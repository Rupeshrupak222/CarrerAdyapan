import api from './api'

export const aiService = {
  scoreCandidate: async (applicationId) => {
    const response = await api.post('/ai/score', { applicationId })
    return response.data
  },

  generateQuestions: async (applicationId) => {
    const response = await api.post('/ai/questions', { applicationId })
    return response.data
  },

  getAssistantResponse: async (query) => {
    const response = await api.post('/ai/assistant', { query })
    return response.data
  },
}