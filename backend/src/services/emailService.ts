import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { logger } from '../utils/logger.js';
import { generateOfferLetterPdfBuffer } from './pdfGeneratorService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for the Adyapan Logo buffer & Base64 Data URL
let cachedLogoData: { buffer: Buffer | null; base64: string } | null = null;

const getLogoData = () => {
  if (cachedLogoData) return cachedLogoData;
  try {
    const candidatePaths = [
      path.join(__dirname, '../assets/adyapan-logo.jpeg'),
      path.join(__dirname, '../../frontend/public/adyapan-logo.jpeg'),
      path.join(process.cwd(), 'backend/src/assets/adyapan-logo.jpeg'),
      path.join(process.cwd(), 'frontend/public/adyapan-logo.jpeg'),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const buffer = fs.readFileSync(p);
        cachedLogoData = {
          buffer,
          base64: `data:image/jpeg;base64,${buffer.toString('base64')}`,
        };
        return cachedLogoData;
      }
    }
  } catch (e) {
    logger.warn('Failed to load logo file:', e);
  }
  cachedLogoData = { buffer: null, base64: '' };
  return cachedLogoData;
};

// Reusable Adyapan Brand Email Navbar Header
const renderEmailHeader = (companyName: string = 'Adyapan Edutech Pvt. Ltd.', subTitle?: string) => {
  const logoUrl = 'https://res.cloudinary.com/tdxhecfr/image/upload/v1787220474/adyapan_edutech_pvt_ltd_logo.jpg';

  return `
    <!-- Header Navbar with Official Adyapan Logo and Golden Amber Theme -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); padding: 22px 28px; text-align: center; border-bottom: 2px solid #b45309;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td style="vertical-align: middle; padding-right: 12px;">
            <img src="${logoUrl}" alt="Adyapan Logo" width="44" height="44" style="width: 44px; height: 44px; border-radius: 50%; display: block; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.22); border: 2px solid rgba(255,255,255,0.6);" />
          </td>
          <td style="vertical-align: middle; text-align: left;">
            <span style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 0.3px; display: block; text-shadow: 0 1px 3px rgba(0,0,0,0.25); line-height: 1.2;">${companyName}</span>
            ${subTitle ? `<span style="color: #fef3c7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-top: 3px;">${subTitle}</span>` : ''}
          </td>
        </tr>
      </table>
    </div>
  `;
};

// Gmail / Google Workspace Credentials
const getSmtpCredentials = () => {
  const user = (process.env.SMTP_USER || 'eclipse@adyapan.com').trim();
  const rawPass = process.env.SMTP_PASS || 'ampw vxhm ussx vczc';
  const pass = rawPass.replace(/["'\s]+/g, '');
  const from = process.env.SMTP_FROM || process.env.SENDER_EMAIL || `"Adyapan Edutech" <${user}>`;
  return { user, pass, from };
};

// Create Bulletproof Nodemailer Gmail Transporter
const createTransporter = (method: 'gmail_service' | 'port_465' | 'port_587' = 'gmail_service') => {
  const { user, pass } = getSmtpCredentials();
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();

  if (method === 'gmail_service') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 45000,
    } as any);
  }

  if (method === 'port_465') {
    return nodemailer.createTransport({
      host,
      port: 465,
      secure: true,
      auth: { user, pass },
      family: 4,
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 45000,
      tls: { rejectUnauthorized: false },
    } as any);
  }

  return nodemailer.createTransport({
    host,
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
    family: 4,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 45000,
    tls: { rejectUnauthorized: false },
  } as any);
};

// HTTPS Port 443 REST API Dispatcher (Immune to Render Cloud SMTP Port Blocks)
const sendViaHttpsPort443 = async ({ to, subject, html, attachments = [] }: { to: string; subject: string; html: string; attachments?: any[] }) => {
  const apiKey = (process.env.BREVO_API_KEY || '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').trim();
  if (!apiKey) return null;

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'dks241655@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Adyapan Academy';

  const apiAttachments = attachments.map((att: any) => ({
    name: att.filename,
    content: Buffer.isBuffer(att.content)
      ? att.content.toString('base64')
      : (typeof att.content === 'string' ? att.content : Buffer.from(att.content).toString('base64')),
  }));

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        replyTo: { name: senderName, email: 'eclipse@adyapan.com' },
        subject,
        htmlContent: html,
        attachment: apiAttachments.length > 0 ? apiAttachments : undefined,
      }),
    });

    const data: any = await response.json();
    if (response.status >= 200 && response.status < 300) {
      logger.info(`REAL HTTPS PORT 443 EMAIL DELIVERED to candidate ${to}! MessageID: ${data?.messageId || data?.id}`);
      return { success: true, method: 'HTTPS_Port_443_Live', messageId: data?.messageId || data?.id };
    }
    logger.warn(`HTTPS Port 443 Notice for ${to}:`, data?.message || data);
    return null;
  } catch (err: any) {
    logger.warn(`HTTPS Port 443 Error for ${to}:`, err?.message || err);
    return null;
  }
};

/**
 * Dispatch Real Email to Candidate Email Address via HTTPS Port 443 + Gmail SMTP Fallback
 */
const dispatchEmailToCandidate = async ({ to, subject, html, attachments = [] }: { to: string; subject: string; html: string; attachments?: any[] }) => {
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    logger.warn(`Invalid or missing recipient email address: "${to}"`);
    return { success: false, message: 'Invalid recipient email address' };
  }

  const allAttachments = [...attachments];

  // 1. PRIMARY: Try Port 443 HTTPS REST API (Delivers in <1s without Render SMTP Port Blocks)
  try {
    const httpsRes = await sendViaHttpsPort443({ to, subject, html, attachments: allAttachments });
    if (httpsRes && httpsRes.success) return httpsRes;
  } catch (httpsErr: any) {
    logger.warn(`HTTPS Port 443 notice for ${to}:`, httpsErr?.message || httpsErr);
  }

  const { user, from } = getSmtpCredentials();

  // Format attachments for Nodemailer
  const nodemailerAttachments = allAttachments.map((att) => ({
    filename: att.filename,
    content: Buffer.isBuffer(att.content)
      ? att.content
      : (typeof att.content === 'string' ? Buffer.from(att.content, 'base64') : Buffer.from(att.content)),
    cid: att.cid,
  }));

  logger.info(`Dispatching real email with ${allAttachments.length} attachment(s) to candidate ${to} via Gmail (${user})...`);

  // 1. PRIMARY: Try Official Nodemailer Gmail Service Connection
  try {
    const transporter = createTransporter('gmail_service');
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments: nodemailerAttachments,
    });

    logger.info(`REAL GMAIL EMAIL DELIVERED to candidate ${to}! MessageID: ${info.messageId} - ${info.response}`);
    return { success: true, method: 'Gmail_Service', messageId: info.messageId };
  } catch (gmailServiceErr: any) {
    logger.warn(`Gmail Service notice for ${to}: ${gmailServiceErr?.message || gmailServiceErr}. Retrying Direct Port 465 SSL...`);

    // 2. FALLBACK: Try Direct Port 465 SSL
    try {
      const transporter465 = createTransporter('port_465');
      const info465 = await transporter465.sendMail({
        from,
        to,
        subject,
        html,
        attachments: nodemailerAttachments,
      });

      logger.info(`REAL GMAIL EMAIL DELIVERED via Port 465 to candidate ${to}! MessageID: ${info465.messageId}`);
      return { success: true, method: 'Gmail_Port_465', messageId: info465.messageId };
    } catch (sslErr: any) {
      logger.warn(`Port 465 SSL notice for ${to}: ${sslErr?.message || sslErr}. Retrying Port 587 STARTTLS...`);

      // 3. FALLBACK: Try Port 587 STARTTLS
      try {
        const transporter587 = createTransporter('port_587');
        const info587 = await transporter587.sendMail({
          from,
          to,
          subject,
          html,
          attachments: nodemailerAttachments,
        });

        logger.info(`REAL GMAIL EMAIL DELIVERED via Port 587 to candidate ${to}! MessageID: ${info587.messageId}`);
        return { success: true, method: 'Gmail_Port_587', messageId: info587.messageId };
      } catch (smtpErr: any) {
        logger.error(`Failed to send email to ${to}:`, smtpErr?.message || smtpErr);
        return { success: false, message: 'SMTP Send failed: ' + (smtpErr?.message || smtpErr) };
      }
    }
  }
};

/**
 * 1. Send Application Confirmation Email to Candidate
 */
export const sendApplicationConfirmationEmail = async (payload: any) => {
  const targetEmail = payload?.candidateEmail || payload?.email || payload?.candidate?.email;
  const candidateName = payload?.candidateName || payload?.name || (payload?.candidate ? `${payload.candidate.firstName} ${payload.candidate.lastName}` : 'Candidate');
  const jobTitle = payload?.jobTitle || payload?.job?.title || 'Open Position';
  const companyName = 'Adyapan Edutech Pvt. Ltd.';

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 4px 14px rgba(217,119,6,0.12);">
      ${renderEmailHeader(companyName)}
      
      <div style="padding: 32px 32px 28px 32px; font-size: 15px; color: #334155; line-height: 1.7;">
        <p style="margin: 0 0 16px 0;">Dear <strong>${candidateName}</strong>,</p>
        
        <p style="margin: 0 0 16px 0;">
          Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.
        </p>
        
        <p style="margin: 0 0 16px 0;">
          We’re pleased to confirm that we have successfully received your application. Our recruitment team will review your profile and qualifications against the requirements of the position.
        </p>
        
        <p style="margin: 0 0 16px 0;">
          If your profile is shortlisted, our recruitment team will contact you regarding the next steps in the hiring process.
        </p>
        
        <p style="margin: 0 0 24px 0;">
          We appreciate your interest in <strong>${companyName}</strong> and thank you for taking the time to apply.
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 14px; color: #475569;">
          <p style="margin: 0 0 4px 0;">Best regards,</p>
          <p style="margin: 0;"><strong style="color: #0f172a;">Adyapan HR Team</strong></p>
        </div>
      </div>
    </div>
  `;

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: `Application Confirmation: ${jobTitle} at ${companyName}`,
    html: emailHtml,
  });
};

/**
 * Send Candidate Shortlist Notification Email
 */
export const sendShortlistEmail = async ({ candidateName, candidateEmail, jobTitle }: any) => {
  const targetEmail = candidateEmail;
  const targetName = candidateName || 'Candidate';
  const targetRole = jobTitle || 'Business Development Associate (BDA)';
  const companyName = 'Adyapan Edutech Pvt. Ltd.';

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 4px 14px rgba(217,119,6,0.12);">
      ${renderEmailHeader(companyName, 'APPLICATION SHORTLISTED')}
      
      <div style="padding: 32px 32px 28px 32px; font-size: 15px; color: #334155; line-height: 1.7;">
        <p style="margin: 0 0 16px 0;">Dear <strong>${targetName}</strong>,</p>
        
        <p style="margin: 0 0 16px 0;">
          Great news! Your profile has been reviewed and <strong>SHORTLISTED</strong> for the position of <strong>${targetRole}</strong> at <strong>${companyName}</strong>.
        </p>
        
        <div style="background-color: #fffbeb; border: 1.5px solid #fde68a; border-radius: 14px; padding: 20px; margin: 24px 0; font-size: 14px; line-height: 1.8;">
          <p style="margin: 0 0 6px 0; color: #92400e;"><strong>🎯 Next Steps:</strong></p>
          <p style="margin: 0; color: #78350f;">
            An HR Talent Specialist is being assigned to your application. You will receive an official interview invitation with your Google Meet link shortly.
          </p>
        </div>

        <p style="margin: 0 0 24px 0;">
          Thank you for choosing Adyapan Edutech. We look forward to connecting with you soon!
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 14px; color: #475569;">
          <p style="margin: 0 0 4px 0;">Best regards,</p>
          <p style="margin: 0;"><strong style="color: #0f172a;">Adyapan Talent Acquisition Team</strong></p>
        </div>
      </div>
    </div>
  `;

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: `Application Shortlisted: ${targetRole} at ${companyName}`,
    html: emailHtml,
  });
};

/**
 * 2. Send Interview Invitation Email to Candidate (Round & Assigned HR Specific)
 */
export const sendInterviewScheduledEmail = async (payload: any) => {
  const targetEmail = payload?.candidateEmail || payload?.email || payload?.candidate?.email;
  const candidateName = payload?.candidateName || payload?.name || (payload?.candidate ? `${payload.candidate.firstName} ${payload.candidate.lastName}` : 'Candidate');
  const jobTitle = payload?.jobTitle || payload?.job?.title || 'Business Development Associate';
  const roundNumber = parseInt(String(payload?.roundNumber || 1), 10);
  const roundName = payload?.roundName || (roundNumber === 1 ? 'Round 1: Screening & Domain' : roundNumber === 2 ? 'Round 2: Technical & Sales Pitch' : `Round ${roundNumber}`);
  const assignedHrName = payload?.assignedHrName || payload?.hr?.name || 'Talent Acquisition Team';
  const scheduledAt = payload?.scheduledAt;
  const meetingLink = payload?.meetingLink;
  const instructions = payload?.instructions || 'Please be ready in a quiet room with stable high-speed internet and your video camera enabled.';
  const companyName = 'Adyapan Edutech Pvt. Ltd.';

  const scheduledDateObj = scheduledAt ? new Date(scheduledAt) : new Date();

  const interviewDate = scheduledDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const interviewTime = scheduledDateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const meetingLocation = meetingLink || payload?.location || 'https://meet.google.com/adyapan-interview';

  const isRound1 = roundNumber === 1;
  const isRound2 = roundNumber === 2;

  const headerTitle = isRound1
    ? 'APPLICATION SHORTLISTED & ROUND 1 SCHEDULE'
    : isRound2
    ? 'ROUND 1 CLEARED — ROUND 2 INVITATION'
    : 'INTERVIEW INVITATION';

  const introParagraph = isRound1
    ? `We are pleased to inform you that your application for the <strong>${jobTitle}</strong> position has been <strong>SHORTLISTED</strong>. As the next step in our recruitment process, we invite you to attend your <strong>Round 1 (Screening & Domain)</strong> interview.`
    : isRound2
    ? `Congratulations on clearing Round 1! We were impressed with your profile and discussion. You have successfully advanced to <strong>Round 2 (${roundName})</strong> for the position of <strong>${jobTitle}</strong>.`
    : `Congratulations! You have been scheduled for your <strong>${roundName}</strong> interview for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.`;

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 4px 14px rgba(217,119,6,0.12);">
      ${renderEmailHeader(companyName, headerTitle)}
      
      <div style="padding: 32px 32px 28px 32px; font-size: 15px; color: #334155; line-height: 1.7;">
        <p style="margin: 0 0 16px 0;">Dear <strong>${candidateName}</strong>,</p>
        
        <p style="margin: 0 0 16px 0;">
          ${introParagraph}
        </p>
        
        <div style="background-color: #fffbeb; border: 1.5px solid #fde68a; border-radius: 14px; padding: 22px; margin: 24px 0; font-size: 14px; line-height: 1.8; box-shadow: 0 2px 8px rgba(245,158,11,0.06);">
          <p style="margin: 0 0 8px 0; color: #92400e;"><strong>🎯 Interview Stage:</strong> <span style="color: #0f172a; font-weight: 700; background: #fef3c7; padding: 3px 8px; border-radius: 6px;">${roundName}</span></p>
          <p style="margin: 0 0 8px 0; color: #92400e;"><strong>💼 Position:</strong> <span style="color: #1e293b;">${jobTitle}</span></p>
          <p style="margin: 0 0 8px 0; color: #92400e;"><strong>👤 Assigned HR Specialist:</strong> <span style="color: #1e293b; font-weight: 600;">${assignedHrName}</span></p>
          <p style="margin: 0 0 8px 0; color: #92400e;"><strong>📅 Date:</strong> <span style="color: #1e293b; font-weight: 600;">${interviewDate}</span></p>
          <p style="margin: 0 0 8px 0; color: #92400e;"><strong>⏰ Time:</strong> <span style="color: #1e293b; font-weight: 600;">${interviewTime} (IST)</span></p>
          ${instructions ? `<p style="margin: 0 0 10px 0; color: #92400e;"><strong>📝 Instructions:</strong> <span style="color: #1e293b;">${instructions}</span></p>` : ''}
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #fcd34d;">
            <p style="margin: 0 0 6px 0; color: #92400e; font-weight: 700;">🔗 Join Google Meet Video Call:</p>
            <a href="${meetingLocation}" target="_blank" style="display: inline-block; background: #d97706; color: #ffffff; text-decoration: none; font-weight: 700; padding: 10px 20px; border-radius: 8px; font-size: 13px; letter-spacing: 0.2px; box-shadow: 0 2px 6px rgba(217,119,6,0.3);">
              Join Video Interview Now &rarr;
            </a>
            <p style="margin: 6px 0 0 0; font-size: 12px; color: #78350f;">Direct Link: <a href="${meetingLocation}" style="color: #d97706; word-break: break-all;">${meetingLocation}</a></p>
            ${payload?.secureToken ? `
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dotted #fde68a;">
              <p style="margin: 0; font-size: 11px; color: #92400e;">
                Candidate Portal Link: <a href="${(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '')}/secure/interview/${payload.secureToken}" style="color: #b45309; text-decoration: underline;">View Interview Details & Instructions</a>
              </p>
            </div>
            ` : ''}
          </div>
        </div>

        <p style="margin: 0 0 16px 0;">
          Please ensure you join 5 minutes prior to the scheduled time with your microphone and camera tested and ready.
        </p>

        <p style="margin: 0 0 24px 0;">
          We look forward to speaking with you!
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 14px; color: #475569;">
          <p style="margin: 0 0 4px 0;">Best regards,</p>
          <p style="margin: 0;"><strong style="color: #0f172a;">${assignedHrName}</strong></p>
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">Talent Acquisition Team • ${companyName}</p>
        </div>
      </div>
    </div>
  `;

  const emailSubject = isRound1
    ? `Shortlisted for Round 1: ${jobTitle} – ${companyName}`
    : isRound2
    ? `Round 2 Interview Invitation: ${jobTitle} – ${companyName}`
    : `Interview Invitation (${roundName}): ${jobTitle} – ${companyName}`;

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: emailSubject,
    html: emailHtml,
  });
};

/**
 * 3. Send Official Offer Letter Email via Gmail SMTP with PDF Attachment & Token Acceptance Link
 */
export const sendOfferLetterEmail = async (offerPayload: any = {}) => {
  const candidateEmail = offerPayload.candidateEmail || offerPayload.email || offerPayload.candidate?.email || offerPayload.application?.candidate?.email;
  const candidateName = offerPayload.candidateName || offerPayload.name || 'Candidate';
  const jobTitle = offerPayload.jobTitle || 'Business Development Associate (BDA)';
  const salary = offerPayload.salary || 550000;
  const bonus = offerPayload.bonus || 100000;
  const joiningDate = offerPayload.joiningDate || '2026-09-01';
  const customTerms = offerPayload.customTerms;
  const companyTemplateName = offerPayload.companyTemplateName;
  const acceptanceToken = offerPayload.acceptanceToken;
  const companyName = 'Adyapan Edutech Pvt. Ltd.';

  const targetEmail = candidateEmail;
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
  const acceptUrl = acceptanceToken
    ? `${frontendUrl}/offers/accept?token=${acceptanceToken}`
    : `${frontendUrl}/careers`;

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
    logger.info(`Generated ${pdfBuffer ? pdfBuffer.length : 0} bytes PDF offer letter buffer for ${candidateName}`);
  } catch (pdfErr: any) {
    logger.error('PDF Buffer generation error:', pdfErr.message);
  }

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 4px 14px rgba(217,119,6,0.12);">
      ${renderEmailHeader(companyName, 'OFFICIAL OFFER OF EMPLOYMENT')}
      
      <div style="padding: 32px 32px 28px 32px; font-size: 15px; color: #334155; line-height: 1.7;">
        <p style="margin: 0 0 16px 0;">Dear <strong>${candidateName}</strong>,</p>
        
        <p style="margin: 0 0 16px 0;">
          We are pleased to inform you that following your outstanding performance across all interview rounds, you have been selected for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>!
        </p>
        
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1.5px solid #fde68a; border-radius: 14px; padding: 22px; margin: 24px 0; text-align: center; box-shadow: 0 4px 12px rgba(217,119,6,0.08);">
          <span style="font-size: 24px; display: block; margin-bottom: 8px;">🎉</span>
          <h3 style="margin: 0 0 6px 0; color: #92400e; font-size: 18px; font-weight: 800;">Congratulations on Your Selection!</h3>
          <p style="margin: 0 0 16px 0; color: #78350f; font-size: 13px;">Please review your attached 4-Page Offer Letter and confirm your acceptance below.</p>
          
          <a href="${acceptUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; font-weight: 800; font-size: 15px; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(22,163,74,0.35); letter-spacing: 0.3px;">
            ✓ Accept Offer of Employment
          </a>
          
          <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748b;">
            Secure Token Verification Link: <a href="${acceptUrl}" style="color: #d97706; text-decoration: underline;">${acceptUrl}</a>
          </p>
        </div>

        <p style="margin: 0 0 16px 0;">
          Your official <strong>Offer Letter PDF</strong> is attached to this email. It outlines your compensation, joining date, training curriculum, and terms of employment.
        </p>

        <p style="margin: 0 0 24px 0;">
          We are thrilled to welcome you to the Adyapan family and look forward to building exceptional educational solutions together!
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 14px; color: #475569;">
          <p style="margin: 0 0 4px 0;">Warm regards,</p>
          <p style="margin: 0;"><strong style="color: #0f172a;">Executive HR & Talent Acquisition</strong></p>
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">${companyName}</p>
        </div>
      </div>
    </div>
  `;

  const attachments = pdfBuffer
    ? [{ filename: `${candidateName.replace(/\s+/g, '_')}_Official_Adyapan_Offer_Letter.pdf`, content: pdfBuffer }]
    : [];

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: `Offer of Employment: ${jobTitle} at ${companyName}`,
    html: emailHtml,
    attachments,
  });
};

/**
 * 4. Send Professional Candidate Rejection Email
 */
export const sendRejectionEmail = async ({ candidateName, candidateEmail, jobTitle }: any) => {
  const targetEmail = candidateEmail;
  const targetName = candidateName || 'Candidate';
  let targetRole = (jobTitle || '').trim();
  if (!targetRole || targetRole.toLowerCase().includes('student') || targetRole.toLowerCase().includes('fresher') || targetRole.toLowerCase().includes('applicant')) {
    targetRole = 'Business Development Associate (BDA)';
  }
  const companyName = 'Adyapan Edutech Pvt. Ltd.';

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 4px 14px rgba(217,119,6,0.12);">
      ${renderEmailHeader(companyName)}
      
      <div style="padding: 32px 32px 28px 32px; font-size: 15px; color: #334155; line-height: 1.7;">
        <p style="margin: 0 0 16px 0;">Dear <strong>${targetName}</strong>,</p>
        
        <p style="margin: 0 0 16px 0;">
          Thank you for your interest in the <strong>${targetRole}</strong> position at <strong>${companyName}</strong> and for taking the time to participate in our recruitment process.
        </p>
        
        <p style="margin: 0 0 16px 0;">
          After carefully reviewing your application and considering the requirements of the position, we regret to inform you that we have decided not to proceed with your application at this time.
        </p>

        <p style="margin: 0 0 16px 0;">
          This decision was made after careful consideration of the qualifications and requirements for the current role and does not diminish the value of your skills and experience.
        </p>

        <p style="margin: 0 0 16px 0;">
          We sincerely appreciate the time and effort you invested in the application process and encourage you to explore future opportunities with <strong>${companyName}</strong> that may be a better match for your profile.
        </p>

        <p style="margin: 0 0 24px 0;">
          We wish you continued success in your career and all the very best for your future endeavors.
        </p>

        <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 14px; color: #475569;">
          <p style="margin: 0 0 4px 0;">Best regards,</p>
          <p style="margin: 0;"><strong style="color: #0f172a;">Adyapan HR Team</strong></p>
        </div>
      </div>
    </div>
  `;

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: `Application Update: ${targetRole} at ${companyName}`,
    html: emailHtml,
  });
};

/**
 * 5. Send Welcome Onboarding Email
 */
export const sendWelcomeOnboardingEmail = async ({ candidateName, candidateEmail, jobTitle, joiningDate, onboardingToken }: any) => {
  const targetEmail = candidateEmail;
  const targetName = candidateName || 'Selected Candidate';
  const targetRole = jobTitle || 'Business Development Associate (BDA)';
  const companyName = 'Adyapan Edutech Pvt. Ltd.';
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
  const onboardingUrl = onboardingToken
    ? `${frontendUrl}/secure/onboarding/${onboardingToken}`
    : `${frontendUrl}/careers`;

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 4px 14px rgba(217,119,6,0.12);">
      ${renderEmailHeader(companyName, 'Employee Onboarding')}
      
      <div style="padding: 32px 32px 28px 32px; font-size: 15px; color: #334155; line-height: 1.7;">
        <p style="margin: 0 0 16px 0;">Welcome to the Team, <strong>${targetName}</strong>!</p>
        
        <p style="margin: 0 0 16px 0;">
          We are thrilled to welcome you as <strong>${targetRole}</strong> at <strong>${companyName}</strong>! Your official joining date is set for <strong>${joiningDate || '1 Sept 2026'}</strong>.
        </p>
        
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 700;">Your Onboarding Checklist:</p>
          <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 13px; line-height: 1.8;">
            <li>Identity & Educational Degree Verification (Complete)</li>
            <li>Adyapan Work Account & IT Provisioning (In Progress)</li>
            <li>Day 1 Orientation & HR Welcome Briefing</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 26px 0;">
          <a href="${onboardingUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; padding: 13px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(217,119,6,0.3);">
            Complete Candidate Onboarding & Upload Documents &rarr;
          </a>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
            Secure Link: <a href="${onboardingUrl}" style="color: #d97706;">${onboardingUrl}</a>
          </p>
        </div>

        <p style="margin: 0 0 24px 0;">
          Our Talent Acquisition team will share your orientation schedule 48 hours prior to your joining date. We look forward to building together!
        </p>

        <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 14px; color: #475569;">
          <p style="margin: 0 0 4px 0;">Best regards,</p>
          <p style="margin: 0;"><strong style="color: #0f172a;">Adyapan HR Team</strong></p>
        </div>
      </div>
    </div>
  `;

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: `Welcome to ${companyName}! Joining Details for ${targetRole}`,
    html: emailHtml,
  });
};

/**
 * 6. Send Contact Us Form Submission Email to Support (support@adyapan.com)
 */
export const sendContactUsSupportEmail = async ({ fullName, email, phone, subject, message }: any) => {
  const targetSupportEmail = 'support@adyapan.com';
  const companyName = 'Adyapan Edutech Pvt. Ltd.';

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 4px 14px rgba(217,119,6,0.12);">
      ${renderEmailHeader(companyName, 'Support Inquiry')}
      
      <div style="padding: 32px 32px 28px 32px; font-size: 15px; color: #334155; line-height: 1.7;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Inquiry Subject: ${subject || 'General Inquiry'}</h2>
        
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 20px 0; font-size: 14px;">
          <p style="margin: 0 0 8px 0; color: #334155;"><strong>From Name:</strong> ${fullName}</p>
          <p style="margin: 0 0 8px 0; color: #334155;"><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #d97706; font-weight: 600;">${email}</a></p>
          <p style="margin: 0 0 8px 0; color: #334155;"><strong>Phone Number:</strong> ${phone || 'Not Provided'}</p>
          <p style="margin: 0; color: #334155;"><strong>Received At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        </div>

        <div style="background-color: #fefce8; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 18px; margin: 24px 0;">
          <span style="display: block; font-size: 11px; text-transform: uppercase; color: #b45309; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">User Message:</span>
          <p style="margin: 0; color: #1a1a2e; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>

        <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
          Reply directly to <a href="mailto:${email}" style="color: #d97706; font-weight: 700; text-decoration: underline;">${email}</a> to respond to this candidate or user inquiry.
        </p>

        <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">Adyapan Edutech Support System • support@adyapan.com</p>
        </div>
      </div>
    </div>
  `;

  return await dispatchEmailToCandidate({
    to: targetSupportEmail,
    subject: `[Contact Support] ${subject || 'New Message'}: ${fullName}`,
    html: emailHtml,
  });
};

/**
 * 7. Send Today's Interview Reminder Email
 */
export const sendInterviewReminderEmail = async ({ recipientEmail, recipientName, candidateName, jobTitle, scheduledAt, meetingLink, isHR = false }: any) => {
  const formattedDate = new Date(scheduledAt || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const companyName = 'Adyapan Edutech Pvt. Ltd.';

  const subject = isHR
    ? `Today's Interview Reminder – ${candidateName}`
    : `Your Interview is Today – ${jobTitle}`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 4px 14px rgba(217,119,6,0.12);">
      ${renderEmailHeader(companyName, "Today's Scheduled Interview")}
      
      <div style="padding: 32px 32px 28px 32px; font-size: 15px; color: #334155; line-height: 1.7;">
        <p style="margin: 0 0 16px 0;">Hello <strong>${recipientName || 'Team'}</strong>,</p>
        
        <p style="margin: 0 0 16px 0;">
          This is an automated reminder that you have an interview scheduled for today.
        </p>
        
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 20px 0; font-size: 14px; line-height: 1.8;">
          <p style="margin: 0 0 6px 0; color: #92400e;"><strong>Candidate:</strong> <span style="color: #1e293b;">${candidateName}</span></p>
          <p style="margin: 0 0 6px 0; color: #92400e;"><strong>Job Position:</strong> <span style="color: #1e293b;">${jobTitle}</span></p>
          <p style="margin: 0 0 6px 0; color: #92400e;"><strong>Scheduled Time (IST):</strong> <span style="color: #1e293b;">${formattedDate}</span></p>
          ${meetingLink ? `<p style="margin: 0; color: #92400e;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #d97706; font-weight: 700; text-decoration: underline;">${meetingLink}</a></p>` : ''}
        </div>

        <p style="margin: 0 0 24px 0;">
          Please be available at the scheduled time. Good luck!
        </p>

        <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 14px; color: #475569;">
          <p style="margin: 0 0 4px 0;">Best regards,</p>
          <p style="margin: 0;"><strong style="color: #0f172a;">Adyapan HR Team</strong></p>
        </div>
      </div>
    </div>
  `;

  return await dispatchEmailToCandidate({
    to: recipientEmail,
    subject,
    html,
  });
};

export default {
  sendApplicationConfirmationEmail,
  sendInterviewScheduledEmail,
  sendInterviewReminderEmail,
  sendOfferLetterEmail,
  sendRejectionEmail,
  sendWelcomeOnboardingEmail,
  sendContactUsSupportEmail,
};
