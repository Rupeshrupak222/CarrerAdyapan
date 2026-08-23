import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import { logger } from './logger.js';

export const autoSeed = async () => {
  try {
    console.log('Checking PostgreSQL Database Seeding Status...');
    const salt = await bcrypt.genSalt(10);

    // 1. Ensure Default Admin User (admin@adyapan.com / Admin@123)
    let defaultAdmin = await prisma.user.findFirst({ where: { email: 'admin@adyapan.com' } });
    const adminHash = await bcrypt.hash('Admin@123', salt);
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

    // 2. Ensure Default HR Manager (manager@company.com / Manager@123)
    let hrManager = await prisma.user.findFirst({ where: { email: 'manager@company.com' } });
    const managerHash = await bcrypt.hash('Manager@123', salt);
    if (!hrManager) {
      hrManager = await prisma.user.create({
        data: {
          id: 'manager-adyapan-01',
          name: 'Priya Sharma (HR Manager)',
          email: 'manager@company.com',
          password: managerHash,
          role: 'HR_MANAGER',
          designation: 'Head of Talent Acquisition & Operations',
          department: 'Talent Acquisition',
          company: 'Adyapan Edutech Pvt Ltd',
          meetLink: 'https://meet.google.com/priya-manager',
          isActive: true,
        },
      });
      console.log('Default HR Manager Created (manager@company.com / Manager@123)');
    }

    // 3. Ensure 5 Initial HR Users (HR-01 to HR-05 / Hr@12345)
    const hrPass = await bcrypt.hash('Hr@12345', salt);
    const initialHRs = [
      { id: 'hr-01', name: 'Aarav Patel (HR-01)', email: 'hr01@company.com', meetLink: 'https://meet.google.com/aarav-hr01' },
      { id: 'hr-02', name: 'Neha Gupta (HR-02)', email: 'hr02@company.com', meetLink: 'https://meet.google.com/neha-hr02' },
      { id: 'hr-03', name: 'Rohan Verma (HR-03)', email: 'hr03@company.com', meetLink: 'https://meet.google.com/rohan-hr03' },
      { id: 'hr-04', name: 'Ananya Reddy (HR-04)', email: 'hr04@company.com', meetLink: 'https://meet.google.com/ananya-hr04' },
      { id: 'hr-05', name: 'Vikram Singh (HR-05)', email: 'hr05@company.com', meetLink: 'https://meet.google.com/vikram-hr05' },
    ];

    for (const hr of initialHRs) {
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

    // 5. Initial Job Requisition
    let defaultJob = await prisma.job.findFirst({ where: { slug: 'business-development-associate-edtech' } });
    if (!defaultJob) {
      defaultJob = await prisma.job.create({
        data: {
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
          totalRounds: 3,
          interviewRounds: [
            { roundNumber: 1, name: 'Round 1: Screening / HR', type: 'PHONE' },
            { roundNumber: 2, name: 'Round 2: Technical / Sales Pitch', type: 'VIDEO' },
            { roundNumber: 3, name: 'Round 3: Final Management HR', type: 'VIDEO' },
          ],
          description: 'We are seeking an energetic Business Development Associate to drive student course enrolments, conduct counselling calls, and achieve monthly revenue targets for Adyapan Edutech.',
          requirements: '1-3 years sales or telesales experience in EdTech or education; excellent English & Hindi communication; strong target achievement mindset.',
          responsibilities: 'Connect with prospective student leads; conduct detailed course counselling sessions; meet monthly enrolment targets; maintain CRM lead status.',
          userId: defaultAdmin.id,
        },
      });
    }

    // 6. Ensure Realistic Candidates & Balanced Allocation (HR-01 to HR-05)
    const candidateCount = await prisma.candidate.count();
    if (candidateCount < 10 && defaultJob) {
      console.log('Seeding rich candidate pool across HR-01 to HR-05...');

      const sampleCandidates = [
        {
          code: 'CAND-000001',
          first: 'Kunal',
          last: 'Kapoor',
          email: 'kunal.kapoor@example.com',
          phone: '+91 98201-11223',
          location: 'Mumbai',
          score: 92,
          round: 1,
          status: 'INTERVIEWING',
          hrId: 'hr-01',
          exp: 2,
        },
        {
          code: 'CAND-000002',
          first: 'Sneha',
          last: 'Rao',
          email: 'sneha.rao@example.com',
          phone: '+91 98450-22334',
          location: 'Bangalore',
          score: 88,
          round: 2,
          status: 'INTERVIEWING',
          hrId: 'hr-01',
          exp: 1,
        },
        {
          code: 'CAND-000003',
          first: 'Aditya',
          last: 'Mehta',
          email: 'aditya.mehta@example.com',
          phone: '+91 98110-33445',
          location: 'Delhi NCR',
          score: 95,
          round: 3,
          status: 'SELECTED',
          hrId: 'hr-01',
          exp: 3,
        },
        {
          code: 'CAND-000004',
          first: 'Pooja',
          last: 'Iyer',
          email: 'pooja.iyer@example.com',
          phone: '+91 98401-44556',
          location: 'Chennai',
          score: 84,
          round: 1,
          status: 'INTERVIEWING',
          hrId: 'hr-02',
          exp: 1,
        },
        {
          code: 'CAND-000005',
          first: 'Manish',
          last: 'Tiwari',
          email: 'manish.tiwari@example.com',
          phone: '+91 97170-55667',
          location: 'Noida',
          score: 79,
          round: 2,
          status: 'INTERVIEWING',
          hrId: 'hr-02',
          exp: 2,
        },
        {
          code: 'CAND-000006',
          first: 'Ritu',
          last: 'Deshmukh',
          email: 'ritu.deshmukh@example.com',
          phone: '+91 98230-66778',
          location: 'Pune',
          score: 91,
          round: 1,
          status: 'INTERVIEWING',
          hrId: 'hr-03',
          exp: 1,
        },
        {
          code: 'CAND-000007',
          first: 'Arjun',
          last: 'Nair',
          email: 'arjun.nair@example.com',
          phone: '+91 94470-77889',
          location: 'Kochi',
          score: 87,
          round: 2,
          status: 'INTERVIEWING',
          hrId: 'hr-03',
          exp: 2,
        },
        {
          code: 'CAND-000008',
          first: 'Divya',
          last: 'Sharma',
          email: 'divya.sharma@example.com',
          phone: '+91 98140-88990',
          location: 'Chandigarh',
          score: 93,
          round: 3,
          status: 'SELECTED',
          hrId: 'hr-04',
          exp: 3,
        },
        {
          code: 'CAND-000009',
          first: 'Varun',
          last: 'Joshi',
          email: 'varun.joshi@example.com',
          phone: '+91 98260-99001',
          location: 'Indore',
          score: 82,
          round: 1,
          status: 'INTERVIEWING',
          hrId: 'hr-04',
          exp: 1,
        },
        {
          code: 'CAND-000010',
          first: 'Meera',
          last: 'Patil',
          email: 'meera.patil@example.com',
          phone: '+91 98220-10112',
          location: 'Nagpur',
          score: 89,
          round: 1,
          status: 'INTERVIEWING',
          hrId: 'hr-05',
          exp: 2,
        },
        {
          code: 'CAND-000011',
          first: 'Siddharth',
          last: 'Bose',
          email: 'siddharth.bose@example.com',
          phone: '+91 98300-21223',
          location: 'Kolkata',
          score: 86,
          round: 2,
          status: 'INTERVIEWING',
          hrId: 'hr-05',
          exp: 2,
        },
      ];

      for (const sc of sampleCandidates) {
        const candidateRecord = await prisma.candidate.create({
          data: {
            candidateCode: sc.code,
            firstName: sc.first,
            lastName: sc.last,
            email: sc.email,
            phone: sc.phone,
            location: sc.location,
            experience: sc.exp,
            currentPosition: 'Sales Executive',
            skills: ['EdTech Sales', 'Communication', 'Lead Conversion', 'B2C Sales'],
            aiScore: sc.score,
            status: sc.status,
          },
        });

        const appRecord = await prisma.application.create({
          data: {
            candidateId: candidateRecord.id,
            jobId: defaultJob.id,
            candidateCode: sc.code,
            screeningStatus: 'SHORTLISTED',
            screeningScore: sc.score,
            screenedAt: new Date(),
            assignedHrId: sc.hrId,
            assignedAt: new Date(),
            currentRound: sc.round,
            overallStatus: sc.status,
            managerApproved: sc.round === 3 || sc.status === 'SELECTED',
          },
        });

        // Track Active HR Assignment
        await prisma.hRAssignment.create({
          data: {
            applicationId: appRecord.id,
            hrId: sc.hrId,
            assignedBy: 'SYSTEM_AUTOMATION',
            reason: 'WORKLOAD_BALANCING',
            isActive: true,
          },
        });

        // Create Round 1 Interview
        const hrUser = initialHRs.find((h) => h.id === sc.hrId);
        await prisma.interview.create({
          data: {
            applicationId: appRecord.id,
            candidateId: candidateRecord.id,
            candidateName: `${sc.first} ${sc.last}`,
            candidateEmail: sc.email,
            jobTitle: defaultJob.title,
            jobId: defaultJob.id,
            hrId: sc.hrId,
            roundNumber: 1,
            roundName: 'Round 1: Screening / HR',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            duration: 30,
            type: 'VIDEO',
            meetingLink: hrUser?.meetLink || 'https://meet.google.com/adyapan-call',
            status: sc.round > 1 ? 'COMPLETED' : 'SCHEDULED',
            result: sc.round > 1 ? 'SELECTED' : 'PENDING',
            rating: 8.5,
            feedback: 'Strong verbal clarity, great passion for EdTech growth.',
          },
        });

        // If Round 2+
        if (sc.round >= 2) {
          await prisma.interview.create({
            data: {
              applicationId: appRecord.id,
              candidateId: candidateRecord.id,
              candidateName: `${sc.first} ${sc.last}`,
              candidateEmail: sc.email,
              jobTitle: defaultJob.title,
              jobId: defaultJob.id,
              hrId: sc.hrId,
              roundNumber: 2,
              roundName: 'Round 2: Technical / Sales Pitch',
              scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
              duration: 45,
              type: 'VIDEO',
              meetingLink: hrUser?.meetLink || 'https://meet.google.com/adyapan-call',
              status: sc.round > 2 ? 'COMPLETED' : 'SCHEDULED',
              result: sc.round > 2 ? 'SELECTED' : 'PENDING',
              rating: 9.0,
              feedback: 'Exceptional pitch simulation and student objection handling.',
            },
          });
        }
      }

      console.log('Seeded 11 realistic candidate records distributed across HR-01..HR-05!');
    }

    console.log('PostgreSQL Database Initialization Complete!');
  } catch (error: any) {
    console.error('Auto Seed Error:', error.message);
  }
};
