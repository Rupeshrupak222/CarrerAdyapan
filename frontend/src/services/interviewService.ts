import api from './api';
import { cacheService } from './cacheService';

export const interviewService = {
  createInterview: async (data: any) => {
    try {
      const response = await api.post('/interviews', data);
      cacheService.invalidate('all_interviews');
      cacheService.invalidate('dashboard_stats');
      return response.data;
    } catch (error) {
      console.error(' Create Interview Error:', error);
      throw error;
    }
  },

  getAllInterviews: async (forceRefresh: boolean = false) => {
    const cacheKey = 'all_interviews';
    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await api.get('/interviews');
      if (response.data) {
        cacheService.set(cacheKey, response.data);
      }
      return response.data;
    } catch (error) {
      console.error(' Get Interviews Error:', error);
      throw error;
    }
  },

  getInterviewById: async (id: string) => {
    try {
      const response = await api.get(`/interviews/${id}`);
      return response.data;
    } catch (error) {
      console.error(' Get Interview Error:', error);
      throw error;
    }
  },

  updateInterview: async (id: string, data: any) => {
    try {
      const response = await api.put(`/interviews/${id}`, data);
      cacheService.invalidate('all_interviews');
      return response.data;
    } catch (error) {
      console.error(' Update Interview Error:', error);
      throw error;
    }
  },

  deleteInterview: async (id: string) => {
    try {
      const response = await api.delete(`/interviews/${id}`);
      cacheService.invalidate('all_interviews');
      return response.data;
    } catch (error) {
      console.error(' Delete Interview Error:', error);
      throw error;
    }
  },
};

export default interviewService;
