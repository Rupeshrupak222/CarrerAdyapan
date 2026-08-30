import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  UsersRound,
  Heart,
  CheckCircle2,
  BriefcaseBusiness,
  Globe2,
  Cpu,
  Zap,
  Award,
  ShieldCheck,
  Rocket,
  Compass,
  Layers,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Target,
  Code2,
  TrendingUp,
  Flame,
  Star,
  Activity,
  PartyPopper,
  FileCheck,
  Building,
} from 'lucide-react';
import SiteShell from '../components/layout/SiteShell';
import { useScrollReveal } from '../hooks/useScrollReveal';

// Assets
import aboutHeroOffice from '../assets/about-hero-office-reference.jpg';
import techTeam from '../assets/tech-team-hd-production.webp';
import nonTechTeam from '../assets/non-tech-team-hd-production.webp';
import managementTeam from '../assets/management-hr-team-hd-production.webp';
import teamCultureImage from '../assets/culture-team-professional.jpg';
import teamAvif from '../assets/team.avif';
import adyapanTeam from '../assets/adyapan-team.jpg';
import foundersImage from '../assets/Founders.jpeg';
import mentorshipImage from '../assets/adyapan-mentorship.png';
import studentCommunityImage from '../assets/largest-student-community.jpeg';
import cricketImage from '../assets/cricket.jpg';
import partyImage from '../assets/party.jpeg';
import adyapanLogo from '../assets/adyapan-logo.png';
import adyapanCampusHeroBg from '../assets/adyapan-campus-hero-bg.jpg';
import adyapanStoryStudioBg from '../assets/adyapan-story-studio-bg.jpg';
import realEmployeeAvatar from '../assets/real-employee-avatar.jpg';
import realEmployeeJoyAvatar from '../assets/real-employee-joy-avatar.jpg';

// ─── Ultra-Vibrant 3D Perspective Wave & Geometric Canvas ──────────────────
const HighImpact3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
    let currentMouseX = width / 2;
    let currentMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Polyhedron (Octahedron vertices)
    const octaVertices = [
      [0, 1, 0], [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1], [0, -1, 0],
    ];
    const octaEdges = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [5, 1], [5, 2], [5, 3], [5, 4],
      [1, 2], [2, 3], [3, 4], [4, 1],
    ];

    // 3D Cube vertices
    const cubeVertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
    ];
    const cubeEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    // 3D Icosahedron Vertices
    const phi = (1 + Math.sqrt(5)) / 2;
    const icoVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
    ];
    const icoEdges = [
      [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
      [1, 5], [5, 11], [11, 10], [10, 7], [7, 1],
      [3, 9], [3, 4], [3, 2], [3, 6], [3, 8],
      [4, 9], [9, 8], [8, 6], [6, 2], [2, 4],
      [4, 5], [5, 9], [9, 1], [1, 8], [8, 7],
      [7, 6], [6, 10], [10, 2], [2, 11], [11, 4],
    ];

    const floaters = [
      { type: 'ico', x: width * 0.88, y: height * 0.18, size: 80, rx: 0.2, ry: 0.3, rz: 0.1, speedX: 0.009, speedY: 0.013, speedZ: 0.006, color: '#f59e0b' },
      { type: 'gyro', x: width * 0.12, y: height * 0.38, size: 95, rx: 0.4, ry: 0.2, rz: 0.3, speedX: 0.007, speedY: 0.011, speedZ: 0.008, color: '#f97316' },
      { type: 'cube', x: width * 0.86, y: height * 0.58, size: 75, rx: 0.1, ry: 0.4, rz: 0.2, speedX: 0.012, speedY: 0.008, speedZ: 0.014, color: '#ffa800' },
      { type: 'ico', x: width * 0.14, y: height * 0.78, size: 70, rx: 0.3, ry: 0.1, rz: 0.4, speedX: 0.008, speedY: 0.015, speedZ: 0.007, color: '#f59e0b' },
      { type: 'gyro', x: width * 0.90, y: height * 0.85, size: 85, rx: 0.2, ry: 0.3, rz: 0.1, speedX: 0.009, speedY: 0.01, speedZ: 0.008, color: '#ea580c' },
      { type: 'octa', x: width * 0.06, y: height * 0.12, size: 60, rx: 0.1, ry: 0.2, rz: 0.3, speedX: 0.01, speedY: 0.01, speedZ: 0.008, color: '#fbbf24' },
      { type: 'cube', x: width * 0.50, y: height * 0.08, size: 50, rx: 0.2, ry: 0.1, rz: 0.3, speedX: 0.008, speedY: 0.012, speedZ: 0.005, color: '#f59e0b' },
    ];

    const particleCount = 65;
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      color: string;
    }> = [];

    const pColors = ['#f59e0b', '#fbbf24', '#f97316', '#ffa800', '#ea580c'];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 400 + 100,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        radius: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.6 + 0.25,
        color: pColors[Math.floor(Math.random() * pColors.length)],
      });
    }

    const gridRows = 20;
    const gridCols = 28;
    const gridSpacing = 60;

    let time = 0;

    const rotate3D = (x: number, y: number, z: number, rx: number, ry: number, rz: number) => {
      let y1 = y * Math.cos(rx) - z * Math.sin(rx);
      let z1 = y * Math.sin(rx) + z * Math.cos(rx);
      let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
      let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
      let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
      return [x3, y3, z2];
    };

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;
      const mouseFactorX = (currentMouseX / width - 0.5) * 2;
      const mouseFactorY = (currentMouseY / height - 0.5) * 2;

      // 3D Perspective Wave Grid
      const fov = 380;
      const gridOriginX = width / 2;
      const gridOriginY = height * 0.70;

      ctx.save();
      for (let r = 0; r < gridRows; r++) {
        ctx.beginPath();
        for (let c = 0; c <= gridCols; c++) {
          const worldX = (c - gridCols / 2) * gridSpacing + mouseFactorX * 45;
          const worldZ = r * gridSpacing + 100;
          const waveHeight =
            Math.sin(c * 0.4 + time * 1.8) * 26 * Math.cos(r * 0.3 + time) +
            Math.cos((c + r) * 0.25 + time) * 18;
          const worldY = 150 + waveHeight + mouseFactorY * 35;

          const scale = fov / (fov + worldZ);
          const projX = gridOriginX + worldX * scale;
          const projY = gridOriginY + worldY * scale;

          if (c === 0) {
            ctx.moveTo(projX, projY);
          } else {
            ctx.lineTo(projX, projY);
          }

          if (r % 2 === 0 && c % 2 === 0 && r < gridRows - 2) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(projX, projY, Math.max(1.2, 3.2 * scale), 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.globalAlpha = Math.max(0.08, 0.65 * scale);
            ctx.shadowColor = '#ffa800';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.restore();
          }
        }
        const depthAlpha = Math.max(0.05, (1 - r / gridRows) * 0.35);
        ctx.strokeStyle = `rgba(245, 158, 11, ${depthAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      for (let c = 0; c <= gridCols; c += 2) {
        ctx.beginPath();
        for (let r = 0; r < gridRows; r++) {
          const worldX = (c - gridCols / 2) * gridSpacing + mouseFactorX * 45;
          const worldZ = r * gridSpacing + 100;
          const waveHeight =
            Math.sin(c * 0.4 + time * 1.8) * 26 * Math.cos(r * 0.3 + time) +
            Math.cos((c + r) * 0.25 + time) * 18;
          const worldY = 150 + waveHeight + mouseFactorY * 35;

          const scale = fov / (fov + worldZ);
          const projX = gridOriginX + worldX * scale;
          const projY = gridOriginY + worldY * scale;

          if (r === 0) {
            ctx.moveTo(projX, projY);
          } else {
            ctx.lineTo(projX, projY);
          }
        }
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.22)';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }
      ctx.restore();

      // Floating 3D Geometric Crystals
      floaters.forEach((obj) => {
        obj.rx += obj.speedX;
        obj.ry += obj.speedY;
        obj.rz += obj.speedZ;

        const posX = obj.x + Math.sin(time * 1.2 + obj.x) * 20 - mouseFactorX * 28;
        const posY = obj.y + Math.cos(time * 1.2 + obj.y) * 20 - mouseFactorY * 28;

        if (obj.type === 'ico') {
          const projected = icoVertices.map(([x, y, z]) => {
            const [rx, ry, rz] = rotate3D(x * (obj.size * 0.4), y * (obj.size * 0.4), z * (obj.size * 0.4), obj.rx, obj.ry, obj.rz);
            return [posX + rx, posY + ry, rz];
          });

          ctx.beginPath();
          icoEdges.forEach(([i, j]) => {
            ctx.moveTo(projected[i][0], projected[i][1]);
            ctx.lineTo(projected[j][0], projected[j][1]);
          });
          ctx.strokeStyle = obj.color;
          ctx.globalAlpha = 0.55;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = obj.color;
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;

          projected.forEach(([px, py]) => {
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = obj.color;
            ctx.globalAlpha = 0.85;
            ctx.fill();
          });
        } else if (obj.type === 'octa') {
          const projected = octaVertices.map(([x, y, z]) => {
            const [rx, ry, rz] = rotate3D(x * obj.size, y * obj.size, z * obj.size, obj.rx, obj.ry, obj.rz);
            return [posX + rx, posY + ry, rz];
          });

          ctx.beginPath();
          octaEdges.forEach(([i, j]) => {
            ctx.moveTo(projected[i][0], projected[i][1]);
            ctx.lineTo(projected[j][0], projected[j][1]);
          });
          ctx.strokeStyle = obj.color;
          ctx.globalAlpha = 0.52;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          projected.forEach(([px, py]) => {
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = obj.color;
            ctx.globalAlpha = 0.8;
            ctx.fill();
          });
        } else if (obj.type === 'cube') {
          const projected = cubeVertices.map(([x, y, z]) => {
            const [rx, ry, rz] = rotate3D(x * (obj.size * 0.6), y * (obj.size * 0.6), z * (obj.size * 0.6), obj.rx, obj.ry, obj.rz);
            return [posX + rx, posY + ry, rz];
          });

          ctx.beginPath();
          cubeEdges.forEach(([i, j]) => {
            ctx.moveTo(projected[i][0], projected[i][1]);
            ctx.lineTo(projected[j][0], projected[j][1]);
          });
          ctx.strokeStyle = obj.color;
          ctx.globalAlpha = 0.48;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          projected.forEach(([px, py]) => {
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = obj.color;
            ctx.globalAlpha = 0.8;
            ctx.fill();
          });
        } else if (obj.type === 'gyro') {
          for (let ring = 0; ring < 3; ring++) {
            const rRadius = obj.size * (0.5 + ring * 0.25);
            ctx.save();
            ctx.beginPath();
            const segments = 36;
            for (let s = 0; s <= segments; s++) {
              const angle = (s / segments) * Math.PI * 2;
              let rx = Math.cos(angle) * rRadius;
              let ry = Math.sin(angle) * rRadius;
              let rz = 0;

              const offsetRot = ring * (Math.PI / 3);
              const [rotX, rotY] = rotate3D(rx, ry, rz, obj.rx + offsetRot, obj.ry + offsetRot, obj.rz);
              const ptX = posX + rotX;
              const ptY = posY + rotY;

              if (s === 0) ctx.moveTo(ptX, ptY);
              else ctx.lineTo(ptX, ptY);

              if (s === Math.floor(((time * 14 + ring * 12) % segments))) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(ptX, ptY, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffa800';
                ctx.globalAlpha = 0.95;
                ctx.shadowColor = '#ffa800';
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.restore();
              }
            }
            ctx.strokeStyle = obj.color;
            ctx.globalAlpha = 0.50 - ring * 0.1;
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.restore();
          }
        }
      });

      // Connected Kinetic Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dx = currentMouseX - p.x;
        const dy = currentMouseY - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 200) {
          const force = (1 - dist / 200) * 0.09;
          p.x += dx * force;
          p.y += dy * force;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distBetween = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distBetween < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#f59e0b';
            ctx.globalAlpha = (1 - distBetween / 120) * 0.28;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // Mouse Aura Nebula
      const auraGradient = ctx.createRadialGradient(
        currentMouseX,
        currentMouseY,
        0,
        currentMouseX,
        currentMouseY,
        260
      );
      auraGradient.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
      auraGradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.08)');
      auraGradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = auraGradient;
      ctx.fillRect(0, 0, width, height);

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-90 dark:opacity-95"
      aria-hidden="true"
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
  maxTilt = 12,
  glowColor = 'rgba(245, 158, 11, 0.22)',
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

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          background: `radial-gradient(400px circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
};

// ─── 3D Holographic AI Neural Talent Core for Hero ───────────────────────
const Hero3DNeuralCore: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeMode, setActiveMode] = useState<'neural' | 'ats' | 'cloud'>('neural');
  const [isScanning, setIsScanning] = useState(false);
  const [score, setScore] = useState(98.4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 460);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 280);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += 0.022;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const coreRadius = 65;

      // 1. Radial Energy Aura
      const aura = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 150);
      aura.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
      aura.addColorStop(0.5, 'rgba(249, 115, 22, 0.12)');
      aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, width, height);

      // 2. Multi-Axis 3D Holographic Rings
      for (let r = 0; r < 3; r++) {
        const ringRadius = coreRadius * (0.65 + r * 0.35);
        const rotAngle = time * (0.8 + r * 0.4) * (r % 2 === 0 ? 1 : -1);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotAngle * 0.3 + (r * Math.PI) / 3);

        ctx.beginPath();
        const segments = 42;
        for (let s = 0; s <= segments; s++) {
          const theta = (s / segments) * Math.PI * 2;
          const rx = Math.cos(theta) * ringRadius;
          const ry = Math.sin(theta) * (ringRadius * 0.42);

          if (s === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);

          // Orbiting glowing data satellite
          if (s === Math.floor(((time * 14 + r * 14) % segments))) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(rx, ry, 3.8, 0, Math.PI * 2);
            ctx.fillStyle = r === 0 ? '#ffffff' : r === 1 ? '#ffa800' : '#f97316';
            ctx.shadowColor = '#ffa800';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();
          }
        }

        ctx.strokeStyle = r === 0 ? 'rgba(255, 168, 0, 0.85)' : `rgba(249, 115, 22, ${0.65 - r * 0.15})`;
        ctx.lineWidth = r === 0 ? 1.8 : 1.2;
        ctx.stroke();
        ctx.restore();
      }

      // 3. Central Quantum Core Node
      ctx.save();
      ctx.beginPath();
      const pulseRadius = 18 + Math.sin(time * 3.5) * 3;
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffa800';
      ctx.shadowColor = '#ffa800';
      ctx.shadowBlur = 22;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // 4. Floating Neural Nodes and Connectors
      const nodeCount = 6;
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 + time * 0.35;
        const dist = 95 + Math.sin(time * 2 + i) * 12;
        const nx = centerX + Math.cos(angle) * dist;
        const ny = centerY + Math.sin(angle) * (dist * 0.65);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    let val = 80;
    const interval = setInterval(() => {
      val += 2.5;
      if (val >= 99.2) {
        setScore(99.2);
        setIsScanning(false);
        clearInterval(interval);
      } else {
        setScore(parseFloat(val.toFixed(1)));
      }
    }, 60);
  };

  return (
    <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-stone-950/95 via-stone-900/95 to-stone-950/95 text-white border-2 border-amber-500/50 shadow-2xl shadow-amber-500/25 overflow-hidden flex flex-col justify-between h-full min-h-[440px] sm:min-h-[480px]">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-black tracking-wider uppercase text-amber-400">
            3D HOLOGRAPHIC TALENT CORE
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold">
          <Activity size={12} className="animate-pulse" />
          <span>v4.2 LIVE</span>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1.5 my-3 relative z-10">
        {[
          { id: 'neural', label: 'AI Match', icon: Cpu },
          { id: 'ats', label: 'ATS Engine', icon: Zap },
          { id: 'cloud', label: 'Talent Cloud', icon: Globe2 },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id as any)}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-stone-950 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white'
              }`}
            >
              <Icon size={12} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3D Quantum Orb Canvas & Holographic HUD */}
      <div className="relative flex-1 flex items-center justify-center my-1">
        <canvas ref={canvasRef} className="w-full h-full min-h-[190px] pointer-events-none" />

        {/* Live floating skill pills */}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-amber-500/30 text-[10px] font-extrabold text-amber-300 shadow-lg animate-pulse">
          ⚡ Latency: 0.1s
        </div>

        <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-emerald-500/30 text-[10px] font-extrabold text-emerald-400 shadow-lg">
          🎯 Fit: {score}%
        </div>
      </div>

      {/* Mode Specific Telemetry Content */}
      <div className="relative z-10 space-y-3 pt-3 border-t border-white/10">
        {activeMode === 'neural' && (
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Multi-Vector Alignment:</span>
              <span className="font-extrabold text-white">Full-Stack &amp; AI Architect</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Market Bracket:</span>
              <span className="font-black text-emerald-400">₹18–28 LPA</span>
            </div>
          </div>
        )}

        {activeMode === 'ats' && (
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Deterministic Parsing:</span>
              <span className="font-extrabold text-white">0% Unconscious Bias</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Verified Commits:</span>
              <span className="font-black text-amber-400">100% Proven</span>
            </div>
          </div>
        )}

        {activeMode === 'cloud' && (
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Active Talent Nodes:</span>
              <span className="font-extrabold text-white">500+ Hiring Partners</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Fast Track Cycle:</span>
              <span className="font-black text-amber-400">14 Days</span>
            </div>
          </div>
        )}

        {/* Live Interactive Action Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex-1 py-2.5 rounded-xl text-xs font-black text-stone-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-75"
          >
            <Zap size={14} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Scanning Neural Network...' : 'Run 3D Match Simulation ⚡'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

// ─── 3D Interactive AI Career Warp Tunnel & Live Offer Unlock Station ───
const Interactive3DCareerWarp: React.FC<{ onTriggerConfetti: () => void }> = ({ onTriggerConfetti }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedRole, setSelectedRole] = useState(0);
  const [isWarping, setIsWarping] = useState(false);

  const roles = [
    { title: 'AI Solutions Architect', package: '₹32.5 LPA', demand: 'Top 0.1% Match', tier: 'Tier-1 Elite' },
    { title: 'Principal Full-Stack Lead', package: '₹28.0 LPA', demand: '98.8% Match', tier: 'High Velocity' },
    { title: 'Cloud Infrastructure Specialist', package: '₹26.5 LPA', demand: '500+ Partners', tier: 'Enterprise Tier' },
    { title: 'Autonomous Agent Engineer', package: '₹34.0 LPA', demand: 'Exponential Demand', tier: 'Next Horizon' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate 3D Starfield particles for the hyperspace warp tunnel
    const stars: Array<{ x: number; y: number; z: number; o: number }> = [];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * 1000 + 1,
        o: Math.random() * 0.8 + 0.2,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.fillStyle = 'rgba(10, 8, 7, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw Warp Speed Starfield
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= 4.5;
        if (s.z <= 0) {
          s.z = 1000;
          s.x = (Math.random() - 0.5) * width * 2;
          s.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 320 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = Math.max(0.5, (1 - s.z / 1000) * 3);
          const alpha = (1 - s.z / 1000) * s.o;

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 180, 50, ${alpha})`;
          ctx.shadowColor = '#ffa800';
          ctx.shadowBlur = 6;
          ctx.fill();
        }
      }

      // Draw 3D Concentric Hexagonal Cyber Warp Rings
      for (let r = 1; r <= 5; r++) {
        const ringProgress = (time * 0.5 + r * 0.2) % 1;
        const radius = ringProgress * Math.min(width, height) * 0.55;
        const alpha = Math.sin(ringProgress * Math.PI) * 0.45;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 0.3 * (r % 2 === 0 ? 1 : -1));
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3;
          const hx = Math.cos(angle) * radius;
          const hy = Math.sin(angle) * radius;
          if (a === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleWarp = () => {
    setIsWarping(true);
    onTriggerConfetti();
    setTimeout(() => setIsWarping(false), 3000);
  };

  const activeRole = roles[selectedRole];

  return (
    <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-stone-950 via-[#14100c] to-stone-950 text-white border-2 border-amber-500/50 shadow-2xl shadow-amber-500/25 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-80" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-pulse" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Col: Live Role Matrix Switcher */}
        <div className="lg:col-span-6 space-y-5 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs uppercase tracking-wider backdrop-blur-md">
            <Sparkles size={14} className="text-amber-400" />
            <span>3D CAREER WARP LAUNCHPAD</span>
          </div>

          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Launch Into Your Next <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Career Trajectory.
            </span>
          </h3>

          <p className="text-stone-300 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
            Select your specialized engineering track and watch your verified credentials map deterministically to India’s top 1% tech opportunities.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {roles.map((r, idx) => (
              <button
                key={r.title}
                onClick={() => setSelectedRole(idx)}
                className={`p-3 rounded-2xl text-left transition-all border ${
                  selectedRole === idx
                    ? 'bg-amber-500/25 border-amber-500 shadow-lg scale-[1.02]'
                    : 'bg-white/5 border-white/10 hover:border-amber-500/40 text-stone-300 hover:text-white'
                }`}
              >
                <div className="text-[10px] font-black text-amber-400 uppercase">{r.tier}</div>
                <div className="text-xs font-black text-white mt-0.5 truncate">{r.title}</div>
                <div className="text-[11px] font-extrabold text-emerald-400 mt-1">{r.package}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: 3D Holographic Verified Offer Matrix Card */}
        <div className="lg:col-span-6">
          <TiltCard maxTilt={10} className="w-full">
            <div className="p-6 sm:p-8 rounded-3xl bg-stone-900/90 backdrop-blur-2xl border-2 border-amber-500/40 shadow-2xl space-y-5 text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                    <Award size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">OFFICIAL FAST-TRACK</span>
                    <h4 className="text-base font-black text-white">{activeRole.title}</h4>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30 animate-pulse">
                  {activeRole.demand}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">Target Package:</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">{activeRole.package}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">Hiring Velocity:</span>
                  <span className="text-xl sm:text-2xl font-black text-white">14 Days</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-stone-300 font-bold">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>100% Pre-Vetted Blind Assessment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300 font-bold">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Direct Hiring Fast-Track with 500+ Tech Partners</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/open-positions"
                  onClick={handleWarp}
                  className="w-full py-3.5 rounded-2xl text-xs font-black text-stone-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-center"
                >
                  <Rocket size={16} className={isWarping ? 'animate-bounce' : ''} />
                  <span>Claim 1-Click Fast-Track Interview 🚀</span>
                </Link>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
};

// ─── Custom Animated Career Breakthrough Story Component ────────────────
interface CandidateStoryAnimationProps {
  currentStage: number;
  onSelectStage: (index: number) => void;
  isCompact?: boolean;
}

const CandidateStoryAnimation: React.FC<CandidateStoryAnimationProps> = ({
  currentStage,
  onSelectStage,
  isCompact = false,
}) => {
  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden border border-amber-500/40 flex flex-col justify-between p-4 sm:p-6 text-white ${isCompact ? 'min-h-[200px]' : 'min-h-[440px]'}`}>
      
      {/* Full-Cover Unique Adyapan Tech Workspace & AI Innovation Studio Background Image */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <img
          src={adyapanStoryStudioBg}
          alt="Adyapan AI Innovation Workspace & Tech Studio"
          className="w-full h-full object-cover object-center scale-100 opacity-90 brightness-95 contrast-105 saturate-115 transition-transform duration-700"
        />
        {/* Soft contrast vignettes that preserve the glowing Adyapan branding while maintaining high text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/40 to-stone-950/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/50 via-transparent to-stone-950/50" />
        <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay" />
      </div>

      {/* Background Cyber Grid Lines in SVG */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="story-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffa800" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#story-grid)" />
        </svg>
      </div>

      {/* Top Holographic Navigation Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-amber-400">
            CANDIDATE STORY SCENE 0{currentStage + 1}
          </span>
        </div>

        {!isCompact && (
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
            {['1. Suit & Bag Walk', '2. AI ATS Round', '3. Offer Signed', '4. Jump Joy!'].map((name, idx) => (
              <button
                key={name}
                onClick={() => onSelectStage(idx)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${currentStage === idx ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'}`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Animated Vector Stage Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-4">
        
        {/* ── SCENE 1: WALKING IN SUIT WITH LAPTOP BAG ── */}
        {currentStage === 0 && (
          <div className="flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
            {/* Real Professional Corporate Employee Avatar */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-3xl p-1.5 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 shadow-2xl shadow-amber-500/25 group">
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-stone-900 relative">
                <img
                  src={realEmployeeAvatar}
                  alt="Adyapan Professional Candidate in Navy Suit"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-black text-white">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-stone-950 uppercase tracking-wider">
                    👔 Suited & Ready
                  </span>
                  <span className="text-emerald-400 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                    Target: ₹24+ LPA
                  </span>
                </div>
              </div>
              
              {/* Ambient Glow */}
              <div className="absolute -inset-1 bg-amber-500/20 rounded-3xl blur-md -z-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
                <BriefcaseBusiness size={13} />
                <span>STEP 1: THE PREPARED ARRIVAL</span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white">Walking In Suited &amp; Laptop in Hand</h4>
              <p className="text-xs text-stone-300 max-w-sm">Candidate arrives focused at Adyapan Interview Suite ready to crack the role.</p>
            </div>
          </div>
        )}

        {/* ── SCENE 2: INTERVIEW & AI ATS SCORING ── */}
        {currentStage === 1 && (
          <div className="flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
            <div className="relative w-52 h-44 sm:w-64 sm:h-52 bg-stone-900/90 rounded-2xl border-2 border-amber-500/40 p-4 shadow-2xl flex flex-col justify-between">
              
              {/* Radar scanner glow */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[11px] font-black text-amber-400 flex items-center gap-1.5">
                  <Cpu size={14} className="animate-spin text-amber-400" />
                  <span>ADYAPAN NEURAL ATS EVALUATOR</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold animate-pulse">
                  SCAN COMPLETE
                </span>
              </div>

              {/* Metrics Breakdown */}
              <div className="space-y-2 text-left text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-semibold">System Architecture:</span>
                  <span className="text-emerald-400 font-black">99.2% MATCH</span>
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full w-[99%]" />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-semibold">Live Coding &amp; Logic:</span>
                  <span className="text-amber-400 font-black">100% PERFECT</span>
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-full" />
                </div>
              </div>

              {/* Big ATS Fit Score */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-stone-300 font-bold">Overall Fit Index:</span>
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                  98.4 / 100 🔥
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
                <Zap size={13} />
                <span>STEP 2: CRACKING THE INTERVIEW</span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white">Technical &amp; HR Rounds Aced</h4>
              <p className="text-xs text-stone-300 max-w-sm">Deterministic scoring verifies core competencies without bias or delays.</p>
            </div>
          </div>
        )}

        {/* ── SCENE 3: OFFICIAL OFFER LETTER ISSUED ── */}
        {currentStage === 2 && (
          <div className="flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
            <div className="relative w-48 h-56 sm:w-56 sm:h-64 bg-gradient-to-b from-stone-100 to-amber-50 text-stone-950 rounded-2xl border-2 border-amber-400 p-4 sm:p-5 shadow-2xl flex flex-col justify-between transform -rotate-1 hover:rotate-0 transition-transform">
              
              {/* Offer Header */}
              <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                <div className="flex items-center gap-1.5">
                  <img src={adyapanLogo} alt="Logo" className="w-5 h-5 rounded-full" />
                  <span className="text-[10px] font-black text-stone-900">ADYAPAN EDUTECH</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">OFFICIAL</span>
              </div>

              {/* Offer Content */}
              <div className="text-left space-y-1.5 my-2">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">OFFER OF EMPLOYMENT</span>
                <p className="text-xs sm:text-sm font-black text-stone-900">Role: Senior Frontend Engineer</p>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-stone-600 font-semibold block">Annual CTC Package:</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700">₹24,50,000 / annum</span>
                </div>
              </div>

              {/* Verification Stamp */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                <span className="text-[9px] text-stone-500 font-bold">HR Dept. Signed</span>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  <CheckCircle2 size={11} />
                  <span>ACCEPTED</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black">
                <FileCheck size={13} />
                <span>STEP 3: OFFER LETTER UNLOCKED</span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white">Instant Verified Compensation</h4>
              <p className="text-xs text-stone-300 max-w-sm">Clear career runway, high CTC packages, and immediate onboarding.</p>
            </div>
          </div>
        )}

        {/* ── SCENE 4: JOYFUL JUMP ON SCREEN CELEBRATION ── */}
        {currentStage === 3 && (
          <div className="flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
            
            {/* Real Professional Candidate Celebrating with Offer Letter */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-3xl p-1.5 bg-gradient-to-tr from-amber-400 via-emerald-500 to-amber-300 shadow-2xl shadow-emerald-500/30 group">
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-stone-900 relative">
                <img
                  src={realEmployeeJoyAvatar}
                  alt="Adyapan Candidate Celebrating Career Breakthrough"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-black text-white">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-stone-950 uppercase tracking-wider">
                    🎉 Offer Unlocked!
                  </span>
                  <span className="text-amber-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                    ₹24.5 LPA Package
                  </span>
                </div>
              </div>

              {/* Ambient Celebration Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/40 to-emerald-500/40 rounded-3xl blur-lg -z-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-black shadow-lg">
                <PartyPopper size={13} />
                <span>STEP 4: PURE CELEBRATION LEAP!</span>
              </div>
              <h4 className="text-lg sm:text-xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                DREAM CAREER UNLOCKED! 🎉
              </h4>
              <p className="text-xs text-amber-100 max-w-sm font-semibold">The life-changing moment of victory: celebrating dream offer unlock on screen!</p>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Progress Indicator Bar */}
      <div className="relative z-10 grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
        {['1. Arrival', '2. AI Round', '3. Offer', '4. Jump Joy'].map((label, idx) => (
          <div key={label} className="text-left space-y-1">
            <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${currentStage === idx ? 'bg-amber-400 w-full animate-pulse' : currentStage > idx ? 'bg-emerald-400 w-full' : 'w-0'}`}
              />
            </div>
            <span className={`text-[9px] sm:text-[10px] font-bold block ${currentStage === idx ? 'text-amber-400' : 'text-stone-500'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};



// ─── Main Component ─────────────────────────────────────────────────────
const AboutUs: React.FC = () => {
  useScrollReveal();

  const [activeTeamTab, setActiveTeamTab] = useState<'tech' | 'nontech' | 'leadership' | 'founders'>('tech');
  const [showCelebrationJump, setShowCelebrationJump] = useState(false);
  const [candidateStageIndex, setCandidateStageIndex] = useState(0);
  const [selectedPillar, setSelectedPillar] = useState<{
    icon: any;
    tag: string;
    title: string;
    description: string;
    glow: string;
    borderColor: string;
    badge: string;
    wireframeType: string;
    metrics: Array<{ label: string; val: string }>;
    highlights: string[];
    deepDive: string;
  } | null>(null);

  // Auto-cycle through the 4 animated story scenes continuously
  useEffect(() => {
    const timer = setInterval(() => {
      setCandidateStageIndex((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const triggerCelebration = () => {
    setCandidateStageIndex(3); // Jump directly to celebration scene
    setShowCelebrationJump(true);
    setTimeout(() => {
      setShowCelebrationJump(false);
    }, 4000);
  };

  const teamTabs = [
    { id: 'tech', label: 'Tech & Engineering', icon: Code2, count: '18+ Engineers' },
    { id: 'nontech', label: 'Operations & Growth', icon: TrendingUp, count: '25+ Specialists' },
    { id: 'leadership', label: 'People & HR', icon: Heart, count: '10+ Leaders' },
    { id: 'founders', label: 'Founders & Vision', icon: Compass, count: 'Founding Team' },
  ];

  const teamData = {
    tech: {
      number: '01',
      badge: 'CORE ENGINEERING & AI LAB',
      title: 'Architecting Intelligent Systems at Scale',
      subtitle: 'Precision AI · Cloud Scale · Zero-Latency Architecture',
      description:
        'Our technology division builds the proprietary AI ATS resume scoring engine, candidate matchmaking algorithms, and ultra-fast web architectures. We turn state-of-the-art AI into tangible career opportunities.',
      image: techTeam,
      highlights: [
        'Proprietary deterministic resume evaluation algorithms',
        'Sub-100ms API response pipelines with Neon PostgreSQL',
        'Secure multi-tier role access & encrypted offer generation',
      ],
      techStack: ['React 18', 'TypeScript', 'Node.js', 'Prisma ORM', 'PostgreSQL', 'TailwindCSS', 'OpenAI API'],
      stats: [
        { label: 'Uptime SLA', val: '99.98%' },
        { label: 'Candidate Match Rate', val: '94.2%' },
        { label: 'Scoring Latency', val: '< 1.8s' },
      ],
    },
    nontech: {
      number: '02',
      badge: 'GROWTH & TALENT OPERATIONS',
      title: 'Fueling Continuous Execution & Mentorship',
      subtitle: 'Empathy-Driven Operations · Student Support · Corporate Alliances',
      description:
        'Behind every successful hiring pipeline is a dedicated operations force. From strategic corporate partnerships and learner success management to outreach and curriculum alignment, we make high impact feel seamless.',
      image: nonTechTeam,
      highlights: [
        'Connecting 500+ top tech recruiters directly to talent',
        'Personalized mentorship tracking & interview preparation',
        'Empathetic resolution and candidate success guidance',
      ],
      techStack: ['CRM Automation', 'Growth Analytics', 'Talent Ops', 'Student Mentorship', 'Corporate Hiring'],
      stats: [
        { label: 'Partner Companies', val: '500+' },
        { label: 'Student Satisfaction', val: '4.9/5.0' },
        { label: 'Hiring Velocity', val: '2.4x Faster' },
      ],
    },
    leadership: {
      number: '03',
      badge: 'PEOPLE & CULTURE',
      title: 'Cultivating Extreme Ownership & Empathy',
      subtitle: 'Transparent Culture · People Acceleration · Zero Bureaucracy',
      description:
        'Our people leadership nurtures an environment where ambitious talent thrives. We eliminate red tape, celebrate high ownership, and ensure every team member has a clear runway to learn, lead, and advance.',
      image: managementTeam,
      highlights: [
        'High-trust, meritocratic promotion pathways',
        'Transparent feedback loops and holistic wellness',
        'Continuous upskilling stipends and leadership mentorship',
      ],
      techStack: ['People First', 'Radical Candor', 'Talent Development', 'Culture of Ownership'],
      stats: [
        { label: 'Team Retention', val: '96.5%' },
        { label: 'Internal Promotion', val: '72%' },
        { label: 'Culture Score', val: '98/100' },
      ],
    },
    founders: {
      number: '04',
      badge: 'FOUNDING LEADERSHIP',
      title: 'Building India’s Most Trusted Talent Highway',
      subtitle: 'Bridging Aspiration with Real-World Industry Placement',
      description:
        'Founded with an uncompromising belief that every ambitious learner deserves direct access to top-tier career opportunities. Our founders combine deep pedagogical insight with modern AI tech to reshape Indian hiring.',
      image: foundersImage,
      highlights: [
        'Pioneering hands-on practical tech education across India',
        'Championing transparent, merit-based hiring evaluation',
        'Mentoring over 1,000,000+ students and young professionals',
      ],
      techStack: ['Visionary Strategy', 'Industry Alignment', 'Talent Transformation', 'AI Innovation'],
      stats: [
        { label: 'Learners Impacted', val: '1,000,000+' },
        { label: 'Years of Trust', val: '5+ Years' },
        { label: 'Campuses Reached', val: '250+' },
      ],
    },
  };

  const corePillars = [
    {
      icon: Target,
      tag: 'OUR MISSION',
      title: 'Democratize Real Career Acceleration',
      description:
        'To empower every ambitious learner with verifiable, industry-ready skills and direct corporate pathways that lead to transformative career trajectories.',
      glow: 'rgba(245, 158, 11, 0.35)',
      borderColor: 'group-hover:border-amber-500/60',
      badge: 'Pillar 01',
      wireframeType: 'octa',
      metrics: [
        { label: 'Learners Upskilled', val: '1,000,000+' },
        { label: 'Career Value Created', val: '₹12.5 Cr+' },
        { label: 'Cities Reached', val: '45+ Tier-2/3' },
      ],
      highlights: [
        'Hands-on apprenticeship programs mirroring modern enterprise sprint cycles',
        'Direct hiring tie-ups with 500+ high-growth tech firms across India',
        'Dedicated outcome guarantees with deterministic skill verification',
      ],
      deepDive:
        'Our mission bridges the severe gap between academic theory and high-performing production engineering. By giving learners access to production-grade repositories, mentor code reviews, and live coding pipelines, we compress 2 years of learning into 16 weeks of hyper-focused mastery.',
    },
    {
      icon: Compass,
      tag: 'OUR VISION',
      title: 'India’s #1 AI Talent Ecosystem',
      description:
        'To establish the most credible, deterministic, and frictionless bridge connecting ambitious candidates with world-class engineering and product teams.',
      glow: 'rgba(249, 115, 22, 0.35)',
      borderColor: 'group-hover:border-orange-500/60',
      badge: 'Pillar 02',
      wireframeType: 'gyro',
      metrics: [
        { label: 'Hiring Partners', val: '500+ Top Tech' },
        { label: 'Placement Velocity', val: '14 Days Avg' },
        { label: 'Candidate Retention', val: '94.2% 1-Year' },
      ],
      highlights: [
        'Deterministic candidate matchmaking mapped to precise stack competencies',
        'Pre-vetted engineering pipelines for rapid scale hiring',
        'End-to-end recruitment analytics dashboard for corporate talent leads',
      ],
      deepDive:
        'We envision an India where talent is evaluated purely on demonstrable competency rather than pedigree or pedigree bias. Our ecosystem gives companies instant access to top 1% verified engineers who can commit to production code on Day One.',
    },
    {
      icon: Cpu,
      tag: 'THE AI ADVANTAGE',
      title: 'Deterministic & Bias-Free ATS Scoring',
      description:
        'Our algorithms score candidates on verified skill relevance, project complexity, and role alignment—eliminating guesswork and unconscious hiring bias.',
      glow: 'rgba(234, 88, 12, 0.35)',
      borderColor: 'group-hover:border-amber-600/60',
      badge: 'Pillar 03',
      wireframeType: 'cube',
      metrics: [
        { label: 'Scoring Latency', val: '< 0.1s' },
        { label: 'ATS Match Precision', val: '98.4%' },
        { label: 'Unconscious Bias', val: '0% (Blind Scan)' },
      ],
      highlights: [
        'Semantic neural parsing of real engineering projects and Git commits',
        'Multi-vector role alignment index scoring from 0 to 100 in real time',
        'Automated skill gap feedback reports generated for every applicant',
      ],
      deepDive:
        'Traditional ATS systems filter on arbitrary keywords. Adyapan’s AI ATS evaluates conceptual mastery, system architecture tradeoffs, and code velocity, ensuring that true high-capability builders get immediate visibility.',
    },
    {
      icon: Heart,
      tag: 'OUR CREED',
      title: 'Radical Ownership & People-First',
      description:
        'We believe in high autonomy, rapid experimentation, and authentic mentorship. When people are treated like owners, extraordinary results follow.',
      glow: 'rgba(245, 158, 11, 0.35)',
      borderColor: 'group-hover:border-amber-500/60',
      badge: 'Pillar 04',
      wireframeType: 'ico',
      metrics: [
        { label: 'Team Retention', val: '96.5%' },
        { label: 'Internal Promotion', val: '72%' },
        { label: 'Mentorship Hours', val: '10,000+' },
      ],
      highlights: [
        'High autonomy culture where every team member owns key business outcomes',
        'Weekly 1-on-1 mentorship circles and radical transparency',
        'Generous learning & development stipends for continuous self-evolution',
      ],
      deepDive:
        'Culture is what happens when leaders are not in the room. We cultivate extreme ownership, eliminate red tape, and celebrate ambitious experimentation so that every team member can do the best work of their lives.',
    },
  ];

  const roadmapSteps = [
    {
      year: '2024',
      phase: 'PHASE 01',
      title: 'The AI Hiring & ATS Transformation',
      desc: 'Launched our automated recruitment platform with deterministic resume matching and AI copilot assessments.',
      highlight: 'Proprietary AI Matching Engine',
      status: 'Completed',
    },
    {
      year: '2025',
      phase: 'PHASE 02',
      title: 'Scale & 500+ Corporate Hiring Ties',
      desc: 'Expanded nationwide partnerships, creating direct hiring tracks with premier tech startups and enterprises.',
      highlight: '250,000+ Community Milestone',
      status: 'Completed',
    },
    {
      year: '2026 Batch',
      phase: 'PHASE 03',
      title: 'Active Recruitment & Direct Placement',
      desc: 'Fast-track corporate hiring, 48-72h interview turnarounds, verified offers, and comprehensive candidate onboarding.',
      highlight: 'Active Placement Drive',
      status: 'Active',
    },
    {
      year: '2027 Batch',
      phase: 'PHASE 04',
      title: 'Early Fast-Track & Internship Pipeline',
      desc: 'Early admissions, hands-on production apprenticeships, mentorship circles, and pre-placement recruitment pipelines.',
      highlight: 'Active Batch Enrolment',
      status: 'Active',
    },
  ];

  const cultureCards = [
    {
      title: 'Innovation & Team Collaboration',
      subtitle: 'Where bold ideas turn into scalable code',
      image: adyapanTeam,
      category: 'Tech Culture',
      tag: '01',
    },
    {
      title: 'Sports Day & High Energy',
      subtitle: 'Cricket tournaments, team banter & fitness',
      image: cricketImage,
      category: 'Life & Sports',
      tag: '02',
    },
    {
      title: 'Milestones & Celebrations',
      subtitle: 'Honoring big wins, birthdays & promotions',
      image: partyImage,
      category: 'Celebration',
      tag: '03',
    },
    {
      title: '1M+ Learner Community',
      subtitle: 'Inspiring the next generation of engineers',
      image: studentCommunityImage,
      category: 'Community',
      tag: '04',
    },
    {
      title: '1-on-1 Mentorship Circles',
      subtitle: 'Direct guidance from veteran leaders',
      image: mentorshipImage,
      category: 'Growth',
      tag: '05',
    },
    {
      title: 'Modern Collaborative Workplace',
      subtitle: 'Spaces designed for focus and creativity',
      image: aboutHeroOffice,
      category: 'Workplace',
      tag: '06',
    },
  ];

  const coreValues = [
    {
      icon: Rocket,
      title: 'Extreme Ownership',
      desc: 'We do not wait for instructions. Every team member acts like a founder and owns outcomes end-to-end.',
    },
    {
      icon: Zap,
      title: 'Velocity of Execution',
      desc: 'Speed is our strategy. We ship fast, iterate with real feedback, and maintain relentless high standards.',
    },
    {
      icon: Award,
      title: 'Uncompromising Quality',
      desc: 'From our UI pixels to our backend algorithms, we obsess over craft, precision, and performance.',
    },
    {
      icon: UsersRound,
      title: 'Radical Transparency',
      desc: 'Zero office politics. We share constructive feedback openly, celebrate candidly, and learn together.',
    },
    {
      icon: ShieldCheck,
      title: 'Trust & Integrity',
      desc: 'We do what is right for learners, candidates, and hiring partners—every single time.',
    },
    {
      icon: Globe2,
      title: 'Scalable Impact',
      desc: 'We build systems that elevate millions of lives across India, unlocking economic freedom through talent.',
    },
  ];

  const currentTeam = teamData[activeTeamTab];

  return (
    <SiteShell>
      <main className="relative min-h-screen overflow-x-hidden bg-[#faf7f2] dark:bg-[#0c0b0a] text-stone-900 dark:text-stone-100 selection:bg-amber-500 selection:text-white transition-colors duration-300 font-sans">

        {/* ══════════════════════════════════════════════════════════
            3D PERSPECTIVE WAVE & FLOATING POLYHEDRA BACKGROUND
           ══════════════════════════════════════════════════════════ */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[15%] -left-[10%] w-[650px] sm:w-[900px] h-[650px] sm:h-[900px] rounded-full bg-gradient-to-br from-amber-500/25 via-orange-500/20 to-transparent blur-3xl animate-pulse" />
          <div className="absolute top-[30%] -right-[15%] w-[550px] sm:w-[800px] h-[550px] sm:h-[800px] rounded-full bg-gradient-to-bl from-orange-500/25 via-amber-600/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-[10%] left-[25%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-amber-500/20 to-transparent blur-3xl" />
          
          <HighImpact3DBackground />

          <div 
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, #ffa800 1px, transparent 1px), linear-gradient(to bottom, #ffa800 1px, transparent 1px)`,
              backgroundSize: '44px 44px',
            }}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════
            1. HERO SECTION: TWO-COLUMN DESIGN (MATCHING JOBS/HOME PAGE)
           ══════════════════════════════════════════════════════════ */}
        <section className="pt-10 pb-16 md:pt-14 md:pb-20 relative z-10 border-b border-stone-200/60 dark:border-stone-800 overflow-hidden bg-transparent">

          {/* Full-Cover Prominently Visible Background Image */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <img
              src={adyapanCampusHeroBg}
              alt="Adyapan Innovation Campus Atmosphere"
              className="w-full h-full object-cover object-center scale-100 opacity-90 dark:opacity-75 brightness-100 contrast-105 saturate-110 transition-opacity duration-500"
            />
            {/* Soft readability overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#fdfbf7]/40 via-[#fdfbf7]/20 to-transparent dark:from-[#141312]/50 dark:via-[#141312]/30 dark:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7]/20 via-transparent to-[#fdfbf7]/85 dark:from-[#141312]/30 dark:via-transparent dark:to-[#141312]/85" />
          </div>

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* LEFT COLUMN: HEADLINE, NARRATIVE & ACTION HUB (7 Cols) */}
              <div className="lg:col-span-7 space-y-6" data-reveal="left">

                {/* Direct Opportunities Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-300 font-bold text-xs tracking-wider uppercase shadow-xs">
                  <Sparkles size={14} className="text-amber-600 dark:text-amber-400 fill-amber-500" />
                  <span>NEXT-GEN AI TALENT INFRASTRUCTURE · 2026 LIVE MATRIX</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[76px] font-bold text-stone-950 dark:text-white tracking-tight leading-[1.05]">
                  Architecting India’s <br />
                  <span className="text-amber-600 dark:text-amber-400">AI-Powered</span> <br />
                  Talent Highway.
                </h1>

                {/* Subtitle - Dark & Crisp */}
                <p className="text-base sm:text-lg lg:text-xl text-stone-900 dark:text-stone-100 leading-relaxed max-w-2xl font-semibold">
                  At Adyapan, we turn ambitious learners into premier tech builders. Combining deterministic AI resume scoring, live engineering sprints, and 500+ corporate hiring pipelines.
                </p>

                {/* ── INTERACTIVE EXPLORATION & ACTIONS CONTAINER ── */}
                <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span>EXPLORE LIVE PLACEMENT TRACKS:</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                      ₹18–35 LPA Avg CTC
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { title: '⚡ AI / ML Architect', badge: '99.4% Match' },
                      { title: '💻 Full-Stack Engineer', badge: '14-Day Fast' },
                      { title: '☁️ Cloud & DevOps', badge: '500+ Partners' },
                      { title: '🛡️ Core Systems', badge: 'High Demand' },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="px-3.5 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700 hover:border-amber-500/60 transition-all flex flex-col justify-center shadow-xs cursor-pointer"
                      >
                        <span className="text-xs font-bold text-stone-900 dark:text-white truncate">{item.title}</span>
                        <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">{item.badge}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-200/60 dark:border-stone-800">
                    <Link
                      to="/open-positions"
                      className="px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <span>Explore Open Positions</span>
                      <ArrowRight size={15} />
                    </Link>

                    <button
                      onClick={triggerCelebration}
                      className="px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <PartyPopper size={15} className="text-amber-500" />
                      <span>Experience Hiring Jump 🎉</span>
                    </button>
                  </div>
                </div>

                {/* ── HIGHLIGHT PILLS (MATCHING JOB PAGE) ── */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-stone-600 dark:text-stone-300">
                  <span className="text-stone-800 dark:text-stone-200 mr-1 flex items-center gap-1">
                    <Flame size={14} className="text-orange-500 fill-orange-500" />
                    <span>Platform Highlights:</span>
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>1,000,000+ Learners</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 shadow-xs">
                    <Building size={13} className="text-purple-500" />
                    <span>500+ Corporate Recruiters</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 shadow-xs">
                    <Zap size={13} className="text-emerald-500" />
                    <span>98.4% Match Accuracy</span>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: HERO IMAGE & 3 FLOATING STAT CARDS (5 Cols) */}
              <div className="lg:col-span-5 relative flex justify-center items-center" data-reveal="right">

                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl transform scale-95" />

                <div className="relative w-full max-w-[440px] h-[360px] sm:h-[440px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 bg-stone-900 z-10 group">
                  <img
                    src={aboutHeroOffice}
                    alt="Life at Adyapan"
                    className="w-full h-full object-cover object-[center_35%] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-500/90 text-[10px] font-extrabold uppercase tracking-widest text-stone-950 mb-1">
                      Adyapan Innovation Hub
                    </span>
                    <b className="text-sm sm:text-base font-bold text-white block">
                      Empowering 1,000,000+ Careers
                    </b>
                  </div>
                </div>

                {/* Floating Cards (Matching Job Page Style) */}
                <div className="absolute -top-4 left-0 sm:-left-8 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 animate-float">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <b className="text-xs font-bold text-stone-900 dark:text-white block">Verified Excellence</b>
                    <small className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">1M+ Active Learners</small>
                  </div>
                </div>

                <div className="absolute top-1/2 right-0 sm:-right-8 -translate-y-1/2 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 animate-float-delayed">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
                    <Star size={16} className="fill-amber-500" />
                  </div>
                  <div>
                    <b className="text-xs font-bold text-stone-900 dark:text-white block">4.9 / 5.0 Rating</b>
                    <small className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">500+ Top Recruiters</small>
                  </div>
                </div>

                <div className="absolute -bottom-4 left-0 sm:-left-6 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-amber-200 dark:border-amber-800/40 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 animate-float bento-glow-orange">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Zap size={16} />
                  </div>
                  <div>
                    <b className="text-xs font-bold text-stone-900 dark:text-white block">Deterministic AI ATS</b>
                    <small className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">Zero Bias Recruitment</small>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            2. 4-PILLAR 3D INTERACTIVE MATRIX (MISSION & CREED)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 bg-transparent border-b border-stone-200/50 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2 backdrop-blur-md">
                <Layers size={14} className="text-amber-500" />
                <span>FOUNDATIONAL PILLARS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight">
                Built on Purpose, <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Driven by Precision.
                </span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-2 font-medium">
                Our architectural principles combine cutting-edge technology with deep educational empathy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {corePillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <TiltCard
                    key={pillar.title}
                    maxTilt={14}
                    glowColor={pillar.glow}
                    className="h-full"
                  >
                    <div
                      data-reveal="up"
                      data-delay={idx * 100}
                      className="group relative h-full p-7 sm:p-8 rounded-3xl bg-white/85 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/60 shadow-xl hover:shadow-2xl hover:shadow-amber-500/15 transition-all duration-500 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Floating 3D Geometric Wireframe Background Graphic */}
                      <div className="absolute -top-6 -right-6 w-28 h-28 opacity-15 group-hover:opacity-35 transition-all duration-700 pointer-events-none group-hover:scale-125 group-hover:rotate-45">
                        {pillar.wireframeType === 'octa' && (
                          <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-500" fill="none" strokeWidth="1.5">
                            <polygon points="50,10 90,50 50,90 10,50" />
                            <line x1="50" y1="10" x2="50" y2="90" />
                            <line x1="10" y1="50" x2="90" y2="50" />
                            <circle cx="50" cy="50" r="3" fill="#ffa800" />
                          </svg>
                        )}
                        {pillar.wireframeType === 'gyro' && (
                          <svg viewBox="0 0 100 100" className="w-full h-full stroke-orange-500" fill="none" strokeWidth="1.5">
                            <circle cx="50" cy="50" r="40" />
                            <ellipse cx="50" cy="50" rx="40" ry="18" transform="rotate(30 50 50)" />
                            <ellipse cx="50" cy="50" rx="40" ry="18" transform="rotate(-30 50 50)" />
                            <circle cx="50" cy="50" r="4" fill="#f97316" />
                          </svg>
                        )}
                        {pillar.wireframeType === 'cube' && (
                          <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-600" fill="none" strokeWidth="1.5">
                            <rect x="20" y="20" width="45" height="45" />
                            <rect x="35" y="35" width="45" height="45" />
                            <line x1="20" y1="20" x2="35" y2="35" />
                            <line x1="65" y1="20" x2="80" y2="35" />
                            <line x1="20" y1="65" x2="35" y2="80" />
                            <line x1="65" y1="65" x2="80" y2="80" />
                          </svg>
                        )}
                        {pillar.wireframeType === 'ico' && (
                          <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-500" fill="none" strokeWidth="1.5">
                            <polygon points="50,8 88,30 88,75 50,95 12,75 12,30" />
                            <line x1="50" y1="8" x2="50" y2="95" />
                            <line x1="12" y1="30" x2="88" y2="75" />
                            <line x1="12" y1="75" x2="88" y2="30" />
                          </svg>
                        )}
                      </div>

                      <div className="relative z-10">
                        {/* Top Icon & Badge */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-stone-950 transition-all duration-300">
                            <IconComponent size={26} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                            {pillar.badge}
                          </span>
                        </div>

                        {/* Tag */}
                        <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-600 dark:text-amber-400 block mb-2">
                          {pillar.tag}
                        </span>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-stone-900 dark:text-white leading-snug mb-3 group-hover:text-amber-500 transition-colors">
                          {pillar.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                          {pillar.description}
                        </p>

                        {/* Mini Quick Metric Pill */}
                        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-stone-400 font-semibold">{pillar.metrics[0].label}:</span>
                          <span className="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                            {pillar.metrics[0].val}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Clickable Explore Impact Action */}
                      <button
                        onClick={() => setSelectedPillar(pillar)}
                        className="relative z-10 pt-4 mt-4 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between w-full text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-all group/btn cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-1.5 font-black uppercase tracking-wider">
                          <span>Explore Impact</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        </span>
                        <div className="w-8 h-8 rounded-full bg-amber-500/15 group-hover/btn:bg-amber-500 group-hover/btn:text-stone-950 flex items-center justify-center transition-all duration-300 shadow-sm">
                          <ChevronRight size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    </div>
                  </TiltCard>
                );
              })}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            3. 3D INTERACTIVE TEAM & LEADERSHIP EXPLORER
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 border-b border-stone-200/50 dark:border-stone-800 bg-transparent">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2 backdrop-blur-md">
                <UsersRound size={14} className="text-amber-500" />
                <span>MEET THE CREATORS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight leading-tight">
                The Minds Shaping <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Future-Ready Talent.
                </span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-2 font-medium">
                Different disciplines. One obsession: creating transformative career breakthroughs for learners.
              </p>
            </div>

            <div className="flex justify-center mb-8" data-reveal="up">
              <div className="inline-flex flex-wrap items-center justify-center p-1.5 rounded-2xl bg-white/85 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 shadow-lg gap-1.5">
                {teamTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTeamTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTeamTab(tab.id as any)}
                      className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 flex items-center gap-2 ${isActive
                        ? 'text-stone-950 bg-gradient-to-r from-amber-400 to-orange-400 shadow-md scale-[1.02]'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                    >
                      <Icon size={16} className={isActive ? 'text-stone-950' : 'text-amber-500'} />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive
                          ? 'bg-black/15 text-stone-950'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                          }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="transition-all duration-500 ease-out">
              <TiltCard
                maxTilt={8}
                glowColor="rgba(245, 158, 11, 0.2)"
                className="rounded-3xl"
              >
                <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/85 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                  <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-2xl h-[300px] sm:h-[380px] bg-stone-950 group">
                    <img
                      src={currentTeam.image}
                      alt={currentTeam.title}
                      className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = teamAvif;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <span className="absolute top-4 left-4 w-10 h-10 rounded-2xl bg-black/70 backdrop-blur-md text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/30 shadow-lg">
                      {currentTeam.number}
                    </span>

                    <span className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold flex items-center justify-between">
                      <span>{currentTeam.badge}</span>
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                    </span>
                  </div>

                  <div className="lg:col-span-7 space-y-5 text-left">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                        <Sparkles size={13} />
                        <span>{currentTeam.subtitle}</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 dark:text-white leading-tight">
                        {currentTeam.title}
                      </h3>
                    </div>

                    <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed font-medium">
                      {currentTeam.description}
                    </p>

                    <div className="space-y-2 pt-0.5">
                      {currentTeam.highlights.map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200"
                        >
                          <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 size={13} />
                          </div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block mb-2">
                        CORE COMPETENCIES &amp; STACK:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentTeam.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 rounded-lg bg-stone-100/90 dark:bg-stone-800/90 text-stone-800 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-stone-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                      {currentTeam.stats.map((st) => (
                        <div key={st.label} className="text-left">
                          <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
                            {st.val}
                          </div>
                          <div className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 mt-0.5">
                            {st.label}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              </TiltCard>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            4. 3D INTERACTIVE MILESTONES & GROWTH ROADMAP
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 bg-transparent border-b border-stone-200/50 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2 backdrop-blur-md">
                <Rocket size={14} className="text-amber-500" />
                <span>THE ADYAPAN TIMELINE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight">
                Our Journey &amp; <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Milestone Evolution.
                </span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-2 font-medium">
                From offline classrooms to India’s most trusted AI recruitment and talent platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {roadmapSteps.map((step, idx) => (
                <TiltCard
                  key={step.year}
                  maxTilt={10}
                  className="h-full"
                >
                  <div
                    data-reveal="up"
                    data-delay={idx * 120}
                    className="relative h-full p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-stone-900/85 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 shadow-xl flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                          {step.year}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${step.status === 'Active'
                            ? 'bg-amber-500 text-stone-950 animate-pulse'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                            }`}
                        >
                          {step.status}
                        </span>
                      </div>

                      <span className="text-[10px] font-extrabold tracking-widest uppercase text-stone-400 dark:text-stone-500 block mb-1.5">
                        {step.phase}
                      </span>

                      <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white mb-2 leading-snug">
                        {step.title}
                      </h3>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                        {step.desc}
                      </p>
                    </div>

                    <div className="pt-3 mt-4 border-t border-stone-100 dark:border-stone-800/80">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold">
                        <Sparkles size={11} />
                        <span>{step.highlight}</span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            5. INTERACTIVE 3D CULTURE, ENERGY & PHOTO MOSAIC
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 border-b border-stone-200/50 dark:border-stone-800 bg-transparent">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4" data-reveal="up">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2 backdrop-blur-md">
                  <Heart size={14} className="text-amber-500" />
                  <span>LIFE &amp; COMMUNITY</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight">
                  High Energy. High Standards. <br />
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    Life at Adyapan.
                  </span>
                </h2>
              </div>

              <Link
                to="/life-at-adyapan"
                className="inline-flex items-center gap-2 text-sm font-black text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline"
              >
                <span>View Full Life Gallery</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cultureCards.map((card, idx) => (
                <TiltCard
                  key={card.title}
                  maxTilt={10}
                  className="h-[280px] sm:h-[320px]"
                >
                  <div
                    data-reveal="up"
                    data-delay={idx * 80}
                    className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl border border-stone-200/80 dark:border-stone-800 group bg-stone-950 cursor-pointer"
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    <div className="absolute top-4 left-4 flex items-center justify-between right-4">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
                        {card.category}
                      </span>
                      <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black flex items-center justify-center">
                        {card.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 p-5 space-y-1 text-white">
                      <h3 className="text-base sm:text-lg font-bold leading-snug text-white group-hover:text-amber-400 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-stone-300 font-medium">{card.subtitle}</p>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            6. "THE CANDIDATE SUCCESS STORY" - CUSTOM ANIMATED CHARACTER SCENE
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 bg-transparent border-b border-stone-200/50 dark:border-stone-800 overflow-hidden">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-2 backdrop-blur-md">
                <PartyPopper size={14} className="text-emerald-500" />
                <span>ORIGINAL CANDIDATE BREAKTHROUGH ANIMATION</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight">
                Walk In Prepared. <br />
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  Leap Out Celebrating!
                </span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-2 font-medium">
                An exclusive animated story: A well-dressed professional carrying a laptop bag arrives for the interview,
                shatters the AI ATS assessment, signs his dream offer, and leaps with ecstatic joy on screen!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Live Interactive Animated Vector Stage */}
              <div className="lg:col-span-6 flex flex-col" data-reveal="left">
                <TiltCard maxTilt={6} className="h-full rounded-3xl p-3 bg-gradient-to-b from-amber-500/25 via-orange-500/10 to-transparent border border-amber-500/40 shadow-2xl flex flex-col">
                  <CandidateStoryAnimation
                    currentStage={candidateStageIndex}
                    onSelectStage={(idx) => setCandidateStageIndex(idx)}
                  />
                </TiltCard>
              </div>

              {/* Right Column: 4 Interactive Step Cards */}
              <div className="lg:col-span-6 flex flex-col justify-between gap-3" data-reveal="right">
                
                <div
                  onClick={() => setCandidateStageIndex(0)}
                  className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 flex-1 flex items-center gap-4 ${candidateStageIndex === 0 ? 'bg-amber-500/20 dark:bg-amber-500/25 border-2 border-amber-500 shadow-lg scale-[1.01]' : 'bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/40'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${candidateStageIndex === 0 ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>
                    01
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <BriefcaseBusiness size={15} className="text-amber-500" />
                      <span>Professional Suited Entrance</span>
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium leading-relaxed">
                      Suited up with laptop briefcase bag in hand, walking confidently into the interview hall.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setCandidateStageIndex(1)}
                  className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 flex-1 flex items-center gap-4 ${candidateStageIndex === 1 ? 'bg-amber-500/20 dark:bg-amber-500/25 border-2 border-amber-500 shadow-lg scale-[1.01]' : 'bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/40'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${candidateStageIndex === 1 ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>
                    02
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <Cpu size={15} className="text-amber-500" />
                      <span>Cracking the AI ATS Assessment</span>
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium leading-relaxed">
                      Live code evaluation &amp; system architecture scored deterministically at 98.4%.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setCandidateStageIndex(2)}
                  className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 flex-1 flex items-center gap-4 ${candidateStageIndex === 2 ? 'bg-emerald-500/20 dark:bg-emerald-500/25 border-2 border-emerald-500 shadow-lg scale-[1.01]' : 'bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/40'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${candidateStageIndex === 2 ? 'bg-emerald-500 text-white shadow-md' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}`}>
                    03
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      <span>Instant Verified Offer Package</span>
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium leading-relaxed">
                      Official stamped employment letter issued with top CTC package (₹24.5 LPA).
                    </p>
                  </div>
                </div>

                <div
                  onClick={triggerCelebration}
                  className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 flex-1 flex items-center gap-4 ${candidateStageIndex === 3 ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 border-2 border-amber-500 shadow-xl scale-[1.01]' : 'bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/40'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center flex-shrink-0 font-black text-base shadow-md">
                    🎉
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <PartyPopper size={15} className="text-amber-500" />
                      <span>The Ecstatic Screen Leap &amp; Joy!</span>
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium leading-relaxed">
                      Pure victory jump on screen as golden confetti bursts and the dream career is unlocked!
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            7. 6-PILLAR CORE VALUES (WHAT WE VALUE MOST)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 bg-transparent border-b border-stone-200/50 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10" data-reveal="up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2 backdrop-blur-md">
                <ShieldCheck size={14} className="text-amber-500" />
                <span>OUR CODE OF EXCELLENCE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 dark:text-white tracking-tight">
                Values That Define <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Every Interaction.
                </span>
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-2 font-medium">
                We believe culture is what you do when no one is watching.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {coreValues.map((val, idx) => {
                const Icon = val.icon;
                return (
                  <TiltCard
                    key={val.title}
                    maxTilt={8}
                    className="h-full"
                  >
                    <div
                      data-reveal="up"
                      data-delay={idx * 80}
                      className="p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-stone-900/85 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between h-full transition-all"
                    >
                      <div>
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                          <Icon size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">
                          {val.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                          {val.desc}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                        <span>ADYAPAN DNA</span>
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            8. 3D CAREER WARP LAUNCHPAD & LIVE OFFER UNLOCK (NEW INNOVATIVE END SECTION)
           ══════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-10 sm:py-14 bg-transparent border-b border-stone-200/50 dark:border-stone-800">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <Interactive3DCareerWarp onTriggerConfetti={triggerCelebration} />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            9. FUTURISTIC CALL-TO-ACTION (CTA)
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
                  <span>JOIN THE TALENT REVOLUTION</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 tracking-tight leading-tight">
                  Be a part of something <br />
                  exponentially bigger.
                </h2>

                <p className="text-stone-950/90 text-xs sm:text-sm font-semibold leading-relaxed max-w-lg">
                  Whether you are an engineer pushing AI frontiers, a mentor transforming student careers, or an operator executing with precision—your runway begins at Adyapan.
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



        {/* ══════════════════════════════════════════════════════════
            CELEBRATION JUMP CONFETTI & EMOJI BURST OVERLAY
           ══════════════════════════════════════════════════════════ */}
        {showCelebrationJump && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              {['🎉', '🚀', '💼', '🥳', '🏆', '⭐', '🎊', '🔥'].map((emoji, idx) => (
                <span
                  key={idx}
                  className="absolute text-5xl sm:text-7xl animate-bounce"
                  style={{
                    left: `${15 + (idx * 11)}%`,
                    top: `${20 + (idx % 3) * 20}%`,
                    animationDuration: `${0.8 + (idx % 4) * 0.3}s`,
                    animationDelay: `${idx * 0.1}s`,
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-stone-950/95 text-white border-2 border-amber-400 shadow-2xl backdrop-blur-2xl text-center space-y-2 animate-pulse max-w-md mx-4">
              <div className="text-4xl sm:text-5xl">🎉 💼 🚀</div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                DREAM JOB CRACKED!
              </h3>
              <p className="text-xs sm:text-sm text-amber-100 font-bold">
                From interview arrival to offer unlocked—pure happiness and unstoppable career acceleration!
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            3D HOLOGRAPHIC PILLAR IMPACT DEEP-DIVE MODAL
           ══════════════════════════════════════════════════════════ */}
        {selectedPillar && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn"
            onClick={() => setSelectedPillar(null)}
          >
            <div
              className="relative max-w-2xl w-full bg-stone-950/95 dark:bg-stone-900/95 text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/25 overflow-hidden animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top ambient glow */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" />

              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <selectedPillar.icon size={24} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black tracking-widest uppercase text-amber-400 block">
                      {selectedPillar.tag} · {selectedPillar.badge}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mt-0.5">
                      {selectedPillar.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPillar(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="py-5 space-y-5 relative z-10 text-left">
                {/* Deep Dive Summary */}
                <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed">
                  {selectedPillar.deepDive}
                </p>

                {/* 3 Impact Metric Boxes */}
                <div className="grid grid-cols-3 gap-3">
                  {selectedPillar.metrics.map((m) => (
                    <div key={m.label} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left">
                      <div className="text-lg sm:text-2xl font-black text-amber-400">
                        {m.val}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-semibold text-stone-400 mt-0.5">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Pillars Highlights */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                    KEY BREAKTHROUGHS &amp; EXECUTION:
                  </span>
                  <div className="space-y-2">
                    {selectedPillar.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-stone-200 font-medium">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 size={12} />
                        </div>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                <span className="text-xs text-stone-400 font-semibold">
                  Adyapan Architectural Standard
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPillar(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-white bg-white/10 hover:bg-white/15 transition-all"
                  >
                    Close
                  </button>
                  <Link
                    to="/open-positions"
                    onClick={() => setSelectedPillar(null)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-stone-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <span>Explore Open Roles</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </SiteShell>
  );
};

export default AboutUs;
