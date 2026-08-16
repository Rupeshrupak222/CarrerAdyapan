import { generateAICompletion } from './openaiClient.js';
import { calculateMatchScore } from '../../utils/scoreCalculator.js';

export const scoreCandidateForJob = async (candidate, job) => {
  const prompt = `You are an AI Recruitment Engine specializing in Education Company & EdTech hiring (BDA, Academic Counsellors, Telecallers, Sales, Tech roles).

Job Details:
Title: ${job.title}
Department: ${job.department}
Requirements: ${job.requirements}
Description: ${job.description}

Candidate Profile:
Name: ${candidate.firstName} ${candidate.lastName}
Skills: ${candidate.skills?.join(', ') || 'N/A'}
Experience: ${candidate.totalExperience || 0} years
Current Position: ${candidate.currentPosition || 'N/A'}

Provide match JSON:
{
  "aiScore": integer 0-100,
  "scoreBreakdown": {
    "salesTargetMatch": 0-100,
    "communicationFit": 0-100,
    "educationDomainExperience": 0-100
  },
  "matchReason": "Detailed reason why candidate was shortlisted/evaluated",
  "missingSkills": ["array of missing skills"],
  "strengths": ["array of top 3 candidate strengths"],
  "recommendations": ["array of actionable interview suggestions"]
}`;

  const result = await generateAICompletion(prompt, 'You are an EdTech HR AI Evaluator.', true);

  if (result) {
    try {
      return JSON.parse(result);
    } catch (e) {
      console.warn('AI scoring JSON parse error, using EdTech algorithmic fallback');
    }
  }

  return calculateMatchScore(candidate.skills, job.requirements, job.title);
};

export default { scoreCandidateForJob };
