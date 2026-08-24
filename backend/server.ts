import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import authRoutes from './src/routes/authRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import candidateRoutes from './src/routes/candidateRoutes.js';
import candidateAuthRoutes from './src/routes/candidateAuthRoutes.js';
import applicationRoutes from './src/routes/applicationRoutes.js';
import interviewRoutes from './src/routes/interviewRoutes.js';
import offerRoutes from './src/routes/offerRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import { todayReminderScheduler } from './src/services/todayReminderScheduler.js';

// Middleware
import { errorMiddleware } from './src/middleware/errorMiddleware.js';
import { autoSeed } from './src/utils/autoSeed.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Bulletproof CORS Configuration for Vercel Frontend & Production
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

// Security-Hardened Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 mins for login / auth / contact
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please try again in 15 minutes.' },
});

// Middleware & Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  frameguard: false, // Allow in-app document preview in iframe
  xContentTypeOptions: true,
  xXssProtection: true,
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', apiLimiter);

// Strict Rate Limiting on Authentication & Public Form Endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/candidate-auth/login', authLimiter);
app.use('/api/candidate-auth/register', authLimiter);
app.use('/api/contact', authLimiter);

// Static files with Cross-Origin and PDF inline headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/candidate-auth', candidateAuthRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/analytics', analyticsRoutes);
import onboardingRoutes from './src/routes/onboardingRoutes.js';
import auditRoutes from './src/routes/auditRoutes.js';

app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/audit', auditRoutes);
import { sendContactUsSupportEmail } from './src/services/emailService.js';

// Contact Us Form Submission API (Delivers to support@adyapan.com)
app.post('/api/contact', async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    if (!fullName || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide fullName, email, and message.' });
    }

    const emailResult = await sendContactUsSupportEmail({ fullName, email, phone, subject, message });

    return res.json({
      success: true,
      message: `Your message has been sent successfully to support@adyapan.com!`,
      emailResult,
    });
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send your message. Please try again or email us directly at support@adyapan.com.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorMiddleware);

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log(`CORS enabled for: http://localhost:5173`);
  await autoSeed();
  todayReminderScheduler.startScheduler();
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${PORT} is already in use by another running backend process. The server is ALREADY LIVE on http://localhost:${PORT}!`);
  } else {
    console.error('Server error:', err);
  }
});