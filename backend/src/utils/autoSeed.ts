import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import { logger } from './logger.js';

export const autoSeed = async () => {
  try {
    console.log('Checking PostgreSQL Database Seeding Status...');
    const salt = await bcrypt.genSalt(10);

    // 1. Ensure Default Admin Users (admin@adyapan.com & rupesh@adyapan.com)
    const adminHash = await bcrypt.hash('Admin@123', salt);
    let defaultAdmin = await prisma.user.findFirst({ where: { email: 'admin@adyapan.com' } });
    if (!defaultAdmin) {
      defaultAdmin = await prisma.user.create({
        data: {
          id: 'admin-adyapan-01',
          name: 'Adyapan Recruiter Admin',
          email: 'admin@adyapan.com',
          password: adminHash,
          role: 'ADMIN',
          company: 'Adyapan Edutech Pvt Ltd',
          meetLink: 'https://meet.google.com/admin-adyapan',
          isActive: true,
        },
      });
      console.log('Default Admin User Created (admin@adyapan.com / Admin@123)');
    }

    let rupeshAdmin = await prisma.user.findFirst({ where: { email: 'rupesh@adyapan.com' } });
    if (!rupeshAdmin) {
      await prisma.user.create({
        data: {
          id: 'rupesh-admin',
          name: 'Rupesh (Admin)',
          email: 'rupesh@adyapan.com',
          password: adminHash,
          role: 'ADMIN',
          company: 'Adyapan Edutech Pvt Ltd',
          meetLink: 'https://meet.google.com/rupesh-admin',
          isActive: true,
        },
      });
      console.log('Admin User Verified (rupesh@adyapan.com / Admin@123)');
    }

    // 2. Ensure Official HR Manager (nandini@adyapan.com / Manager@123)
    const managerHash = await bcrypt.hash('Manager@123', salt);
    let hrManager = await prisma.user.findFirst({ where: { email: 'nandini@adyapan.com' } });
    if (!hrManager) {
      hrManager = await prisma.user.create({
        data: {
          id: 'nandini-manager',
          name: 'Nandini (HR Manager)',
          email: 'nandini@adyapan.com',
          password: managerHash,
          role: 'HR_MANAGER',
          designation: 'Head of Talent Acquisition',
          department: 'Talent Acquisition',
          company: 'Adyapan Edutech Pvt Ltd',
          meetLink: 'https://meet.google.com/nandini-manager',
          isActive: true,
        },
      });
      console.log('Official HR Manager Verified (nandini@adyapan.com / Manager@123)');
    }

    // 3. Ensure 5 Official HR Specialists
    const hrPass = await bcrypt.hash('Hr@12345', salt);
    const officialHRs = [
      { id: 'hr-pavitra', name: 'Pavitra (HR-01)', email: 'pavitra@adyapan.com', meetLink: 'https://meet.google.com/pavitra-hr01' },
      { id: 'hr-charitha', name: 'Charitha (HR-02)', email: 'charitha@adyapan.com', meetLink: 'https://meet.google.com/charitha-hr02' },
      { id: 'hr-nitisha', name: 'Nitisha (HR-03)', email: 'nitisha@adyapan.com', meetLink: 'https://meet.google.com/nitisha-hr03' },
      { id: 'hr-aravind', name: 'Aravind (HR-04)', email: 'aravind@adyapan.com', meetLink: 'https://meet.google.com/aravind-hr04' },
      { id: 'hr-veena', name: 'Veena (HR-05)', email: 'veena@adyapan.com', meetLink: 'https://meet.google.com/veena-hr05' },
    ];

    for (const hr of officialHRs) {
      const existing = await prisma.user.findUnique({ where: { email: hr.email } });
      if (!existing) {
        await prisma.user.create({
          data: {
            id: hr.id,
            name: hr.name,
            email: hr.email,
            password: hrPass,
            role: 'HR',
            designation: 'Talent Acquisition Specialist',
            department: 'HR & Recruitment',
            company: 'Adyapan Edutech Pvt Ltd',
            meetLink: hr.meetLink,
            isActive: true,
          },
        });
      }
    }

    // 4. Ensure Default ATS Screening Rule Exists
    const screeningRuleCount = await prisma.screeningRule.count();
    if (screeningRuleCount === 0) {
      await prisma.screeningRule.create({
        data: {
          name: 'Standard ATS 24-Hour Screening Policy',
          minAiScore: 65,
          minExperience: 0,
          requiredSkills: ['communication', 'sales'],
          isActive: true,
          autoReject: true,
        },
      });
    }

    console.log('PostgreSQL Database Initialization Complete! Official HR team and Admin ready.');
  } catch (error: any) {
    console.error('Auto Seed Error:', error.message);
  }
};
