import api from './api';
import { cacheService } from './cacheService';

export const analyticsService = {
  getDashboardStats: async (forceRefresh = true) => {
    const cacheKey = 'dashboard_stats';
    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await api.get('/analytics/stats');
      if (response.data) {
        cacheService.set(cacheKey, response.data, 5000);
      }
      return response.data;
    } catch (error) {
      console.warn('API Error fetching analytics stats, using fallback:', error.message);
      return null;
    }
  },

  getHiringFunnel: async (forceRefresh = true) => {
    const cacheKey = 'hiring_funnel';
    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await api.get('/analytics/funnel');
      if (response.data) {
        cacheService.set(cacheKey, response.data, 5000);
      }
      return response.data;
    } catch (error) {
      console.warn('API Error fetching hiring funnel:', error.message);
      return null;
    }
  },

  getMonthlyVelocity: async (forceRefresh = true) => {
    try {
      const response = await api.get('/analytics/velocity');
      return response.data;
    } catch (error) {
      console.warn('API Error fetching monthly velocity:', error.message);
      return null;
    }
  },

  getRecentActivity: async (forceRefresh = true) => {
    const cacheKey = 'recent_activity';
    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await api.get('/analytics/activity');
      if (response.data) {
        cacheService.set(cacheKey, response.data, 5000);
      }
      return response.data;
    } catch (error) {
      console.warn('API Error fetching recent activity:', error.message);
      return null;
    }
  },
};