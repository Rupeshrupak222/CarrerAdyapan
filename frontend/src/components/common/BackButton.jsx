import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const BackButton = ({ to, label = 'Back' }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-sm ${
        theme === 'dark'
          ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-blue-600'
      }`}
      title="Go back to previous page"
    >
      <span className="text-sm font-bold">←</span>
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
