import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';

export const recruitmentToolService = {
  /**
   * Search candidates by name, skill, current position, or company
   */
  async searchCandidates({ query, skill }) {
    try {
      const where = {};

      if (query) {
        where.OR = [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { currentPosition: { contains: query, mode: 'insensitive' } },
          { currentCompany: { contains: query, mode: 'insensitive' } },
        ];
      }

      if (skill) {
        where.skills = { has: skill };
      }

      const candidates = await prisma.candidate.findMany({
        where,
        take: 10,
        include: {
          applications: {
            include: {
              job: { select: { title: true, department: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }).catch(err => {
        logger.warn('searchCandidates prisma catch:', err.message);
        return [];
      });

      return candidates.map(c => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        phone: c.phone,
        position: c.currentPosition || 'Applicant',
        company: c.currentCompany || 'N/A',
        totalExperience: c.totalExperience || 0,
        skills: c.skills || [],
        aiScore: c.aiScore || 75,
        appliedJobs: (c.applications || []).map(a => a.job?.title).filter(Boolean)
      }));
    } catch (err) {
      logger.error('searchCandidates Tool Error:', err);
      return [];
    }
  },

  /**
   * Get detailed profile & parsed resume for a specific candidate
   */
  async getCandidateDetails({ candidateName, candidateId }) {
    try {
      let candidate = null;

      if (candidateId) {
        candidate = await prisma.candidate.findUnique({
          where: { id: candidateId },
          include: { applications: { include: { job: true, interviews: true } } }
        }).catch(() => null);
      }

      if (!candidate && candidateName) {
        const nameParts = candidateName.trim().split(/\s+/);
        const first = nameParts[0];
        const last = nameParts.slice(1).join(' ');

        candidate = await prisma.candidate.findFirst({
          where: {
            OR: [
              {
                AND: [
                  { firstName: { contains: first, mode: 'insensitive' } },
                  ...(last ? [{ lastName: { contains: last, mode: 'insensitive' } }] : [])
                ]
              },
              { firstName: { contains: candidateName, mode: 'insensitive' } },
              { lastName: { contains: candidateName, mode: 'insensitive' } }
            ]
          },
          include: { applications: { include: { job: true, interviews: true } } }
        }).catch(() => null);
      }

      if (!candidate) {
        return { message: `Candidate "${candidateName || candidateId}" not found in database.` };
      }

      return {
        id: candidate.id,
        name: `${candidate.firstName} ${candidate.lastName}`,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location || 'India',
        currentPosition: candidate.currentPosition || 'Applicant',
        currentCompany: candidate.currentCompany || 'N/A',
        totalExperience: `${candidate.totalExperience || 0} Years`,
        skills: candidate.skills || [],
        parsedResume: candidate.parsedResume || {},
        aiScore: candidate.aiScore,
        matchReason: candidate.matchReason,
        atsBreakdown: candidate.atsBreakdown,
        applications: (candidate.applications || []).map(app => ({
          applicationId: app.id,
          jobTitle: app.job?.title,
          department: app.job?.department,
          status: app.status,
          score: app.aiScore,
          strengths: app.strengths || [],
          missingSkills: app.missingSkills || [],
          recommendations: app.recommendations || []
        }))
      };
    } catch (err) {
      logger.error('getCandidateDetails Tool Error:', err);
      return { error: 'Failed to retrieve candidate details' };
    }
  },

  /**
   * Get list of jobs with status and filters
   */
  async getJobs({ status, department }) {
    try {
      const where = {};
      if (status) where.status = status;
      if (department) where.department = { contains: department, mode: 'insensitive' };

      const jobs = await prisma.job.findMany({
        where,
        include: {
          _count: { select: { applications: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 15
      }).catch(() => []);

      return jobs.map(j => ({
        id: j.id,
        title: j.title,
        department: j.department,
        status: j.status,
        experienceLevel: j.experienceLevel,
        location: j.location,
        salaryRange: j.salaryMin && j.salaryMax ? `₹${j.salaryMin/100000}L - ₹${j.salaryMax/100000}L PA` : 'Competitive',
        totalApplicants: j._count?.applications || 0,
        requirements: j.requirements ? j.requirements.substring(0, 300) : ''
      }));
    } catch (err) {
      logger.error('getJobs Tool Error:', err);
      return [];
    }
  },

  /**
   * Get detailed job description and required skills
   */
  async getJobDetails({ jobTitle, jobId }) {
    try {
      let job = null;

      if (jobId) {
        job = await prisma.job.findUnique({
          where: { id: jobId },
          include: { applications: { include: { candidate: true } } }
        }).catch(() => null);
      }

      if (!job && jobTitle) {
        job = await prisma.job.findFirst({
          where: { title: { contains: jobTitle, mode: 'insensitive' } },
          include: { applications: { include: { candidate: true } } }
        }).catch(() => null);
      }

      if (!job) {
        return { message: `Job posting "${jobTitle || jobId}" not found in database.` };
      }

      return {
        id: job.id,
        title: job.title,
        department: job.department,
        status: job.status,
        experienceLevel: job.experienceLevel,
        location: job.location,
        salaryRange: job.salaryMin && job.salaryMax ? `₹${job.salaryMin/100000}L - ₹${job.salaryMax/100000}L PA` : 'Competitive',
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        applicantsCount: job.applications?.length || 0,
        topApplicants: (job.applications || []).slice(0, 5).map(a => ({
          candidateId: a.candidateId,
          name: `${a.candidate?.firstName} ${a.candidate?.lastName}`,
          score: a.aiScore,
          status: a.status
        }))
      };
    } catch (err) {
      logger.error('getJobDetails Tool Error:', err);
      return { error: 'Failed to retrieve job details' };
    }
  },

  /**
   * Side-by-side comparison of two or more candidates against a job
   */
  async compareCandidates({ candidate1Name, candidate2Name, jobTitle }) {
    try {
      const c1Data = await this.getCandidateDetails({ candidateName: candidate1Name });
      const c2Data = await this.getCandidateDetails({ candidateName: candidate2Name });

      let jobData = null;
      if (jobTitle) {
        jobData = await this.getJobDetails({ jobTitle });
      }

      return {
        candidate1: c1Data,
        candidate2: c2Data,
        jobContext: jobData || 'No specific job context provided; comparing general profile and skills.'
      };
    } catch (err) {
      logger.error('compareCandidates Tool Error:', err);
      return { error: 'Failed to perform candidate comparison query' };
    }
  },

  /**
   * Get recruitment pipeline metrics summary
   */
  async getPipelineSummary() {
    try {
      const [totalCandidates, totalJobs, totalApps, shortlistedCount, hiredCount, avgScore] = await Promise.all([
        prisma.candidate.count().catch(() => 0),
        prisma.job.count({ where: { status: 'PUBLISHED' } }).catch(() => 0),
        prisma.application.count().catch(() => 0),
        prisma.application.count({ where: { status: 'SHORTLISTED' } }).catch(() => 0),
        prisma.application.count({ where: { status: 'HIRED' } }).catch(() => 0),
        prisma.application.aggregate({ _avg: { aiScore: true } }).catch(() => ({ _avg: { aiScore: 75 } }))
      ]);

      const topCandidates = await prisma.candidate.findMany({
        orderBy: { aiScore: 'desc' },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          currentPosition: true,
          aiScore: true,
          totalExperience: true
        }
      }).catch(() => []);

      return {
        totalRegisteredCandidates: totalCandidates,
        activePublishedJobs: totalJobs,
        totalApplicationsReceived: totalApps,
        shortlistedCount,
        hiredCount,
        averageAtsScore: Math.round(avgScore?._avg?.aiScore || 75),
        topRankedCandidates: topCandidates.map(c => ({
          name: `${c.firstName} ${c.lastName}`,
          position: c.currentPosition || 'Applicant',
          score: c.aiScore,
          experience: `${c.totalExperience || 0} Yrs`
        }))
      };
    } catch (err) {
      logger.error('getPipelineSummary Tool Error:', err);
      return {
        totalRegisteredCandidates: 0,
        activePublishedJobs: 0,
        totalApplicationsReceived: 0,
        shortlistedCount: 0,
        hiredCount: 0,
        averageAtsScore: 75,
        topRankedCandidates: []
      };
    }
  }
};
