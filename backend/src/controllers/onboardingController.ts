import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { secureTokenService } from '../services/secureTokenService.js';
import { sendWelcomeOnboardingEmail } from '../services/emailService.js';
import { auditService } from '../services/auditService.js';

export const onboardingController = {
  /**
   * Public: Verify Token & Get Onboarding Details
   */
  getOnboardingByToken: async (req, res) => {
    try {
      const { token } = req.params;
      const verification = await secureTokenService.verifyToken(token, 'ONBOARDING');

      if (!verification.valid) {
        return res.status(400).json({ success: false, message: verification.message });
      }

      const { candidate, application } = verification;

      let onboarding = await prisma.onboarding.findFirst({
        where: { applicationId: application?.id },
        include: { documents: true },
      });

      if (!onboarding && application) {
        onboarding = await prisma.onboarding.create({
          data: {
            applicationId: application.id,
            candidateId: candidate.id,
            status: 'PENDING',
          },
          include: { documents: true },
        });
      }

      return res.json({
        success: true,
        candidate: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone,
          candidateCode: candidate.candidateCode,
        },
        job: {
          title: application?.job?.title,
          department: application?.job?.department,
          location: application?.job?.location,
        },
        onboarding,
        offer: application?.offer,
      });
    } catch (err: any) {
      logger.error('Get Onboarding Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch onboarding profile' });
    }
  },

  /**
   * Public: Candidate Submits Onboarding Details & Documents
   */
  submitOnboarding: async (req, res) => {
    try {
      const {
        token,
        personalDetails,
        addressDetails,
        educationDetails,
        bankDetails,
        emergencyContact,
        documents = [], // [{ documentType, title, fileUrl, fileName, fileSize }]
      } = req.body;

      const verification = await secureTokenService.verifyToken(token, 'ONBOARDING');
      if (!verification.valid) {
        return res.status(400).json({ success: false, message: verification.message });
      }

      const { candidate, application } = verification;

      // Upsert Onboarding Record
      let onboarding = await prisma.onboarding.findFirst({
        where: { applicationId: application.id },
      });

      if (onboarding) {
        onboarding = await prisma.onboarding.update({
          where: { id: onboarding.id },
          data: {
            personalDetails: personalDetails || undefined,
            addressDetails: addressDetails || undefined,
            educationDetails: educationDetails || undefined,
            bankDetails: bankDetails || undefined,
            emergencyContact: emergencyContact || undefined,
            status: 'DOCUMENTS_SUBMITTED',
            submittedAt: new Date(),
          },
        });
      } else {
        onboarding = await prisma.onboarding.create({
          data: {
            applicationId: application.id,
            candidateId: candidate.id,
            personalDetails,
            addressDetails,
            educationDetails,
            bankDetails,
            emergencyContact,
            status: 'DOCUMENTS_SUBMITTED',
            submittedAt: new Date(),
          },
        });
      }

      // Insert or Update Documents
      if (Array.isArray(documents) && documents.length > 0) {
        for (const doc of documents) {
          if (doc.fileUrl) {
            await prisma.onboardingDocument.create({
              data: {
                onboardingId: onboarding.id,
                documentType: doc.documentType || 'OTHER',
                title: doc.title || doc.documentType || 'Candidate Document',
                fileUrl: doc.fileUrl,
                fileName: doc.fileName || 'document.pdf',
                fileSize: doc.fileSize ? parseInt(String(doc.fileSize)) : null,
                status: 'PENDING',
              },
            });
          }
        }
      }

      // Update Application Overall Status
      await prisma.application.update({
        where: { id: application.id },
        data: { overallStatus: 'DOCUMENT_VERIFICATION' },
      });

      // Audit Log
      await auditService.log({
        action: 'ONBOARDING_COMPLETED',
        entity: 'Onboarding',
        entityId: onboarding.id,
        metadata: { candidateEmail: candidate.email, docCount: documents.length },
      });

      logger.info(`Candidate ${candidate.firstName} ${candidate.lastName} submitted onboarding documents!`);

      return res.json({
        success: true,
        message: 'Onboarding profile and documents submitted successfully! Our HR team will review your verification shortly.',
        onboardingId: onboarding.id,
      });
    } catch (err: any) {
      logger.error('Submit Onboarding Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to submit onboarding profile: ' + err.message });
    }
  },

  /**
   * HR: Verify Candidate Document (VERIFIED, REJECTED, RESUBMISSION_REQUIRED)
   */
  verifyDocument: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const hrUser = req.user;

      const doc = await prisma.onboardingDocument.update({
        where: { id },
        data: {
          status: status || 'VERIFIED',
          rejectionReason: rejectionReason || null,
          verifiedAt: new Date(),
          verifiedBy: hrUser?.id || 'HR',
        },
        include: {
          onboarding: {
            include: { documents: true, application: true },
          },
        },
      });

      // Check if all documents for this onboarding are verified
      const allDocs = doc.onboarding?.documents || [];
      const hasPending = allDocs.some((d) => d.status === 'PENDING' || d.status === 'RESUBMISSION_REQUIRED');
      const hasRejected = allDocs.some((d) => d.status === 'REJECTED');

      let newOnboardingStatus = doc.onboarding.status;
      if (!hasPending && !hasRejected && allDocs.length > 0) {
        newOnboardingStatus = 'VERIFIED';
        await prisma.onboarding.update({
          where: { id: doc.onboardingId },
          data: { status: 'VERIFIED', verifiedAt: new Date(), verifiedBy: hrUser?.id },
        });
      }

      await auditService.log({
        userId: hrUser?.id,
        userRole: hrUser?.role,
        userName: hrUser?.name,
        action: 'DOCUMENT_VERIFIED',
        entity: 'OnboardingDocument',
        entityId: id,
        newValue: { status, rejectionReason },
      });

      return res.json({
        success: true,
        message: `Document status marked as ${status}!`,
        document: doc,
        onboardingStatus: newOnboardingStatus,
      });
    } catch (err: any) {
      logger.error('Verify Document Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to verify document' });
    }
  },

  /**
   * HR: Confirm Joining Date & Generate Employee ID
   */
  confirmJoining: async (req, res) => {
    try {
      const { onboardingId } = req.params;
      const { confirmedDate, designation, department, managerName, location, notes } = req.body;
      const hrUser = req.user;

      const onboarding = await prisma.onboarding.findUnique({
        where: { id: onboardingId },
        include: { candidate: true, application: { include: { job: true } } },
      });

      if (!onboarding) {
        return res.status(404).json({ success: false, message: 'Onboarding record not found' });
      }

      // Generate unique employee ID
      const joiningYear = new Date(confirmedDate || Date.now()).getFullYear();
      const randomSeq = Math.floor(100 + Math.random() * 900);
      const generatedEmpId = `EMP-${joiningYear}-${randomSeq}`;

      const joiningDateObj = confirmedDate ? new Date(confirmedDate) : new Date();

      const joining = await prisma.joining.upsert({
        where: { applicationId: onboarding.applicationId },
        update: {
          confirmedDate: joiningDateObj,
          designation: designation || onboarding.application.job.title || 'Executive Trainee',
          department: department || onboarding.application.job.department || 'Operations',
          managerName: managerName || hrUser?.name || 'HR Manager',
          location: location || onboarding.application.job.location || 'Hyderabad',
          notes,
          status: 'SCHEDULED',
        },
        create: {
          applicationId: onboarding.applicationId,
          candidateId: onboarding.candidateId,
          employeeId: generatedEmpId,
          confirmedDate: joiningDateObj,
          designation: designation || onboarding.application.job.title || 'Executive Trainee',
          department: department || onboarding.application.job.department || 'Operations',
          managerName: managerName || hrUser?.name || 'HR Manager',
          location: location || onboarding.application.job.location || 'Hyderabad',
          notes,
          status: 'SCHEDULED',
        },
      });

      // Update Application Overall Status
      await prisma.application.update({
        where: { id: onboarding.applicationId },
        data: { overallStatus: 'JOINING_SCHEDULED' },
      });

      // Send Joining Confirmation Email
      const candEmail = onboarding.candidate.email;
      const candName = `${onboarding.candidate.firstName} ${onboarding.candidate.lastName}`;

      if (candEmail && !candEmail.includes('example.com')) {
        sendWelcomeOnboardingEmail({
          candidateName: candName,
          candidateEmail: candEmail,
          jobTitle: joining.designation,
          joiningDate: joining.confirmedDate.toISOString().split('T')[0],
        }).catch(() => { });
      }

      await auditService.log({
        userId: hrUser?.id,
        userRole: hrUser?.role,
        userName: hrUser?.name,
        action: 'JOINING_CONFIRMED',
        entity: 'Joining',
        entityId: joining.id,
        newValue: { employeeId: joining.employeeId, confirmedDate: joining.confirmedDate },
      });

      return res.json({
        success: true,
        message: `Joining confirmed for ${candName}! Employee ID: ${joining.employeeId}`,
        joining,
      });
    } catch (err: any) {
      logger.error('Confirm Joining Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to confirm joining date: ' + err.message });
    }
  },

  /**
   * HR: Mark Candidate as JOINED
   */
  markJoined: async (req, res) => {
    try {
      const { joiningId } = req.params;
      const hrUser = req.user;

      const joining = await prisma.joining.update({
        where: { id: joiningId },
        data: {
          status: 'JOINED',
          actualJoinedDate: new Date(),
        },
        include: {
          candidate: true,
          application: true,
        },
      });

      await prisma.application.update({
        where: { id: joining.applicationId },
        data: { overallStatus: 'JOINED', status: 'HIRED' },
      });

      await auditService.log({
        userId: hrUser?.id,
        userRole: hrUser?.role,
        userName: hrUser?.name,
        action: 'CANDIDATE_JOINED',
        entity: 'Joining',
        entityId: joining.id,
        newValue: { status: 'JOINED', employeeId: joining.employeeId },
      });

      return res.json({
        success: true,
        message: `Candidate ${joining.candidate.firstName} ${joining.candidate.lastName} officially marked as JOINED! Employee ID: ${joining.employeeId}`,
        joining,
      });
    } catch (err: any) {
      logger.error('Mark Joined Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to mark candidate as joined' });
    }
  },
};
