import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { logger } from './logger.js';

const prisma = new PrismaClient();

export const autoSeed = async () => {
  try {
    console.log('🌱 Checking PostgreSQL Database Seeding Status...');

    // 1. Ensure Default Admin User
    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          id: 'demo-user-101',
          name: 'Adyapan Recruiter Admin',
          email: 'admin@adyapan.com',
          password: '$2a$10$hashedpasswordplaceholder',
          role: 'ADMIN',
          company: 'Adyapan Edutech Pvt Ltd',
        },
      });
      console.log('✅ Default User Created in PostgreSQL DB');
    }

    const userId = defaultUser.id;

    // 2. Ensure Default Published Job
    let defaultJob = await prisma.job.findFirst();
    if (!defaultJob) {
      defaultJob = await prisma.job.create({
        data: {
          id: 'business-development-associate-edtech',
          title: 'Business Development Associate (BDA)',
          slug: 'business-development-associate-edtech',
          department: 'Sales & Growth',
          location: 'Mumbai / Hybrid',
          type: 'FULL_TIME',
          experienceLevel: 'ENTRY',
          salaryMin: 350000,
          salaryMax: 600000,
          description: 'Drive student course enrolments and counselling.',
          requirements: 'Sales communication skills, student counselling.',
          responsibilities: 'Connect with prospective student leads.',
          status: 'PUBLISHED',
          userId: userId,
        },
      });
      console.log('✅ Default Published Job Created in PostgreSQL DB');
    }

    // 3. Deduplicate Any Existing Duplicate Offers in PostgreSQL DB
    const allDbOffers = await prisma.offer.findMany({ orderBy: { createdAt: 'desc' } });
    const seenOfferKeys = new Set();
    for (const off of allDbOffers) {
      const emailKey = off.candidateEmail && !off.candidateEmail.includes('example.com') ? off.candidateEmail.toLowerCase().trim() : null;
      const nameKey = off.candidateName ? off.candidateName.toLowerCase().trim() : null;
      const key = emailKey || nameKey;

      if (key && seenOfferKeys.has(key)) {
        console.log(`🧹 Removing duplicate DB offer ID ${off.id} for ${off.candidateName}`);
        await prisma.offer.delete({ where: { id: off.id } }).catch(() => null);
      } else if (key) {
        seenOfferKeys.add(key);
      }
    }

    console.log('🚀 PostgreSQL Database Initialization Complete!');
  } catch (error) {
    console.error('❌ Auto Seed Error:', error.message);
  }
};
