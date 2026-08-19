import api from './api';
import { cacheService } from './cacheService';

// Automatically clean up any old legacy local storage keys that caused duplicates
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('adyapan_custom_published_jobs');
    localStorage.removeItem('adyapan_deleted_job_ids');
  } catch (e) { }
}

export const jobService = {
  createJob: async (data: any) => {
    try {
      console.log('Creating job in backend:', data.title);
      const response = await api.post('/jobs', data);
      cacheService.invalidate();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return response.data;
    } catch (error: any) {
      console.error('Create Job Error:', error);
      throw error;
    }
  },

  getAllJobs: async (forceRefresh: boolean = false) => {
    const cacheKey = 'all_jobs';

    if (!forceRefresh) {
      const cached = cacheService.get<any>(cacheKey);
      if (cached && Array.isArray(cached.jobs)) {
        return cached;
      }
    }

    try {
      const response = await api.get('/jobs');
      if (response.data && Array.isArray(response.data.jobs)) {
        const result = { success: true, jobs: response.data.jobs };
        cacheService.set(cacheKey, result);
        return result;
      }
      return { success: true, jobs: [] };
    } catch (error) {
      console.error('Get Jobs API error:', error);
      return { success: false, jobs: [] };
    }
  },

  getJobById: async (id: string) => {
    try {
      const response = await api.get(`/jobs/${id}`);
      if (response.data?.job) {
        return response.data;
      }
      return { success: false, message: 'Job not found' };
    } catch (error) {
      console.error('Get Job Error:', error);
      return { success: false, message: 'Job not found' };
    }
  },

  updateJob: async (id: string, data: any) => {
    try {
      const response = await api.put(`/jobs/${id}`, data);
      cacheService.invalidate();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return response.data;
    } catch (error) {
      console.error('Update Job Error:', error);
      throw error;
    }
  },

  deleteJob: async (id: string, _slug?: string, _title?: string) => {
    try {
      const response = await api.delete(`/jobs/${id}`);
      cacheService.invalidate();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return response.data;
    } catch (error) {
      console.error('Delete Job Error:', error);
      throw error;
    }
  },

  publishJob: async (id: string) => {
    try {
      const response = await api.patch(`/jobs/${id}/publish`);
      cacheService.invalidate();
      return response.data;
    } catch (error) {
      console.error('Publish Job Error:', error);
      throw error;
    }
  },

  getPublicJobs: async () => {
    try {
      const response = await api.get('/jobs/public');
      if (response.data && Array.isArray(response.data.jobs)) {
        return response.data;
      }
      // Fallback to /jobs
      const fallback = await api.get('/jobs');
      if (fallback.data && Array.isArray(fallback.data.jobs)) {
        return fallback.data;
      }
      return { success: true, jobs: [] };
    } catch (error) {
      console.error('Get Public Jobs Error:', error);
      return { success: false, jobs: [] };
    }
  },

  getPublicJob: async (slug: string) => {
    try {
      const response = await api.get(`/jobs/public/${slug}`);
      if (response.data?.job) {
        return response.data;
      }
      // Fallback
      const fallback = await api.get(`/jobs/${slug}`);
      if (fallback.data?.job) {
        return fallback.data;
      }
      return { success: false, message: 'Job not found' };
    } catch (error) {
      console.error('Get Public Job Error:', error);
      return { success: false, message: 'Job not found' };
    }
  },
};
