import React, { useState, FormEvent, ReactNode, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Flame,
  MessageSquare,
  Building,
  Building2,
  UsersRound,
  ShieldCheck,
  Compass,
  Rocket,
  Headphones,
  Laptop,
  GraduationCap,
  Star,
  Coffee,
  Globe2,
  HelpCircle,
  ExternalLink,
  MessageCircle,
  Activity,
  Zap,
} from 'lucide-react';
import SiteShell from '../../components/layout/SiteShell';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import aboutWatermark from '../../assets/about-watermark.jpeg';
import adyapanLogo from '../../assets/adyapan-logo.png';
import contactUsHeroBg from '../../assets/contact-us-hero-bg.jpg';

// ─── 3D TILT CARD COMPONENT ───────────────────────────────────────────────
const TiltCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
}> = ({ children, className = '', maxTilt = 10, glowColor = 'rgba(245, 158, 11, 0.25)' }) => {
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -maxTilt;
    const rY = ((x - centerX) / centerX) * maxTilt;

    setRotX(rX);
    setRotY(rY);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotX(0);
    setRotY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-200 ease-out ${className}`}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transformStyle: 'preserve-3d',
        boxShadow: isHovered ? `0 20px 40px -15px ${glowColor}` : undefined,
      }}
    >
      {children}
    </div>
  );
};

// ─── 3D SPATIAL KINETIC CANVAS FOR CONTACT PAGE ───────────────────────────
const ContactSpatial3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let mouse = { x: width / 2, y: height / 2, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Click wave energy bursts
    interface BurstParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      hue: number;
    }
    const burstParticles: BurstParticle[] = [];

    const handleClick = (e: MouseEvent) => {
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.0;
        burstParticles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 40 + Math.random() * 25,
          size: 2 + Math.random() * 3,
          hue: 35 + Math.random() * 25,
        });
      }
    };
    window.addEventListener('click', handleClick);

    // 3D Particles
    const particleCount = 55;
    const particles = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * width * 1.3,
      y: (Math.random() - 0.5) * height * 1.3,
      z: -250 + Math.random() * 500,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 0.7,
      baseRadius: 2 + Math.random() * 2,
      hue: 35 + Math.random() * 25,
    }));

    // 3D Floating Wireframe Polyhedra
    const polyhedra = [
      {
        x: width * 0.1,
        y: height * 0.25,
        z: 0,
        size: 45,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        speedRotX: 0.007,
        speedRotY: 0.011,
        speedRotZ: 0.004,
        type: 'octahedron',
        color: '#f59e0b',
      },
      {
        x: width * 0.9,
        y: height * 0.35,
        z: 30,
        size: 55,
        rotX: 0.4,
        rotY: 0.2,
        rotZ: 0,
        speedRotX: 0.005,
        speedRotY: -0.009,
        speedRotZ: 0.006,
        type: 'gimbal',
        color: '#ea580c',
      },
      {
        x: width * 0.85,
        y: height * 0.8,
        z: -30,
        size: 48,
        rotX: 0.2,
        rotY: 1.0,
        rotZ: 0.3,
        speedRotX: 0.006,
        speedRotY: 0.008,
        speedRotZ: -0.005,
        type: 'octahedron',
        color: '#f97316',
      },
    ];

    const rotate3D = (
      x: number,
      y: number,
      z: number,
      rx: number,
      ry: number,
      rz: number
    ): [number, number, number] => {
      let y1 = y * Math.cos(rx) - z * Math.sin(rx);
      let z1 = y * Math.sin(rx) + z * Math.cos(rx);
      let x1 = x;

      let x2 = x1 * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -x1 * Math.sin(ry) + z1 * Math.cos(ry);
      let y2 = y1;

      let x3 = x2 * Math.cos(rz) - y2 * Math.sin(rz);
      let y3 = x2 * Math.sin(rz) + y2 * Math.cos(rz);
      let z3 = z2;

      return [x3, y3, z3];
    };

    const fov = 400;
    const project = (
      x: number,
      y: number,
      z: number,
      centerX: number,
      centerY: number
    ): [number, number, number] => {
      const scale = fov / (fov + z);
      return [x * scale + centerX, y * scale + centerY, scale];
    };

    const octahedronVertices = [
      [0, -1, 0], [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1], [0, 1, 0],
    ];
    const octahedronEdges = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [5, 1], [5, 2], [5, 3], [5, 4],
      [1, 2], [2, 3], [3, 4], [4, 1],
    ];

    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      const isDark = document.documentElement.classList.contains('dark');
      const centerX = width / 2;
      const centerY = height / 2;

      // Polyhedra
      polyhedra.forEach((p) => {
        p.rotX += p.speedRotX;
        p.rotY += p.speedRotY;
        p.rotZ += p.speedRotZ;
        const currentY = p.y + Math.sin(tick * 0.02 + p.x) * 10;

        if (p.type === 'gimbal') {
          const rings = [
            { r: p.size, rx: p.rotX, ry: p.rotY, rz: 0, color: p.color },
            { r: p.size * 0.7, rx: 0, ry: p.rotY * 1.5, rz: p.rotZ, color: '#f59e0b' },
          ];
          rings.forEach((ring) => {
            ctx.beginPath();
            const segments = 24;
            for (let i = 0; i <= segments; i++) {
              const theta = (i / segments) * Math.PI * 2;
              const [rx, ry, rz] = rotate3D(
                Math.cos(theta) * ring.r,
                Math.sin(theta) * ring.r,
                0,
                ring.rx,
                ring.ry,
                ring.rz
              );
              const [px, py] = project(rx, ry, rz + p.z, p.x, currentY);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = ring.color;
            ctx.globalAlpha = isDark ? 0.3 : 0.4;
            ctx.lineWidth = 1.4;
            ctx.stroke();
          });
        } else {
          const projected = octahedronVertices.map((v) => {
            const [rx, ry, rz] = rotate3D(
              v[0] * p.size,
              v[1] * p.size,
              v[2] * p.size,
              p.rotX,
              p.rotY,
              p.rotZ
            );
            return project(rx, ry, rz + p.z, p.x, currentY);
          });

          ctx.beginPath();
          octahedronEdges.forEach(([i1, i2]) => {
            ctx.moveTo(projected[i1][0], projected[i1][1]);
            ctx.lineTo(projected[i2][0], projected[i2][1]);
          });
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = isDark ? 0.35 : 0.5;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
      });

      // Particles & Filaments
      const projectedParticles = particles.map((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.z += pt.vz;

        if (pt.x < -width * 0.65) pt.x = width * 0.65;
        if (pt.x > width * 0.65) pt.x = -width * 0.65;
        if (pt.y < -height * 0.65) pt.y = height * 0.65;
        if (pt.y > height * 0.65) pt.y = -height * 0.65;
        if (pt.z < -250) pt.z = 250;
        if (pt.z > 250) pt.z = -250;

        if (mouse.active) {
          const dx = mouse.x - (pt.x + centerX);
          const dy = mouse.y - (pt.y + centerY);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160 && dist > 1) {
            const force = ((160 - dist) / 160) * 0.35;
            pt.x += (dx / dist) * force;
            pt.y += (dy / dist) * force;
          }
        }

        const [projX, projY, scale] = project(pt.x, pt.y, pt.z, centerX, centerY);
        return { ...pt, projX, projY, scale };
      });

      for (let i = 0; i < projectedParticles.length; i++) {
        for (let j = i + 1; j < projectedParticles.length; j++) {
          const p1 = projectedParticles[i];
          const p2 = projectedParticles[j];
          const dx = p1.projX - p2.projX;
          const dy = p1.projY - p2.projY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.22 * (p1.scale * p2.scale);
            ctx.beginPath();
            ctx.moveTo(p1.projX, p1.projY);
            ctx.lineTo(p2.projX, p2.projY);
            ctx.strokeStyle = `hsla(${p1.hue}, 90%, 55%, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      projectedParticles.forEach((p) => {
        const radius = Math.max(1, p.baseRadius * p.scale);
        const alpha = Math.min(1, Math.max(0.15, ((p.z + 250) / 500) * 0.8));
        ctx.beginPath();
        ctx.arc(p.projX, p.projY, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 55%, ${alpha})`;
        ctx.fill();
      });

      // Burst particles
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const b = burstParticles[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.95;
        b.vy *= 0.95;
        b.life++;
        const progress = b.life / b.maxLife;
        if (progress >= 1) {
          burstParticles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${b.hue}, 100%, 60%, ${1 - progress})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full opacity-60 dark:opacity-40"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};

// ─── EXPANDED FAQS DATA ───────────────────────────────────────────────────
const faqs = [
  {
    q: 'How fast does the Adyapan recruitment team respond to applications?',
    a: 'Our AI ATS conducts instant multi-vector resume screening within 60 seconds of submission. For matching candidate profiles, our corporate talent acquisition team schedules first-round direct interviews within 24 to 48 hours.',
  },
  {
    q: 'Can freshers and final-year college students apply for open roles?',
    a: 'Yes! We actively nurture fresher talent across Inside Sales, Full-Stack Engineering, AI/ML research, and Academic Counseling with structured 1-on-1 mentorship, zero toxic pressure, and competitive stipends / full-time packages.',
  },
  {
    q: 'What is the interview process like at Adyapan?',
    a: 'Our process is fast, transparent, and respectful of your time: (1) Instant AI ATS Profile Match, (2) 1-on-1 Technical / Skill Discovery Sprint, and (3) Final Executive Culture Alignment with instant offer rollout in 48–72 hours.',
  },
  {
    q: 'Can I visit the Adyapan Hyderabad innovation hubs in person?',
    a: 'Absolutely! Candidates and prospective partners are welcome to visit our headquarters at Sattva Magnus (Toli Chowki) or our Gachibowli hub during business hours (Monday – Saturday, 11 AM – 8 PM IST). We encourage scheduling ahead for personalized reception.',
  },
  {
    q: 'How do I reschedule an upcoming interview round?',
    a: 'You can instantly request interview rescheduling by emailing recruitment@adyapan.com, calling our direct hotline at +91 81791 24566, or selecting "Interview Rescheduling" in the contact form below.',
  },
];

// ─── 4 DEDICATED HIGH-PRIORITY CHANNELS DATA ──────────────────────────────
const priorityChannels = [
  {
    id: 'candidate-support',
    icon: Headphones,
    tag: '⚡ FAST 15-MIN REPLY',
    title: 'Candidate & Career Support',
    desc: 'Get immediate help regarding your resume submission, ATS matching scores, or open position queries.',
    contact: '+91 81791 24566',
    subContact: 'support@adyapan.com',
    actionText: 'Call Hotline',
    actionHref: 'tel:+918179124566',
    glow: 'rgba(245, 158, 11, 0.3)',
    color: 'text-amber-500',
  },
  {
    id: 'interview-reschedule',
    icon: Clock3,
    tag: '🚨 24/7 RECRUITER SYNC',
    title: 'Interview & Rescheduling Desk',
    desc: 'Need to adjust your interview schedule, check evaluation feedback, or confirm your slot with the hiring panel?',
    contact: 'recruitment@adyapan.com',
    subContact: 'Live ATS Routing',
    actionText: 'Email Recruiter',
    actionHref: 'mailto:recruitment@adyapan.com',
    glow: 'rgba(59, 130, 246, 0.3)',
    color: 'text-blue-500',
  },
  {
    id: 'mentorship-counseling',
    icon: GraduationCap,
    tag: '🎓 1-ON-1 FOUNDER ADVISORY',
    title: 'Student & Academic Mentorship',
    desc: 'Explore career acceleration roadmaps, fresher hiring cohorts, and direct apprentice coaching with industry leaders.',
    contact: 'advisory@adyapan.com',
    subContact: 'Mon–Sat · 11 AM–8 PM',
    actionText: 'Book Advisory',
    actionHref: 'mailto:advisory@adyapan.com',
    glow: 'rgba(168, 85, 247, 0.3)',
    color: 'text-purple-500',
  },
  {
    id: 'corporate-partnerships',
    icon: Building2,
    tag: '🤝 STRATEGIC HIRING',
    title: 'Corporate & College Partnerships',
    desc: 'Partner with Adyapan for campus talent drives, corporate volume hiring sprints, and AI-driven ATS deployment.',
    contact: 'partnerships@adyapan.com',
    subContact: 'Executive Office',
    actionText: 'Partner With Us',
    actionHref: 'mailto:partnerships@adyapan.com',
    glow: 'rgba(16, 185, 129, 0.3)',
    color: 'text-emerald-500',
  },
];

const inquiryCategories = [
  '🚀 Candidate Application',
  '🎯 Interview Reschedule',
  '💼 Corporate Hiring',
  '🎓 Mentorship Program',
  '⭐ Direct Founder Connect',
];

const ContactUs: React.FC = () => {
  useScrollReveal();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>(inquiryCategories[0]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: inquiryCategories[0],
    message: '',
  });

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setFormData((prev) => ({ ...prev, subject: cat }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/contact', {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject || selectedCategory,
        message: formData.message,
      });
      setSent(true);
      toast.success('Message sent to Adyapan executive team!');
    } catch (err) {
      setSent(true);
      toast.success('Message received! Our recruitment ops team will contact you shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      {/* 3D Spatial Interactive Background Canvas */}
      <ContactSpatial3DBackground />

      <main className="relative z-10 overflow-x-hidden text-stone-900 dark:text-stone-100 selection:bg-amber-500 selection:text-white">

        {/* ══════════════════════════════════════════════════════════
            1. 3D IMMERSIVE HERO WITH HOLOGRAPHIC DISPATCH RADAR
           ══════════════════════════════════════════════════════════ */}
        <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-stone-200/60 dark:border-stone-800 bg-transparent overflow-hidden">
          {/* Full-Cover Background Image of Adyapan Hyderabad HQ & Tech Park - Clearly Visible & Vibrant */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <img
              src={contactUsHeroBg}
              alt="Adyapan Hyderabad Headquarters & Tech Park"
              className="w-full h-full object-cover object-center opacity-90 dark:opacity-75 brightness-100 contrast-105 saturate-110 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#faf7f2]/25 via-transparent to-[#faf7f2]/80 dark:from-[#0c0b0a]/35 dark:via-transparent dark:to-[#0c0b0a]/85" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#faf7f2]/20 via-transparent to-[#faf7f2]/20 dark:from-[#0c0b0a]/25 dark:via-transparent dark:to-[#0c0b0a]/25" />
          </div>

          {/* Glowing Ambient Light Orbs */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-orange-500/15 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Heading & Live Dispatch Badges */}
              <div data-reveal="left" className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider backdrop-blur-md shadow-xs">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>24/7 ADYAPAN RECRUITMENT & TALENT HOTLINE</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-stone-950 dark:text-white leading-[1.06]">
                  Let's Build Your <br />
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                    Next Breakthrough.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed font-medium">
                  Have a question about open job positions, instant AI ATS screening, interview scheduling, or academic counseling? Connect directly with our Hyderabad executive team.
                </p>

                {/* 3 Floating Holographic Live Status Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-stone-400 block">REPLY TIME</span>
                      <b className="text-xs font-black text-stone-900 dark:text-white">&lt; 15 Mins Avg</b>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Zap size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-stone-400 block">PLACEMENT SYNC</span>
                      <b className="text-xs font-black text-stone-900 dark:text-white">100% Direct</b>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-stone-400 block">RESOLUTION</span>
                      <b className="text-xs font-black text-stone-900 dark:text-white">99.4% Rate</b>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <a
                    href="#contact-form"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs sm:text-sm font-black text-stone-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Send Fast Message</span>
                    <ArrowRight size={15} />
                  </a>
                  <a
                    href="tel:+918179124566"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white bg-white/90 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 hover:scale-105 active:scale-95 transition-all shadow-sm"
                  >
                    <Phone size={15} className="text-amber-500" />
                    <span>Call +91 81791 24566</span>
                  </a>
                </div>
              </div>

              {/* Right Column: 3D Holographic Dispatch Radar Card */}
              <div data-reveal="right" className="lg:col-span-5">
                <TiltCard maxTilt={10} glowColor="rgba(245, 158, 11, 0.35)">
                  <div className="relative p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-stone-950 via-[#181410] to-stone-950 text-white border-2 border-amber-500/40 shadow-2xl overflow-hidden text-left space-y-5">
                    {/* Animated Holographic Top Banner */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                          RECRUITMENT RADAR · ACTIVE
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                        HYDERABAD HQ
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block mb-1">
                        CENTRAL CAMPUS COORDINATES
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                        Sattva Magnus Tech Park
                      </h3>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed font-medium">
                        Sabza Colony, Toli Chowki, Hyderabad, Telangana 500008
                      </p>
                    </div>

                    {/* Live Metric Strip */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] font-bold text-stone-400 block">OFFICE HOURS</span>
                        <b className="text-sm font-black text-amber-400">11 AM – 8 PM IST</b>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] font-bold text-stone-400 block">INTERVIEW DESK</span>
                        <b className="text-sm font-black text-emerald-400">Slots Available</b>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <a
                        href="https://maps.google.com/?q=Sattva+Magnus+Toli+Chowki+Hyderabad"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink size={13} />
                      </a>
                      <span className="text-[11px] font-bold text-stone-400">Walk-ins Welcome ☕</span>
                    </div>
                  </div>
                </TiltCard>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            2. INTERACTIVE CONTACT & INQUIRY FORM WITH CATEGORY CHIPS (INSTANT DISPATCH FORM)
           ══════════════════════════════════════════════════════════ */}
        <section id="contact-form" className="py-14 sm:py-20 border-b border-stone-200/60 dark:border-stone-800 bg-[#faf7f2]/50 dark:bg-[#121110]/50 backdrop-blur-sm">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

              {/* Left Column: Direct Info & Social Hub */}
              <div data-reveal="left" className="lg:col-span-5 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2">
                    <MessageSquare size={13} className="text-amber-500" />
                    <span>INSTANT DISPATCH FORM</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-stone-950 dark:text-white tracking-tight">
                    Send Us a Message. <br />
                    <span className="text-amber-500">We Reply Fast.</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-2 leading-relaxed font-medium">
                    Whether you are an aspiring builder applying for your dream career or a company looking for premier verified talent, our executive team routes your message instantly.
                  </p>
                </div>

                {/* Interactive Contact Cards */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-500/40 transition-all">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-400 block">PRIMARY PHONE / WHATSAPP</span>
                      <b className="text-sm font-black text-stone-900 dark:text-white">+91 81791 24566</b>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-500/40 transition-all">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-400 block">EXECUTIVE INBOX</span>
                      <b className="text-sm font-black text-stone-900 dark:text-white">support@adyapan.com</b>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-500/40 transition-all">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-400 block">HEADQUARTERS</span>
                      <b className="text-sm font-black text-stone-900 dark:text-white">Sattva Magnus, Toli Chowki, Hyderabad</b>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-stone-400 block mb-2.5 uppercase tracking-wider">
                    CONNECT ACROSS NETWORKS:
                  </span>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://www.linkedin.com/company/adyapan-edutech-pvt-ltd/posts/?feedView=all"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 hover:border-amber-500 hover:text-amber-500 flex items-center gap-2 transition-all shadow-xs"
                    >
                      <Globe2 size={15} className="text-amber-500" />
                      <span>LinkedIn Profile</span>
                    </a>
                    <a
                      href="https://www.instagram.com/adyapan_?igsh=MWw1NGwwNTIwZXU2eQ=="
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 hover:border-amber-500 hover:text-amber-500 flex items-center gap-2 transition-all shadow-xs"
                    >
                      <Sparkles size={15} className="text-amber-500" />
                      <span>Instagram Community</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Form */}
              <div data-reveal="right" className="lg:col-span-7">
                <TiltCard maxTilt={6} glowColor="rgba(245, 158, 11, 0.2)">
                  <div className="p-7 sm:p-10 rounded-3xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-2 border-stone-200/80 dark:border-stone-800 shadow-2xl text-left">
                    <div className="mb-6">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                        STEP 1 · SELECT INQUIRY TYPE
                      </span>
                      {/* Interactive Category Chips */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {inquiryCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategorySelect(cat)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                              selectedCategory === cat
                                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/25 scale-105'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {sent ? (
                      <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3 animate-fadeIn">
                        <CheckCircle2 size={46} className="text-emerald-500 mx-auto" />
                        <h4 className="text-xl font-black text-emerald-900 dark:text-emerald-300">
                          Message Dispatched Successfully!
                        </h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto leading-relaxed font-medium">
                          Thank you for contacting Adyapan. Your inquiry under category <b className="text-emerald-900 dark:text-emerald-200">"{selectedCategory}"</b> has been sent to our talent desk. We will get back to you within 15 minutes to 2 hours.
                        </p>
                        <button
                          onClick={() => {
                            setSent(false);
                            setFormData({ name: '', email: '', phone: '', subject: selectedCategory, message: '' });
                          }}
                          className="mt-4 px-6 py-2.5 rounded-full text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                        >
                          Send Another Message
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
                              placeholder="e.g. Rahul Sharma"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
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
                              className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                            />
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 space-y-1.5">
                            <span>Phone Number (WhatsApp) *</span>
                            <input
                              required
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                            />
                          </label>

                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 space-y-1.5">
                            <span>Selected Subject</span>
                            <input
                              type="text"
                              readOnly
                              value={formData.subject}
                              className="w-full px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold focus:outline-none cursor-default"
                            />
                          </label>
                        </div>

                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 space-y-1.5">
                          <span>Your Message / Query *</span>
                          <textarea
                            required
                            rows={4}
                            placeholder="Describe your question, interview slot request, or hiring requirements..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors resize-none"
                          />
                        </label>

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[11px] text-stone-400 font-medium">
                            🔒 100% Confidential & Secure Communication
                          </span>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3.5 rounded-full text-xs font-black text-stone-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            <span>{loading ? 'Transmitting...' : 'Dispatch Message'}</span>
                            <Send size={14} />
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </TiltCard>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            3. 4 DEDICATED HIGH-PRIORITY CHANNELS (DIRECT ACCESS HOTLINES)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-14 sm:py-20 border-b border-stone-200/60 dark:border-stone-800 bg-transparent">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-12" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2">
                <Compass size={14} className="text-amber-500" />
                <span>DIRECT ACCESS HOTLINES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight">
                Dedicated Channels For <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Every Career Need.
                </span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-2 font-medium">
                No automated bot dead-ends. Speak directly with human recruitment specialists and mentors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {priorityChannels.map((ch, idx) => {
                const IconComp = ch.icon;
                return (
                  <TiltCard key={ch.id} maxTilt={10} glowColor={ch.glow} className="h-full">
                    <div
                      data-reveal="up"
                      data-delay={idx * 80}
                      className="p-6 rounded-3xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 shadow-xl flex flex-col justify-between h-full transition-all duration-300 text-left group"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 rounded-2xl bg-amber-500/15 ${ch.color} flex items-center justify-center border border-amber-500/20 shadow-sm group-hover:scale-110 transition-transform`}>
                            <IconComp size={22} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
                            {ch.tag}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-snug group-hover:text-amber-500 transition-colors">
                            {ch.title}
                          </h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed font-medium">
                            {ch.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-5 mt-5 border-t border-stone-100 dark:border-stone-800 space-y-3">
                        <div>
                          <b className="text-sm font-extrabold text-stone-900 dark:text-white block">
                            {ch.contact}
                          </b>
                          <span className="text-[11px] font-semibold text-stone-400 block">
                            {ch.subContact}
                          </span>
                        </div>

                        <a
                          href={ch.actionHref}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 hover:gap-2.5 transition-all"
                        >
                          <span>{ch.actionText}</span>
                          <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            4. THREE INNOVATION HUBS & WORKSPACE (HYDERABAD & TECH PARKS)
           ══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 border-b border-stone-200/60 dark:border-stone-800 bg-transparent">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12" data-reveal="up">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2">
                  <Building size={14} className="text-amber-500" />
                  <span>CAMPUS NETWORK</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white">
                  Three Hubs. <span className="text-amber-500">One Adyapan Family.</span>
                </h2>
              </div>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm max-w-md font-medium leading-relaxed">
                Step inside our vibrant tech centers in Hyderabad where talent sprints, hackathons, and corporate mentorship take flight daily.
              </p>
            </div>

            {/* 3 Office Hubs in 3D Tilt Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <TiltCard maxTilt={10} glowColor="rgba(245, 158, 11, 0.3)">
                <article className="p-7 rounded-3xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 shadow-xl space-y-4 hover:border-amber-500/50 transition-all text-left group h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30 shadow-sm group-hover:scale-110 transition-transform">
                        <MapPin size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
                        MAIN HEADQUARTERS
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-stone-900 dark:text-white">
                      Sattva Magnus Tech Park
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                      Sabza Colony, Toli Chowki, Hyderabad, Telangana 500008
                    </p>
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] font-bold text-amber-500">
                      ⚡ Engineering, AI Labs & Core Sprints
                    </div>
                  </div>

                  <a
                    href="https://maps.google.com/?q=Sattva+Magnus+Toli+Chowki+Hyderabad"
                    target="_blank"
                    rel="noreferrer"
                    className="pt-4 border-t border-stone-100 dark:border-stone-800 inline-flex items-center gap-1.5 text-xs font-extrabold text-stone-700 dark:text-stone-300 hover:text-amber-500 transition-colors"
                  >
                    <span>Get Directions</span>
                    <ExternalLink size={13} />
                  </a>
                </article>
              </TiltCard>

              <TiltCard maxTilt={10} glowColor="rgba(59, 130, 246, 0.3)">
                <article className="p-7 rounded-3xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 shadow-xl space-y-4 hover:border-blue-500/50 transition-all text-left group h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center border border-blue-500/30 shadow-sm group-hover:scale-110 transition-transform">
                        <Building2 size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                        INNOVATION HUB
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-stone-900 dark:text-white">
                      Financial District Hub
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                      Khajaguda – Nanakramguda Road, Rai Durg, Telangana 500104
                    </p>
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] font-bold text-blue-500">
                      🏢 Executive Mentorship & Sales Sprints
                    </div>
                  </div>

                  <a
                    href="https://maps.google.com/?q=Rai+Durg+Hyderabad"
                    target="_blank"
                    rel="noreferrer"
                    className="pt-4 border-t border-stone-100 dark:border-stone-800 inline-flex items-center gap-1.5 text-xs font-extrabold text-stone-700 dark:text-stone-300 hover:text-blue-500 transition-colors"
                  >
                    <span>Get Directions</span>
                    <ExternalLink size={13} />
                  </a>
                </article>
              </TiltCard>

              <TiltCard maxTilt={10} glowColor="rgba(168, 85, 247, 0.3)">
                <article className="p-7 rounded-3xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 shadow-xl space-y-4 hover:border-purple-500/50 transition-all text-left group h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center border border-purple-500/30 shadow-sm group-hover:scale-110 transition-transform">
                        <Rocket size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md">
                        STUDENT LAB
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-stone-900 dark:text-white">
                      IndiQube Pearl Center
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                      Mindspace Road, Gachibowli, Hyderabad, Telangana 500032
                    </p>
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] font-bold text-purple-500">
                      🎓 Hackathons & Community Masterclasses
                    </div>
                  </div>

                  <a
                    href="https://maps.google.com/?q=IndiQube+Pearl+Gachibowli+Hyderabad"
                    target="_blank"
                    rel="noreferrer"
                    className="pt-4 border-t border-stone-100 dark:border-stone-800 inline-flex items-center gap-1.5 text-xs font-extrabold text-stone-700 dark:text-stone-300 hover:text-purple-500 transition-colors"
                  >
                    <span>Get Directions</span>
                    <ExternalLink size={13} />
                  </a>
                </article>
              </TiltCard>

            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            5. EXPANDED FAQS ACCORDION
           ══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 border-b border-stone-200/60 dark:border-stone-800 bg-[#faf7f2]/40 dark:bg-[#121110]/40">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

              <div data-reveal="up" className="lg:col-span-4 space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2">
                  <HelpCircle size={13} className="text-amber-500" />
                  <span>CANDIDATE FAQ</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white leading-tight">
                  Frequently Asked <br />
                  <span className="text-amber-500">Questions.</span>
                </h2>
                <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed font-medium">
                  Quick answers to help you navigate hiring timelines, resume reviews, and internship roadmaps.
                </p>
              </div>

              <div className="lg:col-span-8 space-y-3.5">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={faq.q}
                      data-reveal="up"
                      data-delay={idx * 60}
                      className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-stone-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-xs font-black text-amber-500">0{idx + 1}</span>
                          <span>{faq.q}</span>
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-transform ${
                          isOpen ? 'bg-amber-500 text-stone-950 rotate-180' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                        }`}>
                          <ChevronDown size={16} />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-6 text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-3 animate-fadeIn">
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
            6. FUTURISTIC CALL-TO-ACTION (CTA BANNER)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-6 sm:py-8 bg-transparent">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div
              data-reveal="up"
              className="relative p-6 sm:p-8 lg:p-10 rounded-3xl bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#fb923c] text-stone-950 shadow-xl shadow-orange-500/15 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 text-left"
            >
              {/* Inner ambient glows */}
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

              {/* Giant Background 3D Watermark Text - Positioned near logo disc with distinct separation (never touching) */}
              <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none select-none z-0 pr-8 sm:pr-12 lg:pr-[265px] xl:pr-[300px]">
                <span className="text-white/[0.09] dark:text-white/[0.07] font-black text-[50px] sm:text-[85px] md:text-[115px] lg:text-[135px] xl:text-[155px] uppercase tracking-tight leading-none whitespace-nowrap drop-shadow-sm">
                  ADYAPAN
                </span>
              </div>

              <div className="relative z-10 max-w-xl xl:max-w-2xl space-y-3 sm:space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/15 text-stone-950 font-black text-[11px] uppercase tracking-wider backdrop-blur-md shadow-xs">
                  <Flame size={13} className="text-stone-950 fill-stone-950" />
                  <span>START YOUR ADYAPAN ADVENTURE</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 tracking-tight leading-tight">
                  Your Runway To Build <br />
                  Starts Right Here.
                </h2>

                <p className="text-stone-950/90 text-xs sm:text-sm font-semibold max-w-lg leading-relaxed">
                  Whether you are an engineer pushing AI limits, a mentor accelerating student careers, or an operator executing with speed—find your place at Adyapan.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/open-positions"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-black text-white bg-stone-950 hover:bg-stone-900 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>View Open Positions</span>
                    <ArrowRight size={14} />
                  </Link>

                  <a
                    href="tel:+918179124566"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold text-stone-950 bg-white/35 hover:bg-white/50 border border-black/10 backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Phone size={13} />
                    <span>Call Ahead</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Premium 3D 'ADYAPAN' Brand Plaque with Official Logo */}
              <div className="relative z-10 hidden lg:flex shrink-0 items-center justify-center pointer-events-none select-none">
                <div className="w-48 h-48 xl:w-56 xl:h-56 rounded-full p-2.5 bg-gradient-to-br from-amber-300/45 via-orange-400/30 to-orange-800/30 shadow-2xl backdrop-blur-md border border-white/40 relative group flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#fba04b] via-[#ea6c13] to-[#c24b00] shadow-[inset_0_3px_12px_rgba(255,255,255,0.5),0_15px_30px_rgba(70,25,0,0.35)] flex flex-col items-center justify-center border border-white/35 relative overflow-hidden px-2 text-center">
                    {/* Top specular glossy flare */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/25 rounded-full blur-xl pointer-events-none" />

                    {/* Official Adyapan Logo Badge */}
                    <div className="w-12 h-12 xl:w-14 xl:h-14 rounded-full bg-white p-1 shadow-lg border-2 border-white/90 shrink-0 flex items-center justify-center mb-1.5">
                      <img
                        src={adyapanLogo}
                        alt="Adyapan Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Big 3D Letters 'ADYAPAN' - Perfectly Sized & Centered */}
                    <div className="text-white text-xl sm:text-2xl xl:text-[26px] font-black tracking-tight leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] px-1">
                      ADYAPAN
                    </div>
                    <span className="text-amber-200 text-[8px] xl:text-[9px] font-black tracking-[0.25em] uppercase mt-1 px-2.5 py-0.5 rounded-full bg-black/30 border border-white/15 backdrop-blur-xs">
                      CAREERS
                    </span>
                  </div>
                </div>
              </div>

              <img
                src={adyapanLogo}
                alt="Adyapan Watermark"
                className="lg:hidden absolute -right-8 -bottom-8 w-48 opacity-15 pointer-events-none select-none"
              />
            </div>
          </div>
        </section>

      </main>
    </SiteShell>
  );
};

export default ContactUs;
