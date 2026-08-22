import React from 'react';
import { Link } from 'react-router-dom';
import AdyapanLogo from '../../components/common/AdyapanLogo';
import { useTheme } from '../../context/ThemeContext';

const LegalPrivacy = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col transition-colors ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[#fdf6ee] text-slate-900'
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

      {/* Main Legal Content Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className={`p-6 sm:p-10 rounded-3xl border shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
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

          {/* Privacy Content Sections */}
          <div className="space-y-8 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">1</span>
                <span>Information We Collect</span>
              </h2>
              <p className="pl-8">We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-12 space-y-1">
                <li>Name, email address, phone number, and mailing address</li>
                <li>Account credentials and profile information</li>
                <li>Course enrollment, attendance, and performance records</li>
                <li>Payment details and transaction history (processed securely via PCI-compliant gateways)</li>
                <li>Communications and support requests you submit</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">2</span>
                <span>How We Use Your Information</span>
              </h2>
              <p className="pl-8">We use the information we collect to:</p>
              <ul className="list-disc pl-12 space-y-1">
                <li>Provide, operate, and improve our courses, certifications, and educational services</li>
                <li>Process payments, issue invoices, and manage enrollment</li>
                <li>Send important administrative notices, schedule updates, and system alerts</li>
                <li>Connect qualified candidates with placement and recruitment partners (with consent)</li>
                <li>Comply with legal obligations under applicable Indian law</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">3</span>
                <span>Information Sharing & Disclosure</span>
              </h2>
              <p className="pl-8">We do <strong>not</strong> sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-12 space-y-1">
                <li><strong>Service Providers:</strong> Cloud hosting, payment processing, and email delivery partners under strict confidentiality agreements</li>
                <li><strong>Hiring Partners:</strong> Recruiter networks when you apply for jobs or opt into career services</li>
                <li><strong>Legal Authorities:</strong> When required by law, court order, or to protect our rights and safety</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">4</span>
                <span>Data Security</span>
              </h2>
              <p className="pl-8">
                We implement industry-standard administrative, technical, and physical safeguards to protect your personal data against unauthorized access, alteration, disclosure, or destruction. All data in transit is encrypted using TLS/SSL protocols.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">5</span>
                <span>Cookies & Tracking Technologies</span>
              </h2>
              <p className="pl-8">
                We use cookies and similar technologies to maintain session state, remember your preferences, and analyze platform traffic. You can configure your browser to reject cookies, though some features may become unavailable.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">6</span>
                <span>Your Rights & Choices</span>
              </h2>
              <p className="pl-8">You have the right to:</p>
              <ul className="list-disc pl-12 space-y-1">
                <li>Access, update, or correct your personal information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of promotional communications at any time</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">7</span>
                <span>Data Retention</span>
              </h2>
              <p className="pl-8">
                We retain personal data for as long as necessary to fulfill the purposes described in this policy, comply with legal requirements, resolve disputes, and enforce our agreements.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">8</span>
                <span>Children's Privacy</span>
              </h2>
              <p className="pl-8">
                Our platform is not directed to individuals under the age of 16. We do not knowingly collect personal data from children without parental or guardian consent.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">9</span>
                <span>Changes to This Policy</span>
              </h2>
              <p className="pl-8">
                We may update this Privacy Policy periodically. Significant changes will be communicated via email or a prominent notification on our website.
              </p>
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
            <Link to="/terms" className="hover:underline">
              Terms of Service
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

export default LegalPrivacy;
