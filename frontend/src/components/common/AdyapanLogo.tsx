import React from 'react';
import logoImg from '../../assets/adyapan-logo.png';

const AdyapanLogo = ({ size = 'normal', variant = 'dark', showText = true }) => {
  const isDark = variant === 'dark';

  const logoSizes = {
    small: 'w-8 h-8',
    normal: 'w-10 h-10',
    large: 'w-12 h-12',
  };

  const textSizes = {
    small: 'text-sm',
    normal: 'text-lg',
    large: 'text-xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none tracking-tight">
      {/* Official Adyapan Image Logo */}
      <img
        src={logoImg}
        alt="Adyapan Edutech Logo"
        className={`${logoSizes[size] || logoSizes.normal} object-contain rounded-xl shadow-md border border-amber-300/40 shrink-0 bg-white transition-transform hover:scale-105`}
      />

      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-tight ${textSizes[size] || textSizes.normal
            } ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ADYAPAN
          </span>
          <span className={`text-[9px] font-bold tracking-widest uppercase -mt-0.5 ${isDark ? 'text-amber-400/90' : 'text-amber-600'
            }`}>
            Careers
          </span>
        </div>
      )}
    </div>
  );
};

export default AdyapanLogo;
