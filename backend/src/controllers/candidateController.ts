import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { sendApplicationConfirmationEmail, sendRejectionEmail } from '../services/emailService.js';
import { extractTextFromBuffer, parseResumeText, calculateAtsScore } from '../services/atsScoringEngine.js';
import { notificationService } from '../services/notificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Extract logged-in candidate from JWT (optional, does not block if absent)
const getAuthenticatedCandidateId = (req: any): string | null => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_12345') as any;
    if (decoded && decoded.id && decoded.role === 'CANDIDATE') {
      return decoded.id;
    }
    return null;
  } catch {
    return null;
  }
};

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
    let extractedResumeText = '';
    const host = req.get('host') || 'localhost:5000';
    const baseUrl = `http://${host}`;

    if (req.file) {
      // File uploaded via Multer - extract text and upload to Cloudinary/disk
      try {
        const { extractTextFromBuffer } = await import('../services/atsScoringEngine.js');
        const fileBuffer = fs.readFileSync(req.file.path);
        extractedResumeText = await extractTextFromBuffer(fileBuffer, req.file.mimetype, req.file.originalname);
      } catch (err: any) {
        logger.warn('Text extraction from uploaded file warning:', err?.message || err);
      }

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

        const fileBuffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, fileBuffer);

        try {
          const { extractTextFromBuffer } = await import('../services/atsScoringEngine.js');
          extractedResumeText = await extractTextFromBuffer(fileBuffer, 'application/pdf', originalName);
        } catch (err: any) {
          logger.warn('Text extraction from base64 resume warning:', err?.message || err);
        }

        const { uploadToCloudinaryOrDisk } = await import('../middleware/uploadMiddleware.js');
        savedFileUrl = await uploadToCloudinaryOrDisk(filePath, filename);
      } catch (e) {
        logger.error('Resume upload error:', e);
      }
    }

    const isDataUrl = (url: any) => typeof url === 'string' && url.startsWith('data:');
    const isDummyUrl = (url: any) => typeof url === 'string' && url.includes('example.com');
    const localFilename = req.file ? req.file.filename : (req.body.resumeFileName ? path.basename(req.body.resumeFileName) : null);
    
    // Prioritize Cloudinary / CDN permanent URL if available, fallback to full backend static URL
    const isPermanentUrl = (url: any) => typeof url === 'string' && url.startsWith('http') && !url.includes('/uploads/resumes/');
    const safeResumeUrl = (savedFileUrl && isPermanentUrl(savedFileUrl))
      ? savedFileUrl
      : (localFilename 
          ? `/uploads/resumes/${localFilename}`
          : ((resumeUrl && !isDataUrl(resumeUrl) && !isDummyUrl(resumeUrl)) ? resumeUrl : `${baseUrl}/uploads/resumes/default_resume.pdf`));

    // Check if the user is logged in as a candidate (optional auth)
    const authenticatedCandidateId = getAuthenticatedCandidateId(req);
    let authenticatedCandidate: any = null;

    if (authenticatedCandidateId) {
      authenticatedCandidate = await prisma.candidate.findUnique({ where: { id: authenticatedCandidateId } });
    }

    let candidate = await prisma.candidate.findUnique({ where: { email } });
    const isRegistered = Boolean(password || authenticatedCandidate || candidate?.isRegistered);

    const candidatePayload = {
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

    // If logged-in candidate is applying with their OWN email, use their record directly
    if (authenticatedCandidate && authenticatedCandidate.email === email) {
      candidate = await prisma.candidate.update({
        where: { id: authenticatedCandidate.id },
        data: candidatePayload,
      });
    } else if (authenticatedCandidate && authenticatedCandidate.email !== email) {
      // Logged-in candidate applying with a DIFFERENT email:
      // Update the authenticated candidate's profile with the new application data
      // so the application appears in their dashboard
      const { email: _formEmail, ...payloadWithoutEmail } = candidatePayload;
      candidate = await prisma.candidate.update({
        where: { id: authenticatedCandidate.id },
        data: payloadWithoutEmail,
      });
    } else if (!candidate) {
      // No logged-in candidate, no existing record — create new
      candidate = await prisma.candidate.create({
        data: candidatePayload,
      });
    } else {
      // No logged-in candidate, but record exists by email — update existing
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

    // Step 4 & 5: Run Identical Deterministic ATS Scoring Engine against Job Requirements
    let textToParse = extractedResumeText || resumeText || '';
    if (!textToParse || textToParse.trim().length < 10) {
      textToParse = `${firstName} ${lastName || ''} ${skillsArray.join(' ')} ${finalPosition} ${finalCompany} ${finalExp} years experience ${eduData.degree || ''} ${eduData.college || ''} ${req.body.motivationPitch || ''} ${req.body.currentRoleDescription || ''}`;
    }

    const parsedResume = parseResumeText(textToParse);
    const atsResult = calculateAtsScore(parsedResume, targetJob);
    const calculatedAiScore = atsResult.aiScore;
    const calculatedMatchReason = atsResult.matchReason;

    // Update candidate with calculated ATS score and breakdown
    await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        aiScore: calculatedAiScore,
        matchReason: calculatedMatchReason,
        atsBreakdown: atsResult.breakdown,
      }
    }).catch(() => null);

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
            interviews: {
              include: {
                hr: {
                  select: { id: true, name: true, email: true, designation: true, meetLink: true, phone: true },
                },
              },
              orderBy: { roundNumber: 'asc' },
            },
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

// Delete Candidate (cascades all applications, interviews, feedback, offers, onboardings, activities from PostgreSQL DB)
export const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_MANAGER')) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Only HR Manager or Admin can delete candidates.' });
    }

    // Find candidate by ID, code, or email
    const candidate = await prisma.candidate.findFirst({
      where: {
        OR: [
          { id },
          { candidateCode: id },
          { email: id },
        ],
      },
      include: {
        applications: {
          select: { id: true },
        },
      },
    }).catch(() => null);

    const targetCandId = candidate?.id || id;
    const candEmail = candidate?.email;
    const appIds = candidate?.applications?.map((a: any) => a.id) || [];

    // 1. Delete linked Offer Verification Tokens & Offers
    const offers = await prisma.offer.findMany({
      where: {
        OR: [
          { candidateId: targetCandId },
          ...(candEmail ? [{ candidateEmail: candEmail }] : []),
          ...(appIds.length > 0 ? [{ applicationId: { in: appIds } }] : []),
        ],
      },
      select: { id: true },
    }).catch(() => []);

    const offerIds = offers.map((o) => o.id);
    if (offerIds.length > 0) {
      await prisma.offerVerificationToken.deleteMany({ where: { offerId: { in: offerIds } } }).catch(() => {});
    }
    await prisma.offer.deleteMany({
      where: {
        OR: [
          { candidateId: targetCandId },
          ...(candEmail ? [{ candidateEmail: candEmail }] : []),
          ...(appIds.length > 0 ? [{ applicationId: { in: appIds } }] : []),
        ],
      },
    }).catch(() => {});

    // 2. Delete Interview Feedback Details & Interviews
    const interviews = await prisma.interview.findMany({
      where: {
        OR: [
          { candidateId: targetCandId },
          ...(candEmail ? [{ candidateEmail: candEmail }] : []),
          ...(appIds.length > 0 ? [{ applicationId: { in: appIds } }] : []),
        ],
      },
      select: { id: true },
    }).catch(() => []);

    const interviewIds = interviews.map((i) => i.id);
    if (interviewIds.length > 0) {
      await prisma.feedbackDetail.deleteMany({ where: { interviewId: { in: interviewIds } } }).catch(() => {});
      await prisma.interview.deleteMany({ where: { id: { in: interviewIds } } }).catch(() => {});
    }

    // 3. Delete Onboardings, Documents & Joinings
    const onboardings = await prisma.onboarding.findMany({
      where: {
        OR: [
          { candidateId: targetCandId },
          ...(candEmail ? [{ email: candEmail }] : []),
          ...(appIds.length > 0 ? [{ applicationId: { in: appIds } }] : []),
        ],
      },
      select: { id: true },
    }).catch(() => []);

    const onboardingIds = onboardings.map((o) => o.id);
    if (onboardingIds.length > 0) {
      await prisma.onboardingDocument.deleteMany({ where: { onboardingId: { in: onboardingIds } } }).catch(() => {});
      await prisma.onboarding.deleteMany({ where: { id: { in: onboardingIds } } }).catch(() => {});
    }

    await prisma.joining.deleteMany({
      where: {
        OR: [
          { candidateId: targetCandId },
          ...(candEmail ? [{ email: candEmail }] : []),
          ...(appIds.length > 0 ? [{ applicationId: { in: appIds } }] : []),
        ],
      },
    }).catch(() => {});

    // 4. Delete Test Results
    await prisma.testResult.deleteMany({
      where: {
        OR: [
          { candidateId: targetCandId },
          ...(candEmail ? [{ candidateEmail: candEmail }] : []),
          ...(appIds.length > 0 ? [{ applicationId: { in: appIds } }] : []),
        ],
      },
    }).catch(() => {});

    // 5. Delete Activities, Secure Tokens, HR Assignments, ATS Analyses, Communications
    await prisma.activity.deleteMany({ where: { candidateId: targetCandId } }).catch(() => {});
    await prisma.candidateSecureToken.deleteMany({ where: { candidateId: targetCandId } }).catch(() => {});
    await prisma.hRAssignment.deleteMany({ where: { candidateId: targetCandId } }).catch(() => {});

    if (appIds.length > 0) {
      await prisma.aTSAnalysis.deleteMany({ where: { applicationId: { in: appIds } } }).catch(() => {});
      await prisma.communicationRecord.deleteMany({ where: { applicationId: { in: appIds } } }).catch(() => {});
    }

    // 6. Delete Applications
    await prisma.application.deleteMany({
      where: {
        OR: [
          { candidateId: targetCandId },
          ...(candEmail ? [{ candidate: { email: candEmail } }] : []),
          ...(appIds.length > 0 ? [{ id: { in: appIds } }] : []),
        ],
      },
    }).catch(() => {});

    // 7. Delete Candidate Record
    await prisma.candidate.deleteMany({
      where: {
        OR: [
          { id: targetCandId },
          ...(candEmail ? [{ email: candEmail }] : []),
        ],
      },
    }).catch(() => {});

    logger.info(`Candidate ${targetCandId} (${candEmail || ''}) and all associated records permanently DELETED from PostgreSQL DB by ${user.name}!`);
    return res.json({
      success: true,
      message: 'Candidate and all associated hiring lifecycle data permanently deleted from database.',
    });
  } catch (error: any) {
    logger.error('Delete Candidate Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to delete candidate: ' + error.message });
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

/**
 * Direct Stream Resume File by Filename or Candidate ID
 */
export const streamResumeFile = async (req: any, res: any) => {
  try {
    const { filename } = req.params;
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      return res.sendFile(filePath);
    }

    // Try finding by candidate ID
    const candidate = await prisma.candidate.findFirst({
      where: {
        OR: [
          { id: filename },
          { candidateCode: filename },
          { resumeUrl: { contains: filename } }
        ]
      }
    });

    if (candidate && candidate.resumeUrl) {
      if (candidate.resumeUrl.startsWith('http')) {
        return res.redirect(candidate.resumeUrl);
      }
      const localCandidatePath = path.join(__dirname, '../../', candidate.resumeUrl.replace(/^\//, ''));
      if (fs.existsSync(localCandidatePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        return res.sendFile(localCandidatePath);
      }
    }

    return res.status(404).json({ success: false, message: 'Resume file not found on server' });
  } catch (error: any) {
    logger.error('Stream Resume Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to stream resume: ' + error.message });
  }
};

/**
 * Proxy Resume URL for in-app viewing & CORS-free PDF download
 */
export const proxyResumeUrl = async (req: any, res: any) => {
  try {
    const targetUrl = (req.query.url as string) || '';
    if (!targetUrl) {
      return res.status(400).json({ success: false, message: 'URL query parameter is required' });
    }

    // If it's a local path
    if (targetUrl.startsWith('/uploads') || targetUrl.startsWith('uploads/')) {
      const cleanPath = targetUrl.startsWith('/') ? targetUrl.slice(1) : targetUrl;
      const filePath = path.join(__dirname, '../../', cleanPath);
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        return res.sendFile(filePath);
      }
    }

    // If it matches a local file in uploads directory by filename
    const filenameOnly = path.basename(targetUrl.split('?')[0]);
    const localUploadPath = path.join(__dirname, '../../uploads/resumes', filenameOnly);
    if (fs.existsSync(localUploadPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filenameOnly}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      return res.sendFile(localUploadPath);
    }

    const axios = (await import('axios')).default;
    let streamFetchUrl = targetUrl;

    // If local file wasn't found on disk (e.g. serverless instance), check Cloudinary CDN fallback
    if (targetUrl.startsWith('/uploads') || targetUrl.startsWith('uploads/') || !targetUrl.startsWith('http')) {
      const sanitizedPublicId = filenameOnly.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'tdxhecfr';
      streamFetchUrl = `https://res.cloudinary.com/${cloudName}/image/upload/adyapan_resumes/${sanitizedPublicId}.pdf`;
    }

    // If Cloudinary URL, generate authenticated signed private download URL
    if (targetUrl.includes('cloudinary.com') || targetUrl.includes('res.cloudinary.com')) {
      try {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'tdxhecfr',
          api_key: process.env.CLOUDINARY_API_KEY || '637165639466259',
          api_secret: process.env.CLOUDINARY_API_SECRET || 'eqnB2Hl_RDJVEzOu0PZcUJCPfh8',
        });
        const match = targetUrl.match(/(adyapan_resumes\/[^/?#.]+)/);
        if (match && match[1]) {
          const publicId = match[1];
          streamFetchUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
            resource_type: 'image',
            type: 'upload',
            expires_at: Math.floor(Date.now() / 1000) + 3600,
          });
          logger.info(`[ResumeProxy] Signed Cloudinary Download URL generated: ${streamFetchUrl}`);
        }
      } catch (cldErr: any) {
        logger.warn('Failed to sign Cloudinary private download URL:', cldErr?.message || cldErr);
      }
    }

    // Remote Stream Fetch
    const response = await axios.get(streamFetchUrl, {
      responseType: 'stream',
      headers: {
        'Accept': 'application/pdf, application/octet-stream, */*',
      },
      timeout: 15000,
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filenameOnly || 'Resume.pdf'}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    response.data.pipe(res);
  } catch (error: any) {
    logger.error('Proxy Resume Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to proxy resume: ' + error.message });
  }
};