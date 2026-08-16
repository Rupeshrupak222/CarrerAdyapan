import nodemailer from 'nodemailer';
import config from '../../config/env.js';

let transporter: any = null;

if ((config as any).email?.host && (config as any).email?.user) {
  transporter = nodemailer.createTransport({
    host: (config as any).email.host,
    port: (config as any).email.port,
    auth: {
      user: (config as any).email.user,
      pass: (config as any).email.pass,
    },
  } as any);
}

export const sendMail = async ({ to, subject, html, text }: { to: any; subject: any; html?: any; text?: any }) => {
  if (!transporter) {
    console.log(`[EMAIL SIMULATED to ${to}]: Subject "${subject}"`);
    return { success: true, messageId: 'simulated-email-id' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${(config as any).email?.from || 'Adyapan Edutech'}" <${(config as any).email?.from || 'noreply@adyapan.com'}>`,
      to,
      subject,
      text: text || 'HireAI Notification',
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('Failed to send email:', err);
    return { success: false, error: err.message };
  }
};

export default sendMail;
