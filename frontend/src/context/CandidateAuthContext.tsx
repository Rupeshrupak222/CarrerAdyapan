import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { candidateAuthService, CandidateUser, CandidateApplication } from '../services/candidateAuthService';
import toast from 'react-hot-toast';

interface CandidateAuthContextType {
  candidate: CandidateUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { firstName: string; lastName?: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getMyApplications: () => Promise<CandidateApplication[]>;
  updateProfile: (data: Partial<CandidateUser>) => Promise<{ success: boolean; error?: string }>;
  setCandidateSession: (candidate: CandidateUser, token?: string) => void;
}

const CandidateAuthContext = createContext<CandidateAuthContextType | undefined>(undefined);

export const CandidateAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [candidate, setCandidate] = useState<CandidateUser | null>(() => {
    const saved = localStorage.getItem('candidate');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('candidateToken');
    if (token && candidate) {
      loadProfile();
    }
  }, []);

  const loadProfile = async () => {
    try {
      const response = await candidateAuthService.getProfile();
      if (response?.success && response?.candidate) {
        setCandidate(response.candidate);
        localStorage.setItem('candidate', JSON.stringify(response.candidate));
      }
    } catch {
      // Token expired or invalid
      console.warn('Candidate token validation failed');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await candidateAuthService.login(email, password);
      if (response?.success && response?.candidate) {
        if (response.token) {
          localStorage.setItem('candidateToken', response.token);
          localStorage.setItem('token', response.token);
        }
        setCandidate(response.candidate);
        localStorage.setItem('candidate', JSON.stringify(response.candidate));
        toast.success('Welcome back!');
        return { success: true };
      }
      return { success: false, error: response?.message || 'Invalid credentials' };
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { firstName: string; lastName?: string; email: string; password: string; phone?: string }) => {
    try {
      setLoading(true);
      const response = await candidateAuthService.register(data);
      if (response?.success && response?.candidate) {
        if (response.token) {
          localStorage.setItem('candidateToken', response.token);
          localStorage.setItem('token', response.token);
        }
        setCandidate(response.candidate);
        localStorage.setItem('candidate', JSON.stringify(response.candidate));
        toast.success('Account created successfully!');
        return { success: true };
      }
      return { success: false, error: response?.message || 'Registration failed' };
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('candidateToken');
    localStorage.removeItem('candidate');
    localStorage.removeItem('token');
    setCandidate(null);
    toast.success('Logged out successfully');
  };

  const getMyApplications = async (): Promise<CandidateApplication[]> => {
    try {
      const response = await candidateAuthService.getMyApplications();
      return response?.applications || [];
    } catch {
      return [];
    }
  };

  const updateProfile = async (data: Partial<CandidateUser>) => {
    try {
      const response = await candidateAuthService.updateProfile(data);
      if (response?.success && response?.candidate) {
        setCandidate(response.candidate);
        localStorage.setItem('candidate', JSON.stringify(response.candidate));
        toast.success('Profile updated!');
        return { success: true };
      }
      return { success: false, error: response?.message || 'Update failed' };
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Update failed';
      return { success: false, error: errMsg };
    }
  };

  const setCandidateSession = (candidateUser: CandidateUser, token?: string) => {
    if (token) {
      localStorage.setItem('candidateToken', token);
      localStorage.setItem('token', token);
    }
    setCandidate(candidateUser);
    localStorage.setItem('candidate', JSON.stringify(candidateUser));
  };

  return (
    <CandidateAuthContext.Provider value={{ candidate, loading, login, register, logout, getMyApplications, updateProfile, setCandidateSession }}>
      {children}
    </CandidateAuthContext.Provider>
  );
};

export const useCandidateAuth = () => {
  const context = useContext(CandidateAuthContext);
  if (!context) {
    throw new Error('useCandidateAuth must be used within a CandidateAuthProvider');
  }
  return context;
};

export default CandidateAuthContext;
