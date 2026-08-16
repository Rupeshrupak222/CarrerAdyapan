import { generateAICompletion } from './openaiClient.js';

export const analyzeJobDescription = async (description, requirements) => {
  const prompt = `Analyze this job posting:
Description: ${description}
Requirements: ${requirements}

Extract and return JSON object with keys:
"keySkills": array of string skills,
"suggestedTitle": refined title recommendation,
"difficultyLevel": "Entry"|"Mid"|"Senior"|"Lead",
"keyResponsibilities": array of top 4 responsibilities
`;

  const aiResult = await generateAICompletion(prompt, 'You are an HR AI analytics expert.', true);

  if (aiResult) {
    try {
      return JSON.parse(aiResult);
    } catch (e) {
      console.warn('Fallback job analysis used due to JSON parse error');
    }
  }

  // Fallback analysis
  return {
    keySkills: ['JavaScript', 'React', 'Node.js', 'Problem Solving'],
    suggestedTitle: 'Software Engineer',
    difficultyLevel: 'Mid',
    keyResponsibilities: [
      'Design and maintain web application components',
      'Collaborate with cross-functional product teams',
      'Write clean, readable, and tested code',
      'Participate in code reviews and architecture discussions',
    ],
  };
};

export default { analyzeJobDescription };
