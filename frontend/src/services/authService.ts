import api from './api';

export const authService = {
  register: async (data: any) => {
    try {
      console.log(' Register API call:', data.email);
      const response = await api.post('/auth/register', data);
      console.log(' Register response:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Register Error:', error);
      throw error;
    }
  },

  login: async (email: string, password?: string) => {
    try {
      console.log(' Login API call:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log(' Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Login Error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      console.log('Get current user API call');
      const response = await api.get('/auth/me');
      console.log(' Get user response:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Get User Error:', error);
      throw error;
    }
  },

  updateProfile: async (data: any) => {
    try {
      console.log('Update Admin Profile API call:', data.email);
      const response = await api.put('/auth/profile', data);
      console.log(' Update Profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Update Profile Error:', error);
      throw error;
    }
  },

  changePassword: async (data: any) => {
    try {
      console.log(' Change Password API call');
      const response = await api.post('/auth/change-password', data);
      console.log(' Change Password response:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Change Password Error:', error);
      throw error;
    }
  },

  createHRUser: async (data: any) => {
    try {
      console.log(' Create HR User API call:', data.email);
      const response = await api.post('/auth/create-hr-user', data);
      return response.data;
    } catch (error) {
      console.error(' Create HR User Error:', error);
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      console.log(' Get All Users API call');
      const response = await api.get('/auth/users');
      return response.data;
    } catch (error) {
      console.error(' Get All Users Error:', error);
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      console.log(' Delete User API call:', id);
      const response = await api.delete(`/auth/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(' Delete User Error:', error);
      throw error;
    }
  },
};
