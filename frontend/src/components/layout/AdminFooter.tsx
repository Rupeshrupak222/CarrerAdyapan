import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

const AdminFooter: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-5 px-6 text-xs text-slate-500 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Adyapan Career ATS</span>
          <span className="text-slate-300">•</span>
          <span>© 2026 SR's Adyapan Edutech Pvt. Ltd. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3 text-orange-600" />
            Enterprise Security
          </span>
          <a
            href="mailto:support@adyapan.com"
            className="hover:text-orange-600 transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
