import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('Clearing all data (including jobs, candidates, applications, offers) from PostgreSQL Database...');
  try {
    await prisma.activity.deleteMany({});
    await prisma.interview.deleteMany({});
    await prisma.offer.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.candidate.deleteMany({});
    await prisma.job.deleteMany({});
    console.log('PostgreSQL Database completely cleaned of all jobs, candidates, applications, interviews, and offers!');
  } catch (err) {
    console.error('Error cleaning database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
