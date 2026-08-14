import React from 'react';
import AdyapanLogo from '../../components/common/AdyapanLogo';
import { useTheme } from '../../context/ThemeContext';

const LegalPrivacy = () => {
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

      {/* Main Legal Content Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className={`p-6 sm:p-10 rounded-3xl border shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200/80'
        }`}>
          {/* Document Title Header */}
          <div className="border-b pb-6 mb-8 border-slate-200 dark:border-slate-800">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">
              Last updated: May 2026 - Effective: May 1, 2026
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              At <strong>Adyapan Edutech Pvt. Ltd.</strong>, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our platform.
            </p>
          </div>

          {/* Policy Sections 1 - 10 */}
          <div className="space-y-8 text-xs sm:text-sm">
            
            {/* Section 1 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">1</span>
                <span>Information We Collect</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and payment details when you register or make a purchase.</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, clicks, and device/browser information.</li>
                <li><strong>Payment Data:</strong> Processed securely via Razorpay. We do not store card or UPI credentials.</li>
                <li><strong>Cookies:</strong> Session cookies, analytics cookies, and preference cookies (see Cookie Policy below).</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">2</span>
                <span>How We Use Your Information</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>To provide and improve our educational services and platform.</li>
                <li>To process payments and send transaction confirmations.</li>
                <li>To send course updates, announcements, and promotional emails (you can opt out anytime).</li>
                <li>To analyse usage patterns and improve user experience.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">3</span>
                <span>Data Sharing</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>We do not sell your personal data to third parties.</li>
                <li>We share data with trusted service providers: Razorpay (payments), SendGrid (emails), MongoDB Atlas (database).</li>
                <li>We may disclose data if required by law or to protect our legal rights.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">4</span>
                <span>Data Security</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>All data is transmitted over HTTPS/TLS encryption.</li>
                <li>Passwords are hashed using Argon2id - never stored in plain text.</li>
                <li>Payment processing is PCI-DSS compliant via Razorpay.</li>
                <li>We regularly review and update our security practices.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">5</span>
                <span>Your Rights</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li><strong>Access:</strong> Request a copy of your personal data.</li>
                <li><strong>Correction:</strong> Update inaccurate or incomplete data.</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data.</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing emails at any time.</li>
                <li>To exercise these rights, email us at <a href="mailto:support@adyapan.com" className="text-amber-600 dark:text-amber-400 font-semibold underline">support@adyapan.com</a></li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">6</span>
                <span>Cookie Policy</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li><strong>Necessary Cookies:</strong> Required for authentication and security. Cannot be disabled.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform.</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings.</li>
                <li><strong>Marketing Cookies:</strong> Used for targeted advertising (disabled by default).</li>
                <li>You can manage cookie preferences via the cookie banner on our site.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">7</span>
                <span>Data Retention</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>Account data is retained as long as your account is active.</li>
                <li>Payment records are retained for 7 years for legal/tax compliance.</li>
                <li>You may request deletion of your account at any time.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">8</span>
                <span>Children's Privacy</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>Our services are not directed to children under 13.</li>
                <li>We do not knowingly collect data from children under 13.</li>
                <li>If you believe a child has provided us data, contact us immediately.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">9</span>
                <span>Changes to This Policy</span>
              </h2>
              <ul className="space-y-1.5 pl-8 list-disc text-slate-600 dark:text-slate-300">
                <li>We may update this Privacy Policy from time to time.</li>
                <li>We will notify you of significant changes via email or a notice on our website.</li>
                <li>Continued use of our services after changes constitutes acceptance.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">10</span>
                <span>Contact Us</span>
              </h2>
              <div className="pl-8 text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">Adyapan Edutech Pvt. Ltd.</p>
                <p>Email: <a href="mailto:support@adyapan.com" className="text-amber-600 dark:text-amber-400 underline font-semibold">support@adyapan.com</a></p>
                <p>For privacy-related queries, please email: <a href="mailto:privacy@adyapan.com" className="text-amber-600 dark:text-amber-400 underline font-semibold">privacy@adyapan.com</a></p>
              </div>
            </section>
          </div>

          {/* Footer Quick Links */}
          <div className="border-t mt-10 pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-amber-600 dark:text-amber-400">
            <a href="https://adyapan.com/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Terms of Service ↗
            </a>
            <span>•</span>
            <a href="https://adyapan.com/contact" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Contact Us ↗
            </a>
            <span>•</span>
            <a href="https://adyapan.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Home ↗
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LegalPrivacy;
