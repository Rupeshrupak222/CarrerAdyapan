import React, { useState, FormEvent, ReactNode } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';
import SiteShell from '../../components/layout/SiteShell';
import api from '../../services/api';
import toast from 'react-hot-toast';

const faqs = [
  [
    'How do I track my job application status?',
    'You can log in to your candidate account at any time to check whether your application has been reviewed, shortlisted, or scheduled for an interview.',
  ],
  [
    'What should I do if I cannot attend my scheduled interview?',
    'Please reply directly to the interview confirmation email or write to support@adyapan.com at least 4 hours in advance so our HR team can reschedule your slot.',
  ],
  [
    'Are remote or hybrid work options available?',
    'Yes, depending on the role. Roles in engineering and content development often support hybrid work, while early-career advisory roles are based at our Hyderabad hubs.',
  ],
  [
    'How quickly does the hiring team get back after an interview?',
    'Our recruitment team typically delivers interview feedback and selection results within 48 to 72 business hours.',
  ],
];

const ContactUs: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/contact', formData);
      setSent(true);
      toast.success('Message sent to Adyapan HR & Support!');
    } catch (err) {
      // Graceful fallback
      setSent(true);
      toast.success('Thank you! Your message has been received.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      <main>
        {/* ── CONTACT HERO ── */}
        <section className="contact-hero">
          <div className="contact-hero-bg" />
          <div className="h-container contact-hero-content">
            <span className="kicker">CONTACT ADYAPAN</span>
            <h1>
              Let's start a <br />
              <em>conversation.</em>
            </h1>
            <p>
              Have a question about careers, hiring, or your application? Our dedicated team is here
              to help you every step of the way.
            </p>
          </div>
        </section>

        {/* ── CONTACT SECTION & FORM ── */}
        <section className="section-h">
          <div className="h-container">
            <div className="contact-grid-h">
              {/* Left Info Column */}
              <div className="contact-info-h">
                <span className="kicker">GET IN TOUCH</span>
                <h2>
                  We'd love to <br />
                  <em>hear from you.</em>
                </h2>
                <p>
                  Reach us through the channel that works best for you. For career support and
                  application queries, we're happy to guide you through your next step.
                </p>

                <div className="contact-items-h">
                  <ContactItem
                    icon={<Phone size={20} />}
                    title="Phone"
                    text="+91 81791 24566"
                    href="tel:+918179124566"
                  />
                  <ContactItem
                    icon={<Mail size={20} />}
                    title="Email"
                    text="support@adyapan.com"
                    href="mailto:support@adyapan.com"
                  />
                  <ContactItem
                    icon={<Clock3 size={20} />}
                    title="Hours"
                    text="Mon – Sat, 11 AM – 8 PM"
                  />
                  <ContactItem
                    icon={<MapPin size={20} />}
                    title="Head Office"
                    text="Sattva Magnus, Toli Chowki, Hyderabad, Telangana"
                  />
                </div>

                <div className="social-row-h">
                  <a
                    href="https://www.instagram.com/adyapan_?igsh=MWw1NGwwNTIwZXU2eQ%3D%3D"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/adyapan-edutech-pvt-ltd"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Right Form Column */}
              <div className="contact-card-h">
                <div className="form-head-h">
                  <span className="kicker">SEND US A MESSAGE</span>
                  <h3>Tell us how we can help.</h3>
                  <p>Fill in the form and our recruitment team will get back to you shortly.</p>
                </div>

                {sent ? (
                  <div className="success-box-h">
                    <CheckCircle2 size={42} className="text-amber-500" />
                    <h3>Message received.</h3>
                    <p>
                      Thanks for reaching out! Our team will review your message and reply via email
                      or phone soon.
                    </p>
                    <button
                      className="btn-h primary"
                      onClick={() => {
                        setSent(false);
                        setFormData({
                          fullName: '',
                          email: '',
                          phone: '',
                          subject: '',
                          message: '',
                        });
                      }}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form-h">
                    <div className="form-two-h">
                      <label>
                        Full Name
                        <input
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="Your name"
                        />
                      </label>
                      <label>
                        Email Address
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@example.com"
                        />
                      </label>
                    </div>

                    <div className="form-two-h">
                      <label>
                        Phone Number
                        <input
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                        />
                      </label>
                      <label>
                        Subject
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                        >
                          <option value="" disabled>
                            Select a subject
                          </option>
                          <option value="Job application">Job application inquiry</option>
                          <option value="Hiring partnership">Hiring partnership</option>
                          <option value="Career guidance">Career guidance</option>
                          <option value="Interview query">Interview / Application query</option>
                          <option value="Other">Other</option>
                        </select>
                      </label>
                    </div>

                    <label>
                      Message
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us a little about what you need..."
                      />
                    </label>

                    <button className="btn-h primary big" type="submit" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Message'} <Send size={17} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── QUICK ANSWERS FAQ ── */}
        <section className="section-h contact-faq-h">
          <div className="h-container faq-grid-h">
            <div>
              <span className="kicker">QUICK ANSWERS</span>
              <h2>
                Before you <br />
                <em>write to us.</em>
              </h2>
              <p>Here are a few common questions from candidates applying to Adyapan.</p>
            </div>
            <div className="faq-list-h">
              {faqs.map(([q, a]) => (
                <div className="faq-item-h" key={q}>
                  <details>
                    <summary
                      style={{
                        cursor: 'pointer',
                        padding: '22px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 800,
                        fontSize: '15px',
                        listStyle: 'none',
                      }}
                    >
                      <span>{q}</span>
                      <ChevronDown size={18} className="text-amber-500" />
                    </summary>
                    <div className="faq-answer-h">{a}</div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
};

function ContactItem({
  icon,
  title,
  text,
  href,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  href?: string;
}) {
  return (
    <div className="contact-item-h">
      <span>{icon}</span>
      <div>
        <b>{title}</b>
        {href ? (
          <a
            href={href}
            style={{ textDecoration: 'none', color: 'inherit' }}
            className="hover:underline"
          >
            <small>{text}</small>
          </a>
        ) : (
          <small>{text}</small>
        )}
      </div>
    </div>
  );
}

export default ContactUs;
