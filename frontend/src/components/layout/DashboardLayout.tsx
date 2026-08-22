import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../../context/ThemeContext';

const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen font-sans antialiased flex flex-col transition-colors ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[#fdf6ee] text-slate-900'
      }`}
      style={{
        backgroundColor: theme === 'dark' ? '#0a0a14' : '#fdf6ee',
      }}
    >
      <div className="flex-1 flex w-full">
        {/* Sidebar Navigation */}
        <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-500 min-h-screen">
          <Navbar toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;