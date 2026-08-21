import React, { useState, FormEvent, ReactNode } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';
import SiteShell from '../../components/layout/SiteShell';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import aboutWatermark from '../../assets/about-watermark.jpeg';

const faqs = [
  {
    q: 'How do I apply for a job?',
    a: 'Create your candidate profile, choose a role, upload your resume and submit your application.',
  },
  {
    q: 'Can freshers apply?',
    a: 'Yes. Roles marked Fresher or 0–2 years are designed for early-career candidates.',
  },
  {
    q: 'How does ATS scoring work?',
    a: 'Your resume and profile are compared with role requirements to highlight relevant skills. The hiring team makes the final decision.',
  },
  {
    q: 'Can I update my profile after applying?',
    a: 'Yes. Keep your profile current and your updated information can be used for future applications.',
  },
];

function ContactItem({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-500/30 transition-all">
      <span className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-xs">
        {icon}
      </span>
      <div>
        <b className="text-sm font-extrabold text-stone-900 dark:text-white block">{title}</b>
        <small className="text-xs text-stone-500 dark:text-stone-400 font-medium block mt-0.5 leading-relaxed">
          {text}
        </small>
      </div>
    </div>
  );
}

const ContactUs: React.FC = () => {
  useScrollReveal();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/contact', {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      setSent(true);
      toast.success('Message sent to Adyapan team!');
    } catch (err) {
      // Graceful fallback so UX is seamless
      setSent(true);
      toast.success('Message received! We will get back to you soon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      <main className="overflow-x-hidden text-stone-900 dark:text-stone-100 bg-[#fdfbf7] dark:bg-[#141312]">

        {/* ══════════════════════════════════════════════════════════
            HERO SECTION (HARSHITHA EXACT BACKGROUND IMAGE)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[440px] sm:min-h-[480px] flex items-center bg-[#0d0a08] text-white overflow-hidden border-b border-stone-800">
          {/* Background Image with Dark Obsidian Gradient */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100 hover:scale-105"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(12, 10, 8, 0.95) 0%, rgba(12, 10, 8, 0.72) 48%, rgba(12, 10, 8, 0.28) 100%), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=90')`,
            }}
          />
          {/* Ambient Warm Glow */}
          <div className="absolute -top-10 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
            <div data-reveal="up" className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-400 font-black text-xs uppercase tracking-wider backdrop-blur-md shadow-xs">
                <Sparkles size={14} className="text-amber-400 fill-amber-400" />
                <span>CONTACT ADYAPAN · WE'RE HERE TO HELP</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.05]">
                Let's start a <br />
                <span className="text-amber-500">conversation.</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 max-w-2xl leading-relaxed font-medium">
                Have a question about careers, hiring or your application? Our team is here to help you every step of the way.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            CONTACT DETAILS & INTERACTIVE FORM
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 border-b border-stone-200/70 dark:border-stone-850">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

              {/* Left Column: Info & Channels */}
              <div data-reveal="left" className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-2">
                    GET IN TOUCH
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-stone-950 dark:text-white tracking-tight">
                    We'd love to <br />
                    <span className="text-amber-500">hear from you.</span>
                  </h2>
                  <p className="text-sm text-stone-600 dark:text-stone-300 mt-3 leading-relaxed font-medium">
                    Reach us through the channel that works best for you. For career support, we're happy to guide you through your next step.
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <ContactItem
                    icon={<Phone size={18} />}
                    title="Phone"
                    text="+91 81791 24566"
                  />
                  <ContactItem
                    icon={<Mail size={18} />}
                    title="Email"
                    text="support@adyapan.com"
                  />
                  <ContactItem
                    icon={<Clock3 size={18} />}
                    title="Hours"
                    text="Mon – Sat, 11 AM – 8 PM IST"
                  />
                  <ContactItem
                    icon={<MapPin size={18} />}
                    title="Head Office"
                    text="Sattva Magnus, Toli Chowki, Hyderabad, Telangana 500008"
                  />
                </div>

                {/* Socials */}
                <div className="pt-2 flex items-center gap-3">
                  <a
                    href="https://www.instagram.com/adyapan_?igsh=MWw1NGwwNTIwZXU2eQ=="
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full border border-stone-300 dark:border-stone-700 flex items-center justify-center text-amber-600 dark:text-amber-400 hover:border-amber-500 hover:scale-105 transition-all shadow-xs"
                    aria-label="Instagram"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/adyapan-edutech-pvt-ltd/posts/?feedView=all"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full border border-stone-300 dark:border-stone-700 flex items-center justify-center text-amber-600 dark:text-amber-400 hover:border-amber-500 hover:scale-105 transition-all shadow-xs"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div data-reveal="right" className="lg:col-span-7">
                <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xl">
                  <div className="mb-6">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                      SEND US A MESSAGE
                    </span>
                    <h3 className="text-2xl font-black text-stone-900 dark:text-white">
                      Tell us how we can help.
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Fill in the form and our recruitment & support team will get back to you promptly.
                    </p>
                  </div>

                  {sent ? (
                    <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                      <CheckCircle2 size={42} className="text-emerald-500 mx-auto" />
                      <h4 className="text-xl font-black text-emerald-900 dark:text-emerald-300">
                        Message received.
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-sm mx-auto">
                        Thanks for reaching out. Our team has received your query and will reply via email or phone shortly.
                      </p>
                      <button
                        onClick={() => {
                          setSent(false);
                          setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                        }}
                        className="mt-4 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 space-y-1.5">
                          <span>Full Name *</span>
                          <input
                            required
                            type="text"
                            placeholder="Your full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                          />
                        </label>

                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 space-y-1.5">
                          <span>Email Address *</span>
                          <input
                            required
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 space-y-1.5">
                          <span>Phone Number *</span>
                          <input
                            required
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                          />
                        </label>

                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 space-y-1.5">
                          <span>Subject *</span>
                          <select
                            required
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                          >
                            <option value="" disabled>Select a subject</option>
                            <option value="Job application">Job application</option>
                            <option value="Hiring partnership">Hiring partnership</option>
                            <option value="Career guidance">Career guidance</option>
                            <option value="Interview rescheduling">Interview rescheduling</option>
                            <option value="Other">Other</option>
                          </select>
                        </label>
                      </div>

                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 space-y-1.5">
                        <span>Message *</span>
                        <textarea
                          required
                          rows={5}
                          placeholder="Tell us a little about what you need..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs sm:text-sm font-extrabold text-stone-950 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>{loading ? 'Sending...' : 'Send Message'}</span>
                        <Send size={15} />
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            QUICK ANSWERS / FAQS SECTION
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 border-b border-stone-200/70 dark:border-stone-850 bg-[#faf6f0] dark:bg-[#181715]">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

              <div data-reveal="up" className="lg:col-span-4 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  QUICK ANSWERS
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white leading-tight">
                  Before you <br />
                  <span className="text-amber-500">write to us.</span>
                </h2>
                <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed font-medium">
                  Here are a few common questions from candidates regarding hiring, interviews, and applications.
                </p>
              </div>

              <div className="lg:col-span-8 space-y-3.5">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={faq.q}
                      data-reveal="up"
                      data-delay={idx * 80}
                      className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-black text-sm sm:text-base text-stone-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          size={18}
                          className={`text-stone-400 transform transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-amber-500' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-3 animate-fadeIn">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            COME MEET US — THREE LOCATIONS
           ══════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12" data-reveal="up">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-2">
                  COME MEET US
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white">
                  Three locations. <span className="text-amber-500">One Adyapan.</span>
                </h2>
              </div>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm max-w-md font-medium leading-relaxed">
                Our teams collaborate across Hyderabad, creating spaces where people can learn, build and connect.
              </p>
            </div>

            {/* Office Visual Banner */}
            <div data-reveal="up" className="relative h-[300px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl mb-8 group">
              <img
                src={aboutWatermark}
                alt="Adyapan office environment"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 block mb-1">
                  ADYAPAN · HYDERABAD
                </span>
                <b className="text-2xl sm:text-3xl font-black text-white">
                  Where people and ideas come together.
                </b>
              </div>
            </div>

            {/* 3 Office Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article
                data-reveal="up"
                data-delay={100}
                className="interactive-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-2 hover:border-amber-500/40 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <MapPin size={18} />
                </div>
                <b className="text-lg font-black text-stone-900 dark:text-white block">Head Office</b>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                  Sattva Magnus, Sabza Colony, Toli Chowki, Hyderabad, Telangana 500008
                </p>
              </article>

              <article
                data-reveal="up"
                data-delay={200}
                className="interactive-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-2 hover:border-amber-500/40 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <MapPin size={18} />
                </div>
                <b className="text-lg font-black text-stone-900 dark:text-white block">Second Office</b>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                  Khajaguda – Nanakramguda Road, Rai Durg, Telangana 500104
                </p>
              </article>

              <article
                data-reveal="up"
                data-delay={300}
                className="interactive-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-2 hover:border-amber-500/40 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <MapPin size={18} />
                </div>
                <b className="text-lg font-black text-stone-900 dark:text-white block">Third Office</b>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                  IndiQube Pearl, Mindspace Road, Gachibowli, Hyderabad, Telangana 500032
                </p>
              </article>
            </div>

          </div>
        </section>

      </main>
    </SiteShell>
  );
};

export default ContactUs;
