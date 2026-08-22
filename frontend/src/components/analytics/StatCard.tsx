import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface StatCardProps {
  title: any;
  value: any;
  icon: any;
  color?: string;
  change?: any;
  trend?: string;
  className?: string;
}

const MotionDiv = motion.div as any;

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'amber', change }) => {
  const { theme } = useTheme();

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className={`rounded-3xl shadow-sm border p-5 transition-all duration-200 relative overflow-hidden group ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {value}
          </p>
          {change && (
            <p className="text-xs mt-1.5 font-semibold text-amber-600 dark:text-amber-400">
              {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">
          {icon}
        </div>
      </div>
    </MotionDiv>
  );
};

export default StatCard;