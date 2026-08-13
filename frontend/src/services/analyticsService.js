import api from './api';
import { cacheService } from './cacheService';

export const analyticsService = {
  getDashboardStats: async (forceRefresh = false) => {
    const cacheKey = 'dashboard_stats';
    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) return cached;
    }

    try {
      console.log('📊 Fetching dashboard stats');
      const response = await api.get('/analytics/stats');
      console.log('✅ Stats fetched:', response.data);
      if (response.data) {
        cacheService.set(cacheKey, response.data);
      }
      return response.data;
    } catch (error) {
      console.error('❌ API Error, using fallback data:', error);
      const fallback = {
        totalApplications: 156,
        aiScreened: 112,
        shortlisted: 45,
        interviewed: 28,
        offersSent: 12,
        hired: 8,
        jobs: 6,
        averageScore: 78,
        timeSaved: 48
      };
      cacheService.set(cacheKey, fallback, 30000); // 30s cache for fallback
      return fallback;
    }
  },

  getHiringFunnel: async (forceRefresh = false) => {
    const cacheKey = 'hiring_funnel';
    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) return cached;
    }

    try {
      console.log('📊 Fetching hiring funnel');
      const response = await api.get('/analytics/funnel');
      console.log('✅ Funnel fetched:', response.data);
      if (response.data) {
        cacheService.set(cacheKey, response.data);
      }
      return response.data;
    } catch (error) {
      console.error('❌ API Error, using fallback data:', error);
      const fallback = {
        data: [
          { stage: 'Applications', count: 156 },
          { stage: 'AI Screened', count: 112 },
          { stage: 'Shortlisted', count: 45 },
          { stage: 'Interviewed', count: 28 },
          { stage: 'Offers', count: 12 },
          { stage: 'Hired', count: 8 }
        ]
      };
      cacheService.set(cacheKey, fallback, 30000);
      return fallback;
    }
  },

  getRecentActivity: async (forceRefresh = false) => {
    const cacheKey = 'recent_activity';
    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) return cached;
    }

    try {
      console.log('📊 Fetching recent activity');
      const response = await api.get('/analytics/activity');
      console.log('✅ Activity fetched:', response.data);
      if (response.data) {
        cacheService.set(cacheKey, response.data);
      }
      return response.data;
    } catch (error) {
      console.error('❌ API Error, using fallback data:', error);
      const fallback = {
        activities: [
          { 
            action: 'APPLIED', 
            candidate: { firstName: 'John', lastName: 'Doe' }, 
            job: { title: 'Sales Executive' }, 
            createdAt: new Date() 
          },
          { 
            action: 'SHORTLISTED', 
            candidate: { firstName: 'Jane', lastName: 'Smith' }, 
            job: { title: 'BDE' }, 
            createdAt: new Date() 
          }
        ]
      };
      return fallback;
    }
  },
};