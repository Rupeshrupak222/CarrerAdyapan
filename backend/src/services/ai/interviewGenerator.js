import { generateAICompletion } from './openaiClient.js';

export const generateInterviewQuestions = async (jobTitle = '', candidateSkills = [], experienceLevel = 'Mid') => {
  const titleLower = jobTitle.toLowerCase();
  const isSalesRole =
    titleLower.includes('bda') ||
    titleLower.includes('business development') ||
    titleLower.includes('counsellor') ||
    titleLower.includes('sales') ||
    titleLower.includes('telecaller');

  const prompt = `Generate tailored interview questions for:
Role: ${jobTitle}
Level: ${experienceLevel}
Candidate Skills: ${candidateSkills.join(', ')}

Return JSON object:
{
  "questions": [
    {
      "category": "Sales & Target Handling" | "Student Counselling" | "Technical" | "Behavioral",
      "question": "Question text",
      "expectedAnswerSummary": "Key points expected in a strong answer",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}`;

  const result = await generateAICompletion(prompt, 'You are an EdTech Hiring Manager & Senior Interviewer.', true);

  if (result) {
    try {
      return JSON.parse(result);
    } catch (e) {
      console.warn('Fallback interview questions generated');
    }
  }

  if (isSalesRole) {
    return {
      questions: [
        {
          category: 'Sales & Target Handling',
          question: 'In a previous sales role, what was your monthly revenue target, and how did you consistently achieve or exceed it?',
          expectedAnswerSummary: 'Candidate should provide specific revenue numbers, call-to-conversion percentages, and pipeline management tactics.',
          difficulty: 'Medium',
        },
        {
          category: 'Student Counselling & Objection Handling',
          question: 'If a prospective student or parent says your course fee is too high compared to competitors, how do you pitch value and handle the objection?',
          expectedAnswerSummary: 'Candidate should demonstrate empathy, highlight career outcomes, placement assistance, and ROI rather than discounting price.',
          difficulty: 'Hard',
        },
        {
          category: 'Behavioral & Cold Calling',
          question: 'How do you handle 50+ cold calls a day when 80% result in rejections? How do you maintain enthusiasm?',
          expectedAnswerSummary: 'Demonstrate resilience, positive mindset, and continuous pitch refinement.',
          difficulty: 'Medium',
        },
      ],
    };
  }

  return {
    questions: [
      {
        category: 'Technical Stack',
        question: `Explain how you would architect a full-stack web application using ${candidateSkills[0] || 'React & Node.js'} to handle high concurrent user traffic.`,
        expectedAnswerSummary: 'Should mention caching, database query indexing, load balancing, and clean state management.',
        difficulty: 'Hard',
      },
      {
        category: 'Problem Solving',
        question: 'Describe a complex production bug you encountered and how you diagnosed and resolved it under pressure.',
        expectedAnswerSummary: 'Focus on systematic log analysis, debugging, and post-mortem prevention.',
        difficulty: 'Medium',
      },
      {
        category: 'Behavioral',
        question: 'How do you prioritize features when product deadlines conflict with code refactoring?',
        expectedAnswerSummary: 'Clear communication, technical debt tracking, and business trade-off alignment.',
        difficulty: 'Easy',
      },
    ],
  };
};

export default { generateInterviewQuestions };
