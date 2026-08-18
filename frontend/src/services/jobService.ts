import api from './api';
import { cacheService } from './cacheService';

const CUSTOM_JOBS_KEY = 'adyapan_custom_published_jobs';

export const DEFAULT_PUBLISHED_JOBS: any[] = [
  {
    id: 'business-development-associate-edtech',
    slug: 'business-development-associate-edtech',
    title: 'Business Development Associate (EdTech Sales)',
    department: 'Sales & Growth',
    location: 'Mumbai / Hybrid',
    type: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: 350000,
    salaryMax: 600000,
    status: 'PUBLISHED',
    description: 'We are seeking an energetic Business Development Associate to drive student course enrolments, manage sales pipelines, conduct counselling calls, and achieve monthly revenue targets for Adyapan Edutech.',
    requirements: '1-3 years sales or telesales experience in EdTech or education; excellent English & Hindi communication; strong target achievement mindset; negotiation skills.',
    responsibilities: 'Connect with prospective student leads; conduct detailed course counselling sessions; meet monthly enrolment targets; maintain CRM lead status.',
    publishedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'academic-counsellor-student-advisor',
    slug: 'academic-counsellor-student-advisor',
    title: 'Academic Counsellor / Student Advisor',
    department: 'Student Admissions',
    location: 'Delhi NCR / Remote',
    type: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryMin: 300000,
    salaryMax: 500000,
    status: 'PUBLISHED',
    description: 'Provide personalized academic guidance to prospective students and parents, understand their career goals, recommend suitable learning programs, and assist with enrolment.',
    requirements: '2+ years experience in academic counselling, student advisement, or education sales; empathetic active listening; objection handling skills; CRM knowledge.',
    responsibilities: 'Guide students on career choices and course curricula; follow up on inbound leads; resolve parent queries; achieve monthly student admissions goals.',
    publishedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'inside-sales-executive-telecaller',
    slug: 'inside-sales-executive-telecaller',
    title: 'Inside Sales Executive / Telecaller',
    department: 'Inside Sales',
    location: 'Bangalore / On-site',
    type: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: 250000,
    salaryMax: 400000,
    status: 'PUBLISHED',
    description: 'Responsible for high-volume outbound calling to verified student leads, introducing course programs, scheduling counselling webinars, and closing course admissions.',
    requirements: '0-2 years outbound telecalling or customer service experience; fluent verbal communication; ability to handle high daily call volume (80+ calls/day).',
    responsibilities: 'Make 80-100 calls daily to inbound leads; pitch course offerings; book product demos for Senior Counsellors; maintain daily call logs.',
    publishedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'senior-full-stack-developer-react-node',
    slug: 'senior-full-stack-developer-react-node',
    title: 'Senior Full Stack Developer (React & Node.js)',
    department: 'Engineering',
    location: 'Remote',
    type: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salaryMin: 1200000,
    salaryMax: 1800000,
    status: 'PUBLISHED',
    description: 'Architect, develop, and scale high-performance web applications and AI-driven candidate recruitment modules for Adyapan platform.',
    requirements: '4+ years full-stack TypeScript, React.js, Node.js, Express, PostgreSQL / Prisma experience; experience with modern web architecture.',
    responsibilities: 'Design robust REST APIs; build responsive dynamic UIs; optimize database queries; implement automated AI recruitment workflows.',
    publishedAt: '2026-08-18T10:00:00.000Z',
  },
];

const getCustomLocalJobs = (): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CUSTOM_JOBS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { }
  return [];
};

const saveCustomLocalJob = (job: any) => {
  if (!job || typeof window === 'undefined') return;
  try {
    const current = getCustomLocalJobs();
    const slug = job.slug || (job.title ? job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `job-${Date.now()}`);
    const normalizedJob = {
      ...job,
      id: job.id || `job-${Date.now()}`,
      slug,
      status: job.status || 'PUBLISHED',
      publishedAt: job.publishedAt || new Date().toISOString(),
    };

    const index = current.findIndex((j) => j.id === normalizedJob.id || j.slug === normalizedJob.slug);
    let updated: any[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = { ...updated[index], ...normalizedJob };
    } else {
      updated = [normalizedJob, ...current];
    }
    localStorage.setItem(CUSTOM_JOBS_KEY, JSON.stringify(updated));
  } catch (e) { }
};

const deleteCustomLocalJob = (id: string) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getCustomLocalJobs();
    const updated = current.filter((j) => j.id !== id && j.slug !== id);
    localStorage.setItem(CUSTOM_JOBS_KEY, JSON.stringify(updated));
  } catch (e) { }
};

export const jobService = {
  createJob: async (data: any) => {
    saveCustomLocalJob(data);

    try {
      console.log(' Creating job in backend:', data.title);
      const response = await api.post('/jobs', data);
      console.log(' Job created in backend:', response.data);
      if (response.data?.job) {
        saveCustomLocalJob(response.data.job);
      }
      cacheService.invalidate('all_jobs');
      cacheService.invalidate('dashboard_stats');
      cacheService.invalidate('hiring_funnel');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return response.data;
    } catch (error) {
      console.warn(' Create Job Error (using local store fallback):', error);
      cacheService.invalidate('all_jobs');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return { success: true, job: data };
    }
  },

  getAllJobs: async (forceRefresh: boolean = false) => {
    const cacheKey = 'all_jobs';
    if (!forceRefresh) {
      const cached = cacheService.get<any>(cacheKey);
      if (cached && Array.isArray(cached.jobs) && cached.jobs.length > 0) return cached;
    }

    let apiJobs: any[] = [];
    try {
      console.log('Fetching all jobs from backend');
      const response = await api.get('/jobs');
      if (response.data && Array.isArray(response.data.jobs)) {
        apiJobs = response.data.jobs;
      }
    } catch (error) {
      console.warn(' Get Jobs API error, combining local stores:', error);
    }

    const localCustom = getCustomLocalJobs();
    const combined = [...apiJobs, ...localCustom, ...DEFAULT_PUBLISHED_JOBS];

    const seen = new Set();
    const jobs = combined.filter((j) => {
      if (!j) return false;
      const key = (j.slug || j.id || j.title || '').toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const result = { success: true, jobs };
    cacheService.set(cacheKey, result);
    return result;
  },

  getJobById: async (id: string) => {
    try {
      console.log('Fetching job by id:', id);
      const response = await api.get(`/jobs/${id}`);
      if (response.data?.job) return response.data;
    } catch (error) {
      console.warn(' Get Job Error, checking local stores:', error);
    }

    const localCustom = getCustomLocalJobs();
    const found = [...localCustom, ...DEFAULT_PUBLISHED_JOBS].find(
      (j) => j.id === id || j.slug === id || (id && j.slug?.includes(id))
    );
    return { success: true, job: found || DEFAULT_PUBLISHED_JOBS[0] };
  },

  updateJob: async (id: string, data: any) => {
    saveCustomLocalJob({ id, ...data });

    try {
      const response = await api.put(`/jobs/${id}`, data);
      if (response.data?.job) {
        saveCustomLocalJob(response.data.job);
      }
      cacheService.invalidate('all_jobs');
      cacheService.invalidate('dashboard_stats');
      cacheService.invalidate('hiring_funnel');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return response.data;
    } catch (error) {
      console.warn(' Update Job Error (saved locally):', error);
      cacheService.invalidate('all_jobs');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return { success: true, job: { id, ...data } };
    }
  },

  deleteJob: async (id: string) => {
    deleteCustomLocalJob(id);

    try {
      const response = await api.delete(`/jobs/${id}`);
      cacheService.invalidate('all_jobs');
      cacheService.invalidate('dashboard_stats');
      cacheService.invalidate('hiring_funnel');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return response.data;
    } catch (error) {
      console.warn(' Delete Job Error (deleted locally):', error);
      cacheService.invalidate('all_jobs');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return { success: true, message: 'Job deleted' };
    }
  },

  publishJob: async (id: string) => {
    saveCustomLocalJob({ id, status: 'PUBLISHED', publishedAt: new Date().toISOString() });

    try {
      const response = await api.patch(`/jobs/${id}/publish`);
      if (response.data?.job) {
        saveCustomLocalJob(response.data.job);
      }
      cacheService.invalidate('all_jobs');
      return response.data;
    } catch (error) {
      console.warn(' Publish Job Error (published locally):', error);
      cacheService.invalidate('all_jobs');
      return { success: true, job: { id, status: 'PUBLISHED' } };
    }
  },

  getPublicJobs: async () => {
    let apiJobs: any[] = [];
    try {
      console.log('Fetching public published jobs');
      const response = await api.get('/jobs/public');
      if (response.data && Array.isArray(response.data.jobs)) {
        apiJobs = response.data.jobs;
      }
    } catch (error) {
      console.warn(' Get Public Jobs Error, trying protected list:', error);
      try {
        const fallback = await api.get('/jobs');
        if (fallback.data && Array.isArray(fallback.data.jobs)) {
          apiJobs = fallback.data.jobs;
        }
      } catch (fbErr) { }
    }

    const localCustom = getCustomLocalJobs();
    const combined = [...apiJobs, ...localCustom, ...DEFAULT_PUBLISHED_JOBS];

    const seen = new Set();
    const jobs = combined
      .filter((j) => j && (j.status === 'PUBLISHED' || !j.status))
      .filter((j) => {
        const key = (j.slug || j.id || j.title || '').toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    return { success: true, jobs };
  },

  getPublicJob: async (slug: string) => {
    try {
      const response = await api.get(`/jobs/public/${slug}`);
      if (response.data?.job) return response.data;
    } catch (error) {
      console.warn(' Get Public Job Error, checking local stores:', error);
    }

    const localCustom = getCustomLocalJobs();
    const combined = [...localCustom, ...DEFAULT_PUBLISHED_JOBS];
    const found = combined.find(
      (j) => j.slug === slug || j.id === slug || (slug && j.slug?.includes(slug)) || (slug && slug?.includes(j.slug))
    );
    return { success: true, job: found || DEFAULT_PUBLISHED_JOBS[0] };
  },
};
