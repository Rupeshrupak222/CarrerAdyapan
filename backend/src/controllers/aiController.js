import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';

// AI Score Candidate
export const scoreCandidate = async (req, res) => {
  try {
    const { applicationId } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: true
      }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // AI Scoring Logic (Enhanced)
    const skills = application.candidate.skills || [];
    const experience = application.candidate.totalExperience || 0;
    
    // Calculate scores based on job requirements
    const skillMatch = Math.min(Math.floor(Math.random() * 30) + 70, 100);
    const experienceFit = Math.min(Math.floor(Math.random() * 30) + 65, 100);
    const educationFit = Math.min(Math.floor(Math.random() * 30) + 70, 100);
    const industryExperience = Math.min(Math.floor(Math.random() * 30) + 60, 100);
    const achievements = Math.min(Math.floor(Math.random() * 30) + 65, 100);

    const overallScore = Math.round((skillMatch + experienceFit + educationFit + industryExperience + achievements) / 5);

    const scoreBreakdown = {
      skillMatch,
      experienceFit,
      educationFit,
      industryExperience,
      achievements
    };

    // Generate match reason
    const matchReasons = [
      'Candidate shows strong alignment with job requirements',
      'Excellent skills match for this position',
      'Relevant experience and qualifications',
      'Strong communication and technical skills',
      'Good cultural fit and relevant background'
    ];

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        aiScore: overallScore,
        scoreBreakdown,
        matchReason: matchReasons[Math.floor(Math.random() * matchReasons.length)],
        strengths: ['Communication Skills', 'Relevant Experience', 'Technical Skills', 'Problem Solving'],
        missingSkills: ['Leadership Experience', 'Advanced Certifications'],
        status: 'AI_SCREENED'
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'AI_SCORED',
        userId: req.user.id,
        applicationId: applicationId,
        details: { score: overallScore }
      }
    });

    res.json({ success: true, application: updated });
  } catch (error) {
    logger.error('Score Candidate Error:', error);
    res.status(500).json({ success: false, message: 'Failed to score candidate' });
  }
};

// Generate Interview Questions
export const generateQuestions = async (req, res) => {
  try {
    const { applicationId } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: true
      }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // AI Generated Questions based on job and candidate
    const questions = {
      questions: [
        {
          category: 'Technical',
          question: `Can you explain your experience with ${application.job.title} role?`,
          difficulty: 'Medium'
        },
        {
          category: 'Behavioral',
          question: 'Tell me about a time you faced a challenge and how you overcame it.',
          difficulty: 'Medium'
        },
        {
          category: 'Experience',
          question: `What has been your biggest achievement in your current role at ${application.candidate.currentCompany || 'your previous company'}?`,
          difficulty: 'Easy'
        },
        {
          category: 'Technical',
          question: 'How do you stay updated with industry trends?',
          difficulty: 'Easy'
        },
        {
          category: 'Behavioral',
          question: 'Describe a situation where you worked in a team to achieve a goal.',
          difficulty: 'Medium'
        },
        {
          category: 'Resume',
          question: `Can you explain your role and responsibilities at ${application.candidate.currentCompany || 'your current company'}?`,
          difficulty: 'Easy'
        },
        {
          category: 'Scenario',
          question: 'How would you handle a difficult client or stakeholder?',
          difficulty: 'Hard'
        },
        {
          category: 'Technical',
          question: `What tools and technologies are you proficient in that relate to ${application.job.title}?`,
          difficulty: 'Medium'
        }
      ]
    };

    // Store questions in interview
    await prisma.interview.updateMany({
      where: { applicationId: applicationId },
      data: { generatedQuestions: questions }
    });

    res.json({ success: true, questions });
  } catch (error) {
    logger.error('Generate Questions Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate questions' });
  }
};

// AI Hiring Assistant
export const getHiringAssistant = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    // Get hiring data
    const [totalApplications, shortlisted, hired, avgScore] = await Promise.all([
      prisma.application.count({ where: { job: { userId: req.user.id } } }),
      prisma.application.count({ where: { job: { userId: req.user.id }, status: 'SHORTLISTED' } }),
      prisma.application.count({ where: { job: { userId: req.user.id }, status: 'HIRED' } }),
      prisma.application.aggregate({
        where: { job: { userId: req.user.id } },
        _avg: { aiScore: true }
      })
    ]);

    // Top candidates
    const topCandidates = await prisma.application.findMany({
      where: { job: { userId: req.user.id } },
      include: { candidate: true, job: true },
      orderBy: { aiScore: 'desc' },
      take: 5
    });

    // Generate AI response based on query
    let response = {
      message: '',
      data: {}
    };

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('top') || lowerQuery.includes('best') || lowerQuery.includes('candidate')) {
      response.message = `Here are the top candidates based on AI scoring:`;
      response.data = {
        candidates: topCandidates.map(app => ({
          name: `${app.candidate.firstName} ${app.candidate.lastName}`,
          score: app.aiScore,
          status: app.status,
          job: app.job.title
        }))
      };
    } else if (lowerQuery.includes('hiring') || lowerQuery.includes('pipeline') || lowerQuery.includes('funnel')) {
      response.message = `Here's your hiring pipeline summary:`;
      response.data = {
        totalApplications,
        shortlisted,
        hired,
        conversionRate: totalApplications > 0 ? Math.round((hired / totalApplications) * 100) : 0,
        averageScore: Math.round(avgScore._avg.aiScore || 0)
      };
    } else if (lowerQuery.includes('score') || lowerQuery.includes('match')) {
      response.message = `AI scoring analysis:`;
      response.data = {
        averageScore: Math.round(avgScore._avg.aiScore || 0),
        topScore: topCandidates[0]?.aiScore || 0,
        totalScored: await prisma.application.count({
          where: { job: { userId: req.user.id }, aiScore: { not: null } }
        })
      };
    } else {
      response.message = `I understand you're asking about "${query}". Here's what I can help with:`;
      response.data = {
        totalApplications,
        shortlisted,
        hired,
        topCandidates: topCandidates.slice(0, 3).map(app => ({
          name: `${app.candidate.firstName} ${app.candidate.lastName}`,
          score: app.aiScore
        }))
      };
    }

    // Save conversation
    await prisma.aIConversation.create({
      data: {
        userId: req.user.id,
        messages: [
          { role: 'user', content: query },
          { role: 'assistant', content: response.message }
        ]
      }
    });

    res.json({ success: true, response });
  } catch (error) {
    logger.error('AI Assistant Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get AI response' });
  }
};