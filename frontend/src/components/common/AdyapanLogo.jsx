import React from 'react';

const AdyapanLogo = ({ size = 'normal', variant = 'dark' }) => {
  const isDark = variant === 'dark';

  const iconSizes = {
    small: 'w-7 h-7 text-sm',
    normal: 'w-9 h-9 text-lg',
    large: 'w-10 h-10 text-xl',
  };

  const textSizes = {
    small: 'text-sm',
    normal: 'text-lg',
    large: 'text-xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none tracking-tight">
      {/* Premium Emblem Badge */}
      <div className={`relative flex items-center justify-center rounded-2xl shadow-lg transition-transform hover:scale-105 shrink-0 ${
        iconSizes[size] || iconSizes.normal
      } bg-gradient-to-tr from-orange-600 via-orange-500 to-orange-500 border border-orange-400/40 shadow-orange-500/30`}>
        <svg
          className="w-5/6 h-5/6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Graduation Cap */}
          <path
            d="M12 3L2 8L12 13L22 8L12 3Z"
            fill="#0f172a"
            stroke="#0f172a"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path
            d="M5 10.5V16.5C5 17.5 8.13401 19.5 12 19.5C15.866 19.5 19 17.5 19 16.5V10.5"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M22 8V15.5"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="22" cy="16.5" r="1.5" fill="#0f172a" />
        </svg>
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight ${
            textSizes[size] || textSizes.normal
          } ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ADYAPAN
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-orange-500 text-slate-950 rounded-md shadow-sm">
            EDUTECH
          </span>
        </div>
        <span className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 ${
          isDark ? 'text-orange-400/90' : 'text-orange-600'
        }`}>
          AI Hiring Platform
        </span>
      </div>
    </div>
  );
};

export default AdyapanLogo;
