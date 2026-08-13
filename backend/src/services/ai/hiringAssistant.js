import { generateAICompletion } from './openaiClient.js';

export const handleHiringAssistantChat = async (userMessage, conversationHistory = []) => {
  const systemPrompt = `You are HireAI, an intelligent conversational AI recruitment copilot. 
Help recruiters post job ads, screen candidates, draft interview questions, compose offer letters, and analyze hiring metrics.
Be concise, professional, clear, and proactive.`;

  const prompt = `Conversation history: ${JSON.stringify(conversationHistory)}
User request: ${userMessage}`;

  const aiReply = await generateAICompletion(prompt, systemPrompt, false);

  if (aiReply) {
    return aiReply;
  }

  // Fallback intelligent responses based on intent keyword
  const msgLower = userMessage.toLowerCase();
  if (msgLower.includes('job') || msgLower.includes('create')) {
    return "I can help you draft a compelling job description! Specify the job title, key skills required, and department, and I'll generate the full posting for you.";
  }
  if (msgLower.includes('candidate') || msgLower.includes('score')) {
    return "Our AI automatically parses incoming candidate resumes, extracts their experience and skills, and calculates a match percentage score against your job requirements.";
  }
  if (msgLower.includes('interview') || msgLower.includes('question')) {
    return "I can generate tailored interview questions broken down by Technical, Behavioral, and System Architecture topics for any candidate profile!";
  }

  return "I am your AI Recruitment Copilot! Ask me to evaluate candidate applications, generate customized interview questions, draft job offers, or summarize hiring pipeline analytics.";
};

export default { handleHiringAssistantChat };
