import PDFDocument from 'pdfkit';

export const generateOfferPDF = (offerData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc
        .fillColor('#2563eb')
        .fontSize(24)
        .text('OFFER OF EMPLOYMENT', { align: 'center' })
        .moveDown(0.5);

      doc
        .fillColor('#4b5563')
        .fontSize(10)
        .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
        .moveDown(1.5);

      // Recipient
      doc
        .fillColor('#111827')
        .fontSize(12)
        .text(`Dear ${offerData.candidateName || 'Candidate'},`, { underline: true })
        .moveDown(1);

      doc
        .fontSize(11)
        .text(
          `We are pleased to extend an offer of employment for the position of ${offerData.jobTitle || 'Team Member'} at ${offerData.companyName || 'HireAI Inc.'}. We were extremely impressed by your experience, background, and performance during our selection process.`,
          { align: 'justify' }
        )
        .moveDown(1.5);

      // Offer Details Table/Box
      doc
        .fillColor('#1e40af')
        .fontSize(13)
        .text('Summary of Compensation & Terms:', { underline: true })
        .moveDown(0.5);

      doc
        .fillColor('#374151')
        .fontSize(11)
        .text(`• Annual Base Salary: $${offerData.salary?.toLocaleString() || 'N/A'}`)
        .text(`• Joining Date: ${offerData.joiningDate ? new Date(offerData.joiningDate).toLocaleDateString() : 'TBD'}`)
        .text(`• Expiration Date: ${offerData.expirationDate ? new Date(offerData.expirationDate).toLocaleDateString() : 'TBD'}`)
        .moveDown(1.5);

      if (offerData.benefits && offerData.benefits.length > 0) {
        doc
          .fillColor('#1e40af')
          .fontSize(13)
          .text('Benefits & Perks:', { underline: true })
          .moveDown(0.5);

        offerData.benefits.forEach((benefit) => {
          doc.fillColor('#374151').fontSize(11).text(`• ${benefit}`);
        });
        doc.moveDown(1.5);
      }

      // Closing
      doc
        .fillColor('#374151')
        .fontSize(11)
        .text('To accept this offer, please sign and return this document before the expiration date noted above.')
        .moveDown(2);

      doc.text('Sincerely,');
      doc.fontSize(12).fillColor('#111827').text(offerData.companyName || 'HireAI Talent Team');

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export default generateOfferPDF;
