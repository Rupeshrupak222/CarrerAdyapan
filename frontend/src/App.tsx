import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CandidateAuthProvider } from './context/CandidateAuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';

const ThemeAwareToaster: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      containerStyle={{ zIndex: 99999, top: 16, right: 16 }}
      toastOptions={{
        duration: 4000,
        style: {
          background: theme === 'dark' ? '#0f172a' : '#ffffff',
          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
          border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
          borderRadius: '0.85rem',
          padding: '12px 18px',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: theme === 'dark'
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CandidateAuthProvider>
            <ThemeAwareToaster />
            <AppRoutes />
          </CandidateAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
