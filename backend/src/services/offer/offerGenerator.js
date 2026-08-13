import generateOfferPDF from './pdfGenerator.js';

export const createOfferLetterPackage = async (offerData) => {
  const pdfBuffer = await generateOfferPDF(offerData);

  return {
    pdfBuffer,
    fileName: `Offer_Letter_${offerData.candidateName?.replace(/\s+/g, '_') || 'Candidate'}.pdf`,
    generatedAt: new Date().toISOString(),
  };
};

export default { createOfferLetterPackage };
