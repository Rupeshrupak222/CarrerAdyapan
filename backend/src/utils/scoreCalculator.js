/**
 * Role-aware algorithm for scoring candidates specifically tailored for Education Company roles
 * (Business Development Associate, Academic Counsellor, Telecaller, Sales Executive, Tech Roles).
 */
export const calculateMatchScore = (candidateSkills = [], jobRequirements = '', jobTitle = '') => {
  const titleLower = (jobTitle || '').toLowerCase();
  const reqLower = (jobRequirements || '').toLowerCase();

  // Detect role domain
  const isSalesRole =
    titleLower.includes('business development') ||
    titleLower.includes('bda') ||
    titleLower.includes('bde') ||
    titleLower.includes('sales') ||
    titleLower.includes('counsellor') ||
    titleLower.includes('telecaller') ||
    titleLower.includes('inside sales');

  const isTechRole =
    titleLower.includes('developer') ||
    titleLower.includes('engineer') ||
    titleLower.includes('tech') ||
    titleLower.includes('stack') ||
    titleLower.includes('code');

  const matchedSkills = [];
  const missingSkills = [];

  candidateSkills.forEach((skill) => {
    if (reqLower.includes(skill.toLowerCase()) || skill.toLowerCase().includes('sales') || skill.toLowerCase().includes('react')) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  let baseScore = Math.min(95, Math.max(65, matchedSkills.length * 15 + 40));

  if (isSalesRole) {
    const hasEdTechExp = candidateSkills.some(s =>
      s.toLowerCase().includes('edtech') ||
      s.toLowerCase().includes('counsell') ||
      s.toLowerCase().includes('tele') ||
      s.toLowerCase().includes('target') ||
      s.toLowerCase().includes('lead')
    );

    return {
      aiScore: hasEdTechExp ? Math.min(98, baseScore + 12) : baseScore,
      scoreBreakdown: {
        salesTargetMatch: hasEdTechExp ? 92 : 75,
        communicationFit: 90,
        educationDomainExperience: hasEdTechExp ? 95 : 65,
        leadConversionRate: hasEdTechExp ? 88 : 70,
      },
      matchReason: hasEdTechExp
        ? 'Strong candidate with proven EdTech sales & student counselling background.'
        : 'Good communication candidate with general customer handling experience.',
      missingSkills: missingSkills.slice(0, 3),
      strengths: candidateSkills.length ? candidateSkills.slice(0, 3) : ['Communication', 'Inside Sales', 'Negotiation'],
      recommendations: [
        'Conduct 10-minute mock sales pitch simulation for student course enrolment.',
        'Verify past monthly sales target achievements and conversion metrics.',
      ],
    };
  }

  if (isTechRole) {
    return {
      aiScore: baseScore,
      scoreBreakdown: {
        technicalStackMatch: baseScore,
        systemArchitectureFit: Math.min(95, baseScore - 5),
        codingBestPractices: Math.min(95, baseScore + 5),
      },
      matchReason: 'Solid technical background matching key stack requirements.',
      missingSkills: missingSkills.slice(0, 3),
      strengths: candidateSkills.slice(0, 3),
      recommendations: [
        'Review recent GitHub repositories or live project architecture.',
        'Conduct technical live problem-solving interview.',
      ],
    };
  }

  // Default General Role
  return {
    aiScore: baseScore,
    scoreBreakdown: { skillMatch: baseScore, domainFit: baseScore },
    matchReason: 'Good overall candidate profile alignment.',
    missingSkills: missingSkills.slice(0, 3),
    strengths: candidateSkills.slice(0, 3),
    recommendations: ['Conduct standard screening interview.'],
  };
};

export default calculateMatchScore;
