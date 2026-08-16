export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RECRUITER' | 'INTERVIEWER' | string;
  avatar?: string;
  phone?: string;
  designation?: string;
  department?: string;
  company?: string;
  location?: string;
  bio?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string; // Full-time, Part-time, Contract, etc.
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  status: 'ACTIVE' | 'DRAFT' | 'CLOSED' | 'ARCHIVED' | string;
  slug?: string;
  applicationsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  resumeUrl?: string;
  resumeText?: string;
  skills?: string[];
  experienceYears?: number;
  currentCompany?: string;
  currentRole?: string;
  education?: string;
  atsScore?: number;
  aiSummary?: string;
  stage?: 'NEW' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED' | string;
  status?: string;
  appliedDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle?: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  stage: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED' | string;
  status: string;
  atsScore?: number;
  resumeUrl?: string;
  notes?: string;
  appliedAt: string;
  updatedAt?: string;
  job?: Job;
  candidate?: Candidate;
}

export interface Interview {
  id: string;
  applicationId?: string;
  candidateId: string;
  candidateName?: string;
  jobId?: string;
  jobTitle?: string;
  interviewerId?: string;
  interviewerName?: string;
  scheduledAt: string;
  durationMinutes?: number;
  type?: 'TECHNICAL' | 'HR' | 'BEHAVIORAL' | string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | string;
  meetingUrl?: string;
  location?: string;
  feedback?: string;
  rating?: number;
  notes?: string;
  createdAt?: string;
}

export interface Offer {
  id: string;
  applicationId?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  jobId?: string;
  jobTitle: string;
  salary: number;
  joiningDate: string;
  expiryDate?: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | string;
  documentUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalJobs: number;
  totalCandidates: number;
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  hiredCount: number;
  conversionRate?: number;
  avgTimeToHireDays?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
