import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

// Create Application
export const createApplication = async (req, res) => {
  try {
    const { jobId, candidateId, notes } = req.body;

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: { jobId, candidateId }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied for this job' });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId,
        notes,
        status: 'PENDING'
      },
      include: {
        candidate: true,
        job: true
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'APPLICATION_CREATED',
        userId: req.user.id,
        jobId: jobId,
        candidateId: candidateId,
        applicationId: application.id,
        details: { status: 'PENDING' }
      }
    });

    res.status(201).json({ success: true, application });
  } catch (error) {
    logger.error('Create Application Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create application' });
  }
};

// Get All Applications
export const getAllApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { job: { userId: req.user.id } },
      include: {
        candidate: true,
        job: true,
        interviews: true,
        offer: true
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json({ success: true, applications });
  } catch (error) {
    logger.error('Get Applications Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

// Get Application by ID
export const getApplicationById = async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        candidate: true,
        job: true,
        interviews: true,
        offer: true
      }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application });
  } catch (error) {
    logger.error('Get Application Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch application' });
  }
};

// Update Application Status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        candidate: true,
        job: true
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: `APPLICATION_${status}`,
        userId: req.user.id,
        jobId: application.jobId,
        candidateId: application.candidateId,
        applicationId: application.id,
        details: { status }
      }
    });

    res.json({ success: true, application });
  } catch (error) {
    logger.error('Update Application Status Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update application' });
  }
};

// Delete Application
export const deleteApplication = async (req, res) => {
  try {
    await prisma.application.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    logger.error('Delete Application Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete application' });
  }
};