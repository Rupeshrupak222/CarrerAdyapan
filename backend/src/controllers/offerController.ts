import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { sendOfferLetterEmail, sendWelcomeOnboardingEmail } from '../services/emailService.js';
import { generateOfferLetterPdfBuffer } from '../services/pdfGeneratorService.js';

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
      numericSalary = !isNaN(parsedNum) ? parsedNum : (existingOffer?.salary || 0);
    }

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
      }).catch((err) => logger.error('Async Resend Offer Email Error:', err));
    }

    res.status(201).json({ success: true, offer });
  } catch (error) {
    logger.error('Create Offer Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create offer: ' + error.message });
  }
};

// Send Offer Email Directly via Resend
export const sendOfferEmail = async (req, res) => {
  try {
    const offerPayload = {
      ...req.body,
      candidateEmail: req.body.candidateEmail || req.body.email,
    };

    if (req.params.id) {
      const offer = await prisma.offer.findUnique({
        where: { id: req.params.id },
      });
      if (offer) {
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

    const result = await sendOfferLetterEmail(offerPayload);

    res.json({
      success: true,
      message: `Official Offer Letter email dispatched via Resend to ${offerPayload.candidateEmail}!`,
      resendResult: result,
    });
  } catch (error) {
    logger.error('Send Offer Email Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send offer email: ' + error.message });
  }
};

// Get All Offers
export const getAllOffers = async (req, res) => {
  try {
    const rawOffers = await prisma.offer.findMany({
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).catch((e) => {
      logger.warn('Offers findMany pooler warning: ' + (e?.message || String(e)));
      return [];
    });

    const offers = rawOffers.map((off) => {
      let customData = off.offerDetails || {};
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
      };
    });

    res.json({ success: true, offers });
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
      data: { status },
    });

    logger.info(`Offer ${req.params.id} status updated to ${status} in PostgreSQL DB!`);
    res.json({ success: true, offer });
  } catch (error) {
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
  } catch (error) {
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
      message: `Welcome onboarding email dispatched via Resend to ${candidateEmail}!`,
      resendResult: result,
    });
  } catch (error) {
    logger.error('Send Welcome Email Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send welcome email: ' + error.message });
  }
};

// Download Dynamic PDF Offer Letter
export const downloadOfferPdf = async (req, res) => {
  try {
    const { candidateName, jobTitle, salary, bonus, joiningDate, expirationDate, customTerms, companyTemplateName, templateDataUrl } = req.body || {};
    const pdfBuffer = await generateOfferLetterPdfBuffer({
      candidateName: candidateName || 'Valued Candidate',
      jobTitle: jobTitle || 'Business Development Associate (BDA)',
      salary: salary || 550000,
      bonus: bonus || 100000,
      joiningDate: joiningDate || '2026-09-01',
      expirationDate: expirationDate || '2026-08-30',
      customTerms: customTerms || 'Standard Adyapan Edutech employment terms apply.',
      companyTemplateName: companyTemplateName || 'Adyapan Edutech Official Offer Template',
      templateDataUrl,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${(candidateName || 'Candidate').replace(/\s+/g, '_')}_Official_Offer_Letter.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    logger.error('Download Offer PDF Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate offer PDF: ' + error.message });
  }
};