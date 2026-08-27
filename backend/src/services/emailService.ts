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
      path.join(__dirname, '../assets/adyapan-logo.png'),
      path.join(__dirname, '../../frontend/public/adyapan-logo.png'),
      path.join(process.cwd(), 'backend/src/assets/adyapan-logo.png'),
      path.join(process.cwd(), 'frontend/public/adyapan-logo.png'),
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

// Reusable Adyapan Brand Email Wrapper with Full Mobile Responsiveness & Dark Mode Resiliency
const renderEmailShell = (companyName: string = 'Adyapan Edutech Pvt. Ltd.', subTitle: string | undefined, bodyHtml: string) => {
  const logoUrl = 'https://res.cloudinary.com/tdxhecfr/image/upload/v1787220474/adyapan_edutech_pvt_ltd_logo.jpg';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${companyName}</title>
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; border-left: none !important; border-right: none !important; }
      .email-body { padding: 20px 14px !important; font-size: 14px !important; }
      .email-header { padding: 16px 14px !important; }
      .email-title { font-size: 17px !important; }
      .email-card { padding: 15px 12px !important; margin: 14px 0 !important; border-radius: 10px !important; }
      .email-btn { width: 100% !important; display: block !important; box-sizing: border-box !important; padding: 13px 14px !important; text-align: center !important; font-size: 14.5px !important; }
      .email-row { margin-bottom: 10px !important; padding-bottom: 8px !important; }
      .email-field-val { font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 12px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 0 4px;">
        <div class="email-container" style="max-width: 620px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.06); text-align: left;">
          
          <!-- Header Navbar with Official Adyapan Logo and Golden Amber Theme -->
          <div class="email-header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); padding: 20px 24px; text-align: center; border-bottom: 2px solid #b45309;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px;">
                  <img src="${logoUrl}" alt="Adyapan Logo" width="42" height="42" style="width: 42px; height: 42px; border-radius: 50%; display: block; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.22); border: 2px solid rgba(255,255,255,0.7);" />
                </td>
                <td style="vertical-align: middle; text-align: left;">
                  <span class="email-title" style="color: #ffffff; font-size: 19px; font-weight: 900; letter-spacing: 0.3px; display: block; text-shadow: 0 1px 3px rgba(0,0,0,0.25); line-height: 1.2;">${companyName}</span>
                  ${subTitle ? `<span style="color: #fef3c7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-top: 3px;">${subTitle}</span>` : ''}
                </td>
              </tr>
            </table>
          </div>

          <!-- Main Email Body -->
          <div class="email-body" style="padding: 28px 28px 24px 28px; font-size: 15px; color: #1e293b; line-height: 1.7; background-color: #ffffff;">
            ${bodyHtml}
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
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

  const bodyHtml = `
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
      <p style="margin: 0;"><strong style="color: #0f172a;">Adyapan HR Department</strong></p>
    </div>
  `;

  const emailHtml = renderEmailShell(companyName, undefined, bodyHtml);

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

  const bodyHtml = `
    <p style="margin: 0 0 16px 0;">Dear <strong>${targetName}</strong>,</p>
    
    <p style="margin: 0 0 16px 0;">
      Great news! Your profile has been reviewed and <strong>SHORTLISTED</strong> for the position of <strong>${targetRole}</strong> at <strong>${companyName}</strong>.
    </p>
    
    <div class="email-card" style="background-color: #fffbeb; border: 1.5px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 12px; padding: 18px 16px; margin: 20px 0; font-size: 14px; line-height: 1.6;">
      <p style="margin: 0 0 6px 0; color: #92400e; font-weight: 800;">🎯 Next Steps:</p>
      <p style="margin: 0; color: #78350f;">
        An HR Talent Specialist is being assigned to your application. You will receive an official interview invitation with your Google Meet link shortly.
      </p>
    </div>

    <p style="margin: 0 0 24px 0;">
      Thank you for choosing Adyapan Edutech. We look forward to connecting with you soon!
    </p>
    
    <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px 0;">Best regards,</p>
      <p style="margin: 0;"><strong style="color: #0f172a;">Adyapan HR Department</strong></p>
    </div>
  `;

  const emailHtml = renderEmailShell(companyName, 'APPLICATION SHORTLISTED', bodyHtml);

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: `Application Shortlisted: ${targetRole} at ${companyName}`,
    html: emailHtml,
  });
};

/**
 * 2. Send Interview Invitation Email to Candidate (Round 1 Shortlist & Round 2 Final Interview)
 */
export const sendInterviewScheduledEmail = async (payload: any) => {
  const targetEmail = payload?.candidateEmail || payload?.email || payload?.candidate?.email;
  const candidateName = payload?.candidateName || payload?.name || (payload?.candidate ? `${payload.candidate.firstName} ${payload.candidate.lastName}` : 'Candidate');
  const jobTitle = payload?.jobTitle || payload?.job?.title || 'Business Development Associate';
  const roundNumber = parseInt(String(payload?.roundNumber || 1), 10);
  const assignedHrName = payload?.assignedHrName || payload?.hr?.name || 'Talent Acquisition Team';
  const interviewPanel = payload?.panelName || payload?.interviewerName || payload?.hr?.name || assignedHrName;
  const scheduledAt = payload?.scheduledAt;
  const meetingLink = payload?.meetingLink;
  const companyName = 'Adyapan Edutech Pvt. Ltd.';

  const scheduledDateObj = scheduledAt ? new Date(scheduledAt) : new Date();

  // Format as [DD Month YYYY], e.g. "28 August 2026"
  const interviewDate = scheduledDateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Format as [HH:MM AM/PM], e.g. "10:33 AM"
  const interviewTime = scheduledDateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const rawLocation = payload?.location || meetingLink || '';
  const isOffline = rawLocation && !rawLocation.startsWith('http') && !rawLocation.toLowerCase().includes('meet');
  const modeText = payload?.mode || (isOffline ? 'Offline / In-Person' : 'Online Interview');
  const meetingLocation = meetingLink || payload?.location || 'https://meet.google.com/adyapan-interview';

  const isRound1 = roundNumber === 1;

  let headerTitle = isRound1 ? 'APPLICATION SHORTLISTED & INTERVIEW INVITATION' : 'FINAL INTERVIEW ROUND INVITATION';
  let emailSubject = isRound1 ? `Shortlisted for Interview Round: ${jobTitle} – ${companyName}` : `Final Interview Round Invitation: ${jobTitle} – ${companyName}`;

  const bodyHtml = `
    <p style="margin: 0 0 16px 0;">Dear <strong>${candidateName}</strong>,</p>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: ${isRound1 ? '#d97706' : '#16a34a'};">
      Congratulations!
    </p>

    <p style="margin: 0 0 16px 0;">
      ${isRound1 
        ? `We are pleased to inform you that your application for the <strong>${jobTitle}</strong> role at <strong>${companyName}</strong> has been successfully reviewed, and you have been <strong>shortlisted for the interview round</strong>.`
        : `We are delighted to inform you that you have successfully cleared the initial selection process and have been shortlisted for the <strong>Final Interview Round</strong> at <strong>${companyName}</strong>.`
      }
    </p>

    <p style="margin: 0 0 20px 0;">
      ${isRound1 
        ? `We were impressed by your profile and would like to invite you to attend an interview as per the details below:`
        : `Your performance in the previous rounds was highly appreciated, and we would now like to invite you to the final stage of our recruitment process:`
      }
    </p>
    
    <!-- Mobile-Optimized Stacked Field Card -->
    <div class="email-card" style="background-color: #ffffff; border: 1.5px solid ${isRound1 ? '#fde68a' : '#bbf7d0'}; border-left: 4.5px solid ${isRound1 ? '#d97706' : '#16a34a'}; border-radius: 12px; padding: 18px 16px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
      <div style="font-size: 15px; font-weight: 800; color: ${isRound1 ? '#92400e' : '#166534'}; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1.5px solid ${isRound1 ? '#fef3c7' : '#dcfce7'};">
        ${isRound1 ? '📌 Interview Schedule & Details' : '🎯 Final Interview Schedule & Details'}
      </div>

      <!-- Position -->
      <div class="email-row" style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 2px;">Position</div>
        <div class="email-field-val" style="font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.4;">${jobTitle}</div>
      </div>

      <!-- Date & Time -->
      <div class="email-row" style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 2px;">Interview Date & Time</div>
        <div class="email-field-val" style="font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.4;">📅 ${interviewDate} &nbsp;•&nbsp; ⏰ ${interviewTime} (IST)</div>
      </div>

      <!-- Mode -->
      <div class="email-row" style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 2px;">Interview Mode</div>
        <div class="email-field-val" style="font-size: 14.5px; font-weight: 600; color: #0f172a;">${modeText}</div>
      </div>

      <!-- Panel / HR -->
      <div class="email-row" style="margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 2px;">Interviewer / Panel</div>
        <div class="email-field-val" style="font-size: 14.5px; font-weight: 600; color: #0f172a;">${interviewPanel}</div>
      </div>

      <!-- Direct Full-Width Join Button -->
      <div style="margin-top: 14px; text-align: center;">
        <a class="email-btn" href="${meetingLocation}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, ${isRound1 ? '#d97706 0%, #b45309' : '#16a34a 0%, #15803d'} 100%); color: #ffffff !important; text-decoration: none; font-weight: 800; padding: 13px 20px; border-radius: 8px; font-size: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); letter-spacing: 0.2px;">
          📹 Join Video Interview &rarr;
        </a>
        <div style="margin-top: 10px; font-size: 12px; color: #64748b; word-break: break-all; line-height: 1.4;">
          Meeting Link: <a href="${meetingLocation}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">${meetingLocation}</a>
        </div>
      </div>

      ${payload?.secureToken ? `
      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed ${isRound1 ? '#fcd34d' : '#86efac'}; text-align: center;">
        <a href="${(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '')}/secure/interview/${payload.secureToken}" target="_blank" style="font-size: 12.5px; color: ${isRound1 ? '#b45309' : '#15803d'}; text-decoration: underline; font-weight: 700;">
          👉 Open Candidate Portal (View Details & Prepare) &rarr;
        </a>
      </div>
      ` : ''}
    </div>

    <!-- Important Instructions Box -->
    <div class="email-card" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; color: #0f172a; font-weight: 700; font-size: 14px;">
        ⚠️ Important Instructions
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13.5px; line-height: 1.8;">
        <li style="margin-bottom: 4px;">Please join the meeting 10 minutes before the scheduled time.</li>
        <li style="margin-bottom: 4px;">Ensure you have a stable internet connection.</li>
        <li style="margin-bottom: 4px;">Keep a copy of your resume ready for reference.</li>
        <li>Maintain professional attire and a quiet, distraction-free environment.</li>
      </ul>
    </div>

    <p style="margin: 18px 0 14px 0; font-weight: 600; color: #1e293b;">
      Kindly confirm your availability by replying to this email.
    </p>

    <p style="margin: 0 0 24px 0; color: #475569;">
      We look forward to meeting you and discussing how your skills and aspirations align with the opportunities at ${companyName}.
    </p>
    
    <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px 0;">Warm Regards,</p>
      <p style="margin: 0;"><strong style="color: #0f172a; font-size: 15px;">${assignedHrName}</strong></p>
      <p style="margin: 2px 0 0 0; color: #64748b; font-size: 13px;">Human Resources Department</p>
      <p style="margin: 2px 0 0 0;"><strong style="color: #d97706; font-size: 13px;">${companyName}</strong></p>
    </div>
  `;

  const emailHtml = renderEmailShell(companyName, headerTitle, bodyHtml);

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: emailSubject,
    html: emailHtml,
  });
};

/**
 * 3. Send Official Offer Letter Email via Gmail SMTP with PDF Attachment
 */
export const sendOfferLetterEmail = async (offerPayload: any = {}) => {
  const candidateEmail = offerPayload.candidateEmail || offerPayload.email || offerPayload.candidate?.email || offerPayload.application?.candidate?.email;
  const candidateName = offerPayload.candidateName || offerPayload.name || (offerPayload.candidate ? `${offerPayload.candidate.firstName} ${offerPayload.candidate.lastName}` : 'Candidate');
  const candidateAddress = offerPayload.address || offerPayload.candidateAddress || offerPayload.candidate?.address || 'India';
  const jobTitle = offerPayload.jobTitle || offerPayload.job?.title || 'Business Development Associate (BDA)';
  const department = offerPayload.department || 'Sales & Business Development';
  const employmentType = offerPayload.employmentType || offerPayload.jobType || 'Full-Time';
  const reportingTo = offerPayload.reportingTo || offerPayload.managerName || 'Operations Manager / HR Lead';
  const workLocation = offerPayload.location || offerPayload.workLocation || 'Remote / Hybrid (Hyderabad)';
  const salary = offerPayload.salary || 550000;
  const bonus = offerPayload.bonus || 100000;
  const joiningDate = offerPayload.joiningDate;
  const probationPeriod = offerPayload.probationPeriod || offerPayload.duration || '3 months';
  const customTerms = offerPayload.customTerms;
  const companyTemplateName = offerPayload.companyTemplateName;
  const companyName = 'Adyapan Edutech Pvt. Ltd.';
  const hrName = offerPayload.hrManagerName || offerPayload.assignedHrName || offerPayload.hr?.name || 'Talent Acquisition Team';
  const hrEmail = offerPayload.hrEmail || 'hr@adyapan.com';
  const hrPhone = offerPayload.hrPhone || '+91 8179124566';
  const companyWebsite = offerPayload.companyWebsite || 'www.adyapan.com';

  const targetEmail = candidateEmail;

  // Format Dates
  const offerDateObj = offerPayload.offerDate ? new Date(offerPayload.offerDate) : new Date();
  const offerDateFormatted = !isNaN(offerDateObj.getTime())
    ? offerDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const joiningDateObj = joiningDate ? new Date(joiningDate) : null;
  const joiningDateFormatted = (joiningDateObj && !isNaN(joiningDateObj.getTime()))
    ? joiningDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : (offerPayload.reportingDate || 'To be communicated upon joining');

  const monthlySalaryFormatted = offerPayload.stipend || (typeof salary === 'number' ? `₹${Math.round(salary / 12).toLocaleString('en-IN')}` : (salary ? `₹${salary}` : '₹20,000'));
  const annualCtcFormatted = offerPayload.postProbationCtc || (typeof salary === 'number' ? `₹${Number(salary).toLocaleString('en-IN')}` : (salary ? `₹${salary}` : '₹6,00,000 - ₹8,00,000 LPA'));

  let pdfBuffer = null;
  try {
    pdfBuffer = await generateOfferLetterPdfBuffer({
      olNo: offerPayload.olNo || 'ADP0428',
      offerDate: offerPayload.offerDate || offerDateFormatted,
      candidateName,
      duration: probationPeriod,
      jobTitle,
      trainingStartDate: joiningDate || offerPayload.trainingStartDate || '25-May-2026',
      trainingEndDate: offerPayload.trainingEndDate || '06-Jun-2026',
      ojtStartDate: offerPayload.ojtStartDate || '07-Jun-2026',
      ojtEndDate: offerPayload.ojtEndDate || '07-Dec-2026',
      location: workLocation,
      stipend: monthlySalaryFormatted,
      incentives: offerPayload.incentives || (bonus ? `Up to ${bonus}/- INCENTIVES.` : 'Up to 10,000/- INCENTIVES.'),
      postProbationCtc: annualCtcFormatted,
      reportingDate: joiningDateFormatted,
      unpaidDays: offerPayload.unpaidDays || '12',
      stipendStartDay: offerPayload.stipendStartDay || '13th day',
      workingHours: offerPayload.workingHours || '9 Hours a day (Inc. Lunch Break).',
      workTiming: offerPayload.workTiming || '11AM - 8 PM.',
      jobType: employmentType,
      hrEmail,
      hrPhone,
      companyWebsite,
      hrManagerName: hrName,
      customTerms,
      companyTemplateName,
    });
    logger.info(`Generated ${pdfBuffer ? pdfBuffer.length : 0} bytes PDF offer letter buffer for ${candidateName}`);
  } catch (pdfErr: any) {
    logger.error('PDF Buffer generation error:', pdfErr.message);
  }

  const bodyHtml = `
    <div style="border-bottom: 2px solid #fde68a; padding-bottom: 14px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 6px 0; color: #92400e; font-size: 20px; font-weight: 800;">Offer Letter – ${companyName}</h2>
      <p style="margin: 0; font-size: 13.5px; color: #64748b;"><strong>Date:</strong> ${offerDateFormatted}</p>
      <div style="margin-top: 10px; font-size: 13.5px; color: #334155; line-height: 1.5;">
        <strong>To,</strong><br/>
        <strong>${candidateName}</strong><br/>
        ${candidateAddress}
      </div>
    </div>

    <p style="margin: 0 0 14px 0; font-weight: 700; color: #0f172a; font-size: 15px;">
      Subject: Offer of Employment
    </p>

    <p style="margin: 0 0 14px 0;">Dear <strong>${candidateName}</strong>,</p>
    
    <p style="margin: 0 0 16px 0;">
      We are pleased to offer you the position of <strong>${jobTitle}</strong> with <strong>${companyName}</strong>. We were impressed with your qualifications, skills, and performance throughout our selection process, and we are confident that you will be a valuable addition to our organization.
    </p>

    <p style="margin: 0 0 18px 0;">
      Your employment will be governed by the following terms and conditions:
    </p>
    
    <!-- Employment Details Card -->
    <div class="email-card" style="background-color: #fffbeb; border: 1.5px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 12px; padding: 18px 16px; margin: 18px 0; font-size: 14px; line-height: 1.8;">
      <p style="margin: 0 0 10px 0; color: #92400e; font-size: 15px; font-weight: 800; border-bottom: 1px solid #fde68a; padding-bottom: 4px;">
        📋 Employment Details
      </p>
      <div class="email-row" style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(253,230,138,0.5);">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #78350f; display: block;">Designation</span>
        <span class="email-field-val" style="font-size: 14.5px; font-weight: 700; color: #0f172a;">${jobTitle}</span>
      </div>
      <div class="email-row" style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(253,230,138,0.5);">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #78350f; display: block;">Department</span>
        <span class="email-field-val" style="font-size: 14px; font-weight: 600; color: #0f172a;">${department}</span>
      </div>
      <div class="email-row" style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(253,230,138,0.5);">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #78350f; display: block;">Work Location</span>
        <span class="email-field-val" style="font-size: 14px; font-weight: 600; color: #0f172a;">${workLocation}</span>
      </div>
      <div class="email-row" style="margin-bottom: 4px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #78350f; display: block;">Date of Joining</span>
        <span class="email-field-val" style="font-size: 14px; font-weight: 700; color: #0f172a;">${joiningDateFormatted}</span>
      </div>
    </div>

    <!-- Compensation & Benefits Card -->
    <div class="email-card" style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 12px; padding: 18px 16px; margin: 18px 0; font-size: 14px; line-height: 1.8;">
      <p style="margin: 0 0 10px 0; color: #166534; font-size: 15px; font-weight: 800; border-bottom: 1px solid #bbf7d0; padding-bottom: 4px;">
        💰 Compensation & Benefits
      </p>
      <div class="email-row" style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(187,247,208,0.5);">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #15803d; display: block;">Monthly Stipend / Salary</span>
        <span class="email-field-val" style="font-size: 15px; font-weight: 800; color: #0f172a;">${monthlySalaryFormatted}</span>
      </div>
      <div class="email-row" style="margin-bottom: 4px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #15803d; display: block;">Annual CTC (Post-Probation)</span>
        <span class="email-field-val" style="font-size: 14.5px; font-weight: 700; color: #0f172a;">${annualCtcFormatted}</span>
      </div>
    </div>

    <!-- Probation Period Card -->
    <div class="email-card" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; margin: 18px 0;">
      <p style="margin: 0 0 6px 0; color: #0f172a; font-weight: 700; font-size: 14px;">⏱️ Probation Period</p>
      <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.6;">
        You will be on probation for a period of <strong>${probationPeriod}</strong> from your date of joining. Upon satisfactory completion of the probation period, your employment will be confirmed in writing.
      </p>
    </div>

    <!-- Confidentiality & Company Policies -->
    <div class="email-card" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; margin: 18px 0;">
      <p style="margin: 0 0 6px 0; color: #0f172a; font-weight: 700; font-size: 14px;">🔒 Confidentiality & Company Policies</p>
      <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.6;">
        During your employment, you will be required to maintain strict confidentiality regarding all business information, client data, intellectual property, and internal processes of the company. You are expected to comply with all company rules, regulations, and policies.
      </p>
    </div>

    <!-- Documents Required on Joining -->
    <div class="email-card" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; margin: 18px 0;">
      <p style="margin: 0 0 8px 0; color: #0f172a; font-weight: 700; font-size: 14px;">📄 Documents Required on Joining</p>
      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">Please submit the following documents on or before your joining date:</p>
      <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13.5px; line-height: 1.8;">
        <li style="margin-bottom: 4px;">Updated Resume/CV</li>
        <li style="margin-bottom: 4px;">Government ID Proof (Aadhaar/PAN)</li>
        <li style="margin-bottom: 4px;">Passport-size Photograph</li>
        <li style="margin-bottom: 4px;">Academic Certificates & Mark Sheets</li>
        <li style="margin-bottom: 4px;">Experience/Internship Certificates (if applicable)</li>
        <li>Bank Account Details</li>
      </ul>
    </div>

    <p style="margin: 16px 0;">
      We are excited about the possibility of you joining our team and contributing to the continued success of <strong>${companyName}</strong>. We believe your skills and dedication will play an important role in our growth journey.
    </p>

    <p style="margin: 0 0 20px 0;">
      We welcome you to the Adyapan family and look forward to a successful and rewarding association.
    </p>

    <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 18px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px 0;">Sincerely,</p>
      <p style="margin: 0;"><strong style="color: #0f172a; font-size: 15px;">${hrName}</strong></p>
      <p style="margin: 2px 0 0 0; color: #64748b; font-size: 13px;">Human Resources Department</p>
      <p style="margin: 2px 0 0 0;"><strong style="color: #d97706; font-size: 13px;">${companyName}</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">
        Website: <a href="http://${companyWebsite}" style="color: #d97706;">${companyWebsite}</a> | Email: <a href="mailto:${hrEmail}" style="color: #d97706;">${hrEmail}</a> | Phone: ${hrPhone}
      </p>
    </div>

    <!-- Note about PDF Attachment -->
    <div style="margin-top: 18px; padding: 12px 16px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 13px; color: #1e40af;">
      📎 <strong>Offer Letter Attached:</strong> An official signed PDF copy of this Offer Letter is attached to this email.
    </div>
  `;

  const emailHtml = renderEmailShell(companyName, 'OFFICIAL OFFER OF EMPLOYMENT', bodyHtml);

  const attachments = pdfBuffer
    ? [{ filename: `${candidateName.replace(/\s+/g, '_')}_Official_Adyapan_Offer_Letter.pdf`, content: pdfBuffer }]
    : [];

  return await dispatchEmailToCandidate({
    to: targetEmail,
    subject: `Offer of Employment: ${jobTitle} – ${companyName}`,
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

  const bodyHtml = `
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
      <p style="margin: 0;"><strong style="color: #0f172a;">Adyapan HR Department</strong></p>
    </div>
  `;

  const emailHtml = renderEmailShell(companyName, undefined, bodyHtml);

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

  const bodyHtml = `
    <p style="margin: 0 0 16px 0;">Welcome to the Team, <strong>${targetName}</strong>!</p>
    
    <p style="margin: 0 0 16px 0;">
      We are thrilled to welcome you as <strong>${targetRole}</strong> at <strong>${companyName}</strong>! Your official joining date is set for <strong>${joiningDate || '1 Sept 2026'}</strong>.
    </p>
    
    <div class="email-card" style="background-color: #fffbeb; border: 1.5px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 12px; padding: 18px 16px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 700;">Your Onboarding Checklist:</p>
      <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 13.5px; line-height: 1.8;">
        <li>Identity & Educational Degree Verification (Complete)</li>
        <li>Adyapan Work Account & IT Provisioning (In Progress)</li>
        <li>Day 1 Orientation & HR Welcome Briefing</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a class="email-btn" href="${onboardingUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 14.5px; padding: 13px 24px; border-radius: 10px; box-shadow: 0 4px 12px rgba(217,119,6,0.3); text-align: center;">
        Complete Candidate Onboarding & Upload Documents &rarr;
      </a>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b; word-break: break-all;">
        Secure Link: <a href="${onboardingUrl}" style="color: #d97706;">${onboardingUrl}</a>
      </p>
    </div>

    <p style="margin: 0 0 24px 0;">
      Our Talent Acquisition team will share your orientation schedule 48 hours prior to your joining date. We look forward to building together!
    </p>

    <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px 0;">Best regards,</p>
      <p style="margin: 0;"><strong style="color: #0f172a;">Adyapan HR Department</strong></p>
    </div>
  `;

  const emailHtml = renderEmailShell(companyName, 'Employee Onboarding', bodyHtml);

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

  const bodyHtml = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Inquiry Subject: ${subject || 'General Inquiry'}</h2>
    
    <div class="email-card" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px 16px; margin: 20px 0; font-size: 14px;">
      <p style="margin: 0 0 8px 0; color: #334155;"><strong>From Name:</strong> ${fullName}</p>
      <p style="margin: 0 0 8px 0; color: #334155;"><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #d97706; font-weight: 600;">${email}</a></p>
      <p style="margin: 0 0 8px 0; color: #334155;"><strong>Phone Number:</strong> ${phone || 'Not Provided'}</p>
      <p style="margin: 0; color: #334155;"><strong>Received At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
    </div>

    <div class="email-card" style="background-color: #fefce8; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 18px; margin: 24px 0;">
      <span style="display: block; font-size: 11px; text-transform: uppercase; color: #b45309; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">User Message:</span>
      <p style="margin: 0; color: #1a1a2e; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
    </div>

    <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
      Reply directly to <a href="mailto:${email}" style="color: #d97706; font-weight: 700; text-decoration: underline;">${email}</a> to respond to this candidate or user inquiry.
    </p>

    <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
      <p style="margin: 0;">Adyapan Edutech Support System • support@adyapan.com</p>
    </div>
  `;

  const emailHtml = renderEmailShell(companyName, 'Support Inquiry', bodyHtml);

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

  const bodyHtml = `
    <p style="margin: 0 0 16px 0;">Hello <strong>${recipientName || 'Team'}</strong>,</p>
    
    <p style="margin: 0 0 16px 0;">
      This is an automated reminder that you have an interview scheduled for today.
    </p>
    
    <div class="email-card" style="background-color: #fffbeb; border: 1.5px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 12px; padding: 18px 16px; margin: 20px 0; font-size: 14px; line-height: 1.8;">
      <div class="email-row" style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(253,230,138,0.5);">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #78350f; display: block;">Candidate</span>
        <span class="email-field-val" style="font-size: 15px; font-weight: 700; color: #0f172a;">${candidateName}</span>
      </div>
      <div class="email-row" style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(253,230,138,0.5);">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #78350f; display: block;">Job Position</span>
        <span class="email-field-val" style="font-size: 14.5px; font-weight: 700; color: #0f172a;">${jobTitle}</span>
      </div>
      <div class="email-row" style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(253,230,138,0.5);">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #78350f; display: block;">Scheduled Time (IST)</span>
        <span class="email-field-val" style="font-size: 14px; font-weight: 700; color: #0f172a;">📅 ${formattedDate}</span>
      </div>
      ${meetingLink ? `
      <div style="margin-top: 14px; text-align: center;">
        <a class="email-btn" href="${meetingLink}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff !important; text-decoration: none; font-weight: 800; padding: 13px 20px; border-radius: 8px; font-size: 15px; text-align: center; box-shadow: 0 4px 12px rgba(22,163,74,0.25);">
          📹 Join Video Interview &rarr;
        </a>
      </div>
      ` : ''}
    </div>

    <p style="margin: 0 0 24px 0;">
      Please be available at the scheduled time. Good luck!
    </p>

    <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 4px 0;">Best regards,</p>
      <p style="margin: 0;"><strong style="color: #0f172a;">Adyapan HR Department</strong></p>
    </div>
  `;

  const html = renderEmailShell(companyName, "Today's Scheduled Interview", bodyHtml);

  return await dispatchEmailToCandidate({
    to: recipientEmail,
    subject,
    html,
  });
};

export default {
  sendApplicationConfirmationEmail,
  sendShortlistEmail,
  sendInterviewScheduledEmail,
  sendInterviewReminderEmail,
  sendOfferLetterEmail,
  sendRejectionEmail,
  sendWelcomeOnboardingEmail,
  sendContactUsSupportEmail,
};
