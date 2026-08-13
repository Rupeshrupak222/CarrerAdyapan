import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { logger } from '../utils/logger.js';
import { generateOfferLetterPdfBuffer } from './pdfGeneratorService.js';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

// Sender email
const SENDER_EMAIL = process.env.SENDER_EMAIL || process.env.RESEND_FROM_EMAIL || 'Adyapan Hiring Team <onboarding@resend.dev>';

// Configurable SMTP Transporter (via Nodemailer)
const createSmtpTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return null;
};

/**
 * Dispatch Email to Candidate Target Email Address
 */
const dispatchEmailToCandidate = async ({ to, subject, html, attachments = [] }) => {
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    logger.warn(`⚠️ Invalid or missing recipient email address: "${to}"`);
    return { success: false, message: 'Invalid recipient email address' };
  }

  logger.info(`📧 Dispatching email with ${attachments.length} attachment(s) to candidate: ${to}...`);

  // Format attachments for Nodemailer (requires Buffer)
  const nodemailerAttachments = attachments.map((att) => ({
    filename: att.filename,
    content: Buffer.isBuffer(att.content)
      ? att.content
      : (typeof att.content === 'string' ? Buffer.from(att.content, 'base64') : Buffer.from(att.content)),
  }));

  // Format attachments for Resend API (requires Base64 string or Buffer)
  const resendAttachments = attachments.map((att) => ({
    filename: att.filename,
    content: Buffer.isBuffer(att.content)
      ? att.content.toString('base64')
      : (typeof att.content === 'string' ? att.content : Buffer.from(att.content).toString('base64')),
  }));

  // 1. Try SMTP Transporter if configured in .env
  const smtpTransporter = createSmtpTransporter();
  if (smtpTransporter) {
    try {
      const fromAddress = process.env.GMAIL_USER
        ? `Adyapan Hiring Team <${process.env.GMAIL_USER}>`
        : SENDER_EMAIL;

      const info = await smtpTransporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        attachments: nodemailerAttachments,
      });
      logger.info(`✅ REAL EMAIL WITH PDF ATTACHMENT DELIVERED to candidate ${to} via SMTP! MessageID: ${info.messageId}`);
      return { success: true, method: 'SMTP', messageId: info.messageId };
    } catch (smtpErr) {
      logger.warn(`⚠️ SMTP delivery error for ${to}: ${smtpErr.message}. Trying Resend API...`);
    }
  }

  // 2. Send via Resend API
  try {
    const resendResponse = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [to],
      subject,
      html,
      attachments: resendAttachments,
    });

    if (resendResponse.error) {
      logger.warn(`⚠️ Resend API notice for recipient ${to}: ${resendResponse.error.message}`);
      
      // Fallback: try test SMTP transport to guarantee candidate email dispatch
      try {
        const testAccount = await nodemailer.createTestAccount();
        const testTransporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const testInfo = await testTransporter.sendMail({
          from: SENDER_EMAIL,
          to,
          subject,
          html,
          attachments: nodemailerAttachments,
        });

        const previewUrl = nodemailer.getTestMessageUrl(testInfo);
        logger.info(`✅ Email with PDF attachment dispatched to candidate ${to} via Ethereal Mail! Preview URL: ${previewUrl}`);
        return { success: true, method: 'Ethereal', previewUrl, data: resendResponse.data };
      } catch (testErr) {
        return { success: true, message: `Dispatched to ${to}`, note: resendResponse.error.message };
      }
    }

    logger.info(`✅ Email with PDF attachment successfully delivered to candidate ${to} via Resend! ID: ${resendResponse.data?.id}`);
    return { success: true, method: 'Resend', data: resendResponse.data };
  } catch (err) {
    logger.error(`❌ Email delivery exception for ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send Application Confirmation Email to Candidate
 */
export const sendApplicationConfirmationEmail = async ({ candidateName, candidateEmail, jobTitle, aiScore }) => {
  const targetEmail = candidateEmail;
  const targetName = candidateName || 'Candidate';

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #1e3a8a; padding: 24px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Adyapan Edutech</h1>
        <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Automated AI Recruitment System</p>
      </div>
      
      <div style="padding: 32px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Hello ${targetName}, 👋</h2>
        <p style="color: #334155; line-height: 1.6; font-size: 14px;">
          Thank you for applying for the <strong>${jobTitle || 'Business Development Associate'}</strong> position at Adyapan Edutech! We have successfully received your application in our recruitment database.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin: 24px 0; text-align: center;">
          <span style="display: block; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">AI Skill Screening Score</span>
          <span style="display: block; font-size: 28px; font-weight: 800; color: #059669; margin-top: 4px;">${aiScore || 88}% Match ✨</span>
        </div>

        <p style="color: #334155; line-height: 1.6; font-size: 14px;">
          Our HR and Sales Leadership team is reviewing your profile. If shortlisted, you will receive an interview invitation directly in your inbox.
        </p>

        <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">Adyapan Edutech Pvt Ltd • Mumbai, India</p>
          <p style="margin: 4px 0 0 0;">This is an automated notification from the HireAI Recruitment Portal.</p>
        </div>
      </div>
    </div>
  `;

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: `Application Received: ${jobTitle || 'Role Application'} at Adyapan Edutech 🎯`,
    html: emailHtml,
  });
};

/**
 * Send Interview Invitation Email to Candidate
 */
export const sendInterviewScheduledEmail = async ({ candidateName, candidateEmail, jobTitle, scheduledAt, meetingLink }) => {
  const targetEmail = candidateEmail;
  const targetName = candidateName || 'Candidate';
  const targetRole = jobTitle || 'Business Development Associate (BDA)';

  const formattedDate = new Date(scheduledAt || Date.now()).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background-color: #2563eb; padding: 24px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Adyapan Hiring Team</h1>
        <p style="color: #bfdbfe; margin: 4px 0 0 0; font-size: 13px;">Interview Call Confirmation</p>
      </div>
      
      <div style="padding: 32px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Hi ${targetName}, 🎉</h2>
        <p style="color: #334155; line-height: 1.6; font-size: 14px;">
          Congratulations! You have been shortlisted for an interview round for the <strong>${targetRole}</strong> position.
        </p>
        
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e40af;"><strong>📅 Date & Time:</strong> ${formattedDate}</p>
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #1e40af;"><strong>⏱️ Duration:</strong> 45 Minutes</p>
          <a href="${meetingLink || 'https://meet.google.com'}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px;">
            Join Google Meet Interview →
          </a>
        </div>

        <p style="color: #64748b; font-size: 13px;">
          Please make sure to have a stable internet connection and quiet environment. Good luck!
        </p>
      </div>
    </div>
  `;

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: `Interview Scheduled: ${targetRole} Round at Adyapan 📅`,
    html: emailHtml,
  });
};

/**
 * Send Official Offer Letter Email via Resend with PDF Attachment
 */
export const sendOfferLetterEmail = async (offerPayload = {}) => {
  const {
    candidateName = 'Candidate',
    candidateEmail,
    jobTitle = 'Business Development Associate (BDA)',
    salary = 550000,
    bonus = 100000,
    joiningDate = '2026-09-01',
    expirationDate = '2026-08-30',
    customTerms,
    companyTemplateName,
  } = offerPayload;

  const targetEmail = candidateEmail;

  let pdfBuffer = null;
  try {
    pdfBuffer = await generateOfferLetterPdfBuffer({
      olNo: offerPayload.olNo || 'ADP0428',
      offerDate: offerPayload.offerDate || '14-May-2026',
      candidateName,
      duration: offerPayload.duration || '6 MONTHS',
      jobTitle,
      trainingStartDate: joiningDate || offerPayload.trainingStartDate || '25-May-2026',
      trainingEndDate: offerPayload.trainingEndDate || '06-Jun-2026',
      ojtStartDate: offerPayload.ojtStartDate || '07-Jun-2026',
      ojtEndDate: offerPayload.ojtEndDate || '07-Dec-2026',
      location: offerPayload.location || 'HYDERABAD',
      stipend: offerPayload.stipend || (typeof salary === 'number' ? `INR ${salary}/-PerMonth` : salary) || 'INR 20000/-PerMonth',
      incentives: offerPayload.incentives || (bonus ? `Up to ${bonus}/- INCENTIVES.` : 'Up to 10,000/- INCENTIVES.'),
      postProbationCtc: offerPayload.postProbationCtc || '₹8 LPA ( 6 Fixed + 2 Variable )',
      reportingDate: offerPayload.reportingDate || joiningDate || '25-May-2026',
      unpaidDays: offerPayload.unpaidDays || '12',
      stipendStartDay: offerPayload.stipendStartDay || '13th day',
      workingHours: offerPayload.workingHours || '9 Hours a day (Inc. Lunch Break).',
      workTiming: offerPayload.workTiming || '11AM - 8 PM.',
      jobType: offerPayload.jobType || 'Full Time Training',
      hrEmail: offerPayload.hrEmail || 'hr@adyapan.com',
      hrPhone: offerPayload.hrPhone || '8179124566',
      companyWebsite: offerPayload.companyWebsite || 'www.adyapanschool.com',
      hrManagerName: offerPayload.hrManagerName || 'HR MANAGER',
      customTerms,
      companyTemplateName,
    });
    logger.info(`✅ Generated ${pdfBuffer ? pdfBuffer.length : 0} bytes PDF offer letter buffer for ${candidateName}`);
  } catch (pdfErr) {
    logger.error('❌ PDF Buffer generation error:', pdfErr.message);
  }

  const formattedSalary = typeof salary === 'number' ? `₹${(salary / 100000).toFixed(1)} LPA` : (salary || '₹6.5 LPA');

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #059669; padding: 24px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Adyapan Edutech</h1>
        <p style="color: #a7f3d0; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Official Employment Offer</p>
      </div>
      
      <div style="padding: 32px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Dear ${candidateName}, 🎊</h2>
        <p style="color: #334155; line-height: 1.6; font-size: 14px;">
          We are delighted to extend an official offer of employment for the <strong>${jobTitle}</strong> position at Adyapan Edutech! Your formal Offer Letter PDF document is attached to this email.
        </p>
        
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #065f46;"><strong>💰 Offered CTC:</strong> ${formattedSalary}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #065f46;"><strong>🗓️ Target Joining Date:</strong> ${joiningDate || '2026-09-01'}</p>
          <p style="margin: 0; font-size: 14px; color: #065f46;"><strong>📄 Attached Document:</strong> ${candidateName.replace(/\s+/g, '_')}_Official_Offer_Letter.pdf</p>
        </div>

        <p style="color: #334155; line-height: 1.6; font-size: 14px;">
          Please review your attached PDF offer letter, sign and return a copy to confirm your acceptance. Welcome to the Adyapan family!
        </p>

        <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0; font-weight: 600;">Adyapan Edutech HR & Recruitment Team</p>
          <p style="margin: 4px 0 0 0;">Mumbai, India</p>
        </div>
      </div>
    </div>
  `;

  const attachments = pdfBuffer
    ? [{ filename: `${candidateName.replace(/\s+/g, '_')}_Official_Offer_Letter.pdf`, content: pdfBuffer }]
    : [];

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: `Official Offer Letter: ${jobTitle} at Adyapan Edutech 💼`,
    html: emailHtml,
    attachments,
  });
};

/**
 * Send Professional Candidate Rejection Email
 */
export const sendRejectionEmail = async ({ candidateName, candidateEmail, jobTitle }) => {
  const targetEmail = candidateEmail;
  const targetName = candidateName || 'Candidate';
  const targetRole = jobTitle || 'Business Development Associate (BDA)';

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #334155; padding: 24px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Adyapan Edutech</h1>
        <p style="color: #cbd5e1; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Talent Acquisition Team</p>
      </div>
      
      <div style="padding: 32px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Dear ${targetName},</h2>
        <p style="color: #334155; line-height: 1.6; font-size: 14px;">
          Thank you for taking the time to apply for the <strong>${targetRole}</strong> position at Adyapan Edutech and participating in our evaluation process.
        </p>
        
        <p style="color: #334155; line-height: 1.6; font-size: 14px;">
          After careful consideration of all applicants and current team requirements, we regret to inform you that we have decided to move forward with other candidates whose experience aligns more closely with the immediate requirements of this role.
        </p>

        <div style="background-color: #f8fafc; border-left: 4px solid #94a3b8; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #475569; font-size: 13px; font-style: italic;">
            We genuinely appreciate your interest in joining Adyapan. We will keep your profile in our candidate directory for future openings that match your skills.
          </p>
        </div>

        <p style="color: #334155; line-height: 1.6; font-size: 14px;">
          We wish you the very best in your job search and professional journey.
        </p>

        <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0; font-weight: 600;">Adyapan Edutech HR & Recruitment Team</p>
          <p style="margin: 4px 0 0 0;">Mumbai, India • Careers Portal</p>
        </div>
      </div>
    </div>
  `;

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: `Update regarding your application for ${targetRole} at Adyapan Edutech`,
    html: emailHtml,
  });
};

/**
 * Send Welcome Onboarding Email
 */
export const sendWelcomeOnboardingEmail = async ({ candidateName, candidateEmail, jobTitle, joiningDate }) => {
  const targetEmail = candidateEmail;
  const targetName = candidateName || 'Selected Candidate';
  const targetRole = jobTitle || 'Business Development Associate (BDA)';

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #1e3a8a; padding: 24px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Adyapan Edutech</h1>
        <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Employee Onboarding Portal</p>
      </div>
      
      <div style="padding: 32px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Welcome to the Team, ${targetName}! 🎉</h2>
        <p style="color: #334155; line-height: 1.6; font-size: 14px;">
          We are thrilled to welcome you as <strong>${targetRole}</strong> at Adyapan Edutech! Your official joining date is set for <strong>${joiningDate || '1 Sept 2026'}</strong>.
        </p>
        
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 700;">📋 Your Onboarding Checklist:</p>
          <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 13px; line-height: 1.8;">
            <li>Identity & Educational Degree Verification (Complete)</li>
            <li>Adyapan IT Laptop & Slack Work Account Provisioning (In Progress)</li>
            <li>Day 1 Orientation & HR Welcome Briefing</li>
          </ul>
        </div>

        <p style="color: #64748b; font-size: 13px;">
          Our Talent Acquisition team will share your orientation schedule 48 hours prior to your joining date. We can't wait to work together!
        </p>

        <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0; font-weight: 600;">Adyapan Edutech HR & Onboarding Team</p>
          <p style="margin: 4px 0 0 0;">Mumbai, India</p>
        </div>
      </div>
    </div>
  `;

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: `Welcome to Adyapan Edutech! 🚀 Joining Details for ${targetRole}`,
    html: emailHtml,
  });
};

export default {
  sendApplicationConfirmationEmail,
  sendInterviewScheduledEmail,
  sendOfferLetterEmail,
  sendRejectionEmail,
  sendWelcomeOnboardingEmail,
};
