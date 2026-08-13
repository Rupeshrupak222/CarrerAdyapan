import api from './api'

export const applicationService = {
  createApplication: async (data) => {
    const response = await api.post('/applications', data)
    return response.data
  },

  getAllApplications: async () => {
    const response = await api.get('/applications')
    return response.data
  },

  getApplicationById: async (id) => {
    const response = await api.get(`/applications/${id}`)
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/applications/${id}/status`, { status })
    return response.data
  },

  deleteApplication: async (id) => {
    const response = await api.delete(`/applications/${id}`)
    return response.data
  },
}