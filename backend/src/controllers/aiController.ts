import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { queryGeminiCopilot } from '../services/geminiService.js';
import { parseResumeText, calculateAtsScore } from '../services/atsScoringEngine.js';

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

    // Real Deterministic ATS Scoring Engine calculation
    const cand = application.candidate;
    const skillsText = Array.isArray(cand.skills) ? cand.skills.join(' ') : (cand.skills || '');
    const textToParse = `${cand.firstName} ${cand.lastName} ${skillsText} ${cand.currentPosition || ''} ${cand.currentCompany || ''} ${cand.totalExperience || 0} years experience`;

    const parsedResume = parseResumeText(textToParse);
    const atsResult = calculateAtsScore(parsedResume, application.job);

    const overallScore = atsResult.aiScore;
    const matchReason = atsResult.matchReason;

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        aiScore: overallScore,
        scoreBreakdown: atsResult.breakdown || null,
        matchReason: matchReason,
        strengths: (atsResult.matchedSkills && atsResult.matchedSkills.length > 0) ? atsResult.matchedSkills : ['Relevant Experience', 'Verified Skills'],
        missingSkills: atsResult.missingSkills || [],
        status: overallScore >= 88 ? 'SHORTLISTED' : 'AI_SCREENED'
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

/**
 * Standard Non-Streaming AI Recruitment Assistant (Gemini API + Database Tools)
 */
export const getHiringAssistant = async (req, res) => {
  try {
    const { query, history = [] } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const { reply } = await queryGeminiCopilot({
      message: query.trim(),
      history
    });

    // Save conversation to DB
    try {
      await prisma.aIConversation.create({
        data: {
          userId: req.user.id,
          messages: [
            { role: 'user', content: query },
            { role: 'assistant', content: reply }
          ]
        }
      });
    } catch (saveErr) {
      logger.warn('Failed to save AIConversation record:', saveErr);
    }

    res.json({
      success: true,
      reply: reply,
      response: {
        message: reply,
        text: reply
      }
    });
  } catch (error) {
    logger.error('AI Assistant Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get response from Gemini AI Assistant'
    });
  }
};

/**
 * Server-Sent Events (SSE) Streaming AI Recruitment Assistant
 */
export const streamHiringAssistant = async (req, res) => {
  try {
    const { query, history = [] } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const { reply } = await queryGeminiCopilot({
      message: query.trim(),
      history
    });

    // Stream out chunks for smooth typing animation
    const chunkSize = 15;
    for (let i = 0; i < reply.length; i += chunkSize) {
      const textChunk = reply.slice(i, i + chunkSize);
      sendEvent({ chunk: textChunk, done: false });
      await new Promise(r => setTimeout(r, 20));
    }

    sendEvent({ chunk: '', done: true });
    res.end();

    // Save conversation to database
    try {
      await prisma.aIConversation.create({
        data: {
          userId: req.user.id,
          messages: [
            { role: 'user', content: query },
            { role: 'assistant', content: reply }
          ]
        }
      });
    } catch (saveErr) {
      logger.warn('Failed to save streamed conversation:', saveErr);
    }
  } catch (error) {
    logger.error('Stream AI Assistant Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message || 'Failed to stream response' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Streaming failed', done: true })}\n\n`);
      res.end();
    }
  }
};

/**
 * Clear conversation memory
 */
export const clearConversation = async (req, res) => {
  try {
    await prisma.aIConversation.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({ success: true, message: 'Conversation memory cleared successfully' });
  } catch (error) {
    logger.error('Clear Conversation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear conversation history' });
  }
};