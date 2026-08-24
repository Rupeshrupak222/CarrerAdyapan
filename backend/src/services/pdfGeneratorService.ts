import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import mammoth from 'mammoth';
import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cleanText = (str: any) => {
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
export const generateOfferLetterPdfBuffer = async (rawOfferData: any = {}) => {
  const offerData: any = {};
  if (rawOfferData && typeof rawOfferData === 'object') {
    Object.keys(rawOfferData).forEach((key) => {
      offerData[key] = cleanText(rawOfferData[key]);
    });
  }

  const {
    olNo = 'ADP0428',
    offerDate = '14-May-2026',
    candidateName = 'Dinesh Kumar Sharma',
    duration = '6 MONTHS',
    jobTitle = 'COMMUNITY DEVELOPMENT INTERN',
    trainingStartDate = '25-May-2026',
    trainingEndDate = '06-Jun-2026',
    ojtStartDate = '07-Jun-2026',
    ojtEndDate = '07-Dec-2026',
    location = 'HYDERABAD',
    stipend = 'INR 20000/-PerMonth',
    incentives = 'Up to 10,000/- INCENTIVES.',
    postProbationCtc = '₹8 LPA ( 6 Fixed + 2 Variable )',
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

  try {
    logger.info(`Generating Pixel-Accurate 4-Page Adyapan Offer Letter PDF for ${candidateName}...`);
    const pdfDoc = await PDFDocument.create();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Embed real adyapan-logo.jpeg image
    let embeddedLogoImage: any = null;
    try {
      const logoPaths = [
        path.join(__dirname, '../assets/adyapan-logo.jpeg'),
        path.join(process.cwd(), 'src/assets/adyapan-logo.jpeg'),
        path.join(process.cwd(), 'backend/src/assets/adyapan-logo.jpeg'),
        path.join(process.cwd(), '../frontend/public/adyapan-logo.jpeg'),
        path.join(process.cwd(), 'frontend/public/adyapan-logo.jpeg'),
      ];
      for (const lp of logoPaths) {
        if (fs.existsSync(lp)) {
          const imgBytes = fs.readFileSync(lp);
          embeddedLogoImage = await pdfDoc.embedJpg(imgBytes);
          break;
        }
      }
    } catch (imgErr: any) {
      logger.warn('Failed to embed adyapan-logo.jpeg:', imgErr?.message || imgErr);
    }

    // Color definitions matching exact Adyapan branding
    const orangeHeaderColor = rgb(0.93, 0.58, 0.08); // Golden Orange #ED9415
    const crimsonSchoolColor = rgb(0.72, 0.12, 0.12); // Deep Crimson #B81E1E
    const textDark = rgb(0.08, 0.11, 0.16);         // #141C29
    const textMuted = rgb(0.35, 0.40, 0.48);        // #59667A
    const footerGoldColor = rgb(0.92, 0.58, 0.18);   // Warm Golden Footer Bar
    const watermarkBorderColor = rgb(0.95, 0.82, 0.55); // faint gold

    // Helper: Draw Header on page
    const drawPageHeader = (page: any) => {
      const { height } = page.getSize();
      
      // Top Left Official Adyapan Logo Image
      if (embeddedLogoImage) {
        page.drawImage(embeddedLogoImage, {
          x: 42,
          y: height - 70,
          width: 48,
          height: 48,
        });
      } else {
        page.drawCircle({
          x: 65,
          y: height - 50,
          size: 26,
          color: rgb(0.94, 0.65, 0.20),
          borderColor: rgb(0.88, 0.55, 0.10),
          borderWidth: 1.5,
        });
        page.drawText('ady.', { x: 49, y: height - 52, size: 16, font: fontBold, color: textDark });
        page.drawText('ADYAPAN', { x: 50, y: height - 63, size: 5.5, font: fontBold, color: textDark });
      }

      // Header Text
      page.drawText("SR'S ADYAPAN EDUTECH PRIVATE LIMITED", {
        x: 102,
        y: height - 48,
        size: 15.5,
        font: fontBold,
        color: orangeHeaderColor,
      });

      page.drawText("A D Y A P A N   S C H O O L .", {
        x: 195,
        y: height - 65,
        size: 10.5,
        font: fontBold,
        color: crimsonSchoolColor,
      });

      // Header Underline
      page.drawLine({
        start: { x: 40, y: height - 76 },
        end: { x: 555, y: height - 76 },
        thickness: 1.2,
        color: rgb(0.75, 0.75, 0.75),
      });
    };

    // Helper: Draw Background Watermark
    const drawWatermark = (page: any) => {
      const { width, height } = page.getSize();
      const centerX = width / 2;
      const centerY = height / 2 - 10;

      // Outer faint circle ring
      page.drawCircle({
        x: centerX,
        y: centerY,
        size: 175,
        color: rgb(0.99, 0.96, 0.88),
        borderColor: watermarkBorderColor,
        borderWidth: 14,
        opacity: 0.35,
      });

      // Faint 'ady.' watermark text
      page.drawText('ady.', {
        x: centerX - 85,
        y: centerY - 25,
        size: 90,
        font: fontBold,
        color: rgb(0.85, 0.50, 0.10),
        opacity: 0.15,
      });

      // Faint 'A D Y A P A N' watermark subtext
      page.drawText('A D Y A P A N', {
        x: centerX - 90,
        y: centerY - 65,
        size: 19,
        font: fontBold,
        color: rgb(0.70, 0.40, 0.10),
        opacity: 0.14,
      });
    };

    // Helper: Draw Footer Bar on page
    const drawPageFooter = (page: any) => {
      const { width } = page.getSize();
      
      // Orange/Golden bar at bottom
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: 26,
        color: footerGoldColor,
      });

      const footerText = `${hrEmail}   |   ${companyWebsite}   |   ${hrPhone}`;
      page.drawText(footerText, {
        x: 120,
        y: 8.5,
        size: 9.5,
        font: fontBold,
        color: textDark,
      });
    };

    // ==========================================
    // PAGE 1: OFFER CONFIRMATION & STIPEND
    // ==========================================
    const page1 = pdfDoc.addPage([595, 842]);
    drawWatermark(page1);
    drawPageHeader(page1);

    let y1 = 735;

    // Date & OL No
    page1.drawText(offerDate, { x: 45, y: y1, size: 10.5, font: fontBold, color: textDark });
    page1.drawText(`OL No: ${olNo}`, { x: 435, y: y1, size: 10.5, font: fontBold, color: textDark });

    y1 -= 35;
    page1.drawText(`Dear ${candidateName} ,`, { x: 45, y: y1, size: 11, font: fontBold, color: textDark });

    y1 -= 30;
    page1.drawText(`We congratulate you for being selected for a `, { x: 140, y: y1, size: 9.5, font: fontRegular, color: textDark });
    page1.drawText(`${duration}`, { x: 345, y: y1, size: 9.5, font: fontBold, color: textDark });
    page1.drawText(` Training with`, { x: 405, y: y1, size: 9.5, font: fontRegular, color: textDark });
    
    y1 -= 15;
    page1.drawText(`adyapan. "At will basis" which can be extended. Please find the following confirmation of your`, { x: 45, y: y1, size: 9.5, font: fontRegular, color: textDark });
    
    y1 -= 15;
    page1.drawText(`Training`, { x: 45, y: y1, size: 9.5, font: fontRegular, color: textDark });

    y1 -= 12;
    page1.drawText(`:`, { x: 45, y: y1, size: 9.5, font: fontBold, color: textDark });

    y1 -= 22;
    page1.drawText(`Job Title:`, { x: 45, y: y1, size: 10, font: fontBold, color: textDark });
    page1.drawText(cleanText(jobTitle).toUpperCase(), { x: 100, y: y1, size: 10, font: fontBold, color: textDark });

    y1 -= 26;
    page1.drawText(`Training Start Date:`, { x: 45, y: y1, size: 9.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(trainingStartDate), { x: 160, y: y1, size: 9.5, font: fontRegular, color: textDark });

    y1 -= 26;
    page1.drawText(`Training End Date:`, { x: 45, y: y1, size: 9.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(trainingEndDate), { x: 160, y: y1, size: 9.5, font: fontRegular, color: textDark });

    y1 -= 30;
    page1.drawText(`OJT Start Date:`, { x: 45, y: y1, size: 9.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(ojtStartDate), { x: 160, y: y1, size: 9.5, font: fontRegular, color: textDark });

    y1 -= 26;
    page1.drawText(`OJT End Date:`, { x: 45, y: y1, size: 9.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(ojtEndDate), { x: 160, y: y1, size: 9.5, font: fontRegular, color: textDark });

    y1 -= 30;
    page1.drawText(`Location :`, { x: 45, y: y1, size: 9.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(location).toUpperCase(), { x: 110, y: y1, size: 9.5, font: fontBold, color: textDark });

    y1 -= 35;
    page1.drawText(`Stipend:`, { x: 45, y: y1, size: 10, font: fontBold, color: textDark });
    page1.drawText(cleanText(stipend), { x: 100, y: y1, size: 10, font: fontBold, color: textDark });

    y1 -= 18;
    page1.drawText(cleanText(incentives), { x: 45, y: y1, size: 9.5, font: fontBold, color: textDark });

    y1 -= 22;
    page1.drawText(`Post-Probation CTC:`, { x: 45, y: y1, size: 9.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(postProbationCtc), { x: 165, y: y1, size: 9.5, font: fontBold, color: textDark });

    y1 -= 60;
    page1.drawText(`The first ${unpaidDays} days of training are unpaid. Once these ${unpaidDays} days are successfully completed, the`, { x: 45, y: y1, size: 9.5, font: fontRegular, color: textDark });
    y1 -= 15;
    page1.drawText(`trainee will start receiving the stipend from the ${stipendStartDay}, subject to regular attendance and`, { x: 45, y: y1, size: 9.5, font: fontRegular, color: textDark });
    y1 -= 15;
    page1.drawText(`satisfactory performance.`, { x: 45, y: y1, size: 9.5, font: fontRegular, color: textDark });

    // Note: Page 1 in original PDF does not have the bottom orange footer bar.

    // ==========================================
    // PAGE 2: ACCEPTANCE & TIMELINE
    // ==========================================
    const page2 = pdfDoc.addPage([595, 842]);
    drawWatermark(page2);
    drawPageHeader(page2);

    let y2 = 725;
    page2.drawText(`Please indicate your acceptance, by signing in the letter and mail the signed and scanned soft`, { x: 45, y: y2, size: 9.5, font: fontRegular, color: textDark });
    y2 -= 15;
    page2.drawText(`copy of the training Offer Letter and the documents as mentioned below to the`, { x: 45, y: y2, size: 9.5, font: fontRegular, color: textDark });
    y2 -= 15;
    page2.drawText(`${cleanText(hrEmail)} within 2 working days from the receipt of this mail. The offer shall stand`, { x: 45, y: y2, size: 9.5, font: fontBold, color: textDark });
    y2 -= 15;
    page2.drawText(`automatically withdrawn without further action on the part of adyapan if we do not receive`, { x: 45, y: y2, size: 9.5, font: fontBold, color: textDark });
    y2 -= 15;
    page2.drawText(`your acceptance as per the mentioned timeline.`, { x: 45, y: y2, size: 9.5, font: fontBold, color: textDark });

    y2 -= 100;
    page2.drawText(`I have read and understood the above terms and conditions and I accept`, { x: 120, y: y2, size: 9.5, font: fontRegular, color: textDark });
    y2 -= 16;
    page2.drawText(`this offer, as set forth above, with adyapan, and will report on or before ${cleanText(reportingDate || trainingStartDate)}.`, { x: 45, y: y2, size: 9.5, font: fontRegular, color: textDark });

    y2 -= 70;
    page2.drawText(`SIGNATURE:`, { x: 45, y: y2, size: 10, font: fontBold, color: textDark });
    page2.drawText(`(Candidate's Signature)`, { x: 130, y: y2, size: 9.5, font: fontRegular, color: textDark });

    y2 -= 25;
    page2.drawText(`DATE:`, { x: 45, y: y2, size: 10, font: fontBold, color: textDark });

    drawPageFooter(page2);

    // ==========================================
    // PAGE 3: MANAGEMENT POLICIES & CODE OF CONDUCT
    // ==========================================
    const page3 = pdfDoc.addPage([595, 842]);
    drawWatermark(page3);
    drawPageHeader(page3);

    let y3 = 730;
    
    const drawSquareBullet = (page: any, text: string, y: number, isBold: boolean = false) => {
      page.drawRectangle({ x: 45, y: y + 2, width: 3.5, height: 3.5, color: textDark });
      page.drawText(cleanText(text), { x: 58, y, size: 9, font: isBold ? fontBold : fontRegular, color: textDark });
    };

    drawSquareBullet(page3, "By accepting this training offer you agree to perform all responsibilities assigned to you", y3);
    y3 -= 14;
    page3.drawText("with due care and diligence and in compliance with the management norms.", { x: 58, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawSquareBullet(page3, "You are also required to substantially use all of your time and effort to perform these", y3);
    y3 -= 14;
    page3.drawText("tasks during business hours and such reasonable additional time as may be necessary.", { x: 58, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 28;
    page3.drawText(`Working Hours:`, { x: 80, y: y3, size: 9, font: fontBold, color: textDark });
    page3.drawLine({ start: { x: 80, y: y3 - 1 }, end: { x: 155, y: y3 - 1 }, thickness: 0.8, color: textDark });
    page3.drawText(` 9 Hours a day (Inc. Lunch Break).`, { x: 155, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 18;
    page3.drawText(`Work Timing:`, { x: 80, y: y3, size: 9, font: fontBold, color: textDark });
    page3.drawLine({ start: { x: 80, y: y3 - 1 }, end: { x: 145, y: y3 - 1 }, thickness: 0.8, color: textDark });
    page3.drawText(` 11AM - 8 PM.`, { x: 145, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 18;
    page3.drawText(`Job Type:`, { x: 80, y: y3, size: 9, font: fontBold, color: textDark });
    page3.drawLine({ start: { x: 80, y: y3 - 1 }, end: { x: 130, y: y3 - 1 }, thickness: 0.8, color: textDark });
    page3.drawText(` Full Time Training`, { x: 130, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 18;
    page3.drawText(`Location:`, { x: 80, y: y3, size: 9, font: fontBold, color: textDark });
    page3.drawLine({ start: { x: 80, y: y3 - 1 }, end: { x: 128, y: y3 - 1 }, thickness: 0.8, color: textDark });
    page3.drawText(` ${location}`, { x: 128, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 26;
    drawSquareBullet(page3, "As a Trainee you will not receive any of the employee benefits that regular employees receive.", y3);

    y3 -= 24;
    drawSquareBullet(page3, "During the Training period, the company will have all the rights to terminate your", y3);
    y3 -= 14;
    page3.drawText("services without offering any reason and you are required to give 15 Days notice should you", { x: 58, y: y3, size: 9, font: fontRegular, color: textDark });
    y3 -= 14;
    page3.drawText("wish to terminate your training before the end of your tenure.", { x: 58, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawSquareBullet(page3, "At any time if you wish to discontinue the training due to personal reasons , you will", y3);
    y3 -= 14;
    page3.drawText("have to pay a compensation equal to 1 month stipend or you will have to serve 1 month notice", { x: 58, y: y3, size: 9, font: fontRegular, color: textDark });
    y3 -= 14;
    page3.drawText("period.", { x: 58, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawSquareBullet(page3, "All the information acquired during the course shall be strictly confidential and you shall", y3);
    y3 -= 14;
    page3.drawText("refrain from using it for your own purpose or from disclosing it to anyone outside of the", { x: 58, y: y3, size: 9, font: fontRegular, color: textDark });
    y3 -= 14;
    page3.drawText("Company.", { x: 58, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawSquareBullet(page3, "Upon conclusion of your tenure, you will immediately return to the Company all of its", y3);
    y3 -= 14;
    page3.drawText("property, equipment and documents including electronically stored information.", { x: 58, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawSquareBullet(page3, "You will observe all policies and practices governing the conduct of our business and", y3);
    y3 -= 14;
    page3.drawText("employees.", { x: 58, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawSquareBullet(page3, "Official communication either within the company or outside the company should be", y3);
    y3 -= 14;
    page3.drawText("through the company Email of your manager only.", { x: 58, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 24;
    drawSquareBullet(page3, "Post successful completion of the tenure, the candidate will be prone to performance", y3);
    y3 -= 14;
    page3.drawText("based pre-placement offers by the company.", { x: 58, y: y3, size: 9, font: fontRegular, color: textDark });

    y3 -= 50;
    page3.drawText(`SIGNATURE:`, { x: 45, y: y3, size: 10, font: fontBold, color: textDark });
    page3.drawText(`(Candidate's Signature)`, { x: 130, y: y3, size: 9.5, font: fontRegular, color: textDark });

    y3 -= 25;
    page3.drawText(`DATE:`, { x: 45, y: y3, size: 10, font: fontBold, color: textDark });

    drawPageFooter(page3);

    // ==========================================
    // PAGE 4: ANNEXURE & HR MANAGER SIGNATURE
    // ==========================================
    const page4 = pdfDoc.addPage([595, 842]);
    drawWatermark(page4);
    drawPageHeader(page4);

    let y4 = 725;
    page4.drawText("ANNEXURE", { x: 250, y: y4, size: 11, font: fontBold, color: textDark });

    y4 -= 25;
    // Annexure Table Box
    const tableTop = y4;
    const tableBottom = y4 - 180;
    const tableLeft = 45;
    const tableRight = 550;
    const colSplit = 95;

    // Outer Rectangle
    page4.drawRectangle({
      x: tableLeft,
      y: tableBottom,
      width: tableRight - tableLeft,
      height: tableTop - tableBottom,
      borderColor: textDark,
      borderWidth: 1,
    });

    // Column Divider Line
    page4.drawLine({ start: { x: colSplit, y: tableTop }, end: { x: colSplit, y: tableBottom }, thickness: 1, color: textDark });

    // Header Row
    page4.drawLine({ start: { x: tableLeft, y: tableTop - 25 }, end: { x: tableRight, y: tableTop - 25 }, thickness: 1, color: textDark });
    page4.drawText("Sl. No", { x: 52, y: tableTop - 17, size: 9.5, font: fontBold, color: textDark });
    page4.drawText("Particulars", { x: 110, y: tableTop - 17, size: 9.5, font: fontBold, color: textDark });

    // Row 1
    let rowY = tableTop - 40;
    page4.drawText("1.", { x: 65, y: rowY, size: 9.5, font: fontBold, color: textDark });
    page4.drawText("Professional / Educational Certificates and Mark Sheets towards:", { x: 110, y: rowY, size: 9, font: fontRegular, color: textDark });
    rowY -= 14;
    page4.drawText("• 10th standard or equivalent examination (Original MS for Verification)", { x: 115, y: rowY, size: 8.5, font: fontRegular, color: textDark });
    rowY -= 13;
    page4.drawText("• 12th standard or equivalent examination (Original MS for Verification)", { x: 115, y: rowY, size: 8.5, font: fontRegular, color: textDark });
    rowY -= 13;
    page4.drawText("• Graduation", { x: 115, y: rowY, size: 8.5, font: fontRegular, color: textDark });
    rowY -= 13;
    page4.drawText("• Post-graduation / Doctorate", { x: 115, y: rowY, size: 8.5, font: fontRegular, color: textDark });
    rowY -= 13;
    page4.drawText("Other relevant educational or skill certifications", { x: 115, y: rowY, size: 8.5, font: fontRegular, color: textDark });

    // Row 2 Divider
    page4.drawLine({ start: { x: tableLeft, y: tableTop - 125 }, end: { x: tableRight, y: tableTop - 125 }, thickness: 1, color: textDark });
    page4.drawText("2.", { x: 65, y: tableTop - 145, size: 9.5, font: fontBold, color: textDark });
    page4.drawText("COLOR SCANNED COPY OF YOUR PHOTOGRAPHS", { x: 110, y: tableTop - 145, size: 9, font: fontRegular, color: textDark });

    // Row 3 Divider
    page4.drawLine({ start: { x: tableLeft, y: tableTop - 155 }, end: { x: tableRight, y: tableTop - 155 }, thickness: 1, color: textDark });
    page4.drawText("3.", { x: 65, y: tableTop - 172, size: 9.5, font: fontBold, color: textDark });
    page4.drawText("PAN Card, Voter ID or Driving Licence Scanned Copy.", { x: 110, y: tableTop - 172, size: 9, font: fontRegular, color: textDark });

    // Item 4 below table
    let y4Below = tableBottom - 35;
    page4.drawText("4. Bank Account Details: Bank Name, Your Name as per Bank records, Account", { x: 45, y: y4Below, size: 9.5, font: fontBold, color: textDark });
    y4Below -= 14;
    page4.drawText("Number, IFSC Code.", { x: 62, y: y4Below, size: 9.5, font: fontBold, color: textDark });

    y4Below -= 110;
    page4.drawText("SIGNATURE:", { x: 45, y: y4Below, size: 10, font: fontBold, color: textDark });
    y4Below -= 28;
    page4.drawText("HR MANAGER", { x: 45, y: y4Below, size: 9.5, font: fontBold, color: textDark });
    y4Below -= 14;
    page4.drawText("ADYAPAN", { x: 45, y: y4Below, size: 9.5, font: fontBold, color: textDark });

    drawPageFooter(page4);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    logger.error('Failed to generate 4-Page Adyapan PDF:', error);
    throw error;
  }
};

