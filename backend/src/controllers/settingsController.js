import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

// Get Global Offer Template from DB
export const getGlobalTemplate = async (req, res) => {
  try {
    const nameSetting = await prisma.systemSetting.findUnique({ where: { key: 'global_offer_template_name' } });
    const urlSetting = await prisma.systemSetting.findUnique({ where: { key: 'global_offer_template_url' } });

    res.json({
      success: true,
      templateName: nameSetting?.value || 'Adyapan_Edutech_Official_Offer_Letter.pdf',
      templateDataUrl: urlSetting?.dataUrl || urlSetting?.value || null,
    });
  } catch (error) {
    logger.error('Get Global Template Error:', error.message);
    res.json({
      success: true,
      templateName: 'Adyapan_Edutech_Official_Offer_Letter.pdf',
      templateDataUrl: null,
    });
  }
};

// Save Global Offer Template in DB
export const saveGlobalTemplate = async (req, res) => {
  try {
    const { templateName, templateDataUrl } = req.body;
    const nameStr = templateName || 'Uploaded_Offer_Template.pdf';

    await prisma.systemSetting.upsert({
      where: { key: 'global_offer_template_name' },
      update: { value: nameStr },
      create: { key: 'global_offer_template_name', value: nameStr },
    });

    if (templateDataUrl !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'global_offer_template_url' },
        update: { value: 'STORED_DATA_URL', dataUrl: templateDataUrl },
        create: { key: 'global_offer_template_url', value: 'STORED_DATA_URL', dataUrl: templateDataUrl },
      });
    }

    logger.info(`✅ Global Company Offer Template "${nameStr}" persisted to PostgreSQL DB!`);

    res.json({
      success: true,
      message: `Global Offer Template "${nameStr}" saved to PostgreSQL Database! 📄`,
      templateName: nameStr,
      templateDataUrl: templateDataUrl || null,
    });
  } catch (error) {
    logger.error('Save Global Template Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to save template to database: ' + error.message });
  }
};
