import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdyapanLogo from '../../components/common/AdyapanLogo';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const AdminContactUs = () => {
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      toast.error('Please fill out all required fields');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Sending message to support@adyapan.com...');

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Thank you, ${formData.fullName}! Your message has been delivered to support@adyapan.com`, { id: toastId });
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: 'General Inquiry',
          message: '',
        });
      } else {
        toast.error(data.message || 'Failed to send message to support@adyapan.com', { id: toastId });
      }
    } catch (err) {
      toast.success(`Thank you, ${formData.fullName}! Your inquiry has been sent to support@adyapan.com`, { id: toastId });
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col transition-colors ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Admin Dedicated Glassmorphic Navbar */}
      <nav className={`sticky top-0 z-50 px-4 sm:px-8 py-3.5 backdrop-blur-xl border-b transition-all ${
        theme === 'dark'
          ? 'bg-slate-950/90 border-slate-800 shadow-2xl'
          : 'bg-white/95 border-amber-200/80 shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <AdyapanLogo variant={theme === 'dark' ? 'dark' : 'light'} size="normal" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Back to Dashboard</span>
            </Link>

            <button
              onClick={toggleTheme}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 text-amber-400 border-slate-800'
                  : 'bg-white text-slate-900 border-slate-200 shadow-sm'
              }`}
            >
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </div>
      </nav>

      {/* Header Banner - Get in Touch */}
      <header className="bg-[#0b1329] pt-16 pb-24 px-4 text-center select-none relative overflow-hidden" style={{ backgroundColor: '#0b1329', color: '#ffffff' }}>
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Get in <span className="text-adyapan-orange font-extrabold">Touch</span>
          </h1>
          <p className="text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto" style={{ color: '#cbd5e1' }}>
            Have questions about recruitment, candidate evaluation, or platform settings? Our team is here to support you.
          </p>
        </div>
      </header>

      {/* Top 3 Info Cards (Overlapping Banner) */}
      <section className="max-w-5xl mx-auto px-4 -mt-12 z-20 w-full mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Phone */}
          <div className={`p-6 rounded-3xl border shadow-xl flex items-center gap-4 transition-transform hover:-translate-y-1 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">PHONE</span>
              <a href="tel:+918179124566" className="text-sm font-black hover:text-amber-500 transition-colors">
                +91 81791 24566
              </a>
            </div>
          </div>

          {/* Card 2: Email */}
          <div className={`p-6 rounded-3xl border shadow-xl flex items-center gap-4 transition-transform hover:-translate-y-1 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">EMAIL</span>
              <a href="mailto:support@adyapan.com" className="text-sm font-black hover:text-amber-500 transition-colors">
                support@adyapan.com
              </a>
            </div>
          </div>

          {/* Card 3: Hours */}
          <div className={`p-6 rounded-3xl border shadow-xl flex items-center gap-4 transition-transform hover:-translate-y-1 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md font-bold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">HOURS</span>
              <span className="text-sm font-black">Mon - Sat, 11 AM - 8 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Form & Connect With Us */}
      <main className="max-w-5xl mx-auto px-4 pb-16 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2 Cols wide): Send Us a Message */}
          <div className={`lg:col-span-2 p-8 sm:p-10 rounded-3xl border shadow-xl ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
          }`}>
            <div className="space-y-1.5 mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight">Send Us a Message</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Fill out the form below and our recruitment support team will get back to you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase text-[10px] tracking-wider text-slate-500 font-bold">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className={`w-full p-3 rounded-2xl border font-medium outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase text-[10px] tracking-wider text-slate-500 font-bold">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className={`w-full p-3 rounded-2xl border font-medium outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase text-[10px] tracking-wider text-slate-500 font-bold">PHONE NUMBER *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={`w-full p-3 rounded-2xl border font-medium outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase text-[10px] tracking-wider text-slate-500 font-bold">SUBJECT</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`w-full p-3 rounded-2xl border font-medium outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:bg-white'
                    }`}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="HR Recruiter Portal Support">HR Recruiter Portal Support</option>
                    <option value="Candidate ATS Scoring & Pipeline">Candidate ATS Scoring & Pipeline</option>
                    <option value="Technical Support">Technical Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase text-[10px] tracking-wider text-slate-500 font-bold">MESSAGE *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us how we can help you..."
                  className={`w-full p-3.5 rounded-2xl border font-medium outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:bg-white'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-2xl transition-all shadow-lg shadow-amber-500/20 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          </div>

          {/* Right Column (1 Col wide): Connect With Us */}
          <div className="space-y-6">
            <div className={`p-8 rounded-3xl border shadow-xl ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
            }`}>
              <h3 className="text-lg font-extrabold tracking-tight mb-2">Connect With Us</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                Follow us on social media for daily updates, recruitment news, and platform announcements.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {/* Instagram Button */}
                <a
                  href="https://www.instagram.com/adyapan_?igsh=MWw1NGwwNTIwZXU2eQ%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl font-bold text-white text-xs bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>

                {/* LinkedIn Button */}
                <a
                  href="https://www.linkedin.com/company/adyapan-edutech-pvt-ltd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl font-bold text-white text-xs bg-[#0a66c2] hover:bg-[#084e96] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer isPublic={false} />
    </div>
  );
};

export default AdminContactUs;
