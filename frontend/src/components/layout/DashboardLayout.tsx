import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans antialiased flex flex-col bg-[#f8fafc] text-slate-900">
      <div className="flex-1 flex w-full">
        {/* Sidebar Navigation */}
        <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300 min-h-screen">
          <Navbar toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
          {/* Dedicated Fixed Navbar Spacer */}
          <div className="h-16 w-full shrink-0" aria-hidden="true" />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
          <Footer variant="white" />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;