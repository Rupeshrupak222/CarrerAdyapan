import api from './api';
import { cacheService } from './cacheService';

export const jobService = {
  createJob: async (data: any) => {
    try {
      console.log(' Creating job:', data.title);
      const response = await api.post('/jobs', data);
      console.log(' Job created:', response.data);
      cacheService.invalidate('all_jobs');
      cacheService.invalidate('dashboard_stats');
      cacheService.invalidate('hiring_funnel');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return response.data;
    } catch (error) {
      console.error(' Create Job Error:', error);
      throw error;
    }
  },

  getAllJobs: async (forceRefresh: boolean = false) => {
    const cacheKey = 'all_jobs';
    if (!forceRefresh) {
      const cached = cacheService.get<any>(cacheKey);
      if (cached && Array.isArray(cached.jobs)) return cached;
    }

    try {
      console.log('Fetching all jobs');
      const response = await api.get('/jobs');
      console.log(' Jobs fetched:', response.data.jobs?.length || 0);
      if (response.data && Array.isArray(response.data.jobs)) {
        cacheService.set(cacheKey, response.data);
      }
      return response.data;
    } catch (error) {
      console.error(' Get Jobs Error:', error);
      throw error;
    }
  },

  getJobById: async (id: string) => {
    try {
      console.log('Fetching job:', id);
      const response = await api.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error(' Get Job Error:', error);
      throw error;
    }
  },

  updateJob: async (id: string, data: any) => {
    try {
      const response = await api.put(`/jobs/${id}`, data);
      cacheService.invalidate('all_jobs');
      cacheService.invalidate('dashboard_stats');
      cacheService.invalidate('hiring_funnel');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return response.data;
    } catch (error) {
      console.error(' Update Job Error:', error);
      throw error;
    }
  },

  deleteJob: async (id: string) => {
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
      console.error(' Delete Job Error:', error);
      throw error;
    }
  },

  publishJob: async (id: string) => {
    try {
      const response = await api.patch(`/jobs/${id}/publish`);
      cacheService.invalidate('all_jobs');
      return response.data;
    } catch (error) {
      console.error(' Publish Job Error:', error);
      throw error;
    }
  },

  getPublicJobs: async () => {
    try {
      console.log('Fetching public published jobs');
      const response = await api.get('/jobs/public');
      return response.data;
    } catch (error) {
      console.error(' Get Public Jobs Error:', error);
      // Fallback attempt to getAllJobs if available
      try {
        const fallback = await api.get('/jobs');
        return fallback.data;
      } catch (fbErr) {
        throw error;
      }
    }
  },

  getPublicJob: async (slug: string) => {
    try {
      const response = await api.get(`/jobs/public/${slug}`);
      return response.data;
    } catch (error) {
      console.error(' Get Public Job Error:', error);
      throw error;
    }
  },
};
