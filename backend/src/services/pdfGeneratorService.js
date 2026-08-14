import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import mammoth from 'mammoth';
import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';

const cleanText = (str) => {
  if (typeof str !== 'string') return String(str || '');
  return str
    .replace(/₹/g, 'Rs. ')
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/”/g, '"')
    .replace(/“/g, '"')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/[^\x00-\x7F]/g, '');
};

/**
 * Convert extracted Word (.docx) text into a formatted PDF document with pdf-lib
 */
const generatePdfFromDocxText = async (extractedText, offerData) => {
  const {
    candidateName = 'Candidate',
    jobTitle = 'COMMUNITY DEVELOPMENT INTERN',
    stipend = 'INR 20000/-PerMonth',
    postProbationCtc = 'Rs. 8 LPA',
    trainingStartDate = '25-May-2026',
    olNo = 'ADP0428',
  } = offerData;

  // Inject candidate offer variables into docx template text
  let processedText = cleanText(extractedText)
    .replace(/\{\{candidateName\}\}/gi, candidateName)
    .replace(/\[Candidate Name\]/gi, candidateName)
    .replace(/\{\{jobTitle\}\}/gi, jobTitle)
    .replace(/\[Job Title\]/gi, jobTitle)
    .replace(/\{\{stipend\}\}/gi, stipend)
    .replace(/\[Stipend\]/gi, stipend)
    .replace(/\{\{postProbationCtc\}\}/gi, postProbationCtc)
    .replace(/\[CTC\]/gi, postProbationCtc)
    .replace(/\{\{trainingStartDate\}\}/gi, trainingStartDate)
    .replace(/\[Joining Date\]/gi, trainingStartDate)
    .replace(/\{\{olNo\}\}/gi, olNo);

  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const orangeHeaderColor = rgb(0.9, 0.54, 0.0);
  const crimsonSchoolColor = rgb(0.75, 0.0, 0.0);
  const textDark = rgb(0.06, 0.09, 0.16);

  let page = pdfDoc.addPage([595, 842]);
  let y = 780;

  // Header banner for Word doc PDF
  page.drawText("SR'S ADYAPAN EDUTECH PRIVATE LIMITED", { x: 100, y, size: 15, font: fontBold, color: orangeHeaderColor });
  page.drawText("A D Y A P A N   S C H O O L", { x: 200, y: y - 16, size: 10, font: fontBold, color: crimsonSchoolColor });
  page.drawLine({ start: { x: 40, y: y - 24 }, end: { x: 555, y: y - 24 }, thickness: 1.5, color: textDark });
  y -= 45;

  const lines = processedText.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      y -= 12;
      continue;
    }

    if (y < 60) {
      page = pdfDoc.addPage([595, 842]);
      y = 780;
      page.drawText("SR'S ADYAPAN EDUTECH PRIVATE LIMITED", { x: 100, y, size: 15, font: fontBold, color: orangeHeaderColor });
      page.drawLine({ start: { x: 40, y: y - 10 }, end: { x: 555, y: y - 10 }, thickness: 1, color: textDark });
      y -= 35;
    }

    const isHeader = line.toUpperCase() === line && line.length < 50;
    const fontToUse = isHeader ? fontBold : fontRegular;
    const fontSize = isHeader ? 10.5 : 9.5;

    const words = line.split(' ');
    let currentLineStr = '';
    for (const word of words) {
      const testStr = currentLineStr ? `${currentLineStr} ${word}` : word;
      if (testStr.length > 85) {
        page.drawText(currentLineStr, { x: 45, y, size: fontSize, font: fontToUse, color: textDark });
        y -= 15;
        if (y < 60) {
          page = pdfDoc.addPage([595, 842]);
          y = 780;
        }
        currentLineStr = word;
      } else {
        currentLineStr = testStr;
      }
    }
    if (currentLineStr) {
      page.drawText(currentLineStr, { x: 45, y, size: fontSize, font: fontToUse, color: textDark });
      y -= 16;
    }
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};

/**
 * High-Fidelity 4-Page Adyapan Edutech Offer Letter PDF Generator using pdf-lib
 * Matches the exact SR'S ADYAPAN EDUTECH PRIVATE LIMITED / ADYAPAN SCHOOL template layout.
 */
export const generateOfferLetterPdfBuffer = async (rawOfferData = {}) => {
  const offerData = {};
  if (rawOfferData && typeof rawOfferData === 'object') {
    Object.keys(rawOfferData).forEach((key) => {
      offerData[key] = cleanText(rawOfferData[key]);
    });
  }

  const {
    olNo = 'ADP0428',
    offerDate = '14-May-2026',
    candidateName = 'Candidate',
    duration = '6 MONTHS',
    jobTitle = 'COMMUNITY DEVELOPMENT INTERN',
    trainingStartDate = '25-May-2026',
    trainingEndDate = '06-Jun-2026',
    ojtStartDate = '07-Jun-2026',
    ojtEndDate = '07-Dec-2026',
    location = 'HYDERABAD',
    stipend = 'INR 20000/-PerMonth',
    incentives = 'Up to 10,000/- INCENTIVES.',
    postProbationCtc = 'Rs. 8 LPA ( 6 Fixed + 2 Variable )',
    reportingDate = '25-May-2026',
    unpaidDays = '12',
    stipendStartDay = '13th day',
    workingHours = '9 Hours a day (Inc. Lunch Break).',
    workTiming = '11AM - 8 PM.',
    jobType = 'Full Time Training',
    hrEmail = 'hr@adyapan.com',
    hrPhone = '8179124566',
    companyWebsite = 'www.adyapanschool.com',
    hrManagerName = 'HR MANAGER',
  } = offerData;

  // If a custom uploaded Word template exists, extract custom terms text if available
  let customDocxText = '';
  let customTemplateDataUrl = rawOfferData.templateDataUrl;
  let customTemplateName = rawOfferData.companyTemplateName || rawOfferData.templateName;

  if (!customTemplateDataUrl) {
    try {
      const urlSetting = await prisma.systemSetting.findUnique({ where: { key: 'global_offer_template_url' } });
      const nameSetting = await prisma.systemSetting.findUnique({ where: { key: 'global_offer_template_name' } });
      if (urlSetting?.dataUrl) {
        customTemplateDataUrl = urlSetting.dataUrl;
        customTemplateName = nameSetting?.value || 'Custom_Uploaded_Template';
      }
    } catch (dbErr) {
      logger.warn('Failed to fetch custom template from DB:', dbErr.message);
    }
  }

  if (customTemplateDataUrl && typeof customTemplateDataUrl === 'string' && customTemplateDataUrl.includes('base64,')) {
    if (customTemplateDataUrl.includes('word') || customTemplateName?.endsWith('.docx') || customTemplateName?.endsWith('.doc')) {
      try {
        const base64Data = customTemplateDataUrl.split('base64,')[1];
        const templateBuffer = Buffer.from(base64Data, 'base64');
        const docxResult = await mammoth.extractRawText({ buffer: templateBuffer });
        if (docxResult.value && docxResult.value.trim().length > 20) {
          customDocxText = cleanText(docxResult.value.trim());
        }
      } catch (docxErr) {
        logger.warn('Docx parsing error:', docxErr.message);
      }
    }
  }

  try {
    logger.info(`Generating Official High-Fidelity 4-Page Adyapan Offer Letter PDF for ${candidateName}...`);
    const pdfDoc = await PDFDocument.create();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Color definitions matching Adyapan branding
    const orangeHeaderColor = rgb(0.9, 0.54, 0.0);   // #E58A00
    const crimsonSchoolColor = rgb(0.75, 0.0, 0.0);  // #C00000
    const textDark = rgb(0.06, 0.09, 0.16);         // #0F172A
    const textGray = rgb(0.3, 0.35, 0.45);          // #475569
    const footerGoldColor = rgb(0.85, 0.51, 0.0);   // #D98200
    const watermarkBorderColor = rgb(0.98, 0.75, 0.14); // faint gold

    // Helper: Draw Header on page
    const drawPageHeader = (page) => {
      const { height } = page.getSize();
      
      // Top Left Logo Circle
      page.drawCircle({
        x: 65,
        y: height - 55,
        size: 24,
        color: rgb(0.98, 0.75, 0.14), // Gold fill
        borderColor: rgb(0.9, 0.54, 0.0),
        borderWidth: 1.5,
      });

      page.drawText('ady.', {
        x: 52,
        y: height - 58,
        size: 14,
        font: fontBold,
        color: textDark,
      });

      page.drawText('ADYAPAN', {
        x: 50,
        y: height - 68,
        size: 5,
        font: fontBold,
        color: textDark,
      });

      // Header Text
      page.drawText("SR'S ADYAPAN EDUTECH PRIVATE LIMITED", {
        x: 100,
        y: height - 52,
        size: 16,
        font: fontBold,
        color: orangeHeaderColor,
      });

      page.drawText("A D Y A P A N   S C H O O L.", {
        x: 200,
        y: height - 68,
        size: 10,
        font: fontBold,
        color: crimsonSchoolColor,
      });

      // Header Underline
      page.drawLine({
        start: { x: 40, y: height - 80 },
        end: { x: 555, y: height - 80 },
        thickness: 1.5,
        color: textDark,
      });
    };

    // Helper: Draw Background Watermark
    const drawWatermark = (page) => {
      const { width, height } = page.getSize();
      const centerX = width / 2;
      const centerY = height / 2;

      // Outer faint circle ring
      page.drawCircle({
        x: centerX,
        y: centerY,
        size: 160,
        color: rgb(0.99, 0.95, 0.82), // Very faint cream background
        borderColor: watermarkBorderColor,
        borderWidth: 12,
        opacity: 0.25,
      });

      // Faint 'ady.' watermark text
      page.drawText('ady.', {
        x: centerX - 80,
        y: centerY - 25,
        size: 85,
        font: fontBold,
        color: rgb(0.85, 0.47, 0.0),
        opacity: 0.10,
      });

      // Faint 'A D Y A P A N' watermark subtext
      page.drawText('A D Y A P A N', {
        x: centerX - 85,
        y: centerY - 65,
        size: 18,
        font: fontBold,
        color: rgb(0.7, 0.35, 0.0),
        opacity: 0.10,
      });
    };

    // Helper: Draw Footer Bar on page
    const drawPageFooter = (page) => {
      const { width } = page.getSize();
      
      // Golden bar at bottom
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: 28,
        color: footerGoldColor,
      });

      const footerText = `${hrEmail}    |    ${companyWebsite}    |    ${hrPhone}`;
      page.drawText(footerText, {
        x: 130,
        y: 10,
        size: 9,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
    };

    // PAGE 1
    const page1 = pdfDoc.addPage([595, 842]); // A4
    drawWatermark(page1);
    drawPageHeader(page1);

    let y1 = 730;

    // Date & OL No
    page1.drawText(offerDate, { x: 40, y: y1, size: 10.5, font: fontBold, color: textDark });
    page1.drawText(`OL No: ${olNo}`, { x: 430, y: y1, size: 10.5, font: fontBold, color: textDark });

    y1 -= 35;
    page1.drawText(`Dear ${candidateName} ,`, { x: 40, y: y1, size: 11, font: fontBold, color: textDark });

    y1 -= 30;
    const line1Text = `We congratulate you for being selected for a ${duration} Training with adyapan. "At will basis" which can be extended. Please find the following confirmation of your Training :`;
    page1.drawText(`We congratulate you for being selected for a `, { x: 40, y: y1, size: 10, font: fontRegular, color: textDark });
    page1.drawText(`${duration}`, { x: 250, y: y1, size: 10, font: fontBold, color: textDark });
    page1.drawText(` Training with`, { x: 310, y: y1, size: 10, font: fontRegular, color: textDark });
    
    y1 -= 16;
    page1.drawText('adyapan. "At will basis" which can be extended. Please find the following confirmation of your Training :', { x: 40, y: y1, size: 10, font: fontRegular, color: textDark });

    y1 -= 35;
    page1.drawText(`Job Title: `, { x: 40, y: y1, size: 10, font: fontBold, color: textDark });
    page1.drawText(cleanText(jobTitle).toUpperCase(), { x: 180, y: y1, size: 10.5, font: fontBold, color: textDark });

    y1 -= 22;
    page1.drawText(`Training Start Date:`, { x: 40, y: y1, size: 10, font: fontBold, color: textDark });
    page1.drawText(cleanText(trainingStartDate), { x: 180, y: y1, size: 10, font: fontRegular, color: textDark });

    y1 -= 22;
    page1.drawText(`Training End Date:`, { x: 40, y: y1, size: 10, font: fontBold, color: textDark });
    page1.drawText(cleanText(trainingEndDate), { x: 180, y: y1, size: 10, font: fontRegular, color: textDark });

    y1 -= 25;
    page1.drawText(`OJT Start Date:`, { x: 40, y: y1, size: 10, font: fontBold, color: textDark });
    page1.drawText(cleanText(ojtStartDate), { x: 180, y: y1, size: 10, font: fontRegular, color: textDark });

    y1 -= 22;
    page1.drawText(`OJT End Date:`, { x: 40, y: y1, size: 10, font: fontBold, color: textDark });
    page1.drawText(cleanText(ojtEndDate), { x: 180, y: y1, size: 10, font: fontRegular, color: textDark });

    y1 -= 25;
    page1.drawText(`Location :`, { x: 40, y: y1, size: 10, font: fontBold, color: textDark });
    page1.drawText(cleanText(location).toUpperCase(), { x: 180, y: y1, size: 10, font: fontBold, color: textDark });

    y1 -= 30;
    page1.drawText(`Stipend:`, { x: 40, y: y1, size: 10.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(stipend), { x: 180, y: y1, size: 10.5, font: fontBold, color: textDark });

    y1 -= 16;
    page1.drawText(cleanText(incentives), { x: 180, y: y1, size: 9.5, font: fontBold, color: textDark });

    y1 -= 22;
    page1.drawText(`Post-Probation CTC:`, { x: 40, y: y1, size: 10, font: fontBold, color: textDark });
    page1.drawText(cleanText(postProbationCtc), { x: 180, y: y1, size: 10, font: fontBold, color: textDark });

    y1 -= 50;
    page1.drawText(`The first ${unpaidDays} days of training are unpaid. Once these ${unpaidDays} days are successfully completed, the`, { x: 40, y: y1, size: 9.5, font: fontRegular, color: textDark });
    y1 -= 16;
    page1.drawText(`trainee will start receiving the stipend from the ${stipendStartDay}, subject to regular attendance and`, { x: 40, y: y1, size: 9.5, font: fontRegular, color: textDark });
    y1 -= 16;
    page1.drawText(`satisfactory performance.`, { x: 40, y: y1, size: 9.5, font: fontRegular, color: textDark });

    drawPageFooter(page1);

    // PAGE 2
    const page2 = pdfDoc.addPage([595, 842]);
    drawWatermark(page2);
    drawPageHeader(page2);

    let y2 = 720;
    page2.drawText(`Please indicate your acceptance, by signing in the letter and mail the signed and scanned soft`, { x: 40, y: y2, size: 10, font: fontRegular, color: textDark });
    y2 -= 16;
    page2.drawText(`copy of the training Offer Letter and the documents as mentioned below to the`, { x: 40, y: y2, size: 10, font: fontRegular, color: textDark });
    y2 -= 16;
    page2.drawText(`${cleanText(hrEmail)} within 2 working days from the receipt of this mail. The offer shall stand`, { x: 40, y: y2, size: 10, font: fontBold, color: textDark });
    y2 -= 16;
    page2.drawText(`automatically withdrawn without further action on the part of adyapan if we do not receive`, { x: 40, y: y2, size: 10, font: fontBold, color: textDark });
    y2 -= 16;
    page2.drawText(`your acceptance as per the mentioned timeline.`, { x: 40, y: y2, size: 10, font: fontBold, color: textDark });

    y2 -= 80;
    page2.drawText(`I have read and understood the above terms and conditions and I accept`, { x: 80, y: y2, size: 10, font: fontRegular, color: textDark });
    y2 -= 18;
    page2.drawText(`this offer, as set forth above, with adyapan, and will report on or before ${cleanText(reportingDate)}.`, { x: 40, y: y2, size: 10, font: fontRegular, color: textDark });

    y2 -= 100;
    page2.drawText(`SIGNATURE:`, { x: 40, y: y2, size: 10.5, font: fontBold, color: textDark });
    page2.drawText(`(Candidate's Signature)`, { x: 130, y: y2, size: 10, font: fontOblique, color: textGray });

    y2 -= 30;
    page2.drawText(`DATE:`, { x: 40, y: y2, size: 10.5, font: fontBold, color: textDark });
    page2.drawLine({ start: { x: 100, y: y2 - 2 }, end: { x: 280, y: y2 - 2 }, thickness: 1, color: textGray });

    drawPageFooter(page2);

    // PAGE 3
    const page3 = pdfDoc.addPage([595, 842]);
    drawWatermark(page3);
    drawPageHeader(page3);

    let y3 = 730;
    
    const drawBulletText = (page, text, y) => {
      page.drawCircle({ x: 44, y: y + 3, size: 2.5, color: textDark });
      page.drawText(cleanText(text), { x: 55, y: y, size: 9, font: fontRegular, color: textDark });
    };

    drawBulletText(page3, "By accepting this training offer you agree to perform all responsibilities assigned to you", y3);
    y3 -= 14;
    page3.drawText("with due care and diligence and in compliance with the management norms.", { x: 55, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawBulletText(page3, "You are also required to substantially use all of your time and effort to perform these", y3);
    y3 -= 14;
    page3.drawText("tasks during business hours and such reasonable additional time as may be necessary.", { x: 55, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 30;
    page3.drawText(`Working Hours:`, { x: 80, y: y3, size: 9.5, font: fontBold, color: textDark });
    page3.drawText(cleanText(workingHours), { x: 180, y: y3, size: 9.5, font: fontRegular, color: textDark });

    y3 -= 18;
    page3.drawText(`Work Timing:`, { x: 80, y: y3, size: 9.5, font: fontBold, color: textDark });
    page3.drawText(cleanText(workTiming), { x: 180, y: y3, size: 9.5, font: fontRegular, color: textDark });

    y3 -= 18;
    page3.drawText(`Job Type:`, { x: 80, y: y3, size: 9.5, font: fontBold, color: textDark });
    page3.drawText(cleanText(jobType), { x: 180, y: y3, size: 9.5, font: fontRegular, color: textDark });

    y3 -= 18;
    page3.drawText(`Location:`, { x: 80, y: y3, size: 9.5, font: fontBold, color: textDark });
    page3.drawText(cleanText(location), { x: 180, y: y3, size: 9.5, font: fontRegular, color: textDark });

    y3 -= 26;
    drawBulletText(page3, "As a Trainee you will not receive any of the employee benefits that regular employees receive.", y3);

    y3 -= 24;
    drawBulletText(page3, "During the Training period, the company will have all the rights to terminate your", y3);
    y3 -= 14;
    page3.drawText("services without offering any reason and you are required to give 15 Days notice should you", { x: 55, y: y3, size: 9, font: fontRegular, color: textDark });
    y3 -= 14;
    page3.drawText("wish to terminate your training before the end of your tenure.", { x: 55, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawBulletText(page3, "At any time if you wish to discontinue the training due to personal reasons , you will", y3);
    y3 -= 14;
    page3.drawText("have to pay a compensation equal to 1 month stipend or you will have to serve 1 month notice", { x: 55, y: y3, size: 9, font: fontRegular, color: textDark });
    y3 -= 14;
    page3.drawText("period.", { x: 55, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawBulletText(page3, "All the information acquired during the course shall be strictly confidential and you shall", y3);
    y3 -= 14;
    page3.drawText("refrain from using it for your own purpose or from disclosing it to anyone outside of the", { x: 55, y: y3, size: 9, font: fontRegular, color: textDark });
    y3 -= 14;
    page3.drawText("Company.", { x: 55, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawBulletText(page3, "Upon conclusion of your tenure, you will immediately return to the Company all of its", y3);
    y3 -= 14;
    page3.drawText("property, equipment and documents including electronically stored information.", { x: 55, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawBulletText(page3, "You will observe all policies and practices governing the conduct of our business and", y3);
    y3 -= 14;
    page3.drawText("employees.", { x: 55, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawBulletText(page3, "Official communication either within the company or outside the company should be", y3);
    y3 -= 14;
    page3.drawText("through the company Email of your manager only.", { x: 55, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawBulletText(page3, "Post successful completion of the tenure, the candidate will be prone to performance", y3);
    y3 -= 14;
    page3.drawText("based pre-placement offers by the company.", { x: 55, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 50;
    page3.drawText(`SIGNATURE:`, { x: 40, y: y3, size: 10, font: fontBold, color: textDark });
    page3.drawText(`(Candidate's Signature)`, { x: 130, y: y3, size: 9.5, font: fontOblique, color: textGray });

    y3 -= 25;
    page3.drawText(`DATE:`, { x: 40, y: y3, size: 10, font: fontBold, color: textDark });
    page3.drawLine({ start: { x: 100, y: y3 - 2 }, end: { x: 280, y: y3 - 2 }, thickness: 1, color: textGray });

    drawPageFooter(page3);

    // PAGE 4
    const page4 = pdfDoc.addPage([595, 842]);
    drawWatermark(page4);
    drawPageHeader(page4);

    let y4 = 720;
    page4.drawText("ANNEXURE", { x: 250, y: y4, size: 12, font: fontBold, color: textDark });

    y4 -= 30;
    // Annexure Table Header Box
    page4.drawRectangle({
      x: 40,
      y: y4 - 200,
      width: 515,
      height: 220,
      borderColor: textDark,
      borderWidth: 1,
    });

    page4.drawLine({ start: { x: 40, y: y4 - 20 }, end: { x: 555, y: y4 - 20 }, thickness: 1, color: textDark });
    page4.drawLine({ start: { x: 90, y: y4 + 20 }, end: { x: 90, y: y4 - 200 }, thickness: 1, color: textDark });

    page4.drawText("Sl. No", { x: 50, y: y4 - 10, size: 10, font: fontBold, color: textDark });
    page4.drawText("Particulars", { x: 105, y: y4 - 10, size: 10, font: fontBold, color: textDark });

    y4 -= 35;
    page4.drawText("1.", { x: 60, y: y4, size: 10, font: fontBold, color: textDark });
    page4.drawText("Professional / Educational Certificates and Mark Sheets towards:", { x: 105, y: y4, size: 9.5, font: fontRegular, color: textDark });
    y4 -= 15;
    page4.drawText("- 10th standard or equivalent examination (Original MS for Verification)", { x: 115, y: y4, size: 9, font: fontRegular, color: textDark });
    y4 -= 14;
    page4.drawText("- 12th standard or equivalent examination (Original MS for Verification)", { x: 115, y: y4, size: 9, font: fontRegular, color: textDark });
    y4 -= 14;
    page4.drawText("- Graduation", { x: 115, y: y4, size: 9, font: fontRegular, color: textDark });
    y4 -= 14;
    page4.drawText("- Post-graduation / Doctorate", { x: 115, y: y4, size: 9, font: fontRegular, color: textDark });
    y4 -= 14;
    page4.drawText("Other relevant educational or skill certifications", { x: 115, y: y4, size: 9, font: fontRegular, color: textDark });

    page4.drawLine({ start: { x: 40, y: y4 - 10 }, end: { x: 555, y: y4 - 10 }, thickness: 1, color: textDark });

    y4 -= 30;
    page4.drawText("2.", { x: 60, y: y4, size: 10, font: fontBold, color: textDark });
    page4.drawText("COLOR SCANNED COPY OF YOUR PHOTOGRAPHS", { x: 105, y: y4, size: 9.5, font: fontBold, color: textDark });

    page4.drawLine({ start: { x: 40, y: y4 - 10 }, end: { x: 555, y: y4 - 10 }, thickness: 1, color: textDark });

    y4 -= 30;
    page4.drawText("3.", { x: 60, y: y4, size: 10, font: fontBold, color: textDark });
    page4.drawText("PAN Card, Voter ID or Driving Licence Scanned Copy.", { x: 105, y: y4, size: 9.5, font: fontRegular, color: textDark });

    y4 -= 60;
    page4.drawText("4. Bank Account Details: Bank Name, Your Name as per Bank records, Account Number,", { x: 40, y: y4, size: 10, font: fontBold, color: textDark });
    y4 -= 16;
    page4.drawText("IFSC Code.", { x: 58, y: y4, size: 10, font: fontBold, color: textDark });

    y4 -= 100;
    page4.drawText("SIGNATURE:", { x: 40, y: y4, size: 10, font: fontBold, color: textDark });
    y4 -= 25;
    page4.drawText(hrManagerName.toUpperCase(), { x: 40, y: y4, size: 10, font: fontBold, color: textDark });
    y4 -= 16;
    page4.drawText("ADYAPAN", { x: 40, y: y4, size: 10, font: fontBold, color: textDark });

    drawPageFooter(page4);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    logger.error('Failed to generate 4-Page Adyapan PDF:', error);
    throw error;
  }
};
