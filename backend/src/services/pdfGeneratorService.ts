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

    // Embed real adyapan logo image (supports png and jpeg)
    let embeddedLogoImage: any = null;
    try {
      const logoPaths = [
        path.join(__dirname, '../assets/adyapan-logo.png'),
        path.join(process.cwd(), 'src/assets/adyapan-logo.png'),
        path.join(process.cwd(), 'backend/src/assets/adyapan-logo.png'),
        path.join(process.cwd(), '../frontend/public/adyapan-logo.png'),
        path.join(process.cwd(), 'frontend/public/adyapan-logo.png'),
        path.join(__dirname, '../assets/adyapan-logo.jpeg'),
        path.join(process.cwd(), 'src/assets/adyapan-logo.jpeg'),
        path.join(process.cwd(), 'backend/src/assets/adyapan-logo.jpeg'),
        path.join(process.cwd(), '../frontend/public/adyapan-logo.jpeg'),
        path.join(process.cwd(), 'frontend/public/adyapan-logo.jpeg'),
      ];
      for (const lp of logoPaths) {
        if (fs.existsSync(lp)) {
          const imgBytes = fs.readFileSync(lp);
          if (lp.endsWith('.png')) {
            embeddedLogoImage = await pdfDoc.embedPng(imgBytes);
          } else {
            embeddedLogoImage = await pdfDoc.embedJpg(imgBytes);
          }
          break;
        }
      }
    } catch (imgErr: any) {
      logger.warn('Failed to embed adyapan logo image:', imgErr?.message || imgErr);
    }

    // Color definitions matching exact Adyapan branding
    const orangeHeaderColor = rgb(0.93, 0.58, 0.08); // Golden Orange #ED9415
    const crimsonSchoolColor = rgb(0.72, 0.12, 0.12); // Deep Crimson #B81E1E
    const textDark = rgb(0.08, 0.11, 0.16);         // #141C29
    const textMuted = rgb(0.35, 0.40, 0.48);        // #59667A
    const footerGoldColor = rgb(0.92, 0.58, 0.18);   // Warm Golden Footer Bar

    // Helper: Draw Header on page - Exactly matching screenshot layout across every page (Large & Bold)
    const drawPageHeader = (page: any) => {
      const { width, height } = page.getSize();

      const titleText = "SR'S ADYAPAN EDUTECH PRIVATE LIMITED";
      const titleSize = 19;
      const titleWidth = fontBold.widthOfTextAtSize(titleText, titleSize);

      const subText = "A D Y A P A N   S C H O O L .";
      const subSize = 13;
      const subWidth = fontBold.widthOfTextAtSize(subText, subSize);

      const logoWidth = 58;
      const logoHeight = 58;
      const gap = 18;

      // Row 1: Combined width of logo + title
      const row1Width = logoWidth + gap + titleWidth;
      const row1StartX = (width - row1Width) / 2;

      // Draw Logo (without any border)
      if (embeddedLogoImage) {
        page.drawImage(embeddedLogoImage, {
          x: row1StartX,
          y: height - 76,
          width: logoWidth,
          height: logoHeight,
        });
      } else {
        page.drawCircle({
          x: row1StartX + 29,
          y: height - 47,
          size: 29,
          color: rgb(0.94, 0.65, 0.20),
        });
        page.drawText('ady.', { x: row1StartX + 14, y: height - 49, size: 14, font: fontBold, color: textDark });
      }

      // Row 1: Title Text (vertically aligned with logo)
      const titleStartX = row1StartX + logoWidth + gap;
      page.drawText(titleText, {
        x: titleStartX,
        y: height - 51,
        size: titleSize,
        font: fontBold,
        color: orangeHeaderColor,
      });

      // Row 2: Subtitle Text (centered horizontally on the page with increased gap)
      const subStartX = (width - subWidth) / 2;
      page.drawText(subText, {
        x: subStartX,
        y: height - 82,
        size: subSize,
        font: fontBold,
        color: crimsonSchoolColor,
      });

      // Row 3: Full-width Header Divider Line
      page.drawLine({
        start: { x: 40, y: height - 98 },
        end: { x: 555, y: height - 98 },
        thickness: 1.5,
        color: rgb(0.55, 0.55, 0.55),
      });
    };

    // Helper: Draw Background Watermark using SAME official logo
    const drawWatermark = (page: any) => {
      const { width, height } = page.getSize();
      const centerX = width / 2;
      const centerY = height / 2 - 15;

      if (embeddedLogoImage) {
        // Draw exact official adyapan logo as subtle watermark
        page.drawImage(embeddedLogoImage, {
          x: centerX - 100,
          y: centerY - 100,
          width: 200,
          height: 200,
          opacity: 0.08,
        });
      } else {
        // Faint fallback watermark text
        page.drawText('ady.', {
          x: centerX - 85,
          y: centerY - 25,
          size: 90,
          font: fontBold,
          color: rgb(0.85, 0.50, 0.10),
          opacity: 0.08,
        });
        page.drawText('A D Y A P A N', {
          x: centerX - 90,
          y: centerY - 65,
          size: 19,
          font: fontBold,
          color: rgb(0.70, 0.40, 0.10),
          opacity: 0.08,
        });
      }
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
        x: 110,
        y: 8,
        size: 10.5,
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

    // Start Date & OL No lower down at y1 = 675 so content does not bunch up at top and fills bottom
    let y1 = 675;

    // Date & OL No
    page1.drawText(cleanText(offerDate), { x: 45, y: y1, size: 12.5, font: fontBold, color: textDark });
    page1.drawText(`OL No: ${cleanText(olNo)}`, { x: 410, y: y1, size: 12.5, font: fontBold, color: textDark });

    y1 -= 38;
    page1.drawText(`Dear ${cleanText(candidateName)},`, { x: 45, y: y1, size: 13, font: fontBold, color: textDark });

    y1 -= 28;
    page1.drawText(`We congratulate you for being selected for a `, { x: 45, y: y1, size: 12.5, font: fontRegular, color: textDark });
    page1.drawText(`${cleanText(duration)}`, { x: 295, y: y1, size: 12.5, font: fontBold, color: textDark });
    page1.drawText(` Training with`, { x: 375, y: y1, size: 12.5, font: fontRegular, color: textDark });

    y1 -= 22;
    page1.drawText(`adyapan. "At will basis" which can be extended. Please find the confirmation of your`, { x: 45, y: y1, size: 12.5, font: fontRegular, color: textDark });

    y1 -= 22;
    page1.drawText(`Training terms and details below:`, { x: 45, y: y1, size: 12.5, font: fontRegular, color: textDark });

    // Terms Details (with generous vertical row gap)
    y1 -= 32;
    page1.drawText(`Job Title:`, { x: 45, y: y1, size: 12.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(jobTitle).toUpperCase(), { x: 185, y: y1, size: 12.5, font: fontBold, color: textDark });

    y1 -= 28;
    page1.drawText(`Training Start Date:`, { x: 45, y: y1, size: 12.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(trainingStartDate), { x: 185, y: y1, size: 12.5, font: fontRegular, color: textDark });

    y1 -= 28;
    page1.drawText(`Training End Date:`, { x: 45, y: y1, size: 12.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(trainingEndDate), { x: 185, y: y1, size: 12.5, font: fontRegular, color: textDark });

    y1 -= 28;
    page1.drawText(`OJT Start Date:`, { x: 45, y: y1, size: 12.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(ojtStartDate), { x: 185, y: y1, size: 12.5, font: fontRegular, color: textDark });

    y1 -= 28;
    page1.drawText(`OJT End Date:`, { x: 45, y: y1, size: 12.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(ojtEndDate), { x: 185, y: y1, size: 12.5, font: fontRegular, color: textDark });

    y1 -= 28;
    page1.drawText(`Location:`, { x: 45, y: y1, size: 12.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(location).toUpperCase(), { x: 185, y: y1, size: 12.5, font: fontBold, color: textDark });

    y1 -= 30;
    page1.drawText(`Stipend:`, { x: 45, y: y1, size: 12.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(stipend), { x: 185, y: y1, size: 12.5, font: fontBold, color: textDark });

    y1 -= 26;
    page1.drawText(cleanText(incentives), { x: 45, y: y1, size: 12.5, font: fontBold, color: textDark });

    y1 -= 28;
    page1.drawText(`Post-Probation CTC:`, { x: 45, y: y1, size: 12.5, font: fontBold, color: textDark });
    page1.drawText(cleanText(postProbationCtc), { x: 185, y: y1, size: 12.5, font: fontBold, color: textDark });

    y1 -= 46;
    page1.drawText(`The first ${unpaidDays} days of training are unpaid. Once these ${unpaidDays} days are successfully completed, the`, { x: 45, y: y1, size: 12, font: fontRegular, color: textDark });
    y1 -= 20;
    page1.drawText(`trainee will start receiving the stipend from the ${stipendStartDay}, subject to regular attendance and`, { x: 45, y: y1, size: 12, font: fontRegular, color: textDark });
    y1 -= 20;
    page1.drawText(`satisfactory performance.`, { x: 45, y: y1, size: 12, font: fontRegular, color: textDark });

    drawPageFooter(page1);

    // ==========================================
    // PAGE 2: ACCEPTANCE & TIMELINE
    // ==========================================
    const page2 = pdfDoc.addPage([595, 842]);
    drawWatermark(page2);
    drawPageHeader(page2);

    let y2 = 665;
    page2.drawText(`Please indicate your acceptance by signing this letter and emailing the signed, scanned soft`, { x: 45, y: y2, size: 12.5, font: fontRegular, color: textDark });
    y2 -= 24;
    page2.drawText(`copy of the training Offer Letter and the required documents to:`, { x: 45, y: y2, size: 12.5, font: fontRegular, color: textDark });
    y2 -= 24;
    page2.drawText(`${cleanText(hrEmail)} within 2 working days from the receipt of this mail. The offer shall stand`, { x: 45, y: y2, size: 12.5, font: fontBold, color: textDark });
    y2 -= 24;
    page2.drawText(`automatically withdrawn without further action on the part of adyapan if we do not receive`, { x: 45, y: y2, size: 12.5, font: fontBold, color: textDark });
    y2 -= 24;
    page2.drawText(`your acceptance as per the mentioned timeline.`, { x: 45, y: y2, size: 12.5, font: fontBold, color: textDark });

    y2 -= 55;
    page2.drawText(`I have read and understood the above terms and conditions and I accept this offer, as set`, { x: 45, y: y2, size: 12.5, font: fontRegular, color: textDark });
    y2 -= 24;
    page2.drawText(`forth above, with adyapan, and will report on or before ${cleanText(reportingDate || trainingStartDate)}.`, { x: 45, y: y2, size: 12.5, font: fontRegular, color: textDark });

    // Signature Block Grounded at Bottom
    y2 = 230;
    page2.drawText(`CANDIDATE SIGNATURE:`, { x: 45, y: y2, size: 12.5, font: fontBold, color: textDark });
    page2.drawText(`____________________________________`, { x: 215, y: y2, size: 12.5, font: fontRegular, color: textDark });

    y2 = 170;
    page2.drawText(`CANDIDATE NAME:`, { x: 45, y: y2, size: 12.5, font: fontBold, color: textDark });
    page2.drawText(cleanText(candidateName), { x: 215, y: y2, size: 12.5, font: fontBold, color: textDark });

    y2 = 110;
    page2.drawText(`DATE:`, { x: 45, y: y2, size: 12.5, font: fontBold, color: textDark });
    page2.drawText(`____________________________________`, { x: 215, y: y2, size: 12.5, font: fontRegular, color: textDark });

    drawPageFooter(page2);

    // ==========================================
    // PAGE 3: MANAGEMENT POLICIES & CODE OF CONDUCT (Evenly Distributed)
    // ==========================================
    const page3 = pdfDoc.addPage([595, 842]);
    drawWatermark(page3);
    drawPageHeader(page3);

    let y3 = 680;

    const drawSquareBullet = (page: any, text: string, y: number, isBold: boolean = false) => {
      page.drawRectangle({ x: 45, y: y + 2.5, width: 4.5, height: 4.5, color: textDark });
      page.drawText(cleanText(text), { x: 58, y, size: 12, font: isBold ? fontBold : fontRegular, color: textDark });
    };

    drawSquareBullet(page3, "By accepting this training offer you agree to perform all responsibilities assigned to you", y3);
    y3 -= 18;
    page3.drawText("with due care and diligence and in compliance with the management norms.", { x: 58, y: y3, size: 12, font: fontRegular, color: textDark });

    y3 -= 28;
    drawSquareBullet(page3, "You are required to substantially use your time and effort to perform assigned tasks during", y3);
    y3 -= 18;
    page3.drawText("business hours and such reasonable additional time as may be necessary.", { x: 58, y: y3, size: 12, font: fontRegular, color: textDark });

    y3 -= 26;
    page3.drawText(`Working Hours:`, { x: 75, y: y3, size: 12, font: fontBold, color: textDark });
    page3.drawText(` 9 Hours a day (Inc. Lunch Break).`, { x: 185, y: y3, size: 12, font: fontRegular, color: textDark });

    y3 -= 20;
    page3.drawText(`Work Timing:`, { x: 75, y: y3, size: 12, font: fontBold, color: textDark });
    page3.drawText(` 11 AM - 8 PM.`, { x: 185, y: y3, size: 12, font: fontRegular, color: textDark });

    y3 -= 20;
    page3.drawText(`Job Type:`, { x: 75, y: y3, size: 12, font: fontBold, color: textDark });
    page3.drawText(` Full Time Training`, { x: 185, y: y3, size: 12, font: fontRegular, color: textDark });

    y3 -= 20;
    page3.drawText(`Location:`, { x: 75, y: y3, size: 12, font: fontBold, color: textDark });
    page3.drawText(` ${cleanText(location)}`, { x: 185, y: y3, size: 12, font: fontRegular, color: textDark });

    y3 -= 28;
    drawSquareBullet(page3, "As a Trainee you will not receive employee benefits that regular employees receive.", y3);

    y3 -= 28;
    drawSquareBullet(page3, "During Training, the company reserves rights to terminate services without offering reason", y3);
    y3 -= 18;
    page3.drawText("and you are required to give 15 Days notice should you wish to terminate early.", { x: 58, y: y3, size: 12, font: fontRegular, color: textDark });

    y3 -= 28;
    drawSquareBullet(page3, "If you discontinue training for personal reasons, you will have to pay compensation equal to", y3);
    y3 -= 18;
    page3.drawText("1 month stipend or serve 1 month notice period.", { x: 58, y: y3, size: 12, font: fontRegular, color: textDark });

    y3 -= 28;
    drawSquareBullet(page3, "All information acquired during tenure is strictly confidential and shall not be disclosed.", y3);

    y3 -= 28;
    drawSquareBullet(page3, "Upon tenure conclusion, immediately return all Company equipment, data and property.", y3);

    y3 -= 28;
    drawSquareBullet(page3, "Official communication must be routed strictly through the company email of your manager.", y3);

    y3 -= 28;
    drawSquareBullet(page3, "Post successful completion, candidate is eligible for performance-based pre-placement offer.", y3);

    // Signature Block grounded at bottom
    y3 = 135;
    page3.drawText(`SIGNATURE:`, { x: 45, y: y3, size: 12.5, font: fontBold, color: textDark });
    page3.drawText(`________________________ (Candidate's Signature)`, { x: 135, y: y3, size: 12, font: fontRegular, color: textDark });

    y3 = 85;
    page3.drawText(`DATE:`, { x: 45, y: y3, size: 12.5, font: fontBold, color: textDark });
    page3.drawText(`________________________`, { x: 135, y: y3, size: 12, font: fontRegular, color: textDark });

    drawPageFooter(page3);

    // ==========================================
    // PAGE 4: ANNEXURE & HR MANAGER SIGNATURE
    // ==========================================
    const page4 = pdfDoc.addPage([595, 842]);
    drawWatermark(page4);
    drawPageHeader(page4);

    let y4 = 680;
    page4.drawText("ANNEXURE", { x: 245, y: y4, size: 14, font: fontBold, color: textDark });

    y4 -= 24;
    // Annexure Table Box
    const tableTop = y4;
    const tableBottom = y4 - 215;
    const tableLeft = 45;
    const tableRight = 550;
    const colSplit = 100;

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
    page4.drawLine({ start: { x: tableLeft, y: tableTop - 28 }, end: { x: tableRight, y: tableTop - 28 }, thickness: 1, color: textDark });
    page4.drawText("Sl. No", { x: 55, y: tableTop - 19, size: 12, font: fontBold, color: textDark });
    page4.drawText("Particulars", { x: 115, y: tableTop - 19, size: 12, font: fontBold, color: textDark });

    // Row 1
    let rowY = tableTop - 46;
    page4.drawText("1.", { x: 68, y: rowY, size: 12, font: fontBold, color: textDark });
    page4.drawText("Professional / Educational Certificates and Mark Sheets towards:", { x: 115, y: rowY, size: 11.5, font: fontRegular, color: textDark });
    rowY -= 17;
    page4.drawText("• 10th standard or equivalent examination (Original for Verification)", { x: 120, y: rowY, size: 11, font: fontRegular, color: textDark });
    rowY -= 16;
    page4.drawText("• 12th standard or equivalent examination (Original for Verification)", { x: 120, y: rowY, size: 11, font: fontRegular, color: textDark });
    rowY -= 16;
    page4.drawText("• Graduation Degree & Semester Mark Sheets", { x: 120, y: rowY, size: 11, font: fontRegular, color: textDark });
    rowY -= 16;
    page4.drawText("• Post-graduation / Master's (if applicable)", { x: 120, y: rowY, size: 11, font: fontRegular, color: textDark });
    rowY -= 16;
    page4.drawText("• Other relevant educational or skill certifications", { x: 120, y: rowY, size: 11, font: fontRegular, color: textDark });

    // Row 2 Divider
    page4.drawLine({ start: { x: tableLeft, y: tableTop - 146 }, end: { x: tableRight, y: tableTop - 146 }, thickness: 1, color: textDark });
    page4.drawText("2.", { x: 68, y: tableTop - 168, size: 12, font: fontBold, color: textDark });
    page4.drawText("COLOR SCANNED COPY OF PASSPORT PHOTOGRAPHS", { x: 115, y: tableTop - 168, size: 11.5, font: fontRegular, color: textDark });

    // Row 3 Divider
    page4.drawLine({ start: { x: tableLeft, y: tableTop - 180 }, end: { x: tableRight, y: tableTop - 180 }, thickness: 1, color: textDark });
    page4.drawText("3.", { x: 68, y: tableTop - 202, size: 12, font: fontBold, color: textDark });
    page4.drawText("Aadhaar Card, PAN Card, Voter ID or Passport Scanned Copy.", { x: 115, y: tableTop - 202, size: 11.5, font: fontRegular, color: textDark });

    // Item 4 below table
    let y4Below = tableBottom - 35;
    page4.drawText("4. Bank Account Details: Bank Name, Name as per Bank, Account Number, IFSC Code.", { x: 45, y: y4Below, size: 12, font: fontBold, color: textDark });

    y4Below = 180;
    page4.drawText("SIGNATURE:", { x: 45, y: y4Below, size: 12.5, font: fontBold, color: textDark });
    y4Below = 145;
    page4.drawText(cleanText(hrManagerName || "HR MANAGER"), { x: 45, y: y4Below, size: 12, font: fontBold, color: textDark });
    y4Below = 120;
    page4.drawText("ADYAPAN EDUTECH PRIVATE LIMITED", { x: 45, y: y4Below, size: 12, font: fontBold, color: textDark });

    drawPageFooter(page4);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    logger.error('Failed to generate 4-Page Adyapan PDF:', error);
    throw error;
  }
};

