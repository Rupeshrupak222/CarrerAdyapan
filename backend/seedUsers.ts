import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const salt = await bcrypt.genSalt(10);

  // Admin: admin@adyapan.com / Admin@123
  const adminPass = await bcrypt.hash('Admin@123', salt);
  await prisma.user.upsert({
    where: { email: 'admin@adyapan.com' },
    update: { password: adminPass },
    create: {
      name: 'Admin',
      email: 'admin@adyapan.com',
      password: adminPass,
      role: 'ADMIN',
      company: 'Adyapan Edutech Pvt. Ltd.'
    }
  });
  console.log('✔ Admin seeded: admin@adyapan.com / Admin@123');

  // Candidate User: user@adyapan.com / User@123
  const userPass = await bcrypt.hash('User@123', salt);
  await prisma.candidate.upsert({
    where: { email: 'user@adyapan.com' },
    update: { password: userPass, isRegistered: true },
    create: {
      firstName: 'Test',
      lastName: 'User',
      email: 'user@adyapan.com',
      password: userPass,
      phone: '+91 9876543210',
      isRegistered: true,
      resumeUrl: '',
      skills: ['Communication', 'Sales', 'EdTech'],
      location: 'Hyderabad'
    }
  });
  console.log('✔ User seeded: user@adyapan.com / User@123');

  await prisma.$disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
