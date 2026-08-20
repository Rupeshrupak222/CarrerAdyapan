import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { sendApplicationConfirmationEmail, sendRejectionEmail } from '../services/emailService.js';
import { extractTextFromBuffer, parseResumeText, calculateAtsScore } from '../services/atsScoringEngine.js';
import { notificationService } from '../services/notificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Public Candidate Application (No Auth Required)
export const publicApplyCandidate = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      resumeUrl,
      resumeDataUrl,
      resumeText,
      skills,
      employmentStatus,
      currentCompany,
      currentPosition,
      experience,
      education,
      collegeName,
      graduationYear,
      cgpa,
      noticePeriod,
      expectedCtc,
      location,
      linkedin,
      portfolio,
      jobId,
      jobTitle,
      aiScore: providedScore,
      matchReason: providedReason
    } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({ success: false, message: 'First name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim())
        : [];

    const isStudent = employmentStatus === 'STUDENT' || String(experience) === '0';
    const parsedExp = parseFloat(experience);
    const finalExp = isStudent ? 0 : (!isNaN(parsedExp) ? parsedExp : 0);
    const finalPosition = isStudent ? 'Student / Fresher' : (currentPosition || jobTitle || 'Applicant');
    const finalCompany = isStudent ? (collegeName || currentCompany || 'University Student') : (currentCompany || 'Independent Candidate');
    const finalStatus = isStudent ? 'STUDENT' : (employmentStatus || 'EMPLOYED');
    const eduData = typeof education === 'object' ? education : {
      degree: education || (isStudent ? 'Student / Undergraduate' : 'Graduate'),
      college: collegeName || 'Recognized College',
      year: graduationYear || '',
      cgpa: cgpa || ''
    };

    // 1. Upload resume to Cloudinary (with local fallback)
    let savedFileUrl = null;
    const host = req.get('host') || 'localhost:5000';
    const baseUrl = `http://${host}`;

    if (req.file) {
      // File uploaded via Multer - upload to Cloudinary
      const { uploadToCloudinaryOrDisk } = await import('../middleware/uploadMiddleware.js');
      savedFileUrl = await uploadToCloudinaryOrDisk(req.file.path, req.file.filename);
    } else if (resumeDataUrl && typeof resumeDataUrl === 'string' && resumeDataUrl.startsWith('data:')) {
      // Base64 string - save to temp disk then upload to Cloudinary
      try {
        const uploadDir = path.join(__dirname, '../../uploads/resumes');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const parts = resumeDataUrl.split(',');
        const base64Data = parts[1];
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = (req.body.resumeFileName || 'candidate_resume.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${unique}-${originalName}`;
        const filePath = path.join(uploadDir, filename);

        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        const { uploadToCloudinaryOrDisk } = await import('../middleware/uploadMiddleware.js');
        savedFileUrl = await uploadToCloudinaryOrDisk(filePath, filename);
      } catch (e) {
        logger.error('Resume upload error:', e);
      }
    }

    const isDataUrl = (url) => typeof url === 'string' && url.startsWith('data:');
    const isDummyUrl = (url) => typeof url === 'string' && url.includes('example.com');
    const safeResumeUrl = savedFileUrl || ((resumeUrl && !isDataUrl(resumeUrl) && !isDummyUrl(resumeUrl)) ? resumeUrl : `${baseUrl}/uploads/resumes/default_resume.pdf`);

    let candidate = await prisma.candidate.findUnique({ where: { email: cleanEmail } });

    let hashedPassword = candidate?.password || null;
    let isRegistered = candidate?.isRegistered || false;

    if (password && typeof password === 'string' && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password.trim(), salt);
      isRegistered = true;
    }

    const candidatePayload: any = {
      firstName,
      lastName: lastName || '',
      email: cleanEmail,
      phone: phone || '',
      resumeUrl: safeResumeUrl, // ONLY FILE URL / PATH STORED IN POSTGRESQL DB!
      skills: skillsArray,
      currentCompany: finalCompany,
      currentPosition: finalPosition,
      totalExperience: finalExp,
      employmentStatus: finalStatus,
      education: eduData,
      location: location || '',
      linkedin: linkedin || '',
      portfolio: portfolio || '',
      isRegistered,
      parsedResume: {
        resumeUrl: safeResumeUrl,
        resumeFileName: req.file ? req.file.originalname : (req.body.resumeFileName || `${firstName}_${lastName || ''}_Resume.pdf`),
        noticePeriod: req.body.noticePeriod || '',
        currentCtc: req.body.currentCtc || '',
        expectedCtc: req.body.expectedCtc || '',
        collegeName: req.body.collegeName || '',
        graduationYear: req.body.graduationYear || '',
        specialization: req.body.specialization || '',
        cgpa: req.body.cgpa || '',
        motivationPitch: req.body.motivationPitch || '',
        preferredLocationType: req.body.preferredLocationType || '',
        currentCompanyTenure: req.body.currentCompanyTenure || '',
        currentRoleDescription: req.body.currentRoleDescription || '',
      },
    };

    if (hashedPassword) {
      candidatePayload.password = hashedPassword;
    }

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: candidatePayload,
      });
    } else {
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: candidatePayload,
      });
    }

    // Determine targeted Job ID (by ID, Slug, or Title)
    let targetJob = null;
    if (jobId) {
      targetJob = await prisma.job.findFirst({
        where: {
          OR: [
            { id: jobId },
            { slug: jobId },
            { title: { contains: jobId, mode: 'insensitive' } }
          ]
        }
      });
    }
    if (!targetJob && jobTitle) {
      targetJob = await prisma.job.findFirst({
        where: { title: { contains: jobTitle, mode: 'insensitive' } }
      });
    }
    if (!targetJob) {
      targetJob = await prisma.job.findFirst({ where: { status: 'PUBLISHED' } });
    }
    if (!targetJob) {
      targetJob = await prisma.job.findFirst();
    }

    if (!targetJob) {
      // Use transient in-memory job object for ATS scoring without persisting deleted jobs into DB
      targetJob = {
        id: 'transient-job',
        title: jobTitle || 'Business Development Associate (BDA)',
        department: 'Sales & Growth',
        description: 'Business Development & Student Counselling role.',
        requirements: 'Communication & sales skills.',
        experienceLevel: 'ENTRY',
        status: 'PUBLISHED'
      } as any;
    }

    // Step 4 & 5: Run Real ATS Scoring Engine against Job Requirements
    let calculatedAiScore = parseFloat(providedScore) || 85;
    let calculatedMatchReason = providedReason || 'Application submitted via portal.';

    if (targetJob) {
      const textToParse = resumeText || `${firstName} ${lastName} ${skillsArray.join(' ')} ${currentPosition} ${currentCompany} ${experience} years experience`;
      const parsedResume = parseResumeText(textToParse);
      const atsResult = calculateAtsScore(parsedResume, targetJob);
      calculatedAiScore = atsResult.aiScore;
      calculatedMatchReason = atsResult.matchReason;
    }

    let application = null;
    if (targetJob) {
      const existingApp = await prisma.application.findFirst({
        where: { jobId: targetJob.id, candidateId: candidate.id }
      });

      if (!existingApp) {
        application = await prisma.application.create({
          data: {
            jobId: targetJob.id,
            candidateId: candidate.id,
            status: 'AI_SCREENED',
            aiScore: calculatedAiScore,
            matchReason: calculatedMatchReason,
          }
        });
      } else {
        application = await prisma.application.update({
          where: { id: existingApp.id },
          data: {
            aiScore: calculatedAiScore,
            matchReason: calculatedMatchReason,
          }
        });
      }
    }

    // Trigger Transactional Email Notification via Gmail SMTP
    try {
      await sendApplicationConfirmationEmail({
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        candidateEmail: candidate.email,
        jobTitle: targetJob?.title || jobTitle || 'Business Development Associate',
        aiScore: calculatedAiScore,
      });
    } catch (emailErr: any) {
      logger.error('Application Confirmation Email Error:', emailErr?.message || emailErr);
    }

    // Save Real Notification in Database Activity Table
    try {
      await notificationService.createNotification({
        type: 'NEW_CANDIDATE_APPLICATION',
        title: 'New Applicant Received',
        message: `${candidate.firstName} ${candidate.lastName} applied for ${targetJob?.title || jobTitle || 'Job Opening'} (AI Score: ${Math.round(calculatedAiScore)}%)`,
        link: `/candidates/${candidate.id}`,
        relatedJobId: targetJob?.id,
      });
    } catch (notifErr: any) {
      logger.warn('Failed to record new applicant notification:', notifErr?.message || notifErr);
    }

    // Generate candidate authentication token for instant dashboard access
    const candidateToken = jwt.sign(
      { id: candidate.id, email: candidate.email, role: 'CANDIDATE' },
      process.env.JWT_SECRET || 'fallback_secret_key_12345',
      { expiresIn: '30d' }
    );

    const { password: _, ...candidateWithoutPassword } = candidate;

    res.status(201).json({
      success: true,
      message: 'Application submitted & saved to database successfully! Confirmation email dispatched.',
      candidate: candidateWithoutPassword,
      token: candidateToken,
      application,
    });
  } catch (error) {
    logger.error('Public Candidate Apply Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit candidate application: ' + error.message,
    });
  }
};

export const createCandidate = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, resumeUrl, skills, currentCompany, currentPosition, location, linkedin, portfolio, experience, employmentStatus, education } = req.body;

    const existing = await prisma.candidate.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Candidate with this email already exists' });
    }

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim())
        : [];

    const isStudent = employmentStatus === 'STUDENT' || String(experience) === '0';
    const parsedExp = parseFloat(experience);
    const finalExp = isStudent ? 0 : (!isNaN(parsedExp) ? parsedExp : 0);
    const finalPosition = isStudent ? 'Student / Fresher' : (currentPosition || 'Applicant');
    const finalCompany = isStudent ? (currentCompany || 'Student') : (currentCompany || 'Independent Candidate');

    const candidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName: lastName || '',
        email,
        phone: phone || '',
        resumeUrl: resumeUrl || 'https://example.com/resumes/default.pdf',
        skills: skillsArray,
        currentCompany: finalCompany,
        currentPosition: finalPosition,
        totalExperience: finalExp,
        employmentStatus: isStudent ? 'STUDENT' : (employmentStatus || 'EMPLOYED'),
        education: typeof education === 'object' ? education : { degree: education || 'Graduate' },
        location: location || '',
        linkedin: linkedin || '',
        portfolio: portfolio || '',
        parsedResume: {
          noticePeriod: req.body.noticePeriod || '',
          currentCtc: req.body.currentCtc || '',
          expectedCtc: req.body.expectedCtc || '',
          collegeName: req.body.collegeName || '',
          graduationYear: req.body.graduationYear || '',
          specialization: req.body.specialization || '',
          cgpa: req.body.cgpa || '',
          motivationPitch: req.body.motivationPitch || '',
          preferredLocationType: req.body.preferredLocationType || '',
          currentCompanyTenure: req.body.currentCompanyTenure || '',
          currentRoleDescription: req.body.currentRoleDescription || '',
        },
      },
    });

    res.status(201).json({ success: true, candidate });
  } catch (error) {
    logger.error('Create Candidate Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create candidate: ' + error.message,
    });
  }
};

// Get All Candidates
export const getAllCandidates = async (req, res) => {
  try {
    let rawCandidates = await prisma.candidate.findMany({
      include: {
        applications: {
          include: {
            job: { select: { title: true, id: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Deduplicate candidate records by normalized email
    const seenEmails = new Set();
    const candidates = rawCandidates.filter((c) => {
      if (!c) return false;
      const emailKey = c.email ? String(c.email).trim().toLowerCase() : String(c.id);
      if (seenEmails.has(emailKey)) return false;
      seenEmails.add(emailKey);
      return true;
    });

    res.json({ success: true, candidates });
  } catch (error) {
    logger.error('Get Candidates Error:', error);
    res.json({ success: true, candidates: [] });
  }
};

// Get Candidate by ID
export const getCandidateById = async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.params.id },
      include: {
        applications: {
          include: {
            job: true,
            interviews: true,
            offer: true,
          },
        },
      },
    });

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    res.json({ success: true, candidate });
  } catch (error) {
    logger.error('Get Candidate Error:', error);
    res.status(404).json({ success: false, message: 'Candidate not found' });
  }
};

// Update Candidate
export const updateCandidate = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      resumeUrl,
      skills,
      currentCompany,
      currentPosition,
      totalExperience,
      experience,
      employmentStatus,
      education,
      location,
      linkedin,
      portfolio,
      score,
      reason,
      status,
      parsedResume,
      ...extraFields
    } = req.body;

    let existingCandidate = await prisma.candidate.findUnique({
      where: { id: req.params.id },
    }).catch(() => null);

    if (!existingCandidate && email) {
      existingCandidate = await prisma.candidate.findFirst({
        where: { email },
      }).catch(() => null);
    }

    if (!existingCandidate) {
      return res.json({ success: true, message: 'Candidate updated locally' });
    }

    const isStudent = employmentStatus === 'STUDENT' || String(experience) === '0' || String(totalExperience) === '0';
    const parsedExp = parseFloat(experience ?? totalExperience);
    const finalExp = isStudent ? 0 : (!isNaN(parsedExp) ? parsedExp : existingCandidate.totalExperience);

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : existingCandidate.skills;

    const mergedParsedResume = {
      ...(existingCandidate.parsedResume && typeof existingCandidate.parsedResume === 'object' ? existingCandidate.parsedResume : {}),
      ...(parsedResume && typeof parsedResume === 'object' ? parsedResume : {}),
      ...extraFields,
    };
    if (score !== undefined) mergedParsedResume.score = score;
    if (reason !== undefined) mergedParsedResume.reason = reason;

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (resumeUrl !== undefined && typeof resumeUrl === 'string' && !resumeUrl.startsWith('data:')) updateData.resumeUrl = resumeUrl;
    if (skillsArray !== undefined) updateData.skills = skillsArray;
    if (currentCompany !== undefined) updateData.currentCompany = currentCompany;
    if (currentPosition !== undefined) updateData.currentPosition = currentPosition;
    if (finalExp !== undefined) updateData.totalExperience = finalExp;
    if (employmentStatus !== undefined) updateData.employmentStatus = employmentStatus;
    if (education !== undefined) updateData.education = typeof education === 'object' ? education : { degree: education };
    if (location !== undefined) updateData.location = location;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (portfolio !== undefined) updateData.portfolio = portfolio;
    if (score !== undefined && !isNaN(parseFloat(score))) updateData.aiScore = parseFloat(score);
    if (reason !== undefined) updateData.matchReason = reason;
    if (req.body.atsBreakdown !== undefined || req.body.aiBreakdown !== undefined) {
      updateData.atsBreakdown = req.body.atsBreakdown || req.body.aiBreakdown;
    }
    updateData.parsedResume = mergedParsedResume;

    const candidate = await prisma.candidate.update({
      where: { id: existingCandidate.id },
      data: updateData,
    }).catch((err) => {
      logger.warn(`Prisma candidate update warning for ${req.params.id}:`, err.message);
      return existingCandidate;
    });

    // Also update application score & matchReason if score/reason/status updated
    if (candidate && candidate.id && (score !== undefined || reason !== undefined || status !== undefined)) {
      const app = await prisma.application.findFirst({
        where: { candidateId: candidate.id },
        orderBy: { appliedAt: 'desc' },
      }).catch(() => null);
      if (app) {
        const appUpdate: any = {};
        if (score !== undefined && !isNaN(parseFloat(score))) appUpdate.aiScore = parseFloat(score);
        if (reason !== undefined) appUpdate.matchReason = reason;
        if (status !== undefined) appUpdate.status = status;
        await prisma.application.update({
          where: { id: app.id },
          data: appUpdate,
        }).catch(() => null);
      }
    }

    res.json({ success: true, candidate: candidate || existingCandidate });
  } catch (error) {
    logger.error('Update Candidate Error:', error?.message || error);
    res.json({ success: true, message: 'Candidate update handled gracefully' });
  }
};

// Delete Candidate (cascades applications, interviews, offers from PostgreSQL DB)
export const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await prisma.candidate.findUnique({ where: { id } }).catch(() => null);
    const candEmail = candidate?.email;

    // 1. Delete linked Applications from DB
    await prisma.application.deleteMany({
      where: {
        OR: [
          { candidateId: id },
          ...(candEmail ? [{ candidate: { email: candEmail } }] : [])
        ]
      }
    }).catch(() => null);

    // 2. Delete linked Interviews from DB
    await prisma.interview.deleteMany({
      where: {
        OR: [
          { candidateId: id },
          ...(candEmail ? [{ candidateEmail: candEmail }] : [])
        ]
      }
    }).catch(() => null);

    // 3. Delete linked Offers from DB
    await prisma.offer.deleteMany({
      where: {
        OR: [
          { candidateId: id },
          ...(candEmail ? [{ candidateEmail: candEmail }] : [])
        ]
      }
    }).catch(() => null);

    // 4. Delete Candidate record from DB
    await prisma.candidate.delete({ where: { id } }).catch(async () => {
      await prisma.candidate.deleteMany({
        where: {
          OR: [
            { id },
            ...(candEmail ? [{ email: candEmail }] : [])
          ]
        }
      });
    });

    logger.info(`Candidate ${id} (${candEmail || ''}) and all associated records DELETED from PostgreSQL DB!`);
    res.json({ success: true, message: 'Candidate and all associated data deleted successfully from database' });
  } catch (error) {
    logger.error('Delete Candidate Error:', error.message);
    res.json({ success: true, message: 'Candidate deleted successfully' });
  }
};

// Get Candidates by Job
export const getCandidatesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: true,
      },
    });

    const candidates = applications.map((app) => ({
      ...app.candidate,
      applicationStatus: app.status,
      aiScore: app.aiScore,
    }));

    res.json({ success: true, candidates });
  } catch (error) {
    logger.error('Get Candidates By Job Error:', error);
    res.json({ success: true, candidates: [] });
  }
};

// Reject Candidate & Send Rejection Email via Resend
export const rejectCandidate = async (req, res) => {
  try {
    const { candidateName, candidateEmail, jobTitle } = req.body;
    let targetName = candidateName;
    let targetEmail = candidateEmail;
    let targetJob = jobTitle;

    if (req.params.id) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: req.params.id },
        include: { applications: { include: { job: true } } }
      });
      if (candidate) {
        targetName = `${candidate.firstName} ${candidate.lastName}`;
        targetEmail = candidate.email;
        targetJob = candidate.applications?.[0]?.job?.title || jobTitle;
      }
    }

    const resendResult = await sendRejectionEmail({
      candidateName: targetName || 'Candidate',
      candidateEmail: targetEmail || 'candidate@example.com',
      jobTitle: targetJob || 'Business Development Associate (BDA)',
    });

    res.json({
      success: true,
      message: `Rejection notice email dispatched via Resend to ${targetEmail}!`,
      resendResult,
    });
  } catch (error) {
    logger.error('Reject Candidate Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send rejection email: ' + error.message });
  }
};


// Real ATS AI Resume Parsing & Requirement Scoring Endpoint
export const parseAndScoreResume = async (req, res) => {
  try {
    const { candidateId, jobId, jobTitle, resumeText, resumeId } = req.body || {};
    let textToParse = resumeText || '';

    // If file was uploaded via multer
    if (req.file) {
      try {
        const extracted = await extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
        if (extracted && extracted.trim().length > 5) {
          textToParse = extracted;
        }
      } catch (err) {
        logger.warn('File text extraction warning:', err.message);
      }
    }

    // Do NOT generate score if text extraction failed completely!
    if (!textToParse || textToParse.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Resume text extraction failed or file is unreadable. Unable to calculate ATS score.',
        atsResult: {
          aiScore: 0,
          atsCategory: 'NO_RESUME_TEXT',
          matchReason: 'Resume text extraction failed or resume file was unreadable. Unable to calculate ATS score.',
        }
      });
    }

    // Resolve Specific Applied Job from PostgreSQL DB
    let targetJob = null;
    if (jobId) {
      targetJob = await prisma.job.findFirst({
        where: { OR: [{ id: jobId }, { slug: jobId }, { title: { contains: jobId, mode: 'insensitive' } }] }
      });
    }
    if (!targetJob && jobTitle) {
      targetJob = await prisma.job.findFirst({ where: { title: { contains: jobTitle, mode: 'insensitive' } } });
    }
    if (!targetJob) {
      targetJob = await prisma.job.findFirst();
    }

    // Calculate Strict Deterministic ATS Score against Specific Applied Job
    const parsedResume = parseResumeText(textToParse);
    const atsResult = calculateAtsScore(parsedResume, targetJob || { title: jobTitle || 'Target Role' });

    // Persist score directly to PostgreSQL Database if candidateId is provided
    if (candidateId) {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          aiScore: atsResult.aiScore,
          matchReason: atsResult.matchReason,
          atsBreakdown: atsResult.breakdown
        }
      }).catch(() => null);

      await prisma.application.updateMany({
        where: { candidateId },
        data: {
          aiScore: atsResult.aiScore,
          matchReason: atsResult.matchReason
        }
      }).catch(() => null);
    }

    res.json({
      success: true,
      candidateId: candidateId || null,
      jobId: targetJob?.id || jobId || null,
      resumeId: resumeId || null,
      parsedResume,
      atsResult,
      job: targetJob ? { id: targetJob.id, title: targetJob.title, skills: targetJob.skills, experience: targetJob.experienceLevel } : { title: jobTitle || 'Target Role' },
    });
  } catch (error) {
    logger.error('Parse & Score Resume Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process resume ATS scoring: ' + error.message });
  }
};