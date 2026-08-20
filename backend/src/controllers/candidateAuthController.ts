import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const generateCandidateToken = (candidate: any) => {
  return jwt.sign(
    { id: candidate.id, email: candidate.email, role: 'CANDIDATE' },
    process.env.JWT_SECRET || 'fallback_secret_key_12345',
    { expiresIn: '30d' }
  );
};

// Candidate Registration
export const candidateRegister = async (req: any, res: any) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const existingCandidate = await prisma.candidate.findUnique({ where: { email: email.trim().toLowerCase() } });

    if (existingCandidate && existingCandidate.password && existingCandidate.isRegistered) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let candidate;
    if (existingCandidate) {
      // Candidate exists (applied before without registering) - add password
      candidate = await prisma.candidate.update({
        where: { id: existingCandidate.id },
        data: {
          firstName: firstName || existingCandidate.firstName,
          lastName: lastName || existingCandidate.lastName,
          phone: phone || existingCandidate.phone,
          password: hashedPassword,
          isRegistered: true
        }
      });
    } else {
      candidate = await prisma.candidate.create({
        data: {
          firstName,
          lastName: lastName || '',
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          phone: phone || '',
          resumeUrl: '',
          isRegistered: true
        }
      });
    }

    const token = generateCandidateToken(candidate);
    const { password: _, ...candidateWithoutPassword } = candidate;

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Adyapan Careers.',
      candidate: candidateWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('Candidate Register Error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// Candidate Login
export const candidateLogin = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!candidate || !candidate.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, candidate.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateCandidateToken(candidate);
    const { password: _, ...candidateWithoutPassword } = candidate;

    return res.json({
      success: true,
      message: 'Login successful!',
      candidate: candidateWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('Candidate Login Error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// Get Current Candidate Profile
export const getCandidateProfile = async (req: any, res: any) => {
  try {
    const candidateId = req.candidate?.id;

    if (!candidateId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                slug: true,
                department: true,
                location: true,
                type: true,
                status: true
              }
            }
          },
          orderBy: { appliedAt: 'desc' }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const { password: _, ...candidateWithoutPassword } = candidate;

    return res.json({
      success: true,
      candidate: candidateWithoutPassword
    });
  } catch (error: any) {
    console.error('Get Candidate Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
};

// Update Candidate Profile
export const updateCandidateProfile = async (req: any, res: any) => {
  try {
    const candidateId = req.candidate?.id;

    if (!candidateId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { firstName, lastName, phone, location, linkedin, portfolio, skills, currentCompany, currentPosition } = req.body;

    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(linkedin !== undefined && { linkedin }),
        ...(portfolio !== undefined && { portfolio }),
        ...(skills && { skills: Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()) }),
        ...(currentCompany !== undefined && { currentCompany }),
        ...(currentPosition !== undefined && { currentPosition }),
      }
    });

    const { password: _, ...candidateWithoutPassword } = candidate;

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      candidate: candidateWithoutPassword
    });
  } catch (error: any) {
    console.error('Update Candidate Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// Get My Applications (Candidate tracking)
export const getMyApplications = async (req: any, res: any) => {
  try {
    const candidateId = req.candidate?.id;
    const candidateEmail = req.candidate?.email;

    if (!candidateId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Find all candidate records that share the same email (handles pre-registration applications)
    const candidateIds = [candidateId];
    if (candidateEmail) {
      const matchingCandidates = await prisma.candidate.findMany({
        where: { email: candidateEmail },
        select: { id: true }
      });
      for (const c of matchingCandidates) {
        if (!candidateIds.includes(c.id)) {
          candidateIds.push(c.id);
        }
      }
    }

    const applications = await prisma.application.findMany({
      where: { candidateId: { in: candidateIds } },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            department: true,
            location: true,
            type: true,
            status: true,
            salaryMin: true,
            salaryMax: true
          }
        },
        interviews: {
          select: {
            id: true,
            type: true,
            scheduledAt: true,
            status: true,
            meetingLink: true
          },
          orderBy: { scheduledAt: 'desc' }
        },
        offer: {
          select: {
            id: true,
            status: true,
            salary: true,
            joiningDate: true
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return res.json({
      success: true,
      applications
    });
  } catch (error: any) {
    console.error('Get My Applications Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load applications' });
  }
};


// Universal Login - checks User table (admin/HR) first, then Candidate table
export const universalLogin = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const normEmail = String(email).trim().toLowerCase();

    // 1. Try User table (Admin / HR)
    try {
      const user = await prisma.user.findFirst({
        where: { email: { equals: normEmail, mode: 'insensitive' } }
      });

      if (user) {
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || 'HR' },
            process.env.JWT_SECRET || 'fallback_secret_key_12345',
            { expiresIn: '30d' }
          );
          const { password: _, ...userWithoutPassword } = user;
          return res.json({
            success: true,
            role: user.role || 'ADMIN',
            user: userWithoutPassword,
            token
          });
        }
      }
    } catch (dbErr: any) {
      console.warn('User table lookup error:', dbErr.message);
    }

    // 2. Try Candidate table
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { email: normEmail }
      });

      if (candidate && candidate.password) {
        const isValid = await bcrypt.compare(password, candidate.password);
        if (isValid) {
          const token = jwt.sign(
            { id: candidate.id, email: candidate.email, role: 'CANDIDATE' },
            process.env.JWT_SECRET || 'fallback_secret_key_12345',
            { expiresIn: '30d' }
          );
          const { password: _, ...candidateWithoutPassword } = candidate;
          return res.json({
            success: true,
            role: 'CANDIDATE',
            candidate: candidateWithoutPassword,
            token
          });
        }
      }
    } catch (dbErr: any) {
      console.warn('Candidate table lookup error:', dbErr.message);
    }

    // 3. Both failed
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  } catch (error: any) {
    console.error('Universal Login Error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};
