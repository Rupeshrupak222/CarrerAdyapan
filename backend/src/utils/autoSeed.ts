import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import { logger } from './logger.js';

export const autoSeed = async () => {
  try {
    console.log('Checking PostgreSQL Database Seeding Status...');

    // 1. Ensure Default Admin User
    let defaultUser = await prisma.user.findFirst({ where: { email: 'admin@adyapan.com' } });
    const salt = await bcrypt.genSalt(10);
    const validHash = await bcrypt.hash('password123', salt);
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          id: 'demo-user-101',
          name: 'Adyapan Recruiter Admin',
          email: 'admin@adyapan.com',
          password: validHash,
          role: 'ADMIN',
          company: 'Adyapan Edutech Pvt Ltd',
        },
      });
      console.log('Default User Created in PostgreSQL DB');
    } else {
      await prisma.user.update({
        where: { id: defaultUser.id },
        data: { password: validHash, role: 'ADMIN' },
      });
      console.log('Default User Password & Role Updated in PostgreSQL DB');
    }

    const userId = defaultUser.id;

    // 2. Ensure Database Cleanliness (No hardcoded fake jobs)

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
