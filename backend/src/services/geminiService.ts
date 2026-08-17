import { GoogleGenerativeAI } from '@google/generative-ai';
import { recruitmentToolService } from './recruitmentToolService.js';
import { logger } from '../utils/logger.js';

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  logger.error('CRITICAL: GEMINI_API_KEY is not defined in backend/.env');
}

const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_INSTRUCTION = `You are HireAI, the official AI Recruitment Copilot for Adyapan Edutech Pvt. Ltd. (India's Premier EdTech Platform).

CONVERSATIONAL BEHAVIOR:
1. NATURAL CONVERSATION: Respond naturally and conversationally to greetings ("Hi", "Hello", "How are you?"), general questions, or casual chat without dumping unsolicited database statistics. Be friendly, professional, and helpful.
2. ACCURACY & ZERO HALLUCINATION: When answering questions about candidates, resumes, ATS match scores, job requirements, or hiring pipeline statistics, use the real-time data provided from the PostgreSQL database. NEVER invent or hallucinate candidate names, experience, skills, projects, ATS scores, or job requirements. If a candidate or job is not in the database records, state that clearly.
3. CONVERSATION CONTEXT & FOLLOW-UPS: Maintain context across conversation turns. Understand references like "his", "her", "that candidate", "why?", "compare them", "what skills should he improve?".
4. RESPONSE FORMATTING: Use standard Markdown formatting (bold text, bullet points, numbered lists, headers) for structured recruitment answers.`;

/**
 * Detect if message or history requires database query context
 */
const shouldFetchDatabaseContext = (message, history = []) => {
  const combined = (message + ' ' + history.map(h => h.text || '').join(' ')).toLowerCase();

  const keywords = [
    'candidate', 'applicant', 'resume', 'score', 'rahul', 'priya',
    'simran', 'dinesh', 'sumit', 'job', 'role', 'bda', 'opening',
    'requirement', 'pipeline', 'funnel', 'hiring', 'top', 'best',
    'missing', 'weakness', 'strength', 'compare', 'versus', 'vs'
  ];

  return keywords.some(kw => combined.includes(kw));
};

/**
 * Process chat query with Gemini API & Selective Context Retrieval + Retry & Model Fallback
 */
export const queryGeminiCopilot = async ({ message, history = [] }) => {
  const qLower = message.toLowerCase();
  const combinedText = (message + ' ' + history.slice(-4).map(h => h.text || '').join(' ')).toLowerCase();
  let dbContext = '';

  // Only query database if the conversation actually relates to recruitment data
  if (shouldFetchDatabaseContext(message, history)) {

    // 1. Specific Candidate / Resume / Skill Queries
    if (
      combinedText.includes('rahul') ||
      combinedText.includes('priya') ||
      combinedText.includes('simran') ||
      combinedText.includes('dinesh') ||
      combinedText.includes('sumit') ||
      combinedText.includes('candidate') ||
      combinedText.includes('resume') ||
      combinedText.includes('applicant') ||
      combinedText.includes('score') ||
      combinedText.includes('missing') ||
      combinedText.includes('weakness')
    ) {
      let candName = '';
      if (combinedText.includes('rahul')) candName = 'Rahul';
      else if (combinedText.includes('priya')) candName = 'Priya';
      else if (combinedText.includes('simran')) candName = 'Simran';
      else if (combinedText.includes('dinesh')) candName = 'Dinesh';
      else if (combinedText.includes('sumit')) candName = 'Sumit';

      if (candName) {
        const details = await recruitmentToolService.getCandidateDetails({ candidateName: candName } as any);
        if (details && details.name) {
          dbContext += `\n[DATABASE RECORD FOR ${candName}]:\n${JSON.stringify(details, null, 2)}`;
        }
      }

      if (!dbContext) {
        const searchRes = await recruitmentToolService.searchCandidates({ query: candName || '' } as any);
        if (searchRes && searchRes.length > 0) {
          dbContext += `\n[DATABASE CANDIDATES SEARCH RESULTS]:\n${JSON.stringify(searchRes, null, 2)}`;
        }
      }
    }

    // 2. Candidate Comparison
    if (combinedText.includes('compare') || combinedText.includes('versus') || combinedText.includes('vs') || (combinedText.includes('priya') && combinedText.includes('rahul'))) {
      const compRes = await recruitmentToolService.compareCandidates({
        candidate1Name: 'Rahul',
        candidate2Name: 'Priya',
        jobTitle: combinedText.includes('bda') ? 'Business Development Associate' : ''
      });
      dbContext += `\n[DATABASE CANDIDATE COMPARISON DATA]:\n${JSON.stringify(compRes, null, 2)}`;
    }

    // 3. Job Openings
    if (
      combinedText.includes('job') ||
      combinedText.includes('role') ||
      combinedText.includes('bda') ||
      combinedText.includes('opening') ||
      combinedText.includes('requirement')
    ) {
      const jobsRes = await recruitmentToolService.getJobs({} as any);
      dbContext += `\n[DATABASE JOB OPENINGS DATA]:\n${JSON.stringify(jobsRes, null, 2)}`;
    }

    // 4. Recruitment Pipeline Funnel
    if (
      combinedText.includes('pipeline') ||
      combinedText.includes('summary') ||
      combinedText.includes('metric') ||
      combinedText.includes('funnel') ||
      combinedText.includes('top') ||
      combinedText.includes('best')
    ) {
      const summaryRes = await recruitmentToolService.getPipelineSummary();
      dbContext += `\n[DATABASE RECRUITMENT PIPELINE SUMMARY]:\n${JSON.stringify(summaryRes, null, 2)}`;
    }
  }

  // Build prompt payload for Gemini API
  let promptPayload = `${SYSTEM_INSTRUCTION}\n\n`;

  if (dbContext) {
    promptPayload += `RELEVANT APPLICATION DATABASE RECORDS:${dbContext}\n\n`;
  }

  if (history && history.length > 0) {
    promptPayload += `CONVERSATION HISTORY:\n`;
    for (const h of history.slice(-6)) {
      const roleName = h.sender === 'user' || h.role === 'user' ? 'User' : 'HireAI Assistant';
      promptPayload += `${roleName}: ${h.text}\n`;
    }
    promptPayload += `\n`;
  }

  promptPayload += `User Message: "${message}"\n\nPlease provide a natural, contextually appropriate response:`;

  // Candidate models for automatic fallback during high demand spikes (503/429)
  const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-flash-latest'];
  let lastError = null;

  for (const mName of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: mName });
        const result = await model.generateContent(promptPayload);
        const reply = result.response.text();
        if (reply) {
          return { success: true, reply };
        }
      } catch (err) {
        lastError = err;
        logger.warn(`Gemini Model ${mName} attempt ${attempt} failed (${err.status || err.message}). Trying fallback...`);
        await new Promise(r => setTimeout(r, 400));
      }
    }
  }

  throw lastError || new Error('All Gemini API models are currently unavailable.');
};
