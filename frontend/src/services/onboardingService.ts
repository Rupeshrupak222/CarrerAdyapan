import api from './api';

export const onboardingService = {
  getOnboardingByToken: async (token: string) => {
    const response = await api.get(`/onboarding/token/${token}`);
    return response.data;
  },

  submitOnboarding: async (data: {
    token: string;
    personalDetails: any;
    addressDetails: any;
    educationDetails: any;
    bankDetails: any;
    emergencyContact: any;
    documents: any[];
  }) => {
    const response = await api.post('/onboarding/submit', data);
    return response.data;
  },

  verifyDocument: async (documentId: string, status: string, rejectionReason?: string) => {
    const response = await api.patch(`/onboarding/documents/${documentId}/verify`, { status, rejectionReason });
    return response.data;
  },

  confirmJoining: async (onboardingId: string, data: {
    confirmedDate: string;
    designation?: string;
    department?: string;
    managerName?: string;
    location?: string;
    notes?: string;
  }) => {
    const response = await api.post(`/onboarding/${onboardingId}/confirm-joining`, data);
    return response.data;
  },

  markJoined: async (joiningId: string) => {
    const response = await api.post(`/onboarding/joinings/${joiningId}/mark-joined`);
    return response.data;
  },
};

export default onboardingService;
