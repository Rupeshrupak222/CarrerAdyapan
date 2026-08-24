import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const DUMMY_EMAILS = [
  'hr01@company.com',
  'hr02@company.com',
  'hr03@company.com',
  'hr04@company.com',
  'hr05@company.com',
  'manager@company.com'
];

async function deleteDummyHrs() {
  console.log('Starting deletion of dummy HR accounts...');
  try {
    const dummyUsers = await prisma.user.findMany({
      where: { email: { in: DUMMY_EMAILS } },
      select: { id: true, email: true, name: true }
    });

    const dummyIds = dummyUsers.map(u => u.id);
    console.log(`Found ${dummyIds.length} dummy user(s) to remove:`, dummyUsers);

    if (dummyIds.length > 0) {
      await prisma.$transaction(async (tx) => {
        // Delete activities belonging to dummy users
        const act = await tx.activity.deleteMany({
          where: { userId: { in: dummyIds } }
        });
        console.log(`Deleted ${act.count} activity records linked to dummy users.`);

        // Delete HR assignments belonging to dummy users
        const hr = await tx.hRAssignment.deleteMany({
          where: { hrId: { in: dummyIds } }
        });
        console.log(`Deleted ${hr.count} HR assignment records linked to dummy users.`);

        // Delete dummy users
        const deleted = await tx.user.deleteMany({
          where: { id: { in: dummyIds } }
        });
        console.log(`Deleted ${deleted.count} dummy user records.`);
      }, {
        maxWait: 20000,
        timeout: 45000
      });
    }

    const remainingHRs = await prisma.user.findMany({
      where: { role: 'HR' },
      select: { id: true, name: true, email: true, role: true }
    });
    console.log(`Remaining HR Specialists in DB (${remainingHRs.length}):`, JSON.stringify(remainingHRs, null, 2));
  } catch (error) {
    console.error('Error during deletion of dummy HRs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteDummyHrs();
