import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import { logger } from './logger.js';

export const autoSeed = async () => {
  try {
    console.log('Checking PostgreSQL Database Seeding Status...');

    // 1. Ensure Default Admin User (admin@adyapan.com / Admin@123)
    let defaultUser = await prisma.user.findFirst({ where: { email: 'admin@adyapan.com' } });
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          id: 'demo-user-101',
          name: 'Adyapan Recruiter Admin',
          email: 'admin@adyapan.com',
          password: adminHash,
          role: 'ADMIN',
          company: 'Adyapan Edutech Pvt Ltd',
        },
      });
      console.log('Default Admin User Created in PostgreSQL DB (admin@adyapan.com / Admin@123)');
    } else {
      await prisma.user.update({
        where: { id: defaultUser.id },
        data: { password: adminHash, role: 'ADMIN' },
      });
      console.log('Default Admin Password & Role Updated in PostgreSQL DB (admin@adyapan.com / Admin@123)');
    }

    // 1.1 Ensure Default Candidate User (user@adyapan.com / User@123)
    const userPass = await bcrypt.hash('User@123', salt);
    await prisma.candidate.upsert({
      where: { email: 'user@adyapan.com' },
      update: { password: userPass, isRegistered: true },
      create: {
        firstName: 'Adyapan',
        lastName: 'Candidate',
        email: 'user@adyapan.com',
        password: userPass,
        phone: '+91 9876543210',
        isRegistered: true,
        resumeUrl: '',
        skills: ['Communication', 'Sales', 'EdTech'],
        location: 'Hyderabad',
      },
    }).catch(() => null);

    const userId = defaultUser.id;

    // 2. Seed initial jobs if database is empty
    const jobCount = await prisma.job.count();
    if (jobCount === 0) {
      console.log('Seeding initial jobs into PostgreSQL DB...');
      await prisma.job.createMany({
        data: [
          {
            id: 'business-development-associate-edtech',
            slug: 'business-development-associate-edtech',
            title: 'Business Development Associate (EdTech Sales)',
            department: 'Sales & Growth',
            location: 'Mumbai / Hybrid',
            type: 'FULL_TIME',
            experienceLevel: 'ENTRY',
            salaryMin: 350000,
            salaryMax: 600000,
            status: 'PUBLISHED',
            description: 'We are seeking an energetic Business Development Associate to drive student course enrolments, manage sales pipelines, conduct counselling calls, and achieve monthly revenue targets for Adyapan Edutech.',
            requirements: '1-3 years sales or telesales experience in EdTech or education; excellent English & Hindi communication; strong target achievement mindset; negotiation skills.',
            responsibilities: 'Connect with prospective student leads; conduct detailed course counselling sessions; meet monthly enrolment targets; maintain CRM lead status.',
            userId,
          },
          {
            id: 'academic-counsellor-student-advisor',
            slug: 'academic-counsellor-student-advisor',
            title: 'Academic Counsellor / Student Advisor',
            department: 'Student Admissions',
            location: 'Delhi NCR / Remote',
            type: 'FULL_TIME',
            experienceLevel: 'MID',
            salaryMin: 300000,
            salaryMax: 500000,
            status: 'PUBLISHED',
            description: 'Provide personalized academic guidance to prospective students and parents, understand their career goals, recommend suitable learning programs, and assist with enrolment.',
            requirements: '2+ years experience in academic counselling, student advisement, or education sales; empathetic active listening; objection handling skills; CRM knowledge.',
            responsibilities: 'Guide students on career choices and course curricula; follow up on inbound leads; resolve parent queries; achieve monthly student admissions goals.',
            userId,
          },
        ]
      });
      console.log('Initial jobs seeded into DB!');
    }

    // 3. Deduplicate Any Existing Duplicate Candidate Records in PostgreSQL DB
    const allDbCandidates = await prisma.candidate.findMany({ orderBy: { createdAt: 'desc' } });
    const seenCandEmails = new Set();
    for (const cand of allDbCandidates) {
      if (cand.email) {
        const normEmail = cand.email.toLowerCase().trim();
        if (seenCandEmails.has(normEmail)) {
          console.log(`Removing duplicate DB candidate ID ${cand.id} for ${cand.email}`);
          await prisma.candidate.delete({ where: { id: cand.id } }).catch(() => null);
        } else {
          seenCandEmails.add(normEmail);
        }
      }
    }

    // 4. Deduplicate Any Existing Duplicate Offers in PostgreSQL DB
    const allDbOffers = await prisma.offer.findMany({ orderBy: { createdAt: 'desc' } });
    const seenOfferKeys = new Set();
    for (const off of allDbOffers) {
      const emailKey = off.candidateEmail && !off.candidateEmail.includes('example.com') ? off.candidateEmail.toLowerCase().trim() : null;
      const nameKey = off.candidateName ? off.candidateName.toLowerCase().trim() : null;
      const key = emailKey || nameKey;

      if (key && seenOfferKeys.has(key)) {
        console.log(`Removing duplicate DB offer ID ${off.id} for ${off.candidateName}`);
        await prisma.offer.delete({ where: { id: off.id } }).catch(() => null);
      } else if (key) {
        seenOfferKeys.add(key);
      }
    }

    console.log('PostgreSQL Database Initialization Complete!');
  } catch (error) {
    console.error('Auto Seed Error:', error.message);
  }
};
