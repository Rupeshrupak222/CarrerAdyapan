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
import applicationRoutes from './src/routes/applicationRoutes.js';
import interviewRoutes from './src/routes/interviewRoutes.js';
import offerRoutes from './src/routes/offerRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';

// Middleware
import { errorMiddleware } from './src/middleware/errorMiddleware.js';
import { autoSeed } from './src/utils/autoSeed.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50000,
  message: 'Too many requests from this IP',
  skip: () => true,
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/analytics', analyticsRoutes);
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
  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message: ' + error.message });
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
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${PORT} is already in use by another running backend process. The server is ALREADY LIVE on http://localhost:${PORT}!`);
  } else {
    console.error('Server error:', err);
  }
});