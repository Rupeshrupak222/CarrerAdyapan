import sendMail from './sendEmail.js';

export const sendInterviewInviteEmail = async (candidateEmail, candidateName, jobTitle, scheduledAt, meetingLink) => {
  const subject = `Interview Invitation: ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2563eb;">Interview Scheduled!</h2>
      <p>Hi <strong>${candidateName}</strong>,</p>
      <p>We are excited to invite you to an interview for the <strong>${jobTitle}</strong> position.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${new Date(scheduledAt).toLocaleString()}</p>
        ${meetingLink ? `<p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #2563eb;">Join Meeting</a></p>` : ''}
      </div>
      <p>Please confirm your availability.</p>
      <p>Best regards,<br/>Recruitment Team</p>
    </div>
  `;

  return sendMail({ to: candidateEmail, subject, html });
};

export const sendOfferLetterEmail = async (candidateEmail, candidateName, jobTitle, offerDetails) => {
  const subject = `Job Offer: ${jobTitle} Position`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #10b981;">Congratulations! Official Offer Letter</h2>
      <p>Dear <strong>${candidateName}</strong>,</p>
      <p>We are delighted to offer you the position of <strong>${jobTitle}</strong>.</p>
      <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #a7f3d0;">
        <p style="margin: 5px 0;"><strong>Base Salary:</strong> $${offerDetails.salary?.toLocaleString()}/yr</p>
        <p style="margin: 5px 0;"><strong>Joining Date:</strong> ${new Date(offerDetails.joiningDate).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Offer Expires:</strong> ${new Date(offerDetails.expirationDate).toLocaleDateString()}</p>
      </div>
      <p>Please review and sign your offer letter.</p>
      <p>Welcome to the team!</p>
    </div>
  `;

  return sendMail({ to: candidateEmail, subject, html });
};

export default { sendInterviewInviteEmail, sendOfferLetterEmail };
