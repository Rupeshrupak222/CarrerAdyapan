import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

export const recruitmentToolService = {
  /**
   * Search candidates by name, skill, current position, or company
   */
  async searchCandidates({ query, skill, limit = 8 }: { query?: string; skill?: string; limit?: number } = {}) {
    try {
      const where: any = {};

      if (query && query.trim()) {
        const q = query.trim();
        where.OR = [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { currentPosition: { contains: q, mode: 'insensitive' } },
          { currentCompany: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (skill && skill.trim()) {
        where.skills = { has: skill.trim() };
      }

      const candidates = await prisma.candidate.findMany({
        where,
        take: Math.min(Number(limit) || 8, 20),
        include: {
          applications: {
            include: {
              job: { select: { title: true, department: true } }
            },
            take: 3
          }
        },
        orderBy: { aiScore: 'desc' }
      }).catch(err => {
        logger.warn('searchCandidates prisma catch:', err.message);
        return [];
      });

      if (!candidates || candidates.length === 0) {
        return { count: 0, candidates: [], message: query ? `No candidates found matching "${query}".` : 'No candidates registered yet.' };
      }

      return {
        count: candidates.length,
        candidates: candidates.map(c => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          position: c.currentPosition || 'Applicant',
          company: c.currentCompany || 'N/A',
          experienceYears: c.totalExperience || 0,
          skills: (c.skills || []).slice(0, 6),
          aiScore: c.aiScore || 75,
          matchReason: c.matchReason || undefined,
          appliedJobs: (c.applications || []).map(a => a.job?.title).filter(Boolean)
        }))
      };
    } catch (err: any) {
      logger.error('searchCandidates Tool Error:', err);
      return { count: 0, candidates: [], error: 'Failed to search candidates' };
    }
  },

  /**
   * Get detailed profile & parsed resume for a specific candidate
   */
  async getCandidateDetails({ candidateName, candidateId }: { candidateName?: string; candidateId?: string } = {}) {
    try {
      let candidate: any = null;

      if (candidateId) {
        candidate = await prisma.candidate.findUnique({
          where: { id: candidateId },
          include: {
            applications: {
              include: {
                job: { select: { title: true, department: true } },
                interviews: true
              }
            }
          }
        }).catch(() => null);
      }

      if (!candidate && candidateName && candidateName.trim()) {
        const trimmed = candidateName.trim();
        const nameParts = trimmed.split(/\s+/);
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
              { firstName: { contains: trimmed, mode: 'insensitive' } },
              { lastName: { contains: trimmed, mode: 'insensitive' } }
            ]
          },
          include: {
            applications: {
              include: {
                job: { select: { title: true, department: true } },
                interviews: true
              }
            }
          }
        }).catch(() => null);
      }

      if (!candidate) {
        return { found: false, message: `Candidate "${candidateName || candidateId}" not found in database.` };
      }

      return {
        found: true,
        id: candidate.id,
        name: `${candidate.firstName} ${candidate.lastName}`,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location || 'India',
        currentPosition: candidate.currentPosition || 'Applicant',
        currentCompany: candidate.currentCompany || 'N/A',
        experienceYears: candidate.totalExperience || 0,
        skills: candidate.skills || [],
        aiScore: candidate.aiScore,
        matchReason: candidate.matchReason,
        applications: (candidate.applications || []).map((app: any) => ({
          applicationId: app.id,
          jobTitle: app.job?.title,
          department: app.job?.department,
          status: app.status,
          score: app.aiScore,
          strengths: app.strengths || [],
          missingSkills: app.missingSkills || [],
          interviewsCount: app.interviews?.length || 0
        }))
      };
    } catch (err: any) {
      logger.error('getCandidateDetails Tool Error:', err);
      return { found: false, error: 'Failed to retrieve candidate details' };
    }
  },

  /**
   * Get list of jobs with status and filters
   */
  async getJobs({ status, department, limit = 10 }: { status?: string; department?: string; limit?: number } = {}) {
    try {
      const where: any = {};
      if (status) where.status = status;
      if (department) where.department = { contains: department, mode: 'insensitive' };

      const jobs = await prisma.job.findMany({
        where,
        include: {
          _count: { select: { applications: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(Number(limit) || 10, 25)
      }).catch(() => []);

      return {
        count: jobs.length,
        jobs: jobs.map(j => ({
          id: j.id,
          title: j.title,
          department: j.department,
          status: j.status,
          experienceLevel: j.experienceLevel,
          location: j.location,
          type: j.type,
          salaryRange: j.salaryMin && j.salaryMax ? `₹${(j.salaryMin/100000).toFixed(1)}L - ₹${(j.salaryMax/100000).toFixed(1)}L PA` : 'Competitive',
          totalApplicants: j._count?.applications || 0,
          totalRounds: j.totalRounds || 3
        }))
      };
    } catch (err: any) {
      logger.error('getJobs Tool Error:', err);
      return { count: 0, jobs: [] };
    }
  },

  /**
   * Get detailed job description, requirements and applicant metrics
   */
  async getJobDetails({ jobTitle, jobId }: { jobTitle?: string; jobId?: string } = {}) {
    try {
      let job: any = null;

      if (jobId) {
        job = await prisma.job.findUnique({
          where: { id: jobId },
          include: {
            applications: {
              include: { candidate: true },
              take: 10,
              orderBy: { aiScore: 'desc' }
            }
          }
        }).catch(() => null);
      }

      if (!job && jobTitle && jobTitle.trim()) {
        job = await prisma.job.findFirst({
          where: { title: { contains: jobTitle.trim(), mode: 'insensitive' } },
          include: {
            applications: {
              include: { candidate: true },
              take: 10,
              orderBy: { aiScore: 'desc' }
            }
          }
        }).catch(() => null);
      }

      if (!job) {
        return { found: false, message: `Job posting "${jobTitle || jobId}" not found in database.` };
      }

      return {
        found: true,
        id: job.id,
        title: job.title,
        department: job.department,
        status: job.status,
        experienceLevel: job.experienceLevel,
        location: job.location,
        type: job.type,
        salaryRange: job.salaryMin && job.salaryMax ? `₹${(job.salaryMin/100000).toFixed(1)}L - ₹${(job.salaryMax/100000).toFixed(1)}L PA` : 'Competitive',
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        totalRounds: job.totalRounds || 3,
        interviewRounds: job.interviewRounds || [],
        applicantsCount: job.applications?.length || 0,
        topApplicants: (job.applications || []).map((a: any) => ({
          candidateId: a.candidateId,
          name: `${a.candidate?.firstName} ${a.candidate?.lastName}`,
          score: a.aiScore,
          status: a.status,
          currentPosition: a.candidate?.currentPosition || 'Applicant'
        }))
      };
    } catch (err: any) {
      logger.error('getJobDetails Tool Error:', err);
      return { found: false, error: 'Failed to retrieve job details' };
    }
  },

  /**
   * Get applications with filters (status, job, candidate)
   */
  async getApplications({ status, jobTitle, candidateName, limit = 10 }: { status?: string; jobTitle?: string; candidateName?: string; limit?: number } = {}) {
    try {
      const where: any = {};
      if (status) where.status = status;
      if (jobTitle) where.job = { title: { contains: jobTitle, mode: 'insensitive' } };
      if (candidateName) {
        where.candidate = {
          OR: [
            { firstName: { contains: candidateName, mode: 'insensitive' } },
            { lastName: { contains: candidateName, mode: 'insensitive' } }
          ]
        };
      }

      const applications = await prisma.application.findMany({
        where,
        take: Math.min(Number(limit) || 10, 30),
        include: {
          candidate: {
            select: { id: true, firstName: true, lastName: true, email: true, currentPosition: true, totalExperience: true }
          },
          job: {
            select: { id: true, title: true, department: true }
          }
        },
        orderBy: { appliedAt: 'desc' }
      }).catch(() => []);

      return {
        count: applications.length,
        applications: applications.map(app => ({
          id: app.id,
          candidateName: `${app.candidate?.firstName} ${app.candidate?.lastName}`,
          candidateEmail: app.candidate?.email,
          candidatePosition: app.candidate?.currentPosition || 'Applicant',
          jobTitle: app.job?.title,
          department: app.job?.department,
          status: app.status,
          aiScore: app.aiScore,
          appliedAt: app.appliedAt
        }))
      };
    } catch (err: any) {
      logger.error('getApplications Tool Error:', err);
      return { count: 0, applications: [] };
    }
  },

  /**
   * Get upcoming or past interviews
   */
  async getInterviews({ status, limit = 8 }: { status?: string; limit?: number } = {}) {
    try {
      const where: any = {};
      if (status) where.status = status;

      const interviews = await prisma.interview.findMany({
        where,
        take: Math.min(Number(limit) || 8, 20),
        include: {
          application: {
            include: {
              candidate: { select: { firstName: true, lastName: true, email: true } },
              job: { select: { title: true } }
            }
          },
          interviewer: { select: { name: true, email: true } }
        },
        orderBy: { scheduledAt: 'desc' }
      }).catch(() => []);

      return {
        count: interviews.length,
        interviews: interviews.map(i => ({
          id: i.id,
          candidateName: `${i.application?.candidate?.firstName} ${i.application?.candidate?.lastName}`,
          jobTitle: i.application?.job?.title,
          roundNumber: i.roundNumber,
          roundName: i.roundName,
          status: i.status,
          scheduledAt: i.scheduledAt,
          interviewerName: i.interviewer?.name || 'Assigned HR',
          meetLink: i.meetLink || undefined
        }))
      };
    } catch (err: any) {
      logger.error('getInterviews Tool Error:', err);
      return { count: 0, interviews: [] };
    }
  },

  /**
   * Get offers released or pending
   */
  async getOffers({ status, limit = 8 }: { status?: string; limit?: number } = {}) {
    try {
      const where: any = {};
      if (status) where.status = status;

      const offers = await prisma.offer.findMany({
        where,
        take: Math.min(Number(limit) || 8, 20),
        include: {
          candidate: { select: { firstName: true, lastName: true, email: true } },
          job: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' }
      }).catch(() => []);

      return {
        count: offers.length,
        offers: offers.map(o => ({
          id: o.id,
          candidateName: `${o.candidate?.firstName} ${o.candidate?.lastName}`,
          jobTitle: o.job?.title,
          status: o.status,
          baseSalary: o.baseSalary ? `₹${(o.baseSalary/100000).toFixed(1)}L PA` : 'N/A',
          totalCompensation: o.totalCompensation ? `₹${(o.totalCompensation/100000).toFixed(1)}L PA` : 'N/A',
          joiningDate: o.joiningDate
        }))
      };
    } catch (err: any) {
      logger.error('getOffers Tool Error:', err);
      return { count: 0, offers: [] };
    }
  },

  /**
   * Side-by-side comparison of two candidates against a job
   */
  async compareCandidates({ candidate1Name, candidate2Name, jobTitle }: { candidate1Name: string; candidate2Name: string; jobTitle?: string }) {
    try {
      const [c1Data, c2Data, jobData] = await Promise.all([
        this.getCandidateDetails({ candidateName: candidate1Name }),
        this.getCandidateDetails({ candidateName: candidate2Name }),
        jobTitle ? this.getJobDetails({ jobTitle }) : Promise.resolve(null)
      ]);

      return {
        candidate1: c1Data,
        candidate2: c2Data,
        targetJob: jobData?.found ? { title: jobData.title, requirements: jobData.requirements } : (jobTitle || 'General Comparison')
      };
    } catch (err: any) {
      logger.error('compareCandidates Tool Error:', err);
      return { error: 'Failed to perform candidate comparison query' };
    }
  },

  /**
   * Get recruitment pipeline metrics summary
   */
  async getPipelineSummary() {
    try {
      const [totalCandidates, totalJobs, totalApps, shortlistedCount, hiredCount, interviewingCount, avgScore] = await Promise.all([
        prisma.candidate.count().catch(() => 0),
        prisma.job.count({ where: { status: 'PUBLISHED' } }).catch(() => 0),
        prisma.application.count().catch(() => 0),
        prisma.application.count({ where: { status: 'SHORTLISTED' } }).catch(() => 0),
        prisma.application.count({ where: { status: 'HIRED' } }).catch(() => 0),
        prisma.application.count({ where: { status: { in: ['INTERVIEWING', 'HR_ASSIGNED'] } } }).catch(() => 0),
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
        interviewingCount,
        hiredCount,
        averageAtsScore: Math.round(avgScore?._avg?.aiScore || 75),
        topRankedCandidates: topCandidates.map(c => ({
          name: `${c.firstName} ${c.lastName}`,
          position: c.currentPosition || 'Applicant',
          score: c.aiScore,
          experience: `${c.totalExperience || 0} Yrs`
        }))
      };
    } catch (err: any) {
      logger.error('getPipelineSummary Tool Error:', err);
      return {
        totalRegisteredCandidates: 0,
        activePublishedJobs: 0,
        totalApplicationsReceived: 0,
        shortlistedCount: 0,
        interviewingCount: 0,
        hiredCount: 0,
        averageAtsScore: 75,
        topRankedCandidates: []
      };
    }
  },

  /**
   * Execute tool dynamically by name and arguments
   */
  async executeTool(toolName: string, toolArgs: any = {}) {
    logger.info(`[AI Tool Call] Executing tool: ${toolName} with args:`, toolArgs);
    switch (toolName) {
      case 'searchCandidates':
        return await this.searchCandidates(toolArgs);
      case 'getCandidateDetails':
        return await this.getCandidateDetails(toolArgs);
      case 'getJobs':
        return await this.getJobs(toolArgs);
      case 'getJobDetails':
        return await this.getJobDetails(toolArgs);
      case 'getApplications':
        return await this.getApplications(toolArgs);
      case 'getInterviews':
        return await this.getInterviews(toolArgs);
      case 'getOffers':
        return await this.getOffers(toolArgs);
      case 'compareCandidates':
        return await this.compareCandidates(toolArgs);
      case 'getPipelineSummary':
        return await this.getPipelineSummary();
      default:
        logger.warn(`Unknown AI tool called: ${toolName}`);
        return { error: `Tool ${toolName} is not available.` };
    }
  }
};

/**
 * Gemini Function Declarations for autonomous tool use
 */
export const recruitmentFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: 'searchCandidates',
    description: 'Search for candidates in the Adyapan recruitment database by name, skills, job title, or company.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: 'Search term for name, title, or company' },
        skill: { type: SchemaType.STRING, description: 'Specific skill to filter candidates (e.g. React, B2B Sales, CRM)' },
        limit: { type: SchemaType.NUMBER, description: 'Max number of candidates to return (default: 8)' }
      }
    }
  },
  {
    name: 'getCandidateDetails',
    description: 'Get verified in-depth candidate profile, skills, experience, ATS match score, and application history.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        candidateName: { type: SchemaType.STRING, description: 'First name, last name, or full name of the candidate' },
        candidateId: { type: SchemaType.STRING, description: 'Unique candidate ID if known' }
      }
    }
  },
  {
    name: 'getJobs',
    description: 'List active or draft job openings in Adyapan Edutech with department, salary, and applicant counts.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        status: { type: SchemaType.STRING, description: 'Filter by job status: PUBLISHED, DRAFT, CLOSED' },
        department: { type: SchemaType.STRING, description: 'Filter by department (e.g. Sales, Tech, HR)' },
        limit: { type: SchemaType.NUMBER, description: 'Max number of jobs to return' }
      }
    }
  },
  {
    name: 'getJobDetails',
    description: 'Get full details of a specific job opening including description, responsibilities, requirements, and top applicants.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        jobTitle: { type: SchemaType.STRING, description: 'Title or partial name of the job' },
        jobId: { type: SchemaType.STRING, description: 'Unique job ID if known' }
      }
    }
  },
  {
    name: 'getApplications',
    description: 'Retrieve candidate applications filtered by status (SHORTLISTED, APPLIED, INTERVIEWING, REJECTED, HIRED), job title, or candidate name.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        status: { type: SchemaType.STRING, description: 'Application status filter: SHORTLISTED, APPLIED, INTERVIEWING, REJECTED, HIRED' },
        jobTitle: { type: SchemaType.STRING, description: 'Filter applications for a specific job title' },
        candidateName: { type: SchemaType.STRING, description: 'Filter applications for a specific candidate name' },
        limit: { type: SchemaType.NUMBER, description: 'Max applications to return' }
      }
    }
  },
  {
    name: 'getInterviews',
    description: 'Retrieve scheduled interview rounds, interviewers, dates, and candidate interview statuses.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        status: { type: SchemaType.STRING, description: 'Filter interview status: SCHEDULED, COMPLETED, CANCELLED' },
        limit: { type: SchemaType.NUMBER, description: 'Max interviews to return' }
      }
    }
  },
  {
    name: 'getOffers',
    description: 'Retrieve candidate offer letters, status (OFFER_PENDING, OFFER_RELEASED, OFFER_ACCEPTED), and compensation details.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        status: { type: SchemaType.STRING, description: 'Filter offer status: OFFER_PENDING, OFFER_RELEASED, OFFER_ACCEPTED' },
        limit: { type: SchemaType.NUMBER, description: 'Max offers to return' }
      }
    }
  },
  {
    name: 'compareCandidates',
    description: 'Perform a side-by-side comparison of two specific candidates against a job position or skill criteria.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        candidate1Name: { type: SchemaType.STRING, description: 'Full or first name of candidate 1' },
        candidate2Name: { type: SchemaType.STRING, description: 'Full or first name of candidate 2' },
        jobTitle: { type: SchemaType.STRING, description: 'Optional job position to evaluate against' }
      },
      required: ['candidate1Name', 'candidate2Name']
    }
  },
  {
    name: 'getPipelineSummary',
    description: 'Get real-time total metrics of the recruitment pipeline: total candidates, active jobs, applications, shortlisted, hired, and average ATS scores.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    }
  }
];
