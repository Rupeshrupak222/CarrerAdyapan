import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRoleAccount: (email: string) => Promise<boolean>;
  register: (formData: any) => Promise<any>;
  createHRUser: (data: any) => Promise<any>;
  getAllUsers: () => Promise<User[]>;
  deleteUser: (id: string) => Promise<any>;
  updateHRPassword: (id: string, newPassword: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
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
  const [loading, setLoading] = useState<boolean>(false);

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

  const login = async (email: string, password?: string) => {
    try {
      const response = await authService.login(email, password || '');
      if (response?.success && response?.user) {
        if (response.token) localStorage.setItem('token', response.token);
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success('Welcome back! ');
        return { success: true };
      }
      return { success: false, error: response?.message || 'Invalid email or password' };
    } catch (error: any) {
      console.error('AuthContext login error:', error);
      const errMsg = error.response?.data?.message || error.message || 'Login failed. Invalid credentials.';
      return { success: false, error: errMsg };
    }
  };

  const switchRoleAccount = async (targetEmail: string) => {
    try {
      const defaultPasswords: Record<string, string> = {
        'rupesh@adyapan.com': 'Admin@123',
        'nandini@adyapan.com': 'Manager@123',
        'pavitra@adyapan.com': 'Hr@12345',
        'charitha@adyapan.com': 'Hr@12345',
        'nitisha@adyapan.com': 'Hr@12345',
        'aravind@adyapan.com': 'Hr@12345',
        'veena@adyapan.com': 'Hr@12345',
      };

      const pass = defaultPasswords[targetEmail] || 'Hr@12345';
      const response = await authService.login(targetEmail, pass);
      if (response?.success && response?.user) {
        if (response.token) localStorage.setItem('token', response.token);
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success(`Switched role to: ${response.user.name} (${response.user.role})`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Switch role error:', err);
      toast.error('Failed to switch role account');
      return false;
    }
  };

  const register = async (formData: any) => {
    try {
      const response = await authService.register(formData);
      return response;
    } catch (error: any) {
      console.error('AuthContext register error:', error);
      return { success: false, error: error.response?.data?.message || error.message || 'Registration failed' };
    }
  };

  const createHRUser = async (data: any) => {
    try {
      const response = await authService.createHRUser(data);
      return response;
    } catch (error: any) {
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

  const deleteUser = async (id: string) => {
    try {
      const response = await authService.deleteUser(id);
      return response;
    } catch (error: any) {
      console.error('AuthContext deleteUser error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateHRPassword = async (id: string, newPassword: string) => {
    try {
      const response = await authService.updateHRPassword(id, newPassword);
      return response;
    } catch (error: any) {
      console.error('AuthContext updateHRPassword error:', error);
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to update HR password' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchRoleAccount, register, createHRUser, getAllUsers, deleteUser, updateHRPassword }}>
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
