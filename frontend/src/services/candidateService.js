import api from './api';
import { cacheService } from './cacheService';

export const candidateService = {
  publicApply: async (dataOrFormData) => {
    try {
      const isFormData = dataOrFormData instanceof FormData;
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      console.log('📝 Submitting public application');
      const response = await api.post('/candidates/public-apply', dataOrFormData, config);
      cacheService.invalidate('all_candidates');
      cacheService.invalidate('dashboard_stats');
      cacheService.invalidate('hiring_funnel');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return response.data;
    } catch (error) {
      console.error('❌ Public Apply Error:', error);
      throw error;
    }
  },

  createCandidate: async (data) => {
    try {
      console.log('📝 Creating candidate:', data.firstName);
      const response = await api.post('/candidates', data);
      cacheService.invalidate('all_candidates');
      cacheService.invalidate('dashboard_stats');
      cacheService.invalidate('hiring_funnel');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return response.data;
    } catch (error) {
      console.error('❌ Create Candidate Error:', error);
      throw error;
    }
  },

  sendRejectionEmail: async (data) => {
    try {
      console.log('✉️ Dispatching Rejection Email via Resend to:', data.candidateEmail);
      const response = await api.post('/candidates/reject', data);
      return response.data;
    } catch (error) {
      console.error('❌ Send Rejection Email Error:', error);
      throw error;
    }
  },

  parseAndScoreResume: async (dataOrFormData) => {
    try {
      console.log('⚡ Running Real ATS AI Resume Parsing & Scoring Engine...');
      const isFormData = dataOrFormData instanceof FormData;
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await api.post('/candidates/parse-and-score', dataOrFormData, config);
      return response.data;
    } catch (error) {
      console.error('❌ ATS Score Error:', error);
      throw error;
    }
  },

  getAllCandidates: async (forceRefresh = false) => {
    const cacheKey = 'all_candidates';
    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) return cached;
    }

    try {
      console.log('📋 Fetching all candidates from database');
      const response = await api.get('/candidates');
      if (response.data) {
        cacheService.set(cacheKey, response.data);
      }
      return response.data;
    } catch (error) {
      console.error('❌ Get Candidates Error:', error);
      throw error;
    }
  },

  getCandidateById: async (id) => {
    try {
      const response = await api.get(`/candidates/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get Candidate Error:', error);
      throw error;
    }
  },

  updateCandidate: async (id, data) => {
    try {
      const response = await api.put(`/candidates/${id}`, data);
      cacheService.invalidate('all_candidates');
      cacheService.invalidate('dashboard_stats');
      cacheService.invalidate('hiring_funnel');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return response.data;
    } catch (error) {
      console.error('❌ Update Candidate Error:', error);
      throw error;
    }
  },

  deleteCandidate: async (id) => {
    try {
      const response = await api.delete(`/candidates/${id}`);
      cacheService.invalidate('all_candidates');
      cacheService.invalidate('dashboard_stats');
      cacheService.invalidate('hiring_funnel');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adyapan_data_updated'));
      }
      return response.data;
    } catch (error) {
      console.error('❌ Delete Candidate Error:', error);
      throw error;
    }
  },

  getCandidatesByJob: async (jobId) => {
    try {
      const response = await api.get(`/candidates/job/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get Candidates By Job Error:', error);
      throw error;
    }
  },
};