import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const PRESERVED_EMAIL = 'mdsharmapb07@gmail.com';

async function deleteOtherCandidates() {
  console.log(`Starting candidate cleanup. Preserving only: ${PRESERVED_EMAIL}`);

  try {
    const keepCandidate = await prisma.candidate.findFirst({
      where: {
        email: {
          equals: PRESERVED_EMAIL,
          mode: 'insensitive'
        }
      }
    });

    if (!keepCandidate) {
      throw new Error(`Target candidate ${PRESERVED_EMAIL} not found in database! Aborting to prevent accidental data loss.`);
    }

    console.log(`Verified preserved candidate: ${keepCandidate.firstName} ${keepCandidate.lastName} (ID: ${keepCandidate.id})`);

    const candidatesToDelete = await prisma.candidate.findMany({
      where: {
        NOT: {
          email: {
            equals: PRESERVED_EMAIL,
            mode: 'insensitive'
          }
        }
      },
      select: {
        id: true,
        email: true
      }
    });

    const candidateIds = candidatesToDelete.map(c => c.id);
    const candidateEmails = candidatesToDelete.map(c => c.email);

    console.log(`Identified ${candidateIds.length} candidate(s) for deletion.`);

    if (candidateIds.length === 0) {
      console.log('No candidates to delete. All clean!');
      return;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete Activity logs
      const act = await tx.activity.deleteMany({
        where: { candidateId: { in: candidateIds } }
      });
      console.log(`Deleted ${act.count} activity records.`);

      // 2. Delete HR Assignments
      const hr = await tx.hRAssignment.deleteMany({
        where: { candidateId: { in: candidateIds } }
      });
      console.log(`Deleted ${hr.count} HR assignment records.`);

      // 3. Delete Interview Feedback
      const fb = await tx.interviewFeedback.deleteMany({
        where: {
          interview: {
            OR: [
              { candidateId: { in: candidateIds } },
              { candidateEmail: { in: candidateEmails } },
              { application: { candidateId: { in: candidateIds } } }
            ]
          }
        }
      });
      console.log(`Deleted ${fb.count} interview feedback records.`);

      // 4. Delete Interviews
      const iv = await tx.interview.deleteMany({
        where: {
          OR: [
            { candidateId: { in: candidateIds } },
            { candidateEmail: { in: candidateEmails } },
            { application: { candidateId: { in: candidateIds } } }
          ]
        }
      });
      console.log(`Deleted ${iv.count} interview records.`);

      // 5. Delete Offers
      const off = await tx.offer.deleteMany({
        where: {
          OR: [
            { candidateId: { in: candidateIds } },
            { candidateEmail: { in: candidateEmails } },
            { application: { candidateId: { in: candidateIds } } }
          ]
        }
      });
      console.log(`Deleted ${off.count} offer records.`);

      // 6. Delete Onboarding Documents & Onboardings
      const doc = await tx.onboardingDocument.deleteMany({
        where: {
          onboarding: {
            candidateId: { in: candidateIds }
          }
        }
      });
      console.log(`Deleted ${doc.count} onboarding documents.`);

      const onb = await tx.onboarding.deleteMany({
        where: { candidateId: { in: candidateIds } }
      });
      console.log(`Deleted ${onb.count} onboarding records.`);

      // 7. Delete Joinings
      const jn = await tx.joining.deleteMany({
        where: { candidateId: { in: candidateIds } }
      });
      console.log(`Deleted ${jn.count} joining records.`);

      // 8. Delete Tokens
      const tok = await tx.candidateSecureToken.deleteMany({
        where: { candidateId: { in: candidateIds } }
      });
      console.log(`Deleted ${tok.count} candidate secure tokens.`);

      // 9. Delete ATS Analysis history
      const ats = await tx.aTSAnalysis.deleteMany({
        where: {
          application: {
            candidateId: { in: candidateIds }
          }
        }
      });
      console.log(`Deleted ${ats.count} ATS analysis records.`);

      // 10. Delete Applications
      const app = await tx.application.deleteMany({
        where: { candidateId: { in: candidateIds } }
      });
      console.log(`Deleted ${app.count} application records.`);

      // 11. Delete Candidates
      const cand = await tx.candidate.deleteMany({
        where: { id: { in: candidateIds } }
      });
      console.log(`Deleted ${cand.count} candidate records.`);
    }, {
      maxWait: 20000,
      timeout: 45000
    });

    // Verification
    const remainingCandidates = await prisma.candidate.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        candidateCode: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    console.log('Cleanup completed successfully!');
    console.log(`Remaining Candidates count: ${remainingCandidates.length}`);
    console.log('Remaining candidates:', JSON.stringify(remainingCandidates, null, 2));
  } catch (error) {
    console.error('Error during deletion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteOtherCandidates();
