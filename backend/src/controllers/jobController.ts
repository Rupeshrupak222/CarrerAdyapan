import prisma from '../config/db.js';
import { generateSlug } from '../utils/generateSlug.js';

export const createJob = async (req, res) => {
  try {
    const { 
      title, 
      department, 
      description, 
      requirements, 
      responsibilities, 
      type, 
      experienceLevel, 
      salaryMin, 
      salaryMax, 
      location,
      status
    } = req.body;

    // Validation
    if (!title || !department || !description || !requirements || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields: title, department, description, requirements, location' 
      });
    }

    // Ensure User exists in PostgreSQL DB to satisfy Foreign Key Constraint
    let userRecord = null;
    if (req.user?.id) {
      userRecord = await prisma.user.findUnique({ where: { id: req.user.id } }).catch(() => null);
    }
    if (!userRecord && req.user?.email) {
      userRecord = await prisma.user.findUnique({ where: { email: req.user.email } }).catch(() => null);
    }
    if (!userRecord) {
      userRecord = await prisma.user.findFirst().catch(() => null);
    }
    if (!userRecord) {
      userRecord = await prisma.user.create({
        data: {
          id: req.user?.id || 'demo-user-101',
          name: req.user?.name || 'Adyapan Recruiter Admin',
          email: req.user?.email || 'admin@adyapan.com',
          password: '$2a$10$hashedpasswordplaceholder',
          role: 'ADMIN',
          company: 'Adyapan Edutech Pvt Ltd',
        },
      });
    }
    const targetUserId = userRecord.id;

    // Check if default sample job or duplicate unedited job exists to prevent copy creation
    const existingDefault = await prisma.job.findFirst({
      where: {
        OR: [
          { id: 'business-development-associate-edtech' },
          { title: { equals: title, mode: 'insensitive' } }
        ]
      },
      include: { applications: true }
    });

    let job;
    if (existingDefault && existingDefault.applications.length === 0) {
      // Overwrite/update existing job instead of creating a duplicate copy
      job = await prisma.job.update({
        where: { id: existingDefault.id },
        data: {
          title,
          department,
          description,
          requirements,
          responsibilities: responsibilities || '',
          type: type || 'FULL_TIME',
          experienceLevel: experienceLevel || 'MID',
          salaryMin: salaryMin ? parseFloat(salaryMin) : null,
          salaryMax: salaryMax ? parseFloat(salaryMax) : null,
          location,
          status: status || 'PUBLISHED',
          publishedAt: status === 'PUBLISHED' ? new Date() : null,
        }
      });
    } else {
      const slug = generateSlug(title) + '-' + Math.floor(Math.random() * 10000);
      job = await prisma.job.create({
        data: {
          title,
          slug,
          department,
          description,
          requirements,
          responsibilities: responsibilities || '',
          type: type || 'FULL_TIME',
          experienceLevel: experienceLevel || 'MID',
          salaryMin: salaryMin ? parseFloat(salaryMin) : null,
          salaryMax: salaryMax ? parseFloat(salaryMax) : null,
          location,
          userId: targetUserId,
          status: status || 'PUBLISHED',
          publishedAt: status === 'PUBLISHED' ? new Date() : null,
        }
      });
    }

    // Clean up any remaining unneeded default sample jobs if new custom job created
    if (job.id !== 'business-development-associate-edtech') {
      await prisma.job.delete({
        where: { id: 'business-development-associate-edtech' }
      }).catch(() => null);
    }
    
    res.status(201).json({ 
      success: true, 
      job 
    });
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create job: ' + error.message 
    });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'private, max-age=5, stale-while-revalidate=10');
    let rawJobs = await prisma.job.findMany({
      include: {
        applications: {
          select: { id: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Deduplicate jobs by normalized title so no duplicate copies appear
    const seenTitles = new Set();
    let jobs = rawJobs.filter((j) => {
      const norm = (j.title || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (seenTitles.has(norm)) return false;
      seenTitles.add(norm);
      return true;
    });

    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Get Jobs Error:', error.message);
    res.json({
      success: true,
      jobs: []
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        applications: {
          include: {
            candidate: true
          }
        }
      }
    });
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }
    
    res.json({ success: true, job });
  } catch (error) {
    console.error('Get Job Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch job' 
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: req.body
    });
    
    res.json({ success: true, job });
  } catch (error) {
    console.error('Update Job Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update job' 
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Clean up all foreign key dependencies before deleting job
    await prisma.activity.deleteMany({ where: { jobId: id } }).catch(() => null);
    await prisma.interview.deleteMany({ where: { jobId: id } }).catch(() => null);
    await prisma.application.deleteMany({ where: { jobId: id } }).catch(() => null);
    
    await prisma.job.delete({ where: { id } });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('Delete Job Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete job' });
  }
};

export const publishJob = async (req, res) => {
  try {
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });
    
    res.json({ success: true, job });
  } catch (error) {
    console.error('Publish Job Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to publish job' 
    });
  }
};

export const getPublicJob = async (req, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { 
        slug: req.params.slug, 
        status: 'PUBLISHED' 
      }
    });
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }
    
    res.json({ success: true, job });
  } catch (error) {
    console.error('Get Public Job Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch job' 
    });
  }
};