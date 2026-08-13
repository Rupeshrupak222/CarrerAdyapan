import nodemailer from 'nodemailer';
import config from '../../config/env.js';

let transporter = null;

if (config.email.host && config.email.user) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
}

export const sendMail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.log(`[EMAIL SIMULATED to ${to}]: Subject "${subject}"`);
    return { success: true, messageId: 'simulated-email-id' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${config.email.from}" <${config.email.from}>`,
      to,
      subject,
      text: text || 'HireAI Notification',
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Failed to send email:', err);
    return { success: false, error: err.message };
  }
};

export default sendMail;
