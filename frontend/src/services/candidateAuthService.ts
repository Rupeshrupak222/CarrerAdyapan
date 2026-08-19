import api from './api';

export interface CandidateUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
  skills?: string[];
  currentCompany?: string;
  currentPosition?: string;
  resumeUrl?: string;
  isRegistered: boolean;
  createdAt?: string;
}

export interface CandidateApplication {
  id: string;
  status: string;
  aiScore?: number;
  matchReason?: string;
  appliedAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    slug: string;
    department: string;
    location: string;
    type: string;
    status: string;
    salaryMin?: number;
    salaryMax?: number;
  };
  interviews?: {
    id: string;
    type: string;
    scheduledAt: string;
    status: string;
    meetingLink?: string;
  }[];
  offer?: {
    id: string;
    status: string;
    salary: number;
    joiningDate: string;
  };
}

export const candidateAuthService = {
  register: async (data: { firstName: string; lastName?: string; email: string; password: string; phone?: string }) => {
    const response = await api.post('/candidate-auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/candidate-auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/candidate-auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<CandidateUser>) => {
    const response = await api.put('/candidate-auth/profile', data);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/candidate-auth/my-applications');
    return response.data;
  },
};
