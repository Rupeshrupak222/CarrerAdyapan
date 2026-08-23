import api from './api';

export const applicationService = {
  createApplication: async (data: any) => {
    const response = await api.post('/applications', data);
    return response.data;
  },

  getAllApplications: async (params?: any) => {
    const response = await api.get('/applications', { params });
    return response.data;
  },

  getApplicationById: async (id: string) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string, overallStatus?: string) => {
    const response = await api.patch(`/applications/${id}/status`, { status, overallStatus });
    return response.data;
  },

  reassignCandidate: async (id: string, newHrId: string, reason?: string) => {
    const response = await api.post(`/applications/${id}/reassign`, { newHrId, reason });
    return response.data;
  },

  reassignHR: async (id: string, newHrId: string, reason?: string) => {
    const response = await api.post(`/applications/${id}/reassign`, { newHrId, reason });
    return response.data;
  },

  approveOffer: async (id: string) => {
    const response = await api.post(`/applications/${id}/approve-offer`);
    return response.data;
  },

  triggerScreening: async (forceAll: boolean = false) => {
    const response = await api.post('/applications/trigger-screening', { forceAll });
    return response.data;
  },

  deleteApplication: async (id: string) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
};

export default applicationService;
