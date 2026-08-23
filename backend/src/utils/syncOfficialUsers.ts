import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

export const syncOfficialUsers = async () => {
  try {
    console.log('Syncing official Adyapan HR & Admin accounts...');
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('Admin@123', salt);
    const managerPass = await bcrypt.hash('Manager@123', salt);
    const hrPass = await bcrypt.hash('Hr@12345', salt);

    // 1. Admin: rupesh@adyapan.com
    const adminUser = await prisma.user.upsert({
      where: { email: 'rupesh@adyapan.com' },
      update: {
        name: 'Rupesh (Admin)',
        password: adminPass,
        role: 'ADMIN',
        isActive: true,
        company: 'Adyapan Edutech Pvt Ltd',
        meetLink: 'https://meet.google.com/rupesh-admin',
      },
      create: {
        id: 'rupesh-admin',
        name: 'Rupesh (Admin)',
        email: 'rupesh@adyapan.com',
        password: adminPass,
        role: 'ADMIN',
        isActive: true,
        company: 'Adyapan Edutech Pvt Ltd',
        meetLink: 'https://meet.google.com/rupesh-admin',
      },
    });
    console.log('Admin user verified: rupesh@adyapan.com');

    // 2. HR Manager: nandini@adyapan.com
    const managerUser = await prisma.user.upsert({
      where: { email: 'nandini@adyapan.com' },
      update: {
        name: 'Nandini (HR Manager)',
        password: managerPass,
        role: 'HR_MANAGER',
        designation: 'Head of Talent Acquisition',
        department: 'Talent Acquisition',
        isActive: true,
        company: 'Adyapan Edutech Pvt Ltd',
        meetLink: 'https://meet.google.com/nandini-manager',
      },
      create: {
        id: 'nandini-manager',
        name: 'Nandini (HR Manager)',
        email: 'nandini@adyapan.com',
        password: managerPass,
        role: 'HR_MANAGER',
        designation: 'Head of Talent Acquisition',
        department: 'Talent Acquisition',
        isActive: true,
        company: 'Adyapan Edutech Pvt Ltd',
        meetLink: 'https://meet.google.com/nandini-manager',
      },
    });
    console.log('HR Manager verified: nandini@adyapan.com');

    // 3. 5 HR Specialists
    const officialHRs = [
      { id: 'hr-pavitra', name: 'Pavitra (HR-01)', email: 'pavitra@adyapan.com', meetLink: 'https://meet.google.com/pavitra-hr01' },
      { id: 'hr-charitha', name: 'Charitha (HR-02)', email: 'charitha@adyapan.com', meetLink: 'https://meet.google.com/charitha-hr02' },
      { id: 'hr-nitisha', name: 'Nitisha (HR-03)', email: 'nitisha@adyapan.com', meetLink: 'https://meet.google.com/nitisha-hr03' },
      { id: 'hr-aravind', name: 'Aravind (HR-04)', email: 'aravind@adyapan.com', meetLink: 'https://meet.google.com/aravind-hr04' },
      { id: 'hr-veena', name: 'Veena (HR-05)', email: 'veena@adyapan.com', meetLink: 'https://meet.google.com/veena-hr05' },
    ];

    const createdHRs: any[] = [];
    for (const hr of officialHRs) {
      const u = await prisma.user.upsert({
        where: { email: hr.email },
        update: {
          name: hr.name,
          password: hrPass,
          role: 'HR',
          designation: 'Talent Acquisition Specialist',
          department: 'HR & Recruitment',
          company: 'Adyapan Edutech Pvt Ltd',
          meetLink: hr.meetLink,
          isActive: true,
        },
        create: {
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
      createdHRs.push(u);
      console.log(`HR Specialist verified: ${hr.name} (${hr.email})`);
    }

    // 4. Distribute candidate applications across the 5 official HRs
    const apps = await prisma.application.findMany({
      include: { candidate: true, job: true },
    });

    console.log(`Distributing ${apps.length} applications evenly among official HRs...`);
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      const assignedHr = createdHRs[i % createdHRs.length];

      await prisma.application.update({
        where: { id: app.id },
        data: {
          assignedHrId: assignedHr.id,
          assignedAt: new Date(),
        },
      });

      // Update active interview record if exists
      await prisma.interview.updateMany({
        where: { applicationId: app.id },
        data: {
          hrId: assignedHr.id,
          meetingLink: assignedHr.meetLink || 'https://meet.google.com/adyapan-hiring',
        },
      });
    }

    console.log('All candidate applications and interviews re-assigned to official HR team!');
  } catch (err: any) {
    console.error('Error syncing official users:', err.message);
  }
};

syncOfficialUsers().then(() => process.exit(0));
