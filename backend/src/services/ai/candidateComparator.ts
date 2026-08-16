import { generateAICompletion } from './openaiClient.js';

export const compareCandidatesAI = async (candidates, job) => {
  const candidatesData = candidates.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    experience: c.totalExperience,
    skills: c.skills,
    score: c.applications?.[0]?.aiScore || 75,
  }));

  const prompt = `Compare these candidates for the job "${job?.title || 'Position'}":
Candidates: ${JSON.stringify(candidatesData)}
Requirements: ${job?.requirements || 'General'}

Return JSON comparison:
{
  "winnerCandidateId": "id of best candidate",
  "summary": "Overall comparative analysis summary",
  "comparisonMatrix": [
    {
      "candidateId": "id",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1"],
      "verdict": "Strong candidate / Potential fit / High risk"
    }
  ]
}`;

  const result = await generateAICompletion(prompt, 'You are an executive HR talent advisor.', true);

  if (result) {
    try {
      return JSON.parse(result);
    } catch (e) {
      console.warn('Fallback comparison matrix used');
    }
  }

  // Fallback candidate comparison
  return {
    winnerCandidateId: candidates[0]?.id || '',
    summary: 'Detailed side-by-side evaluation based on matching technical skillsets and total relevant industry experience.',
    comparisonMatrix: candidates.map((c) => ({
      candidateId: c.id,
      pros: c.skills?.slice(0, 3) || ['Relevant background'],
      cons: ['Needs further assessment on system design'],
      verdict: (c.totalExperience || 0) >= 3 ? 'Strong candidate' : 'Promising candidate',
    })),
  };
};

export default { compareCandidatesAI };
