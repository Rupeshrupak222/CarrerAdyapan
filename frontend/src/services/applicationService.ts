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

  assignHr: async (id: string, hrId: string, reason?: string) => {
    const response = await api.post(`/applications/${id}/assign-hr`, { hrId, reason });
    return response.data;
  },

  getWorkloadStats: async () => {
    const response = await api.get('/applications/workload/stats');
    return response.data;
  },

  getManagerStats: async () => {
    const response = await api.get('/applications/manager-stats');
    return response.data;
  },

  bulkRunAtsCheck: async (applicationIds: string[]) => {
    const response = await api.post('/applications/bulk-ats-check', { applicationIds });
    return response.data;
  },

  getFinalRoundSelected: async () => {
    const response = await api.get('/applications/final-selected/list');
    return response.data;
  },

  getBulkOfferRangePreview: async (fromId: string, toId: string) => {
    const response = await api.post('/applications/final-selected/bulk-preview', { fromId, toId });
    return response.data;
  },

  executeBulkOfferSend: async (payload: {
    fromId: string;
    toId: string;
    commonOfferData: any;
    candidateIdsToProcess?: string[];
  }) => {
    const response = await api.post('/applications/final-selected/bulk-send', payload);
    return response.data;
  },

  saveOfferDraft: async (id: string, offerData: any) => {
    const response = await api.post(`/applications/${id}/save-offer`, offerData);
    return response.data;
  },

  sendOfficialOffer: async (id: string, offerData: any) => {
    const response = await api.post(`/applications/${id}/send-offer`, offerData);
    return response.data;
  },

  getCommunicationHistory: async () => {
    const response = await api.get('/applications/communications/history');
    return response.data;
  },

  getHiringReports: async () => {
    const response = await api.get('/applications/reports/hiring-funnel');
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

  runAtsCheck: async (id: string) => {
    const response = await api.post(`/applications/${id}/ats-check`);
    return response.data;
  },

  getAtsResult: async (id: string) => {
    const response = await api.get(`/applications/${id}/ats-result`);
    return response.data;
  },

  rerunAtsCheck: async (id: string) => {
    const response = await api.post(`/applications/${id}/ats-rerun`);
    return response.data;
  },

  shortlistApplication: async (id: string) => {
    const response = await api.post(`/applications/${id}/shortlist`);
    return response.data;
  },

  rejectApplication: async (id: string, reason?: string) => {
    const response = await api.post(`/applications/${id}/reject`, { reason });
    return response.data;
  },

  bulkShortlist: async (applicationIds: string[]) => {
    const response = await api.post('/applications/bulk-shortlist', { applicationIds });
    return response.data;
  },

  bulkReject: async (applicationIds: string[], reason?: string) => {
    const response = await api.post('/applications/bulk-reject', { applicationIds, reason });
    return response.data;
  },

  deleteApplication: async (id: string) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
};

export default applicationService;
