import prisma from '../config/db.js';

export const syncDistribute = async () => {
  try {
    const hrs = await prisma.user.findMany({ where: { role: 'HR' } });
    console.log(`Found ${hrs.length} HR users:`, hrs.map(h => `${h.id}: ${h.name}`));

    if (hrs.length === 0) {
      console.log('No HR users found!');
      return;
    }

    const apps = await prisma.application.findMany({
      include: {
        candidate: true,
        job: true,
      },
    });

    console.log(`Found ${apps.length} candidate applications in database.`);

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      const assignedHr = hrs[i % hrs.length];
      const code = `CAND-${String(i + 1).padStart(6, '0')}`;
      const roundNum = (i % 3) + 1; // Round 1, 2, or 3
      const overallStatus = roundNum === 3 ? 'SELECTED' : 'INTERVIEWING';

      // Update Candidate
      if (app.candidate) {
        await prisma.candidate.update({
          where: { id: app.candidate.id },
          data: {
            candidateCode: code,
            employmentStatus: overallStatus,
          },
        });
      }

      // Update Application
      await prisma.application.update({
        where: { id: app.id },
        data: {
          candidateCode: code,
          assignedHrId: assignedHr.id,
          assignedAt: new Date(),
          currentRound: roundNum,
          screeningStatus: 'SHORTLISTED',
          screeningScore: 80 + (i * 2) % 18,
          screenedAt: new Date(),
          overallStatus: overallStatus,
          managerApproved: roundNum === 3,
        },
      });

      // Track active HR Assignment
      await prisma.hRAssignment.create({
        data: {
          candidateId: app.candidateId,
          applicationId: app.id,
          hrId: assignedHr.id,
          assignedBy: 'SYSTEM_BALANCER',
          reason: 'WORKLOAD_BALANCING',
          status: 'ACTIVE',
        },
      });

      // Ensure Round 1 Interview exists
      const existingInterview = await prisma.interview.findFirst({
        where: { applicationId: app.id, roundNumber: 1 },
      });

      if (!existingInterview) {
        await prisma.interview.create({
          data: {
            applicationId: app.id,
            candidateId: app.candidateId,
            candidateName: `${app.candidate?.firstName || 'Candidate'} ${app.candidate?.lastName || ''}`,
            candidateEmail: app.candidate?.email || 'candidate@example.com',
            jobTitle: app.job?.title || 'Business Development Associate',
            jobId: app.jobId,
            hrId: assignedHr.id,
            roundNumber: 1,
            roundName: 'Round 1: Screening / HR',
            scheduledAt: new Date(Date.now() + ((i % 3) + 1) * 24 * 60 * 60 * 1000),
            duration: 30,
            type: 'VIDEO',
            meetingLink: assignedHr.meetLink || 'https://meet.google.com/adyapan-hiring',
            status: roundNum > 1 ? 'COMPLETED' : 'SCHEDULED',
            result: roundNum > 1 ? 'SELECTED' : 'PENDING',
            rating: 8.5,
            feedback: 'Good communication and confident sales mindset.',
          },
        });
      }

      if (roundNum >= 2) {
        const round2Interview = await prisma.interview.findFirst({
          where: { applicationId: app.id, roundNumber: 2 },
        });
        if (!round2Interview) {
          await prisma.interview.create({
            data: {
              applicationId: app.id,
              candidateId: app.candidateId,
              candidateName: `${app.candidate?.firstName || 'Candidate'} ${app.candidate?.lastName || ''}`,
              candidateEmail: app.candidate?.email || 'candidate@example.com',
              jobTitle: app.job?.title || 'Business Development Associate',
              jobId: app.jobId,
              hrId: assignedHr.id,
              roundNumber: 2,
              roundName: 'Round 2: Technical / Sales Pitch',
              scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
              duration: 45,
              type: 'VIDEO',
              meetingLink: assignedHr.meetLink || 'https://meet.google.com/adyapan-hiring',
              status: roundNum > 2 ? 'COMPLETED' : 'SCHEDULED',
              result: roundNum > 2 ? 'SELECTED' : 'PENDING',
              rating: 9.0,
              feedback: 'Demonstrated strong product knowledge and objection handling.',
            },
          });
        }
      }
    }

    console.log('Successfully distributed and assigned all applications across HR team!');
  } catch (err: any) {
    console.error('syncDistribute error:', err.message);
  }
};

syncDistribute().then(() => process.exit(0));
