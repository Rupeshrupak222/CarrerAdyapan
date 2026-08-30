import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Heart,
  BriefcaseBusiness,
  Award,
  Zap,
  Coffee,
  Code2,
  Trophy,
  PartyPopper,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Flame,
  Star,
  UsersRound,
  ShieldCheck,
  Rocket,
  Compass,
  Play,
  Pause,
  Laptop,
  GraduationCap,
  Activity,
  Smile,
  X,
  Volume2,
  Clock,
  Utensils,
  Sun,
  Moon,
} from 'lucide-react';
import SiteShell from '../components/layout/SiteShell';
import { useScrollReveal } from '../hooks/useScrollReveal';

// Assets
import adyapanTeam from '../assets/adyapan-team.jpg';
import cultureTeamProfessional from '../assets/culture-team-professional.jpg';
import aboutHeroOffice from '../assets/about-hero-office-reference.jpg';
import cricketImage from '../assets/cricket.jpg';
import partyImage from '../assets/party.jpeg';
import mentorshipImage from '../assets/adyapan-mentorship.png';
import studentCommunityImage from '../assets/largest-student-community.jpeg';
import techTeam from '../assets/tech-team-hd-production.webp';
import managementTeam from '../assets/management-hr-team-hd-production.webp';
import foundersImage from '../assets/Founders.jpeg';
import adyapanLogo from '../assets/adyapan-logo.png';
import lifeAtAdyapanHeroBg from '../assets/life-at-adyapan-hero-unique.jpg';

// ─── UNIQUE 3D SPATIAL CULTURE & HOLOGRAPHIC POLYHEDRA CANVAS ─────────────
// Features: Real 3D Wireframe Polyhedra, 3D Particle Constellation with depth, Laser Filaments & Mouse Gravitational Swarm
const Spatial3DCultureCanvas: React.FC = () => {
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

    // Mouse coordinates & interaction
    let mouse = { x: width / 2, y: height / 2, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Click wave bursts
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
        const speed = 1.5 + Math.random() * 4.5;
        burstParticles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 40 + Math.random() * 30,
          size: 2 + Math.random() * 3,
          hue: 35 + Math.random() * 25,
        });
      }
    };
    window.addEventListener('click', handleClick);

    // 3D Particles in XYZ space
    const particleCount = 75;
    const particles = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: -300 + Math.random() * 600,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      vz: (Math.random() - 0.5) * 0.8,
      baseRadius: 2 + Math.random() * 2.5,
      hue: 35 + Math.random() * 25,
    }));

    // 3D Floating Wireframe Polyhedra
    interface Polyhedron3D {
      x: number;
      y: number;
      z: number;
      size: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      speedRotX: number;
      speedRotY: number;
      speedRotZ: number;
      type: 'octahedron' | 'icosahedron' | 'cube' | 'gimbal';
      color: string;
    }

    const polyhedra: Polyhedron3D[] = [
      {
        x: width * 0.15,
        y: height * 0.25,
        z: 0,
        size: 55,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        speedRotX: 0.008,
        speedRotY: 0.012,
        speedRotZ: 0.005,
        type: 'octahedron',
        color: '#f59e0b',
      },
      {
        x: width * 0.85,
        y: height * 0.35,
        z: 50,
        size: 65,
        rotX: 0.5,
        rotY: 0.2,
        rotZ: 0,
        speedRotX: 0.006,
        speedRotY: 0.009,
        speedRotZ: 0.007,
        type: 'gimbal',
        color: '#fbbf24',
      },
      {
        x: width * 0.1,
        y: height * 0.75,
        z: -50,
        size: 50,
        rotX: 0.2,
        rotY: 0.8,
        rotZ: 0,
        speedRotX: 0.007,
        speedRotY: 0.01,
        speedRotZ: 0.004,
        type: 'cube',
        color: '#f97316',
      },
      {
        x: width * 0.9,
        y: height * 0.8,
        z: 20,
        size: 60,
        rotX: 0.3,
        rotY: 0.5,
        rotZ: 0,
        speedRotX: 0.009,
        speedRotY: 0.008,
        speedRotZ: 0.006,
        type: 'octahedron',
        color: '#f59e0b',
      },
    ];

    // 3D Rotation and Projection Helper
    const project3D = (x: number, y: number, z: number, fov: number = 700) => {
      const scale = fov / (fov + z);
      return {
        x: x * scale,
        y: y * scale,
        scale,
      };
    };

    const rotatePoint3D = (
      p: [number, number, number],
      rx: number,
      ry: number,
      rz: number
    ): [number, number, number] => {
      let [x, y, z] = p;

      // Rotate X
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;

      // Rotate Y
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;

      // Rotate Z
      const cosZ = Math.cos(rz);
      const sinZ = Math.sin(rz);
      const x3 = x2 * cosZ - y1 * sinZ;
      const y3 = x2 * sinZ + y1 * cosZ;

      return [x3, y3, z2];
    };

    // Draw Octahedron in 3D
    const draw3DOctahedron = (cx: number, cy: number, size: number, rx: number, ry: number, rz: number, color: string) => {
      const vertices: [number, number, number][] = [
        [0, -size, 0],
        [size, 0, 0],
        [0, 0, size],
        [-size, 0, 0],
        [0, 0, -size],
        [0, size, 0],
      ];

      const edges = [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [5, 1], [5, 2], [5, 3], [5, 4],
        [1, 2], [2, 3], [3, 4], [4, 1],
      ];

      const rotated = vertices.map((v) => rotatePoint3D(v, rx, ry, rz));
      const projected = rotated.map(([x, y, z]) => {
        const proj = project3D(x, y, z);
        return { x: cx + proj.x, y: cy + proj.y, z };
      });

      // Draw Edges
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      edges.forEach(([i1, i2]) => {
        const p1 = projected[i1];
        const p2 = projected[i2];
        const avgZ = (p1.z + p2.z) / 2;
        ctx.globalAlpha = Math.max(0.15, Math.min(0.8, 0.45 + avgZ / 200));
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw glowing vertices
      projected.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    // Draw 3D Gimbal Ring
    const draw3DGimbal = (cx: number, cy: number, size: number, rx: number, ry: number, rz: number, color: string) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.lineWidth = 1.5;

      // Outer Ring
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.45, rx, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.55;
      ctx.stroke();

      // Inner Ring
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.7, size * 0.3, -ry, 0, Math.PI * 2);
      ctx.strokeStyle = '#f97316';
      ctx.globalAlpha = 0.65;
      ctx.stroke();

      // Center glowing node
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffedd5';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.restore();
    };

    let time = 0;

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      // Ambient radial lighting
      const ambientGrad = ctx.createRadialGradient(
        width / 2 + Math.sin(time * 0.5) * 120,
        height * 0.35 + Math.cos(time * 0.5) * 80,
        40,
        width / 2,
        height * 0.35,
        width * 0.6
      );
      ambientGrad.addColorStop(0, 'rgba(245, 158, 11, 0.09)');
      ambientGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.04)');
      ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Burst Particles from clicks
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i];
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.vx *= 0.96;
        bp.vy *= 0.96;
        bp.life++;

        const progress = bp.life / bp.maxLife;
        const alpha = Math.max(0, 1 - progress);

        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${bp.hue}, 100%, 65%, ${alpha})`;
        ctx.shadowColor = `hsl(${bp.hue}, 100%, 60%)`;
        ctx.shadowBlur = 10;
        ctx.fill();

        if (bp.life >= bp.maxLife) {
          burstParticles.splice(i, 1);
        }
      }
      ctx.shadowBlur = 0;

      // Update & Draw 3D Particle Constellation
      const projectedParticles: { x: number; y: number; z: number; r: number; alpha: number; hue: number }[] = [];

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Boundaries
        const boundX = width * 0.75;
        const boundY = height * 0.75;
        if (p.x < -boundX) p.x = boundX;
        if (p.x > boundX) p.x = -boundX;
        if (p.y < -boundY) p.y = boundY;
        if (p.y > boundY) p.y = -boundY;
        if (p.z < -300) p.z = 300;
        if (p.z > 300) p.z = -300;

        // Gravitational pull toward mouse if active
        if (mouse.active) {
          const screenX = p.x + width / 2;
          const screenY = p.y + height / 2;
          const dx = mouse.x - screenX;
          const dy = mouse.y - screenY;
          const dist = Math.hypot(dx, dy);
          if (dist < 180 && dist > 10) {
            p.x += (dx / dist) * 0.8;
            p.y += (dy / dist) * 0.8;
          }
        }

        const proj = project3D(p.x, p.y, p.z);
        const screenX = proj.x + width / 2;
        const screenY = proj.y + height / 2;
        const radius = p.baseRadius * proj.scale;
        const alpha = Math.max(0.15, Math.min(0.85, 0.45 + p.z / 400));

        projectedParticles.push({
          x: screenX,
          y: screenY,
          z: p.z,
          r: radius,
          alpha,
          hue: p.hue,
        });

        // Draw particle
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${alpha})`;
        ctx.fill();
      });

      // Connect nearby particles with laser filaments
      for (let i = 0; i < projectedParticles.length; i++) {
        const p1 = projectedParticles[i];
        for (let j = i + 1; j < projectedParticles.length; j++) {
          const p2 = projectedParticles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 115) {
            const lineAlpha = (1 - dist / 115) * 0.22 * Math.min(p1.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${lineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();

            // Occasional signal pulse traveling along filament
            if ((i + j + Math.floor(time * 20)) % 120 === 0) {
              const pulseT = (time * 2) % 1;
              const px = p1.x + (p2.x - p1.x) * pulseT;
              const py = p1.y + (p2.y - p1.y) * pulseT;
              ctx.beginPath();
              ctx.arc(px, py, 1.8, 0, Math.PI * 2);
              ctx.fillStyle = '#ffedd5';
              ctx.fill();
            }
          }
        }
      }

      // Update & Draw 3D Floating Polyhedra
      polyhedra.forEach((poly) => {
        poly.rotX += poly.speedRotX;
        poly.rotY += poly.speedRotY;
        poly.rotZ += poly.speedRotZ;

        // Interactive mouse parallax drift
        const targetX = poly.x + (mouse.x - width / 2) * 0.03;
        const targetY = poly.y + (mouse.y - height / 2) * 0.03;

        if (poly.type === 'octahedron') {
          draw3DOctahedron(targetX, targetY, poly.size, poly.rotX, poly.rotY, poly.rotZ, poly.color);
        } else if (poly.type === 'gimbal') {
          draw3DGimbal(targetX, targetY, poly.size, poly.rotX, poly.rotY, poly.rotZ, poly.color);
        } else if (poly.type === 'cube') {
          draw3DOctahedron(targetX, targetY, poly.size * 0.8, poly.rotX, poly.rotY, poly.rotZ, poly.color);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-auto z-0 opacity-90"
    />
  );
};

// ─── 3D Tilt Card Component ─────────────────────────────────────────────
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 10,
  glowColor = 'rgba(245, 158, 11, 0.25)',
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    setTilt({ x: tiltX, y: tiltY });
    setGlowPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
      className={`relative transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(450px circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
};

// ─── EXACT 3D ANIMATED EMPLOYEE LIFE CINEMA THEATER ──────────────────────
// Exact storyline:
// 1. 11:00 AM: Arrives in formals wearing spectacles, entering modern campus
// 2. 11:30 AM - 02:00 PM: Coding on laptop till 2 PM, receiving a cup of hot coffee
// 3. 02:00 PM: Goes to lunch area with friends eating & laughing
// 4. 04:30 PM: Goes to cafeteria to self-brew a fresh cup of coffee
// 5. 08:00 PM: Office time out! Packs laptop with satisfaction, heading home
const ExactEmployeeLifeCinema: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const storyline = [
    {
      time: '11:00 AM',
      tag: 'SCENE 01 · SHARP ARRIVAL',
      title: 'Arrival in Formals & Spectacles',
      subtitle: 'Stepping into the high-energy campus with full ambition',
      desc: 'Dressed in crisp formals and wearing sleek spectacles, he arrives at 11:00 AM with his laptop bag, swipes in through the smart glass portal, and greets the team.',
      badge: '👔 FORMALS & SPECS',
      energy: '98% Focus',
      icon: Clock,
      sceneId: 'arrival',
    },
    {
      time: '11:30 AM – 02:00 PM',
      tag: 'SCENE 02 · DEEP FLOW & COFFEE',
      title: 'Deep Coding on Laptop & Hot Coffee Served',
      subtitle: 'Sub-100ms algorithms flow, hot espresso delivered to desk',
      desc: 'He opens his MacBook Pro, dives into production TypeScript & AI pipelines. As the clock nears 1:30 PM, a hot steaming cup of barista espresso arrives right at his desk.',
      badge: '💻 FLOW & HOT COFFEE',
      energy: '100% Flow State',
      icon: Laptop,
      sceneId: 'coding',
    },
    {
      time: '02:00 PM',
      tag: 'SCENE 03 · LUNCH & LAUGHTER',
      title: 'Gourmet Lunch & Laughing with Teammates',
      subtitle: 'Rooftop buffet lunch, sharing stories & loud laughter',
      desc: 'At 2:00 PM, he joins his close friends in the dining lounge for catered gourmet feasts, cracking jokes, laughing uncontrollably, and sharing weekend stories.',
      badge: '🍕 LAUGHING & BONDING',
      energy: '100% Camaraderie',
      icon: Utensils,
      sceneId: 'lunch',
    },
    {
      time: '04:30 PM',
      tag: 'SCENE 04 · SELF-BREW BREAK',
      title: 'Cafeteria Break & Self-Crafted Espresso',
      subtitle: 'Artisanal beans, fresh steam & afternoon recharge',
      desc: 'He heads over to the cafeteria espresso machine at 4:30 PM, selects roasted dark beans, and freshly brews an aromatic espresso to power his evening sprint.',
      badge: '☕ SELF-BREW ESPRESSO',
      energy: '96% Recharge',
      icon: Coffee,
      sceneId: 'brew',
    },
    {
      time: '08:00 PM',
      tag: 'SCENE 05 · OFFICE TIME OUT',
      title: 'Office Time Out & Victorious Wrap-Up',
      subtitle: '8 PM chime, packing up, high-fives & evening exit',
      desc: 'At 8:00 PM, the office bell chimes! He shuts his laptop with deep satisfaction, high-fives the late pod, and steps out under the sparkling night city lights.',
      badge: '🌙 8 PM OFFICE TIMEOUT',
      energy: '100% Accomplished 🎉',
      icon: Moon,
      sceneId: 'timeout',
    },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % storyline.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, storyline.length]);

  const current = storyline[activeStep];

  return (
    <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-stone-950/95 via-[#16120d]/95 to-stone-950/95 text-white border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 backdrop-blur-2xl overflow-hidden text-left">
      {/* Top Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-pulse" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs uppercase tracking-wider mb-2 backdrop-blur-md">
            <Activity size={14} className="text-amber-400 animate-pulse" />
            <span>3D CINEMATIC EMPLOYEE LIFE CHRONICLE</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            A Day in the Life: From 11 AM Formals to 8 PM Timeout
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 font-medium mt-1">
            Follow our engineer's authentic daily flow inside the Adyapan innovation campus.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-black text-amber-300 flex items-center gap-1.5 transition-all shadow-md"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause Loop' : 'Auto Play Story'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Dynamic Animated Vector Stage */}
        <div className="lg:col-span-7">
          <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-amber-500/40 p-6 sm:p-8 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between shadow-2xl">
            
            {/* Top Status Bar in Stage */}
            <div className="flex items-center justify-between text-xs relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-black text-amber-400 tracking-wider uppercase">
                  {current.time} · {current.badge}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40 shadow-sm">
                ⚡ {current.energy}
              </span>
            </div>

            {/* Middle Vector Illustrated Animated Stage */}
            <div className="my-auto py-6 flex flex-col items-center justify-center text-center relative z-10 min-h-[220px]">
              
              {/* Scene 1: 11:00 AM Formals + Spectacles Arrival */}
              {current.sceneId === 'arrival' && (
                <div className="relative w-full max-w-[340px] flex flex-col items-center justify-center animate-fadeIn">
                  {/* Digital Clock Banner */}
                  <div className="px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 font-mono text-xs font-black mb-3 animate-pulse">
                    ⏰ 11:00 AM · CAMPUS CHECK-IN
                  </div>

                  {/* Character Illustration */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 p-3 flex flex-col items-center justify-center shadow-2xl border-2 border-white/20">
                      {/* Spectacles / Glasses Icon representation */}
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-4 h-3 rounded-md border-2 border-stone-950 bg-amber-200/50" />
                        <div className="w-2 h-0.5 bg-stone-950" />
                        <div className="w-4 h-3 rounded-md border-2 border-stone-950 bg-amber-200/50" />
                      </div>
                      {/* Formal Tie & Collar */}
                      <div className="w-6 h-6 rounded-full bg-stone-950 flex items-center justify-center text-white text-[10px] font-bold">
                        👔
                      </div>
                    </div>
                    <span className="absolute -top-2 -right-2 text-2xl animate-bounce">💼</span>
                    <span className="absolute -bottom-1 -left-2 text-xl animate-pulse">✨</span>
                  </div>

                  <div className="mt-3 text-xs font-bold text-stone-200 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
                    👓 Spectacles On · Formal Blazer · Smart Door Swiped
                  </div>
                </div>
              )}

              {/* Scene 2: 11:30 AM - 02:00 PM Coding on Laptop & Hot Coffee Delivered */}
              {current.sceneId === 'coding' && (
                <div className="relative w-full max-w-[360px] flex flex-col items-center justify-center animate-fadeIn">
                  <div className="px-4 py-1 rounded-full bg-orange-500/20 border border-orange-500 text-orange-300 font-mono text-xs font-black mb-3 animate-pulse">
                    ⚡ 11:30 AM - 2:00 PM · DEEP SPRINT
                  </div>

                  <div className="w-full p-4 rounded-2xl bg-stone-900/90 border border-amber-500/40 font-mono text-left text-xs shadow-2xl space-y-1.5 relative">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[10px] text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="ml-1 font-bold text-amber-400">BuilderIDE.tsx</span>
                      </div>
                      <span className="text-emerald-400 font-bold">● LIVE COMPILE</span>
                    </div>

                    <p className="text-emerald-400 text-[11px] animate-pulse">const aiMatchingLatency = 0.04; // 40ms</p>
                    <p className="text-amber-300 text-[11px]">deployCandidatePipeline(candidate);</p>

                    {/* Steaming Coffee Cup Delivery Badge */}
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between bg-amber-500/10 p-2 rounded-xl border border-amber-500/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xl animate-bounce">☕</span>
                        <span className="text-[11px] font-extrabold text-amber-300">Hot Barista Coffee Served to Desk!</span>
                      </div>
                      <span className="text-xs text-amber-400 animate-ping">♨️</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Scene 3: 02:00 PM Lunch & Laughing with Friends */}
              {current.sceneId === 'lunch' && (
                <div className="relative w-full max-w-[340px] flex flex-col items-center justify-center animate-fadeIn">
                  <div className="px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 font-mono text-xs font-black mb-3 animate-pulse">
                    🍽️ 02:00 PM · ROOFTOP DINING LOUNGE
                  </div>

                  <div className="relative flex items-center justify-center gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-2 flex flex-col items-center justify-center shadow-xl">
                      <Utensils size={32} className="text-stone-950" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="px-3 py-1 rounded-xl bg-white text-stone-950 font-black text-xs shadow-lg animate-bounce">
                        💬 "Haha! Best deploy ever!" 😂
                      </div>
                      <div className="flex items-center gap-1 text-2xl">
                        <span>🥗</span>
                        <span>🍕</span>
                        <span>🥤</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs font-bold text-stone-200 bg-white/10 px-4 py-1.5 rounded-xl border border-white/15">
                    Dining with Teammates · Joyful Banter · Laughing Freely
                  </div>
                </div>
              )}

              {/* Scene 4: 04:30 PM Cafeteria Self-Brew Espresso */}
              {current.sceneId === 'brew' && (
                <div className="relative w-full max-w-[340px] flex flex-col items-center justify-center animate-fadeIn">
                  <div className="px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 font-mono text-xs font-black mb-3 animate-pulse">
                    ☕ 04:30 PM · ARTISANAL CAFETERIA
                  </div>

                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl animate-pulse" />
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-400 p-3 flex flex-col items-center justify-center shadow-2xl border border-white/20">
                      <Coffee size={40} className="text-stone-950 animate-bounce" />
                      <span className="text-[10px] font-black text-stone-950">FRESH BREW</span>
                    </div>
                    <span className="absolute -top-3 text-2xl animate-ping">♨️</span>
                    <span className="absolute -right-2 text-2xl animate-bounce">⚡</span>
                  </div>

                  <div className="mt-3 text-xs font-bold text-stone-200 bg-white/10 px-4 py-1.5 rounded-xl border border-white/15">
                    Freshly Ground Espresso · Self-Brewed Hot Cup · Afternoon Recharge
                  </div>
                </div>
              )}

              {/* Scene 5: 08:00 PM Office Time Out */}
              {current.sceneId === 'timeout' && (
                <div className="relative w-full max-w-[340px] flex flex-col items-center justify-center animate-fadeIn">
                  <div className="px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-mono text-xs font-black mb-3 animate-pulse">
                    🌙 08:00 PM · OFFICE WRAP-UP CHIME
                  </div>

                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-500/25 rounded-full blur-xl animate-pulse" />
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-400 p-3 flex flex-col items-center justify-center shadow-2xl border border-white/20">
                      <Moon size={40} className="text-stone-950" />
                      <span className="text-[10px] font-black text-stone-950">TIME OUT</span>
                    </div>
                    <span className="absolute -top-3 text-2xl animate-bounce">👋</span>
                    <span className="absolute -bottom-2 -right-2 text-2xl animate-ping">⭐</span>
                  </div>

                  <div className="mt-3 text-xs font-bold text-stone-200 bg-white/10 px-4 py-1.5 rounded-xl border border-white/15">
                    Laptop Closed · High-Fives to Late Pod · Heading Out Smiling
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Scene Info */}
            <div className="relative z-10 text-left pt-4 border-t border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                {current.tag}
              </span>
              <h4 className="text-lg sm:text-xl font-black text-white">{current.title}</h4>
              <p className="text-xs text-stone-300 font-medium mt-1 leading-relaxed">
                {current.desc}
              </p>
            </div>

          </div>
        </div>

        {/* Right Column: 5 Clickable Milestones */}
        <div className="lg:col-span-5 space-y-2.5">
          {storyline.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeStep === idx;
            return (
              <div
                key={item.time}
                onClick={() => {
                  setActiveStep(idx);
                  setIsPlaying(false);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-start gap-3.5 border ${
                  isActive
                    ? 'bg-amber-500/25 border-amber-500 shadow-xl scale-[1.02]'
                    : 'bg-white/5 border-white/10 hover:border-amber-500/40 hover:bg-white/10'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs ${
                    isActive ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-white/10 text-amber-400'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                      {item.time}
                    </span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-white/10 text-stone-300">
                      {item.badge}
                    </span>
                  </div>
                  <h5 className="text-xs sm:text-sm font-black text-white truncate mt-0.5">{item.title}</h5>
                  <p className="text-[11px] text-stone-400 truncate mt-0.5 font-medium">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN LIFE AT ADYAPAN PAGE COMPONENT ──────────────────────────────────
const LifeAtAdyapan: React.FC = () => {
  useScrollReveal();

  const [activeGalleryFilter, setActiveGalleryFilter] = useState<'all' | 'innovation' | 'sports' | 'party' | 'mentorship'>('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<number | null>(null);
  const [selectedHeroVibe, setSelectedHeroVibe] = useState<number>(0);

  const culturePillars = [
    {
      icon: Flame,
      title: 'High-Impact Innovation Sprints',
      tag: '01 · VELOCITY',
      desc: '48-hour adrenaline sprints where cross-functional pods build live AI tools, competing for ₹5,00,000 in grand prizes and instant production deployment.',
      glow: 'rgba(245, 158, 11, 0.45)',
      stat: '₹5L Innovation Pools',
      image: adyapanTeam,
    },
    {
      icon: Trophy,
      title: 'Fun Time Playing Cricket & Sports',
      tag: '02 · ENERGY',
      desc: 'Enjoying fun times playing cricket with teammates, annual Adyapan Premier League matches, and weekly fitness challenges. High performance begins with high physical energy.',
      glow: 'rgba(249, 115, 22, 0.45)',
      stat: 'APL Cricket Fun',
      image: cricketImage,
    },
    {
      icon: PartyPopper,
      title: 'Party Celebrations & Retreats',
      tag: '03 · HAPPINESS',
      desc: 'From spontaneous Friday rooftop BBQ party celebrations and DJ nights to annual company retreats in Goa and Himachal, we believe the best work happens when we celebrate big.',
      glow: 'rgba(234, 88, 12, 0.45)',
      stat: 'Party Celebrations & Trips',
      image: partyImage,
    },
    {
      icon: GraduationCap,
      title: 'Radical Upskilling & Mentorship',
      tag: '04 · MASTERY',
      desc: '₹1,00,000 annual continuous education stipend for every team member. Direct 1-on-1 mentorship circles led by FAANG leaders and startup founders.',
      glow: 'rgba(245, 158, 11, 0.45)',
      stat: '₹1L Learning Pass',
      image: mentorshipImage,
    },
  ];

  const perksBento = [
    {
      icon: Laptop,
      title: 'Top-Tier M3 Max Gear',
      desc: 'Custom Apple M3 Max MacBook Pros, 4K dual monitors, and ergonomic setups for peak engineering flow.',
      badge: 'HARDWARE',
    },
    {
      icon: GraduationCap,
      title: 'Unlimited Learning Pass',
      desc: 'Buy any technical book, book international AI conference passes, or take masterclasses with zero approval bureaucracy.',
      badge: 'UPSKILLING',
    },
    {
      icon: Heart,
      title: 'Comprehensive Health Cover',
      desc: '100% premium coverage for employee, spouse, and parents with mental wellness and dental insurance included.',
      badge: 'WELLNESS',
    },
    {
      icon: Zap,
      title: 'High-Impact ESOPs',
      desc: 'Every full-time team member owns equity in Adyapan. When we grow exponentially, you generate life-changing wealth.',
      badge: 'OWNERSHIP',
    },
    {
      icon: Compass,
      title: 'Hybrid Agility & Recharges',
      desc: 'Flexible work schedules, generous paid vacations, and mandatory unplug weeks to prevent burnout.',
      badge: 'FLEXIBILITY',
    },
    {
      icon: Coffee,
      title: 'Gourmet Fuel & Snacks',
      desc: 'Barista-grade coffee machine, catered healthy lunch buffets, and unlimited artisanal snacks in the kitchen.',
      badge: 'PANTRY',
    },
  ];

  const employeeStories = [
    {
      name: 'Poojitha',
      role: 'Lead Talent Operations',
      badge: '500+ PARTNERS BUILT',
      salaryGrowth: '2.8x Package Boost',
      image: managementTeam,
      quote:
        'The culture of empathy and radical ownership is real. Everyone here is supported like an owner, and our candidate milestones are celebrated with genuine joy across the entire team.',
    },
    {
      name: 'Rupesh',
      role: 'Head of Technology & AI',
      badge: 'PROMOTED IN 8 MONTHS',
      salaryGrowth: '3.4x Package Boost',
      image: techTeam,
      quote:
        'At Adyapan, there is zero red tape. We pitch new AI matching models and scalable algorithms, and by the weekend they are deployed in production evaluating thousands of applications.',
    },
    {
      name: 'Harshitha',
      role: 'Senior Full-Stack AI Engineer',
      badge: 'FAST-TRACK PROMOTION',
      salaryGrowth: '3.2x Package Boost',
      image: cultureTeamProfessional,
      quote:
        'Joining Adyapan accelerated my career beyond expectations. The 1-on-1 mentorship and high-velocity engineering transformed my technical leadership in just months.',
    },
  ];

  const galleryItems = [
    { src: adyapanTeam, category: 'innovation', title: 'Adyapan Engineering & Innovation Sprint', tag: 'Innovation' },
    { src: cricketImage, category: 'sports', title: 'Fun Time Playing Cricket & APL Championship', tag: 'Sports Energy' },
    { src: partyImage, category: 'party', title: 'Party Celebrations, DJ Nights & Rooftop Gala', tag: 'Party Celebration' },
    { src: mentorshipImage, category: 'mentorship', title: '1-on-1 Leadership & Apprenticeship Circle', tag: 'Mentorship' },
    { src: studentCommunityImage, category: 'innovation', title: '1M+ Learner Community Convocation', tag: 'Community' },
    { src: aboutHeroOffice, category: 'mentorship', title: 'Modern Collaborative Creative Hub', tag: 'Workplace' },
  ];

  const filteredGallery =
    activeGalleryFilter === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeGalleryFilter);

  const archetypes = [
    {
      title: '⚡ The 10x Velocity Architect',
      desc: 'You obsess over code performance, sub-100ms APIs, and shipping bold AI systems without hesitation.',
      match: 'Recommended: Core AI & Backend Pod',
    },
    {
      title: '🧬 The Neural Systems Pioneer',
      desc: 'You love LLM fine-tuning, deterministic matching weights, and extracting actionable truth from unstructured data.',
      match: 'Recommended: AI Labs Division',
    },
    {
      title: '❤️ The Empathy Growth Catalyst',
      desc: 'You are energized by mentoring learners, building deep relationships, and connecting talent with top recruiters.',
      match: 'Recommended: Talent Operations & Mentorship Pod',
    },
  ];

  return (
    <SiteShell>
      <main className="relative min-h-screen overflow-x-hidden bg-[#faf7f2] dark:bg-[#0c0b0a] text-stone-900 dark:text-stone-100 selection:bg-amber-500 selection:text-white transition-colors duration-300 font-sans">
        
        {/* ══════════════════════════════════════════════════════════
            UNIQUE 3D SPATIAL CULTURE & HOLOGRAPHIC POLYHEDRA CANVAS BACKGROUND
           ══════════════════════════════════════════════════════════ */}
        <Spatial3DCultureCanvas />

        {/* ══════════════════════════════════════════════════════════
            1. CINEMATIC 3D HOLOGRAPHIC CULTURE NEXUS HERO STAGE
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 pt-8 sm:pt-14 pb-10 sm:pb-16 bg-transparent overflow-hidden border-b border-stone-200/60 dark:border-stone-800">
          
          {/* Full-Cover Background Image of Adyapan Culture & Collaboration Campus - Clearly Visible & Vibrant */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <img
              src={lifeAtAdyapanHeroBg}
              alt="Adyapan Culture & Innovation Hub Atmosphere"
              className="w-full h-full object-cover object-center opacity-95 dark:opacity-80 brightness-100 contrast-105 saturate-110 transition-opacity duration-500"
            />
            {/* Subtle, soft readability gradient that preserves background image clarity and vibrancy */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#faf7f2]/25 via-transparent to-[#faf7f2]/80 dark:from-[#0c0b0a]/35 dark:via-transparent dark:to-[#0c0b0a]/85" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#faf7f2]/20 via-transparent to-[#faf7f2]/20 dark:from-[#0c0b0a]/25 dark:via-transparent dark:to-[#0c0b0a]/25" />
          </div>

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            
            {/* Top Kinetic Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/35 text-amber-800 dark:text-amber-300 font-extrabold text-xs uppercase tracking-widest mb-4 backdrop-blur-md shadow-xs" data-reveal="up">
              <Sparkles size={14} className="text-amber-500 fill-amber-500" />
              <span>THE ADYAPAN CULTURE &amp; ENERGY NEXUS</span>
            </div>

            {/* Bold Eye-Catching Center Headline with Enhanced Readability Shadow */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] text-stone-950 dark:text-white max-w-4xl mx-auto drop-shadow-[0_2px_10px_rgba(255,255,255,0.7)] dark:drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]" data-reveal="up">
              Where Bold Ambition <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
                Meets Unstoppable Energy.
              </span>
            </h1>

            <div className="mt-3 sm:mt-4 max-w-2xl mx-auto" data-reveal="up">
              <p className="text-xs sm:text-base text-stone-800 dark:text-stone-200 font-semibold leading-relaxed bg-[#faf7f2]/75 dark:bg-[#0c0b0a]/75 backdrop-blur-sm px-5 py-2 rounded-2xl inline-block border border-stone-200/50 dark:border-stone-800/50 shadow-xs">
                We aren't just writing AI algorithms and accelerating careers. We are creating an electric workplace where every engineer, mentor, and builder thrives with radical autonomy.
              </p>
            </div>

            {/* Interactive Culture Vibe Switcher Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 my-6 sm:my-8" data-reveal="up">
              {[
                { id: 0, label: '⚡ Innovation Sprints', title: 'Adyapan Engineering & Innovation Sprint', subtitle: '48-hour adrenaline code sprints with ₹5 Lakh prize pool', image: adyapanTeam, badge: '₹5L PRIZE POOL' },
                { id: 1, label: '🏏 Fun Time Playing Cricket', title: 'Fun Time Playing Cricket & Sports', subtitle: 'Energetic turf cricket matches, friendly team banter & sports fun', image: cricketImage, badge: 'APL CRICKET FUN' },
                { id: 2, label: '🎉 Party Celebrations', title: 'Party Celebrations & Milestone Galas', subtitle: 'Celebrating our wins with rooftop DJ parties and all-hands trips', image: partyImage, badge: 'PARTY CELEBRATIONS' },
                { id: 3, label: '🚀 FAANG Mentorship', title: '1-on-1 Apprenticeship & Growth', subtitle: 'Personalized masterclasses with ₹30+ LPA target compensation', image: mentorshipImage, badge: '₹1L LEARNING PASS' },
              ].map((vibe) => (
                <button
                  key={vibe.id}
                  onClick={() => setSelectedHeroVibe(vibe.id)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 flex items-center gap-2 border ${
                    selectedHeroVibe === vibe.id
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-lg shadow-amber-500/25 scale-105'
                      : 'bg-white/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <span>{vibe.label}</span>
                </button>
              ))}
            </div>

            {/* 3D Spatial Fan Carousel (3 Layered 3D Perspective Cards) */}
            <div className="relative py-4 sm:py-6 max-w-5xl mx-auto" data-reveal="up">
              
              {/* Floating 3D Holographic Badges around the Cards */}
              <div className="hidden lg:flex absolute -left-6 top-1/4 z-30 px-4 py-2 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-amber-500/40 shadow-xl items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400 animate-bounce">
                <Flame size={16} className="text-amber-500" />
                <span>Zero Red Tape</span>
              </div>

              <div className="hidden lg:flex absolute -right-6 top-1/3 z-30 px-4 py-2 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-emerald-500/40 shadow-xl items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 animate-bounce" style={{ animationDelay: '1s' }}>
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>2.8x Career Velocity</span>
              </div>

              <div className="hidden lg:flex absolute left-12 bottom-6 z-30 px-4 py-2 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-orange-500/40 shadow-xl items-center gap-2 text-xs font-black text-orange-600 dark:text-orange-400 animate-bounce" style={{ animationDelay: '2s' }}>
                <Coffee size={16} className="text-orange-500" />
                <span>Unlimited Barista Fuel</span>
              </div>

              {/* Main Featured 3D Showcase Frame */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Flanking Card Left (Clickable to switch) */}
                <div
                  onClick={() => setSelectedHeroVibe((selectedHeroVibe + 3) % 4)}
                  className="hidden md:block md:col-span-3 transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer opacity-75 hover:opacity-100"
                >
                  <div className="rounded-3xl overflow-hidden shadow-xl border-2 border-stone-200 dark:border-stone-800 bg-stone-900 h-[260px] relative group">
                    <img
                      src={
                        selectedHeroVibe === 0 ? cricketImage :
                        selectedHeroVibe === 1 ? partyImage :
                        selectedHeroVibe === 2 ? mentorshipImage : adyapanTeam
                      }
                      alt="Culture Preview"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-3 inset-x-3 text-[11px] font-bold text-white text-left truncate">
                      👈 Click to Shift View
                    </span>
                  </div>
                </div>

                {/* Central Featured 3D Spotlight Card */}
                <div className="col-span-1 md:col-span-6 z-20">
                  <TiltCard maxTilt={10} className="w-full">
                    <div className="relative rounded-3xl overflow-hidden bg-stone-950 border-2 border-amber-500 shadow-2xl shadow-amber-500/25 p-3 group">
                      <div className="relative rounded-2xl overflow-hidden h-[300px] sm:h-[360px]">
                        <img
                          src={
                            selectedHeroVibe === 0 ? adyapanTeam :
                            selectedHeroVibe === 1 ? cricketImage :
                            selectedHeroVibe === 2 ? partyImage : mentorshipImage
                          }
                          alt="Active Vibe Showcase"
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                          <span className="px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/50 text-amber-400 text-xs font-black uppercase tracking-wider shadow-lg">
                            {
                              selectedHeroVibe === 0 ? '🏆 ₹5L PRIZE POOL' :
                              selectedHeroVibe === 1 ? '🏏 APL CRICKET FUN' :
                              selectedHeroVibe === 2 ? '🎉 PARTY CELEBRATIONS' : '🚀 ₹1L LEARNING PASS'
                            }
                          </span>
                          <span className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shadow-lg">
                            ⚡
                          </span>
                        </div>

                        {/* Bottom Overlay Info */}
                        <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-left text-white space-y-1">
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                            LIVE CULTURE SPOTLIGHT
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-white">
                            {
                              selectedHeroVibe === 0 ? 'Adyapan Engineering & Innovation Sprint' :
                              selectedHeroVibe === 1 ? 'Fun Time Playing Cricket & Sports' :
                              selectedHeroVibe === 2 ? 'Party Celebrations & Milestone Galas' : '1-on-1 Direct Leadership Apprenticeship'
                            }
                          </h3>
                          <p className="text-xs text-stone-300 font-medium">
                            {
                              selectedHeroVibe === 0 ? '48-hour sprints shipping deterministic AI candidate evaluation tools.' :
                              selectedHeroVibe === 1 ? 'High physical energy, team synergy & fun cricket matches on turf.' :
                              selectedHeroVibe === 2 ? 'Spontaneous rooftop DJ parties, celebrations, and annual company retreats.' : 'Personalized technical roadmaps to accelerate top compensation.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </div>

                {/* Flanking Card Right (Clickable to switch) */}
                <div
                  onClick={() => setSelectedHeroVibe((selectedHeroVibe + 1) % 4)}
                  className="hidden md:block md:col-span-3 transform rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer opacity-75 hover:opacity-100"
                >
                  <div className="rounded-3xl overflow-hidden shadow-xl border-2 border-stone-200 dark:border-stone-800 bg-stone-900 h-[260px] relative group">
                    <img
                      src={
                        selectedHeroVibe === 0 ? partyImage :
                        selectedHeroVibe === 1 ? mentorshipImage :
                        selectedHeroVibe === 2 ? adyapanTeam : cricketImage
                      }
                      alt="Culture Preview"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-3 inset-x-3 text-[11px] font-bold text-white text-right truncate">
                      Click to Shift View 👉
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4" data-reveal="up">
              <Link
                to="/open-positions"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-black text-stone-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
              >
                <span>View All Open Positions (25+ Roles)</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/contact-us"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-200 bg-white/80 dark:bg-stone-900/80 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 shadow-md backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
              >
                <span>Get in Touch</span>
              </Link>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            2. THE 4 CORE LIFE DIMENSIONS (3D TILT CARDS WITH ANIMATED PICS & OVERLAID TEXT)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 bg-transparent border-b border-stone-200/50 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2 backdrop-blur-md">
                <Flame size={14} className="text-amber-500" />
                <span>ENERGY ARCHITECTURE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight">
                The Four Dimensions of <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Life at Adyapan.
                </span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-2 font-medium">
                We craft an environment where high autonomy meets joyful, authentic celebration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {culturePillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <TiltCard key={pillar.title} maxTilt={10} glowColor={pillar.glow} className="h-full">
                    <div
                      data-reveal="up"
                      data-delay={idx * 100}
                      className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-stone-200/80 dark:border-stone-800 hover:border-amber-500/80 group h-[420px] sm:h-[450px] flex flex-col justify-between text-left transition-all duration-500 bg-stone-950"
                    >
                      {/* Background Picture with animated zoom and dark gradient overlay */}
                      <img
                        src={pillar.image}
                        alt={pillar.title}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/75 to-black/35 pointer-events-none" />

                      {/* Top Floating Badges */}
                      <div className="relative z-10 p-5 flex items-center justify-between">
                        <div className="w-11 h-11 rounded-2xl bg-black/60 backdrop-blur-md text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-lg group-hover:scale-110 transition-transform">
                          <IconComponent size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/40 shadow-lg">
                          {pillar.stat}
                        </span>
                      </div>

                      {/* Overlaid Bottom Content in Frosted Glass */}
                      <div className="relative z-10 p-5 m-3 rounded-2xl bg-black/65 backdrop-blur-xl border border-white/15 space-y-1.5 shadow-2xl group-hover:border-amber-500/50 transition-colors">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                          {pillar.tag}
                        </span>

                        <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                          {pillar.title}
                        </h3>

                        <p className="text-xs text-stone-300 leading-relaxed font-medium line-clamp-3">
                          {pillar.desc}
                        </p>

                        <Link
                          to="/open-positions"
                          className="pt-2.5 mt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group/btn cursor-pointer"
                        >
                          <span className="group-hover/btn:underline">Experience Velocity</span>
                          <ChevronRight size={15} className="group-hover:translate-x-1 group-hover/btn:translate-x-1.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            4. PERKS & SUPERPOWERS MATRIX (3D BENTO GRID)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 bg-transparent border-b border-stone-200/50 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2 backdrop-blur-md">
                <Sparkles size={14} className="text-amber-500" />
                <span>BUILDER SUPERPOWERS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight">
                Crafted For Peak Performance <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  &amp; Holistic Well-Being.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {perksBento.map((perk, idx) => {
                const Icon = perk.icon;
                return (
                  <TiltCard key={perk.title} maxTilt={8} className="h-full">
                    <div
                      data-reveal="up"
                      data-delay={idx * 70}
                      className="p-6 sm:p-7 rounded-3xl bg-white/85 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 shadow-lg text-left flex flex-col justify-between h-full transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Icon size={20} />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500 px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800">
                            {perk.badge}
                          </span>
                        </div>

                        <h4 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white mb-1.5">
                          {perk.title}
                        </h4>

                        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                          {perk.desc}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>Available Day 1 for All Roles</span>
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            5. "VOICES OF ADYAPAN BUILDERS" (TESTIMONIAL CAROUSEL)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 bg-transparent border-b border-stone-200/50 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2 backdrop-blur-md">
                <UsersRound size={14} className="text-amber-500" />
                <span>BUILDER STORIES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight">
                Authentic Journeys. <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Exponential Career Growth.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {employeeStories.map((story, idx) => (
                <TiltCard key={story.name} maxTilt={10} className="h-full">
                  <div
                    data-reveal="up"
                    data-delay={idx * 100}
                    className="p-6 sm:p-7 rounded-3xl bg-white/85 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 shadow-xl text-left flex flex-col justify-between h-full transition-all"
                  >
                    <div>
                      {/* Top Row: Avatar and Growth Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={story.image}
                            alt={story.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                          />
                          <div>
                            <h4 className="text-sm font-black text-stone-900 dark:text-white">{story.name}</h4>
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">{story.role}</span>
                          </div>
                        </div>
                      </div>

                      <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20 mb-3">
                        ⚡ {story.salaryGrowth}
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium italic">
                        "{story.quote}"
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-stone-400">{story.badge}</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            6. 3D PHOTO MOSAIC & FILTERABLE GALLERY
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 bg-transparent border-b border-stone-200/50 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4" data-reveal="up">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2 backdrop-blur-md">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>LIFE GALLERY</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight">
                  Memories &amp; <br />
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    Unstoppable Moments.
                  </span>
                </h2>
              </div>

              {/* Gallery Filter Chips */}
              <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'innovation', label: 'Innovation' },
                  { id: 'sports', label: 'Sports & Cricket' },
                  { id: 'party', label: 'Celebrations' },
                  { id: 'mentorship', label: 'Mentorship' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveGalleryFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeGalleryFilter === f.id
                        ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGallery.map((item, idx) => (
                <TiltCard key={item.title} maxTilt={10} className="h-[260px] sm:h-[300px]">
                  <div
                    onClick={() => setLightboxImage(item.src)}
                    className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl border border-stone-200/80 dark:border-stone-800 group bg-stone-950 cursor-pointer"
                  >
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    
                    <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold uppercase">
                      {item.tag}
                    </span>

                    <div className="absolute bottom-0 inset-x-0 p-4 space-y-1 text-left text-white">
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            7. "DISCOVER YOUR ADYAPAN PERSONA" (INTERACTIVE ARCHETYPE SCANNER)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 bg-transparent border-b border-stone-200/50 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-stone-950 via-[#14100c] to-stone-950 text-white border-2 border-amber-500/40 shadow-2xl overflow-hidden text-left">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-3xl mb-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs uppercase tracking-wider mb-2">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>INTERACTIVE CULTURE MATCH SCANNER</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  What Type of Builder Are You?
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 font-medium mt-1">
                  Click an archetype below to see how your superpowers align with Adyapan teams:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {archetypes.map((arch, idx) => (
                  <button
                    key={arch.title}
                    onClick={() => setSelectedPersona(idx)}
                    className={`p-5 rounded-2xl text-left transition-all border ${
                      selectedPersona === idx
                        ? 'bg-amber-500/25 border-amber-500 shadow-xl scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:border-amber-500/40 text-stone-300'
                    }`}
                  >
                    <h4 className="text-base font-black text-white">{arch.title}</h4>
                    <p className="text-xs text-stone-300 mt-2 leading-relaxed">{arch.desc}</p>
                    <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-black text-amber-400">
                      {arch.match}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-stone-400 font-semibold">
                  Ready to apply your superpowers? We are hiring across all technical and operations roles!
                </span>
                <Link
                  to="/open-positions"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-black text-stone-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>View Matching Open Roles</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* ══════════════════════════════════════════════════════════
            7.5 EXACT 3D ANIMATED EMPLOYEE LIFE CHRONICLE (AT THE END OF PAGE)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 bg-transparent border-b border-stone-200/50 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <ExactEmployeeLifeCinema />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            8. FUTURISTIC CALL-TO-ACTION (CTA)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-6 sm:py-8 bg-transparent">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <div
              data-reveal="up"
              className="relative p-6 sm:p-8 lg:p-10 rounded-3xl bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#fb923c] text-stone-950 shadow-xl shadow-orange-500/15 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 text-left"
            >
              {/* Subtle Ambient Depth Lighting */}
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

              {/* Giant Background 3D Watermark Text - Positioned near logo disc with distinct separation (never touching) */}
              <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none select-none z-0 pr-8 sm:pr-12 lg:pr-[265px] xl:pr-[300px]">
                <span className="text-white/[0.09] dark:text-white/[0.07] font-black text-[50px] sm:text-[85px] md:text-[115px] lg:text-[135px] xl:text-[155px] uppercase tracking-tight leading-none whitespace-nowrap drop-shadow-sm">
                  ADYAPAN
                </span>
              </div>

              {/* Left Column: Heading, Narrative & Action Buttons */}
              <div className="relative z-10 max-w-xl xl:max-w-2xl space-y-3 sm:space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/15 text-stone-950 font-black text-[11px] uppercase tracking-wider backdrop-blur-md shadow-xs">
                  <Flame size={13} className="text-stone-950 fill-stone-950" />
                  <span>START YOUR ADYAPAN ADVENTURE</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 tracking-tight leading-tight">
                  Your Runway To Build <br />
                  Starts Right Here.
                </h2>

                <p className="text-stone-950/90 text-xs sm:text-sm font-semibold leading-relaxed max-w-lg">
                  Whether you are an engineer pushing AI limits, a mentor accelerating student careers, or an operator executing with speed—find your place at Adyapan.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/open-positions"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-black text-white bg-stone-950 hover:bg-stone-900 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>View All Open Positions</span>
                    <ArrowRight size={14} />
                  </Link>

                  <Link
                    to="/contact-us"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold text-stone-950 bg-white/35 hover:bg-white/50 border border-black/10 backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Get in Touch</span>
                  </Link>
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

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={lightboxImage}
                alt="Enlarged Life Moment"
                className="w-full h-auto max-h-[85vh] object-contain rounded-3xl border-2 border-amber-500 shadow-2xl"
              />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center border border-white/20 hover:bg-amber-500 hover:text-stone-950 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

      </main>
    </SiteShell>
  );
};

export default LifeAtAdyapan;

