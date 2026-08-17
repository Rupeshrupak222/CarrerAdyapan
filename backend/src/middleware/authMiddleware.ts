import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Missing or invalid Authorization header'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_12345') as any;

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid token payload'
      });
    }
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { 
          id: true, 
          name: true, 
          email: true, 
          role: true, 
          company: true 
        }
      });

      if (user) {
        req.user = user;
        return next();
      }
    } catch (dbError: any) {
      console.warn('Prisma auth DB warning, falling back to token payload:', dbError.message);
    }

    req.user = {
      id: decoded.id,
      name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'Recruiter Admin'),
      email: decoded.email || 'admin@adyapan.com',
      role: decoded.role || 'HR',
      company: decoded.company || 'Adyapan Edutech Pvt Ltd'
    };

    next();
  } catch (error: any) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Token verification failed'
    });
  }
};

export const roleMiddleware = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (req.user && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }
    next();
  };
};