import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const StatCardSkeleton = () => {
  const { theme } = useTheme();
  return (
    <div className={`p-5 rounded-2xl border animate-pulse space-y-3 ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className={`h-4 w-28 rounded ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
        <div className={`w-8 h-8 rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
      </div>
      <div className={`h-7 w-16 rounded font-bold ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      <div className={`h-3 w-36 rounded ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-100'}`}></div>
    </div>
  );
};

export const ChartSkeleton = ({ title = 'Loading Analytics...' }) => {
  const { theme } = useTheme();
  return (
    <div className={`rounded-2xl border p-5 space-y-4 animate-pulse ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className={`h-4 w-48 rounded ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      <div className="h-64 flex items-end justify-between gap-3 pt-6">
        {[40, 65, 30, 85, 55, 70].map((height, i) => (
          <div
            key={i}
            className={`w-full rounded-t-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200/80'}`}
            style={{ height: `${height}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export const JobListSkeleton = () => {
  const { theme } = useTheme();
  return (
    <div className={`rounded-2xl border p-5 space-y-3 animate-pulse ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className={`h-4 w-40 rounded ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
        <div className={`h-3 w-20 rounded ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
      <div className="space-y-2.5">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`flex items-center justify-between p-3.5 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="space-y-2">
              <div className={`h-4 w-48 rounded ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
              <div className={`h-3 w-32 rounded ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-200/60'}`}></div>
            </div>
            <div className={`h-6 w-20 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};
