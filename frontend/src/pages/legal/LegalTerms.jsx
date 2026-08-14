import React from 'react';
import AdyapanLogo from '../../components/common/AdyapanLogo';
import { useTheme } from '../../context/ThemeContext';

const LegalTerms = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Header Bar */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md ${
        theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <AdyapanLogo size="normal" variant={theme} />
          <a
            href="https://adyapan.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Back to Home</span>
            <span>↗</span>
          </a>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className={`p-6 sm:p-10 rounded-3xl border shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200/80'
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

          {/* Policy Sections 1 - 11 */}
          <div className="space-y-8 text-xs sm:text-sm">
            
            {/* Section 1 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">1</span>
                <span>Acceptance of Terms</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>By accessing or using Adyapan's platform, you agree to be bound by these Terms of Service.</li>
                <li>If you do not agree to these terms, please do not use our services.</li>
                <li>We reserve the right to update these terms at any time with notice to users.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">2</span>
                <span>Use of Services</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>You must be at least 13 years old to use our services.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree not to share your account with others or use another person's account.</li>
                <li>You agree not to use our platform for any unlawful or prohibited purpose.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">3</span>
                <span>Course Enrollment & Access</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>Upon successful payment, you will be enrolled in the selected course/program.</li>
                <li>Course access is granted to the registered user only and is non-transferable.</li>
                <li>We reserve the right to update course content to keep it current and relevant.</li>
                <li>Course access duration is as specified at the time of purchase.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">4</span>
                <span>Payment Terms</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>All prices are in Indian Rupees (INR) and inclusive of applicable taxes.</li>
                <li>Payments are processed securely via Razorpay.</li>
                <li>By making a payment, you confirm that you are authorised to use the payment method.</li>
                <li>We do not store your payment credentials.</li>
                <li>All sales are final unless covered by our Refund Policy.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">5</span>
                <span>Refund Policy</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>Refund requests must be submitted within 7 days of purchase.</li>
                <li>Refunds are considered on a case-by-case basis.</li>
                <li>No refunds will be issued after course content has been substantially accessed.</li>
                <li>To request a refund, email <a href="mailto:support@adyapan.com" className="text-amber-600 dark:text-amber-400 font-semibold underline">support@adyapan.com</a> with your order details.</li>
                <li>Approved refunds will be processed within 7–10 business days.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">6</span>
                <span>Intellectual Property</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>All course content, materials, and platform features are owned by Adyapan Edutech Pvt. Ltd.</li>
                <li>You may not reproduce, distribute, or create derivative works without written permission.</li>
                <li>You are granted a limited, non-exclusive licence to access content for personal learning only.</li>
                <li>Certificates issued are the property of Adyapan and may be verified by employers.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">7</span>
                <span>User Conduct</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>You agree not to upload harmful, offensive, or illegal content.</li>
                <li>You agree not to attempt to hack, disrupt, or reverse-engineer our platform.</li>
                <li>You agree not to scrape, crawl, or extract data from our platform without permission.</li>
                <li>Violations may result in immediate account termination without refund.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">8</span>
                <span>Certificates & Credentials</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>Certificates are issued upon successful completion of course requirements.</li>
                <li>Certificates are digital and can be shared on LinkedIn and other platforms.</li>
                <li>Adyapan reserves the right to revoke certificates if fraud is detected.</li>
                <li>Certificates do not guarantee employment or specific outcomes.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">9</span>
                <span>Limitation of Liability</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>Adyapan is not liable for any indirect, incidental, or consequential damages.</li>
                <li>Our total liability shall not exceed the amount paid for the specific service.</li>
                <li>We do not guarantee specific learning outcomes or employment results.</li>
                <li>Platform availability is provided on a best-effort basis.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">10</span>
                <span>Governing Law</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>These terms are governed by the laws of India.</li>
                <li>Any disputes shall be subject to the exclusive jurisdiction of courts in India.</li>
                <li>We encourage resolving disputes amicably before pursuing legal action.</li>
              </ul>
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
            <a href="https://adyapan.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Privacy Policy ↗
            </a>
            <span>-</span>
            <a href="https://adyapan.com/contact" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Contact Us ↗
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LegalTerms;
