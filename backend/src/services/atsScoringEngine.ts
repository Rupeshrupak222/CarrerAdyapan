import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import stringSimilarity from 'string-similarity';
import natural from 'natural';
import { logger } from '../utils/logger.js';

/**
 * Step 1: Text Extraction from PDF or DOCX buffer
 * Returns empty string if extraction fails (no hardcoded fallback!)
 */
export const extractTextFromBuffer = async (buffer, mimeType = '', filename = '') => {
  try {
    const isDocx = filename.endsWith('.docx') || filename.endsWith('.doc') || mimeType.includes('word');
    if (isDocx) {
      logger.info('Extracting text from DOCX resume using Mammoth...');
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    }

    logger.info('Extracting text from PDF resume using pdf-parse...');
    const pdfData = await pdfParse(buffer);
    return pdfData.text || '';
  } catch (error) {
    logger.error('Resume Text Extraction Error:', error.message);
    return '';
  }
};

/**
 * Step 2: AI Structured Resume Parser
 * Converts raw extracted text into structured Resume JSON
 */
export const parseResumeText = (rawText) => {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 5) {
    return {
      error: 'Resume text extraction failed or text is empty',
      extractedSkills: [],
      yearsOfExperience: 0,
      education: [],
      certifications: [],
      projects: [],
      rawText: ''
    };
  }

  const text = rawText.replace(/\r\n/g, '\n');

  // Extract Email & Phone
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91\s?\d{10}|\d{10}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Comprehensive Skills Dictionary
  const SKILL_KEYWORDS = [
    // Tech Stack
    'JavaScript', 'TypeScript', 'React', 'React.js', 'Next.js', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Prisma', 'SQL',
    'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C++', 'C#', 'AWS', 'Docker', 'Kubernetes', 'Git', 'GraphQL', 'REST API',
    'HTML', 'CSS', 'Tailwind', 'Redux', 'Jest', 'CI/CD', 'Full Stack', 'Frontend', 'Backend', 'Software Development',
    // Sales & EdTech & Growth
    'Business Development', 'BDA', 'Sales', 'Lead Generation', 'Cold Calling', 'B2B Sales', 'B2C Sales', 'Inside Sales', 'Negotiation', 'CRM', 'HubSpot', 'Salesforce',
    'Student Counselling', 'Academic Counselling', 'Admissions', 'Communication', 'Closing', 'Direct Sales', 'Telesales', 'Telecalling',
    'Target Handling', 'Parent Counselling', 'Objection Handling', 'Client Advisory', 'Student Advisory', 'Pitching',
    // General / Management / Operations
    'Customer Success', 'Client Handling', 'Public Speaking', 'Team Leadership', 'Market Research', 'Data Analysis', 'Project Management',
    'Problem Solving', 'Communication Skills', 'Teamwork', 'Presentation', 'MS Office', 'Excel', 'Operations', 'Leadership'
  ];

  const lowerText = text.toLowerCase();
  const extractedSkills = SKILL_KEYWORDS.filter(skill => lowerText.includes(skill.toLowerCase()));

  // Extract NLP Keywords via Natural TfIdf
  let nlpKeywords = [];
  try {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text);

    const tfidf = new natural.TfIdf();
    tfidf.addDocument(tokens.join(' '));

    const terms = [];
    tfidf.listTerms(0).forEach(item => {
      if (item.term.length > 3 && !['with', 'from', 'that', 'this', 'have', 'your', 'about', 'work', 'year', 'project'].includes(item.term)) {
        terms.push(item.term.charAt(0).toUpperCase() + item.term.slice(1));
      }
    });
    nlpKeywords = terms.slice(0, 15);
  } catch (e: any) {
    logger.warn('NLP TfIdf extraction warning:', e?.message || e);
  }

  const allSkillsCombined = Array.from(new Set([...extractedSkills, ...nlpKeywords]));

  // Experience calculation from text patterns
  let yearsOfExperience = 0;
  const expMatch = text.match(/(\d+)\s*\+?\s*(?:years?|yrs?)\s*(?:of)?\s*experience/i);
  if (expMatch) {
    yearsOfExperience = parseInt(expMatch[1], 10);
  } else {
    const yearMatches = text.match(/20\d{2}/g);
    if (yearMatches && yearMatches.length >= 2) {
      const years = yearMatches.map(y => parseInt(y, 10)).sort();
      const diff = years[years.length - 1] - years[0];
      if (diff > 0 && diff <= 20) yearsOfExperience = diff;
    }
  }

  // Extract Education
  const education = [];
  if (/b\.tech|btech|bachelor|b\.e|be/i.test(text)) education.push('B.Tech / B.E');
  if (/m\.tech|mtech|master/i.test(text)) education.push('M.Tech');
  if (/bba|b\.b\.a/i.test(text)) education.push('BBA');
  if (/mba|m\.b\.a/i.test(text)) education.push('MBA');
  if (/b\.sc|bsc|b\.com|bcom|bachelor/i.test(text)) education.push('Bachelor Degree');

  // Certifications detection
  const certifications = [];
  if (/aws certified|aws/i.test(text)) certifications.push('AWS');
  if (/salesforce/i.test(text)) certifications.push('Salesforce');
  if (/pmp|scrum/i.test(text)) certifications.push('PMP / Scrum');
  if (/google|meta/i.test(text)) certifications.push('Google / Meta Certified');

  return {
    email,
    phone,
    extractedSkills: allSkillsCombined,
    yearsOfExperience,
    education,
    certifications,
    rawLength: text.length,
    rawText: text
  };
};

/**
 * Step 3: Strict Job-Specific Deterministic ATS Scoring Engine
 * Candidate Resume + Specific Applied Job Requirements = ATS Score (0 - 100)
 */
export const calculateAtsScore = (parsedResume: any, job: any = {}) => {
  // If resume text extraction failed or text is missing, calculate baseline evaluation
  if (!parsedResume || parsedResume.error || !parsedResume.rawText || parsedResume.rawText.trim().length === 0) {
    return {
      aiScore: 0,
      atsCategory: 'NO_RESUME_TEXT',
      matchedSkills: [],
      missingSkills: [],
      matchReason: 'Resume text extraction failed or resume file was unreadable. Unable to calculate ATS score.',
      calculatedExp: 0,
      breakdown: {
        keywordMatching: { score: 0, maxScore: 15 },
        skillsMatching: { score: 0, maxScore: 35 },
        experienceMatching: { score: 0, maxScore: 20 },
        educationMatching: { score: 0, maxScore: 10 },
        semanticMatching: { score: 0, maxScore: 15 },
        requiredCriteria: { score: 0, maxScore: 5 }
      }
    };
  }

  const {
    extractedSkills = [],
    yearsOfExperience = 0,
    education = [],
    certifications = [],
    rawText = ''
  } = parsedResume;

  const textLower = rawText.toLowerCase();

  // Extract Specific Job Requirements
  const jobTitle = job.title || job.jobTitle || 'Business Development Associate (BDA)';
  const rawExpVal = String(job.experience ?? job.experienceRequired ?? job.experienceLevel ?? '1');
  let jobReqExp = 1;
  const numMatch = rawExpVal.match(/\d+(\.\d+)?/);
  if (numMatch) {
    jobReqExp = parseFloat(numMatch[0]);
  } else if (/fresh|entry|student|intern/i.test(rawExpVal)) {
    jobReqExp = 0;
  } else if (/mid/i.test(rawExpVal)) {
    jobReqExp = 2;
  } else if (/senior|lead/i.test(rawExpVal)) {
    jobReqExp = 4;
  }

  // Normalize Job Required Skills
  let jobRequiredSkills: string[] = [];
  if (Array.isArray(job.skills)) {
    jobRequiredSkills = job.skills;
  } else if (typeof job.skills === 'string' && job.skills.length > 0) {
    try {
      jobRequiredSkills = JSON.parse(job.skills);
    } catch (e) {
      jobRequiredSkills = job.skills.split(',').map((s: string) => s.trim());
    }
  }
  if (jobRequiredSkills.length === 0 && job.requirements) {
    const SKILL_LOOKUP = ['React', 'Node.js', 'JavaScript', 'TypeScript', 'PostgreSQL', 'Sales', 'Lead Generation', 'Student Counselling', 'B2B Sales', 'Negotiation', 'CRM', 'Telesales', 'Communication', 'Business Development'];
    jobRequiredSkills = SKILL_LOOKUP.filter(sk => job.requirements.toLowerCase().includes(sk.toLowerCase()));
  }
  if (jobRequiredSkills.length === 0) {
    jobRequiredSkills = ['Sales', 'Communication', 'Lead Generation', 'Student Counselling', 'Business Development'];
  }

  // 1. Required Skills Matching (Weight: 35 Points)
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  const SKILL_SYNONYMS: Record<string, string[]> = {
    'javascript': ['js', 'ecmascript', 'javascript'],
    'typescript': ['ts', 'typescript'],
    'react': ['react.js', 'reactjs', 'react'],
    'react.js': ['react', 'reactjs', 'react.js'],
    'node.js': ['node', 'nodejs', 'node.js'],
    'node': ['node.js', 'nodejs', 'node'],
    'postgresql': ['postgres', 'postgresql', 'psql'],
    'postgres': ['postgresql', 'postgres', 'psql'],
    'python': ['python programming', 'python3', 'python'],
    'business development': ['bda', 'business development', 'sales', 'growth', 'client advisory', 'lead generation'],
    'sales': ['edtech sales', 'inside sales', 'direct sales', 'b2b sales', 'b2c sales', 'telesales', 'sales', 'business development'],
    'student counselling': ['student counseling', 'academic counselling', 'academic counseling', 'counselling', 'counseling', 'advising', 'counselor'],
    'lead generation': ['lead conversion', 'lead gen', 'lead generation', 'prospecting', 'cold calling'],
    'communication': ['communication skills', 'verbal communication', 'presentation', 'public speaking', 'interpersonal'],
    'crm': ['hubspot', 'salesforce', 'crm tools', 'lead management', 'zoho'],
    'problem solving': ['analytical skills', 'critical thinking', 'problem solving', 'troubleshooting'],
  };

  jobRequiredSkills.forEach(reqSkill => {
    const reqLower = reqSkill.toLowerCase().trim();
    const synonyms = SKILL_SYNONYMS[reqLower] || [reqLower];

    const isExactMatch = synonyms.some(syn =>
      extractedSkills.some((candSkill: string) => candSkill.toLowerCase().includes(syn) || syn.includes(candSkill.toLowerCase())) ||
      textLower.includes(syn)
    );

    let isFuzzyMatch = false;
    if (!isExactMatch && extractedSkills.length > 0) {
      const best = stringSimilarity.findBestMatch(reqLower, extractedSkills.map((s: string) => s.toLowerCase()));
      if (best?.bestMatch?.rating > 0.5) {
        isFuzzyMatch = true;
      }
    }

    if (isExactMatch || isFuzzyMatch) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const skillMatchRatio = jobRequiredSkills.length > 0 ? matchedSkills.length / jobRequiredSkills.length : 0.5;
  const skillsScore = Math.round(skillMatchRatio * 35);

  // 2. Experience Matching (Weight: 20 Points)
  let experienceScore = 12;
  if (jobReqExp > 0) {
    const expRatio = Math.min(Math.max(yearsOfExperience, 1) / jobReqExp, 1.0);
    experienceScore = Math.round(expRatio * 20);
  } else {
    experienceScore = 20;
  }

  // 3. Job Title & Domain Relevance (Weight: 15 Points)
  const genericPrefixes = ['senior', 'junior', 'lead', 'associate', 'executive', 'specialist', 'manager', 'intern', 'head', 'principal'];
  const titleTokens = jobTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !genericPrefixes.includes(w));
  let matchedTitleTokens = 0;
  titleTokens.forEach(token => {
    if (textLower.includes(token)) matchedTitleTokens++;
  });
  const titleRatio = titleTokens.length > 0 ? matchedTitleTokens / titleTokens.length : 0.5;
  const titleScore = Math.max(5, Math.round(titleRatio * 15));

  // 4. Job Responsibilities & Keywords Density (Weight: 15 Points)
  const stopWords = ['responsible', 'experience', 'description', 'requirements', 'responsibilities', 'prospects', 'converting', 'proven', 'record', 'track', 'using', 'admissions', 'working', 'ability', 'strong', 'candidate'];
  const reqText = `${(job as any).requirements || ''} ${(job as any).responsibilities || ''} ${(job as any).description || ''}`.toLowerCase();
  const reqTokens = reqText.split(/\s+/).filter(w => w.length > 4 && !stopWords.includes(w));
  const uniqueReqTokens = Array.from(new Set(reqTokens)).slice(0, 20);
  let matchedReqTokens = 0;
  uniqueReqTokens.forEach(token => {
    if (textLower.includes(token)) matchedReqTokens++;
  });
  const keywordsRatio = uniqueReqTokens.length > 0 ? matchedReqTokens / uniqueReqTokens.length : 0.5;
  const keywordsScore = Math.max(5, Math.round(keywordsRatio * 15));

  // 5. Education & Qualification Match (Weight: 10 Points)
  let educationScore = 8;
  if (education.length > 0) {
    const eduJoined = education.join(' ').toLowerCase();
    if (reqText.includes('b.tech') || reqText.includes('engineering') || reqText.includes('developer')) {
      if (eduJoined.includes('b.tech') || eduJoined.includes('btech') || eduJoined.includes('be')) educationScore = 10;
    } else if (reqText.includes('mba') || reqText.includes('management') || reqText.includes('sales')) {
      if (eduJoined.includes('mba') || eduJoined.includes('bba')) educationScore = 10;
    } else {
      educationScore = 9;
    }
  }

  // 6. Certifications & Projects Match (Weight: 5 Points)
  let certScore = 3;
  if (certifications.length > 0 || textLower.includes('project') || textLower.includes('certification')) {
    certScore = 5;
  }

  // Raw Weighted Total (0 - 100)
  const rawTotal = skillsScore + experienceScore + titleScore + keywordsScore + educationScore + certScore;
  const deterministicScore = Math.max(25, Math.min(98, rawTotal));

  // ATS Category Classification
  let atsCategory = 'WEAK_MATCH';
  if (deterministicScore >= 85) atsCategory = 'EXCELLENT_MATCH';
  else if (deterministicScore >= 70) atsCategory = 'STRONG_MATCH';
  else if (deterministicScore >= 50) atsCategory = 'MODERATE_MATCH';

  // 7. Executive Hiring ROI Analysis (Business Profit vs Loss Risk)
  const hiringProfit = [];
  const hiringLoss = [];

  if (matchedSkills.length > 0) {
    hiringProfit.push(`Immediate Onboarding Benefit: Candidate possesses verified proficiency in ${matchedSkills.join(', ')}, eliminating preliminary technical training expenses.`);
  }
  if (yearsOfExperience >= jobReqExp) {
    hiringProfit.push(`Zero Ramp-up Delay: With ${yearsOfExperience} yrs verified experience (vs ${jobReqExp} yrs required), candidate can drive immediate team productivity and revenue.`);
  } else if (yearsOfExperience > 0) {
    hiringProfit.push(`Competitive Cost Bandwidth: Candidate brings ${yearsOfExperience} yrs relevant experience with high growth potential at optimized talent budget.`);
  }
  if (titleScore > 5) {
    hiringProfit.push(`Domain Orientation Profit: Direct alignment with ${jobTitle} ensures zero operational learning curve.`);
  }
  if (education.length > 0) {
    hiringProfit.push(`Academic Verification: Academic qualification (${education[0]}) ensures baseline analytical and execution capability.`);
  }

  if (missingSkills.length > 0) {
    hiringLoss.push(`Training & Upskilling Loss: Lack of key skills (${missingSkills.join(', ')}) will incur estimated 2-4 weeks internal training cost and delayed delivery.`);
  }
  if (yearsOfExperience < jobReqExp) {
    hiringLoss.push(`Seniority Supervision Overhead: Experience deficit (${yearsOfExperience} yrs vs ${jobReqExp} yrs required) requires senior team mentorship bandwidth.`);
  }
  if (matchedSkills.length === 0) {
    hiringLoss.push(`High Skill Mismatch Risk: Candidate lacks all mandatory job skills for ${jobTitle}, posing high risk of probation underperformance or target failure.`);
  }
  if (hiringLoss.length === 0) {
    hiringLoss.push(`Minimal Operational Risk: Candidate meets all mandatory qualification criteria for ${jobTitle}.`);
  }

  // Executive Hiring Verdict
  let hiringVerdict = 'HIGH RISK / LOW RETURN';
  if (deterministicScore >= 85) hiringVerdict = 'HIGH RETURN / LOW RISK HIRE ';
  else if (deterministicScore >= 70) hiringVerdict = 'MODERATE RETURN / MANAGEABLE RISK ';
  else if (deterministicScore >= 50) hiringVerdict = 'CONDITIONAL HIRE / REQUIRES UPSKILLING ';

  // AI Structured Explanation Output
  const breakdown = {
    keywordMatching: { score: titleScore + keywordsScore, maxScore: 30, matched: matchedTitleTokens, total: titleTokens.length },
    skillsMatching: { score: skillsScore, maxScore: 35, matched: matchedSkills.length, total: jobRequiredSkills.length, matchedSkills, missingSkills },
    experienceMatching: { score: experienceScore, maxScore: 20, candidateYears: yearsOfExperience, requiredYears: jobReqExp },
    educationMatching: { score: educationScore, maxScore: 10, educationFound: education },
    semanticMatching: { score: titleScore, maxScore: 15, jobTitle },
    requiredCriteria: { score: certScore, maxScore: 5 },
    evaluationDetails: {
      matchingSkills: matchedSkills,
      missingSkills,
      matchingExperience: `${yearsOfExperience} yrs verified experience`,
      experienceGaps: yearsOfExperience < jobReqExp ? `Short by ${jobReqExp - yearsOfExperience} yr(s)` : 'None',
      hiringProfit,
      hiringLoss,
      hiringVerdict,
      finalRecommendation: hiringVerdict
    }
  };

  const explanation = [
    ` Role Title & Keywords (${titleScore + keywordsScore}/30): Matched ${matchedTitleTokens}/${titleTokens.length} title terms against ${jobTitle}.`,
    `Required Skills (${skillsScore}/35): Matched ${matchedSkills.length}/${jobRequiredSkills.length} job skills (${matchedSkills.join(', ') || 'None matched'}).`,
    `Experience (${experienceScore}/20): Candidate has ${yearsOfExperience} yrs vs ${jobReqExp} yrs required for this role.`,
    `Education (${educationScore}/10): Qualification fit evaluated (${education[0] || 'Unspecified'}).`,
    missingSkills.length > 0 ? `Missing Key Skills for ${jobTitle}: ${missingSkills.join(', ')}.` : 'All mandatory skills verified.'
  ].join(' ');

  return {
    aiScore: deterministicScore,
    atsCategory,
    finalRecommendation: hiringVerdict,
    hiringVerdict,
    matchedSkills,
    missingSkills,
    matchingExperience: `${yearsOfExperience} years verified experience`,
    experienceGaps: yearsOfExperience < jobReqExp ? `Requires ${jobReqExp - yearsOfExperience} more year(s) of experience for ${jobTitle}` : 'Meets minimum experience requirements',
    hiringProfit,
    hiringLoss,
    educationMatch: education.length > 0 ? `Verified ${education[0]} degree alignment` : 'Degree requirements unconfirmed',
    jobResponsibilitiesMatch: `${matchedTitleTokens}/${titleTokens.length} core title & responsibility areas matched`,
    matchReason: explanation,
    calculatedExp: yearsOfExperience,
    breakdown
  };
};
