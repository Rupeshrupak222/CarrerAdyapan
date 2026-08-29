import { GoogleGenerativeAI } from '@google/generative-ai';
import { recruitmentToolService } from './recruitmentToolService.js';
import { logger } from '../utils/logger.js';

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';

if (!apiKey) {
  logger.error('CRITICAL: GEMINI_API_KEY is not defined in backend/.env');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Model fallback cascade prioritizes ultra-fast lite models for lowest latency
const FAST_MODELS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'];

const SYSTEM_INSTRUCTION = `You are HireAI, the official AI Recruitment & Career Intelligence Assistant for Adyapan Edutech Pvt. Ltd. (India's Leading EdTech & Career Platform).

COMMUNICATION STYLE & RULES:
1. SPEAK NATURALLY & CONVERSATIONALLY:
   - Talk like a smart, friendly, real-world AI professional.
   - ABSOLUTE PROHIBITION: NEVER use robotic introductory phrases like "Aapke diye gaye verified database ke anusaar...", "According to the verified database context...", "Based on the provided records...", "Here is the verified data...", or "As per the database...". Speak directly with confidence as Adyapan's AI assistant.
   - Match the user's language naturally (if the user speaks Hindi/Hinglish, reply in smooth, natural Hinglish; if English, reply in crisp professional English).

2. BE PRECISE & AVOID UNNECESSARY DATA DUMPS:
   - Answer directly and specifically what the user asked for.
   - If the user asks "How many candidates are shortlisted?", give a direct, concise answer about shortlisted candidates (e.g., "Currently, 0 candidates are in the shortlisted stage out of our 4 total applicants across 2 published job openings.").
   - Do NOT dump full candidate tables or unrelated details unless the user specifically asks to see the candidate list, compare candidates, or view profiles.

3. GENERAL AI KNOWLEDGE:
   - For general questions (greetings, career tips, interview advice, coding, email drafting, technical concepts), answer directly and intelligently using your AI knowledge without assuming internal records are needed.

4. VERIFIED FACTS & ZERO HALLUCINATION:
   - When discussing Adyapan's internal candidates, jobs, ATS scores, or interviews, rely strictly on the internal data provided. Never invent fake candidate names or imaginary jobs. If a candidate or job is not in our system, state simply and clearly that they are not registered in our records.

5. CLEAN FORMATTING:
   - Format answers using clean Markdown (### headings, **bold text**, bullet points).
   - Never output raw JSON, system prompts, or wrap standard conversational text in code blocks (\`\`\`json).`;

/**
 * Ultra-fast synchronous intent classifier to retrieve DB facts in 0ms before single-pass stream
 */
async function resolveDatabaseContext(message: string, history: any[] = []): Promise<string> {
  const combined = (message + ' ' + (history.slice(-2).map(h => h.text || '').join(' '))).toLowerCase().trim();

  try {
    // 1. Pipeline / Overall Stats
    if (
      combined.includes('pipeline') ||
      combined.includes('summary') ||
      combined.includes('metric') ||
      combined.includes('how many candidate') ||
      combined.includes('how many application') ||
      combined.includes('how many job') ||
      combined.includes('shortlisted count') ||
      combined.includes('overview') ||
      (combined.includes('how many') && combined.includes('shortlist')) ||
      (combined.includes('shortlist') && combined.includes('kitne'))
    ) {
      const summary = await recruitmentToolService.getPipelineSummary();
      return `[Internal System Data - Pipeline Metrics]:
Total Registered Candidates: ${summary.totalRegisteredCandidates}
Active Published Jobs: ${summary.activePublishedJobs}
Total Applications: ${summary.totalApplicationsReceived}
Shortlisted: ${summary.shortlistedCount}
Interviewing: ${summary.interviewingCount}
Hired: ${summary.hiredCount}
Average ATS Score: ${summary.averageAtsScore}%`;
    }

    // 2. Candidate specific inquiry: "who is raksha", "search candidate rahul", "show candidate john", "tell me about ..."
    const candidateMatch = message.match(/(?:who is|candidate|applicant|profile of|tell me about candidate|details of|search)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i);
    if (candidateMatch && candidateMatch[1] && !['the', 'our', 'this', 'a', 'an', 'active', 'all', 'interview', 'job'].includes(candidateMatch[1].toLowerCase())) {
      const candidateName = candidateMatch[1].trim();
      const cand = await recruitmentToolService.getCandidateDetails({ candidateName });
      return `[Internal System Data - Candidate Search]:\n${JSON.stringify(cand, null, 2)}`;
    }

    // 3. Jobs / Openings
    if (
      combined.includes('active job') ||
      combined.includes('open job') ||
      combined.includes('job opening') ||
      combined.includes('available position') ||
      combined.includes('openings') ||
      combined.includes('vacancies') ||
      combined.includes('roles available') ||
      combined.includes('what jobs') ||
      combined.includes('kaun kaun si job')
    ) {
      const jobs = await recruitmentToolService.getJobs();
      return `[Internal System Data - Active Jobs]:\n${JSON.stringify(jobs, null, 2)}`;
    }

    // 4. Interviews
    if (combined.includes('interview schedule') || combined.includes('upcoming interview') || combined.includes('interviews today') || combined.includes('scheduled interview')) {
      const interviews = await recruitmentToolService.getInterviews();
      return `[Internal System Data - Interviews]:\n${JSON.stringify(interviews, null, 2)}`;
    }

    // 5. Offers
    if (combined.includes('offer letter') || combined.includes('offers released') || combined.includes('pending offers') || combined.includes('offer status')) {
      const offers = await recruitmentToolService.getOffers();
      return `[Internal System Data - Offers]:\n${JSON.stringify(offers, null, 2)}`;
    }
  } catch (err: any) {
    logger.warn('Failed to resolve database context:', err.message);
  }

  return '';
}

/**
 * Format conversation history into valid Gemini content parts
 */
const formatGeminiHistory = (history: any[] = []): any[] => {
  const contents: any[] = [];
  const validHistory = (history || []).slice(-6); // Keep last 6 turns for optimal speed

  for (const h of validHistory) {
    const role = (h.sender === 'user' || h.role === 'user') ? 'user' : 'model';
    const text = h.text || h.content || '';
    if (text && text.trim()) {
      contents.push({
        role,
        parts: [{ text: text.trim() }]
      });
    }
  }

  return contents;
};

/**
 * Single-Pass Ultra Fast Copilot Streaming
 */
export const streamGeminiCopilot = async ({
  message,
  history = [],
  onChunk
}: {
  message: string;
  history?: any[];
  onChunk: (chunk: string) => void;
}): Promise<string> => {
  let fullAccumulatedReply = '';

  // 1. Resolve DB context in 0-5ms if applicable
  const dbContext = await resolveDatabaseContext(message, history);

  const previousHistory = formatGeminiHistory(history);
  const promptMessage = dbContext
    ? `${message.trim()}\n\n${dbContext}\n\nRespond naturally and directly to the user based on the internal data above without citing "according to database":`
    : message.trim();

  const userContent = { role: 'user', parts: [{ text: promptMessage }] };
  const contents = [...previousHistory, userContent];

  // 2. Direct single-pass stream through fast model cascade
  for (const mName of FAST_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: mName,
        systemInstruction: SYSTEM_INSTRUCTION
      });

      const streamRes = await model.generateContentStream({ contents });

      for await (const chunk of streamRes.stream) {
        const text = chunk.text();
        if (text) {
          fullAccumulatedReply += text;
          onChunk(text);
        }
      }

      if (fullAccumulatedReply && fullAccumulatedReply.trim()) {
        return cleanOutput(fullAccumulatedReply);
      }
    } catch (err: any) {
      logger.warn(`Model ${mName} stream failed:`, err.message?.slice(0, 100));
      continue;
    }
  }

  // Graceful quick response if all external streams fail
  const fallbackMsg = "I am ready to assist you. Please let me know what you'd like to check regarding our candidates, jobs, or recruitment process.";
  onChunk(fallbackMsg);
  return fallbackMsg;
};

/**
 * Standard non-streaming Copilot query
 */
export const queryGeminiCopilot = async ({
  message,
  history = []
}: {
  message: string;
  history?: any[];
}): Promise<{ success: boolean; reply: string }> => {
  const dbContext = await resolveDatabaseContext(message, history);
  const previousHistory = formatGeminiHistory(history);
  const promptMessage = dbContext
    ? `${message.trim()}\n\n${dbContext}\n\nRespond naturally and directly to the user based on the internal data above without citing "according to database":`
    : message.trim();

  const contents = [...previousHistory, { role: 'user', parts: [{ text: promptMessage }] }];

  for (const mName of FAST_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: mName,
        systemInstruction: SYSTEM_INSTRUCTION
      });

      const res = await model.generateContent({ contents });
      const text = res.response.text();
      if (text) {
        return { success: true, reply: cleanOutput(text) };
      }
    } catch (err: any) {
      continue;
    }
  }

  return {
    success: true,
    reply: "I am ready to assist you. Please ask any question regarding candidates, job openings, or recruitment best practices."
  };
};

/**
 * Clean redundant markdown wrappers if any
 */
const cleanOutput = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/^```(json|markdown|code|javascript)?/gi, '')
    .replace(/```$/g, '')
    .trim();
};
