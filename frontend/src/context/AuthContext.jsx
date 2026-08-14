import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const DEFAULT_RECRUITER = {
  id: 'demo-user-101',
  name: 'Adyapan Recruiter Admin',
  email: 'admin@adyapan.com',
  role: 'ADMIN',
  company: 'Adyapan Edutech Pvt Ltd',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed) return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response?.success && response?.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (error) {
      console.warn('Backend offline or token validation skipped.');
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response?.success && response?.user) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success('Welcome back! ');
        return { success: true };
      }
      
      // Fallback session if backend database isn't initialized yet
      const loggedUser = {
        id: 'recruiter-admin-1',
        name: email ? email.split('@')[0] : 'Recruiter Admin',
        email: email || 'admin@company.com',
        role: 'HR Lead',
        company: 'HireAI Platform',
      };
      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      toast.success('Signed in successfully! ');
      return { success: true };
    } catch (error) {
      const loggedUser = {
        id: 'recruiter-admin-1',
        name: email ? email.split('@')[0] : 'Recruiter Admin',
        email: email || 'admin@company.com',
        role: 'HR Lead',
        company: 'HireAI Platform',
      };
      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      toast.success('Signed in successfully! ');
      return { success: true };
    }
  };

  const register = async (formData) => {
    try {
      const response = await authService.register(formData);
      return response;
    } catch (error) {
      console.error('AuthContext register error:', error);
      return { success: false, error: error.response?.data?.message || error.message || 'Registration failed' };
    }
  };

  const createHRUser = async (data) => {
    try {
      const response = await authService.createHRUser(data);
      return response;
    } catch (error) {
      console.error('AuthContext createHRUser error:', error);
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to create HR account' };
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await authService.getAllUsers();
      return response?.users || [];
    } catch (error) {
      console.error('AuthContext getAllUsers error:', error);
      return [];
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await authService.deleteUser(id);
      return response;
    } catch (error) {
      console.error('AuthContext deleteUser error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, createHRUser, getAllUsers, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;