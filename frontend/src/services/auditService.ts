import api from './api';

export const auditService = {
  getAuditLogs: async (params?: { entity?: string; action?: string; userId?: string; page?: number; limit?: number }) => {
    const response = await api.get('/audit', { params });
    return response.data;
  },
};

export default auditService;
