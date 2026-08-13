import api from './api';

export const offerService = {
  createOffer: async (data) => {
    const response = await api.post('/offers', data);
    return response.data;
  },

  getAllOffers: async () => {
    const response = await api.get('/offers');
    return response.data;
  },

  getOfferById: async (id) => {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  },

  updateOfferStatus: async (id, status) => {
    const response = await api.patch(`/offers/${id}/status`, { status });
    return response.data;
  },

  generatePDF: async (offerPayload) => {
    const response = await api.post('/offers/generate-pdf', offerPayload || {}, { responseType: 'blob' });
    return response.data;
  },

  sendEmail: async (idOrPayload, payload) => {
    if (typeof idOrPayload === 'string') {
      const response = await api.post(`/offers/${idOrPayload}/send-email`, payload || {});
      return response.data;
    }
    const response = await api.post('/offers/send-email', idOrPayload || {});
    return response.data;
  },

  sendWelcomeEmail: async (payload) => {
    const response = await api.post('/offers/send-welcome-email', payload || {});
    return response.data;
  },

  deleteOffer: async (id) => {
    const response = await api.delete(`/offers/${id}`);
    return response.data;
  },

  getGlobalTemplate: async () => {
    const response = await api.get('/settings/template');
    return response.data;
  },

  saveGlobalTemplate: async (payload) => {
    const response = await api.post('/settings/template', payload);
    return response.data;
  },
};

export default offerService;
