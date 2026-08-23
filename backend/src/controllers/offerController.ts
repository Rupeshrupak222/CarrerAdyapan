import crypto from 'crypto';
import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { sendOfferLetterEmail, sendWelcomeOnboardingEmail } from '../services/emailService.js';
import { generateOfferLetterPdfBuffer } from '../services/pdfGeneratorService.js';
import { secureTokenService } from '../services/secureTokenService.js';
import { auditService } from '../services/auditService.js';

// Create or Upsert Offer in PostgreSQL DB
export const createOffer = async (req, res) => {
  try {
    const {
      id,
      candidateId,
      candidateName,
      candidateEmail,
      jobTitle,
      salary,
      bonus,
      equity,
      benefits,
      joiningDate,
      expirationDate,
      customTerms,
      notes,
      status,
      applicationId,
      interviewId,
      ...extraFields
    } = req.body;

    let existingOffer = null;
    if (id) {
      existingOffer = await prisma.offer.findUnique({ where: { id } }).catch(() => null);
    }
    if (!existingOffer && candidateId) {
      existingOffer = await prisma.offer.findFirst({ where: { candidateId } }).catch(() => null);
    }
    if (!existingOffer && candidateEmail && !candidateEmail.includes('example.com')) {
      existingOffer = await prisma.offer.findFirst({ where: { candidateEmail } }).catch(() => null);
    }
    if (!existingOffer && candidateName) {
      existingOffer = await prisma.offer.findFirst({ where: { candidateName } }).catch(() => null);
    }

    const targetId = existingOffer ? existingOffer.id : (id || `off-${Date.now()}`);

    // Parse numeric salary safely
    let numericSalary = 0;
    if (typeof salary === 'number') {
      numericSalary = salary;
    } else if (typeof salary === 'string') {
      const parsedNum = parseFloat(salary.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsedNum) && parsedNum > 0) {
        numericSalary = parsedNum;
      } else {
        numericSalary = existingOffer?.salary || 0;
      }
    }

    // Generate or preserve secure acceptance token
    const secureToken = existingOffer?.acceptanceToken || crypto.randomBytes(32).toString('hex');

    // Merge full custom offer details object
    const offerDetailsJson = {
      ...extraFields,
      candidateId: candidateId || existingOffer?.candidateId,
      candidateName: candidateName || existingOffer?.candidateName,
      candidateEmail: candidateEmail || existingOffer?.candidateEmail,
      jobTitle: jobTitle || existingOffer?.jobTitle,
      salary: salary || existingOffer?.salary,
      stipend: extraFields.stipend || salary,
      postProbationCtc: extraFields.postProbationCtc,
      location: extraFields.location,
      trainingStartDate: extraFields.trainingStartDate || joiningDate,
      trainingEndDate: extraFields.trainingEndDate,
      ojtStartDate: extraFields.ojtStartDate,
      ojtEndDate: extraFields.ojtEndDate,
      workTiming: extraFields.workTiming,
      workingHours: extraFields.workingHours,
      jobType: extraFields.jobType,
      customTermsText: customTerms,
      acceptanceToken: secureToken,
    };

    const offer = await prisma.offer.upsert({
      where: { id: targetId },
      update: {
        candidateId: candidateId || existingOffer?.candidateId || null,
        candidateName: candidateName || existingOffer?.candidateName || 'Candidate',
        candidateEmail: candidateEmail && !candidateEmail.includes('example.com') ? candidateEmail : (existingOffer?.candidateEmail || candidateEmail || ''),
        jobTitle: jobTitle || existingOffer?.jobTitle || 'Applicant',
        salary: numericSalary,
        bonus: bonus ? parseFloat(bonus) : (existingOffer?.bonus || null),
        equity: equity ? parseFloat(equity) : (existingOffer?.equity || null),
        benefits: benefits || existingOffer?.benefits || [],
        joiningDate: joiningDate ? new Date(joiningDate) : (existingOffer?.joiningDate || new Date()),
        expirationDate: expirationDate ? new Date(expirationDate) : (existingOffer?.expirationDate || new Date()),
        acceptanceToken: secureToken,
        customTerms: JSON.stringify(offerDetailsJson),
        offerDetails: offerDetailsJson,
        notes: notes || existingOffer?.notes,
        status: status || existingOffer?.status || 'SENT',
      },
      create: {
        id: targetId,
        candidateId: candidateId || null,
        candidateName: candidateName || 'Candidate',
        candidateEmail: candidateEmail || '',
        jobTitle: jobTitle || 'Applicant',
        salary: numericSalary,
        bonus: bonus ? parseFloat(bonus) : null,
        equity: equity ? parseFloat(equity) : null,
        benefits: benefits || [],
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        expirationDate: expirationDate ? new Date(expirationDate) : new Date(),
        acceptanceToken: secureToken,
        customTerms: JSON.stringify(offerDetailsJson),
        offerDetails: offerDetailsJson,
        notes,
        status: status || 'SENT',
        applicationId: applicationId || null,
        interviewId: interviewId || null,
      },
    });

    logger.info(`Individual Offer Letter for candidate "${offer.candidateName}" (ID: ${offer.id}) saved to PostgreSQL DB!`);

    // Only send selection email if explicitly requested and status is not REJECTED
    if (candidateEmail && req.body.sendEmail === true && status !== 'REJECTED') {
      sendOfferLetterEmail({
        ...req.body,
        candidateName: candidateName || 'Candidate',
        candidateEmail: candidateEmail,
        jobTitle: jobTitle || 'Business Development Associate (BDA)',
        salary: offer.salary,
        joiningDate: offer.joiningDate?.toISOString().split('T')[0],
        acceptanceToken: secureToken,
      }).catch((err) => logger.error('Async Resend Offer Email Error:', err));
    }

    res.status(201).json({ success: true, offer });
  } catch (error: any) {
    logger.error('Create Offer Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create offer: ' + error.message });
  }
};

// Send Offer Email with Accept Action CTA
export const sendOfferEmail = async (req, res) => {
  try {
    const offerPayload = {
      ...req.body,
      candidateEmail: req.body.candidateEmail || req.body.email,
    };

    let secureToken = offerPayload.acceptanceToken;

    if (req.params.id) {
      const offer = await prisma.offer.findUnique({
        where: { id: req.params.id },
      });
      if (offer) {
        if (!offer.acceptanceToken) {
          secureToken = crypto.randomBytes(32).toString('hex');
          await prisma.offer.update({
            where: { id: offer.id },
            data: { acceptanceToken: secureToken },
          });
        } else {
          secureToken = offer.acceptanceToken;
        }

        let customData = offer.offerDetails || {};
        if (!customData || Object.keys(customData).length === 0) {
          if (offer.customTerms) {
            try {
              customData = typeof offer.customTerms === 'string' && offer.customTerms.startsWith('{')
                ? JSON.parse(offer.customTerms)
                : { customTermsText: offer.customTerms };
            } catch (e) { }
          }
        }
        Object.assign(offerPayload, customData, offer);
      }
    }

    if (!secureToken) {
      secureToken = crypto.randomBytes(32).toString('hex');
    }

    offerPayload.acceptanceToken = secureToken;

    const emailResult = await sendOfferLetterEmail(offerPayload);

    // Update offer status to SENT
    if (req.params.id) {
      await prisma.offer.update({
        where: { id: req.params.id },
        data: { status: 'SENT' },
      }).catch(() => { });
    }

    res.json({
      success: true,
      message: `Offer letter email dispatched to ${offerPayload.candidateEmail}!`,
      acceptanceToken: secureToken,
      emailResult,
    });
  } catch (error: any) {
    logger.error('Send Offer Email Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send offer email: ' + error.message });
  }
};

// Public: Get Offer Details by Secure Acceptance Token
export const getOfferByAcceptanceToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid or missing offer acceptance token' });
    }

    const offer = await prisma.offer.findUnique({
      where: { acceptanceToken: token },
      include: {
        application: {
          include: { job: true, candidate: true },
        },
      },
    });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found or token has expired.' });
    }

    let customDetails: any = offer.offerDetails || {};
    if (!customDetails || Object.keys(customDetails).length === 0) {
      if (offer.customTerms) {
        try {
          customDetails = JSON.parse(offer.customTerms);
        } catch (e) { }
      }
    }

    res.json({
      success: true,
      offer: {
        id: offer.id,
        candidateName: offer.candidateName,
        candidateEmail: offer.candidateEmail,
        jobTitle: offer.jobTitle,
        salary: offer.salary,
        stipend: customDetails.stipend || `INR ${offer.salary}/-PerMonth`,
        location: customDetails.location || 'Hyderabad',
        joiningDate: offer.joiningDate,
        trainingStartDate: customDetails.trainingStartDate || offer.joiningDate,
        status: offer.status,
        acceptedAt: offer.acceptedAt,
        isAccepted: offer.status === 'ACCEPTED',
        createdAt: offer.createdAt,
      },
    });
  } catch (error: any) {
    logger.error('Get Offer by Token Error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify offer token: ' + error.message });
  }
};

// Public: Candidate Accepts Offer via Secure Token
export const acceptOfferByToken = async (req, res) => {
  try {
    const { token, acceptanceIp, comments } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || acceptanceIp || 'Unknown IP';

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid or missing acceptance token.' });
    }

    const offer = await prisma.offer.findUnique({
      where: { acceptanceToken: token },
      include: { application: true },
    });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer record not found.' });
    }

    // Idempotent: If already accepted, return success with existing acceptance timestamp
    if (offer.status === 'ACCEPTED') {
      return res.json({
        success: true,
        alreadyAccepted: true,
        message: `Offer was already accepted on ${offer.acceptedAt ? new Date(offer.acceptedAt).toLocaleDateString() : 'a previous date'}.`,
        offer: {
          id: offer.id,
          candidateName: offer.candidateName,
          jobTitle: offer.jobTitle,
          status: 'ACCEPTED',
          acceptedAt: offer.acceptedAt,
        },
      });
    }

    const acceptedDate = new Date();

    const updatedOffer = await prisma.offer.update({
      where: { id: offer.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: acceptedDate,
        acceptanceIp: String(clientIp),
        acceptanceMetadata: {
          acceptedVia: 'EMAIL_TOKEN_LINK',
          timestamp: acceptedDate.toISOString(),
          ip: clientIp,
          comments: comments || null,
        },
      },
    });

    // Update candidate application status to OFFER_ACCEPTED & ONBOARDING in DB
    const targetAppId = offer.applicationId;
    let candidateId = offer.candidateId;

    if (targetAppId) {
      await prisma.application.update({
        where: { id: targetAppId },
        data: { status: 'OFFER_ACCEPTED', overallStatus: 'ONBOARDING' },
      }).catch(() => { });
    } else if (candidateId) {
      await prisma.application.updateMany({
        where: { candidateId: candidateId },
        data: { status: 'OFFER_ACCEPTED', overallStatus: 'ONBOARDING' },
      }).catch(() => { });
    }

    // Ensure Onboarding record is created exactly once
    let onboardingToken = '';
    if (targetAppId && candidateId) {
      let onboarding = await prisma.onboarding.findFirst({ where: { applicationId: targetAppId } });
      if (!onboarding) {
        onboarding = await prisma.onboarding.create({
          data: {
            applicationId: targetAppId,
            candidateId: candidateId,
            status: 'PENDING',
          },
        });
      }
      onboardingToken = await secureTokenService.createSecureToken({
        candidateId,
        applicationId: targetAppId,
        tokenType: 'ONBOARDING',
      });
    }

    await auditService.log({
      action: 'OFFER_ACCEPTED',
      entity: 'Offer',
      entityId: offer.id,
      metadata: { candidateEmail: offer.candidateEmail, ip: clientIp },
    });

    logger.info(`Candidate "${offer.candidateName}" has ACCEPTED offer (${offer.id}) via token! Status: ACCEPTED / ONBOARDING.`);

    // Send Welcome Onboarding Email in parallel with secure token link
    sendWelcomeOnboardingEmail({
      candidateName: offer.candidateName,
      candidateEmail: offer.candidateEmail,
      jobTitle: offer.jobTitle,
      joiningDate: offer.joiningDate?.toISOString().split('T')[0],
      onboardingToken,
    }).catch(() => { });

    res.json({
      success: true,
      message: `Congratulations ${offer.candidateName}! You have successfully accepted the offer of employment.`,
      offer: {
        id: updatedOffer.id,
        candidateName: updatedOffer.candidateName,
        jobTitle: updatedOffer.jobTitle,
        status: 'ACCEPTED',
        acceptedAt: updatedOffer.acceptedAt,
      },
      onboardingToken: onboardingToken || undefined,
    });
  } catch (error: any) {
    logger.error('Accept Offer Error:', error);
    res.status(500).json({ success: false, message: 'Failed to accept offer: ' + error.message });
  }
};

/**
 * Public: Candidate Rejects Offer via Secure Token
 */
export const rejectOfferByToken = async (req, res) => {
  try {
    const { token, rejectionReason } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid or missing rejection token.' });
    }

    const offer = await prisma.offer.findUnique({
      where: { acceptanceToken: token },
      include: { application: true },
    });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer record not found.' });
    }

    const updatedOffer = await prisma.offer.update({
      where: { id: offer.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || 'Candidate declined the employment offer.',
      },
    });

    if (offer.applicationId) {
      await prisma.application.update({
        where: { id: offer.applicationId },
        data: { status: 'OFFER_REJECTED', overallStatus: 'REJECTED' },
      }).catch(() => {});
    }

    await auditService.log({
      action: 'OFFER_REJECTED',
      entity: 'Offer',
      entityId: offer.id,
      metadata: { candidateEmail: offer.candidateEmail, reason: rejectionReason },
    });

    return res.json({
      success: true,
      message: 'You have declined the employment offer. Your decision has been noted.',
      offer: updatedOffer,
    });
  } catch (error: any) {
    logger.error('Reject Offer Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record offer rejection: ' + error.message });
  }
};

// Download Offer PDF
export const downloadOfferPdf = async (req, res) => {
  try {
    const pdfBuffer = await generateOfferLetterPdfBuffer(req.body);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${(req.body.candidateName || 'Offer_Letter').replace(/\s+/g, '_')}_Official_Adyapan_Offer.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    logger.error('Download PDF Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
};

// Get All Offers
export const getAllOffers = async (req, res) => {
  try {
    // Auto-sync any final selected applications to Offer table
    const finalSelectedApps = await prisma.application.findMany({
      where: {
        OR: [
          { finalSelected: true },
          { status: 'FINAL_SELECTED' },
          { managerApproved: true },
        ],
      },
      include: {
        candidate: true,
        job: true,
        offer: true,
      },
    }).catch(() => []);

    for (const app of finalSelectedApps) {
      if (!app.offer) {
        const candName = app.candidate ? `${app.candidate.firstName} ${app.candidate.lastName}` : 'Candidate';
        const candEmail = app.candidate?.email || '';
        const secureToken = crypto.randomBytes(32).toString('hex');
        await prisma.offer.create({
          data: {
            id: `off-${app.id.slice(-8)}-${Date.now()}`,
            applicationId: app.id,
            candidateId: app.candidateId,
            candidateName: candName,
            candidateEmail: candEmail,
            jobTitle: app.job?.title || 'Business Development Associate (BDA)',
            salary: 20000,
            status: 'PENDING',
            acceptanceToken: secureToken,
            joiningDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            customTerms: JSON.stringify({
              stipend: 'INR 20,000/- Per Month (During 6-Month Training)',
              location: 'Hyderabad / Hybrid',
              trainingStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              acceptanceToken: secureToken,
            }),
            offerDetails: {
              stipend: 'INR 20,000/- Per Month (During 6-Month Training)',
              location: 'Hyderabad / Hybrid',
              trainingStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              acceptanceToken: secureToken,
            },
          },
        }).catch((e) => logger.warn('Sync offer create warning:', e));
      }
    }

    const dbOffers = await prisma.offer.findMany({
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
            assignedHr: true,
          },
        },
        interview: true,
      },
      orderBy: { createdAt: 'desc' },
    }).catch((e) => {
      logger.warn('Prisma getAllOffers catch: ' + (e?.message || String(e)));
      return [];
    });

    const offers = dbOffers.map((off) => {
      let customData: any = off.offerDetails || {};
      if (!customData || Object.keys(customData).length === 0) {
        if (off.customTerms) {
          try {
            customData = typeof off.customTerms === 'string' && off.customTerms.startsWith('{')
              ? JSON.parse(off.customTerms)
              : { customTermsText: off.customTerms };
          } catch (e) { }
        }
      }

      return {
        ...off,
        ...customData,
        candidateId: off.candidateId || customData.candidateId || off.id,
        candidateName: off.candidateName || customData.candidateName,
        email: off.candidateEmail && !off.candidateEmail.includes('example.com') ? off.candidateEmail : (customData.email || customData.candidateEmail || off.candidateEmail),
        salary: customData.stipend || (off.salary > 0 ? `INR ${off.salary}/-PerMonth` : (off.salary || 'INR 20000/-PerMonth')),
        joiningDate: customData.trainingStartDate || (off.joiningDate ? off.joiningDate.toISOString().split('T')[0] : '2026-09-01'),
        acceptanceToken: off.acceptanceToken,
        acceptedAt: off.acceptedAt,
      };
    });

    res.json({ success: true, count: offers.length, offers });
  } catch (error: any) {
    logger.warn('Get Offers Error: ' + (error?.message || String(error)));
    res.json({ success: true, offers: [] });
  }
};

// Get Offer by ID
export const getOfferById = async (req, res) => {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: req.params.id },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        interview: true,
      },
    });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({ success: true, offer });
  } catch (error: any) {
    logger.error('Get Offer Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch offer: ' + error.message });
  }
};

// Update Offer Details
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      candidateName,
      candidateEmail,
      jobTitle,
      salary,
      bonus,
      equity,
      benefits,
      joiningDate,
      expirationDate,
      customTerms,
      notes,
      status,
    } = req.body;

    let numericSalary = typeof salary === 'number' ? salary : 0;
    if (typeof salary === 'string') {
      const parsed = parseFloat(salary.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) numericSalary = parsed;
    }

    const offer = await prisma.offer.update({
      where: { id },
      data: {
        ...(candidateName && { candidateName }),
        ...(candidateEmail && { candidateEmail }),
        ...(jobTitle && { jobTitle }),
        ...(numericSalary > 0 && { salary: numericSalary }),
        ...(bonus !== undefined && { bonus: parseFloat(bonus) || null }),
        ...(equity !== undefined && { equity: parseFloat(equity) || null }),
        ...(benefits && { benefits }),
        ...(joiningDate && { joiningDate: new Date(joiningDate) }),
        ...(expirationDate && { expirationDate: new Date(expirationDate) }),
        ...(customTerms && { customTerms: typeof customTerms === 'object' ? JSON.stringify(customTerms) : customTerms }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
    });

    res.json({ success: true, offer });
  } catch (error: any) {
    logger.error('Update Offer Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update offer: ' + error.message });
  }
};

// Update Offer Status
export const updateOfferStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const offer = await prisma.offer.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === 'ACCEPTED' && { acceptedAt: new Date() }),
      },
    });

    logger.info(`Offer ${req.params.id} status updated to ${status} in PostgreSQL DB!`);
    res.json({ success: true, offer });
  } catch (error: any) {
    logger.error('Update Offer Status Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update offer status: ' + error.message });
  }
};

// Delete Offer
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.offer.delete({ where: { id } }).catch(async () => {
      await prisma.offer.deleteMany({ where: { id } });
    });
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error: any) {
    logger.error('Delete Offer Error:', error.message);
    res.json({ success: true, message: 'Offer deleted successfully' });
  }
};

// Send Welcome Onboarding Email via Resend
export const sendWelcomeEmail = async (req, res) => {
  try {
    const { candidateName, candidateEmail, jobTitle, joiningDate } = req.body;
    const result = await sendWelcomeOnboardingEmail({
      candidateName: candidateName || 'Selected Candidate',
      candidateEmail: candidateEmail || 'candidate@example.com',
      jobTitle: jobTitle || 'Business Development Associate (BDA)',
      joiningDate: joiningDate || '2026-09-01',
    });

    res.json({
      success: true,
      message: `Welcome onboarding email dispatched to ${candidateEmail}!`,
      result,
    });
  } catch (error: any) {
    logger.error('Send Welcome Email Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send welcome email: ' + error.message });
  }
};