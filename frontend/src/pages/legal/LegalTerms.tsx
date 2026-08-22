import React from 'react';
import { Link } from 'react-router-dom';
import AdyapanLogo from '../../components/common/AdyapanLogo';
import { useTheme } from '../../context/ThemeContext';

const LegalTerms = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col transition-colors ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
    }`}>
      {/* Header Bar */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md ${
        theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/careers" className="flex items-center">
            <AdyapanLogo size="normal" variant={theme} />
          </Link>
          <Link
            to="/careers"
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Back to Careers Home</span>
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className={`p-6 sm:p-10 rounded-3xl border shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Document Title Header */}
          <div className="border-b pb-6 mb-8 border-slate-200 dark:border-slate-800">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">
              Last updated: May 2026 - Effective: May 1, 2026
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              Please read these Terms of Service carefully before using Adyapan's platform. These terms constitute a legally binding agreement between you and <strong>Adyapan Edutech Pvt. Ltd.</strong>
            </p>
          </div>

          {/* Terms Content Sections */}
          <div className="space-y-8 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">1</span>
                <span>Acceptance of Terms</span>
              </h2>
              <p className="pl-8">
                By accessing or using any services provided by Adyapan Edutech Pvt. Ltd., including websites, mobile applications, courses, and educational platforms, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">2</span>
                <span>Eligibility</span>
              </h2>
              <p className="pl-8">
                You must be at least 16 years of age to register for an account or enroll in courses. By registering, you warrant that all information you provide is accurate and complete.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">3</span>
                <span>User Accounts & Security</span>
              </h2>
              <p className="pl-8">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized access at <strong>support@adyapan.com</strong>.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">4</span>
                <span>Course Enrollment & Access</span>
              </h2>
              <ul className="list-disc pl-12 space-y-1">
                <li>Enrollment grants a limited, non-exclusive, non-transferable license to access course materials.</li>
                <li>Course content is for personal, educational use only and may not be redistributed, copied, or sold.</li>
                <li>Access duration is specified at enrollment; Adyapan reserves the right to retire outdated content with notice.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">5</span>
                <span>Fees, Payments & Refunds</span>
              </h2>
              <ul className="list-disc pl-12 space-y-1">
                <li>All fees are listed in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise.</li>
                <li>Refund requests are processed in accordance with our Refund Policy (eligible within 7 days of course purchase, provided less than 20% of content has been accessed).</li>
                <li>Adyapan reserves the right to modify pricing with advance notice.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">6</span>
                <span>Code of Conduct</span>
              </h2>
              <p className="pl-8">Users agree not to:</p>
              <ul className="list-disc pl-12 space-y-1">
                <li>Engage in abusive, harassing, or discriminatory behavior in forums, live sessions, or group chats</li>
                <li>Share, copy, or redistribute course videos, notes, or assessment materials</li>
                <li>Attempt to gain unauthorized access to our servers, user accounts, or backend systems</li>
                <li>Use automated bots or scrapers to extract platform data</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">7</span>
                <span>Intellectual Property</span>
              </h2>
              <p className="pl-8">
                All platform content, including curriculums, assessments, videos, graphics, logos, and software, is the exclusive intellectual property of Adyapan Edutech Pvt. Ltd. and protected under Indian and international copyright laws.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">8</span>
                <span>Certifications & Placement Assistance</span>
              </h2>
              <ul className="list-disc pl-12 space-y-1">
                <li>Certificates are issued upon meeting attendance, project, and assessment criteria.</li>
                <li>Certificates are digital and can be shared on LinkedIn and other platforms.</li>
                <li>Placement assistance includes interview preparation, resume reviews, and recruiter introductions. <strong>Placement is not guaranteed</strong> and is subject to candidate performance and market conditions.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">9</span>
                <span>Limitation of Liability</span>
              </h2>
              <p className="pl-8">
                To the maximum extent permitted by law, Adyapan Edutech Pvt. Ltd. is not liable for indirect, incidental, special, or consequential damages resulting from platform use, downtime, or content accuracy.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">10</span>
                <span>Governing Law & Jurisdiction</span>
              </h2>
              <p className="pl-8">
                These terms are governed by the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in <strong>Hyderabad, Telangana</strong>.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">11</span>
                <span>Contact</span>
              </h2>
              <div className="pl-8 text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">Adyapan Edutech Pvt. Ltd.</p>
                <p>Email: <a href="mailto:support@adyapan.com" className="text-amber-600 dark:text-amber-400 underline font-semibold">support@adyapan.com</a></p>
                <p>For legal queries: <a href="mailto:legal@adyapan.com" className="text-amber-600 dark:text-amber-400 underline font-semibold">legal@adyapan.com</a></p>
              </div>
            </section>
          </div>

          {/* Footer Quick Links */}
          <div className="border-t mt-10 pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Link to="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:underline">
              Contact Us
            </Link>
            <span>•</span>
            <Link to="/careers" className="hover:underline">
              Careers Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LegalTerms;
