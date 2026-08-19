import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const candidateAuthMiddleware = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Please login to continue'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_12345') as any;

    if (!decoded || !decoded.id || decoded.role !== 'CANDIDATE') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid candidate token'
      });
    }

    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isRegistered: true
        }
      });

      if (candidate) {
        req.candidate = candidate;
        return next();
      }
    } catch (dbError: any) {
      console.warn('Prisma candidate auth DB warning:', dbError.message);
    }

    // Fallback to token payload
    req.candidate = {
      id: decoded.id,
      email: decoded.email,
      firstName: decoded.email?.split('@')[0] || 'Candidate',
      lastName: '',
    };

    next();
  } catch (error: any) {
    console.error('Candidate Auth Middleware Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Session expired. Please login again.'
    });
  }
};
