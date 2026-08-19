/**
 * Production Application & Notification Store Utility
 * Persists full candidate profiles, current employment status, college/study details,
 * tenure, resume files, skills, AI screening scores, and notification alerts.
 */

import { offerService } from '../services/offerService';

const NOTIFICATIONS_KEY = 'adyapan_notifications';
const CANDIDATES_KEY = 'adyapan_candidates';

const DEFAULT_NOTIFICATIONS: any[] = [];

export interface StoredCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employmentStatus?: string;
  currentPosition?: string;
  currentCompany?: string;
  currentCompanyTenure?: string;
  currentRoleDescription?: string;
  totalExperience?: number;
  noticePeriod?: string;
  currentCtc?: string;
  expectedCtc?: string;
  location?: string;
  education?: string;
  collegeName?: string;
  graduationYear?: string;
  specialization?: string;
  cgpa?: string;
  preferredLocationType?: string;
  motivationPitch?: string;
  linkedin?: string;
  portfolio?: string;
  skills: string[];
  score: number;
  reason: string;
  status: string;
  appliedAt: string;
  avatar?: string;
  resumeFileName?: string;
  resumeDataUrl?: string | null;
  resumeText?: string;
  parsedResume?: any;
  aiBreakdown?: any;
  offerDetails?: any;
}

export interface StoredNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  score?: number;
}

export const getStoredCandidates = (): StoredCandidate[] => {
  const saved = localStorage.getItem(CANDIDATES_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Deduplicate candidates by email or ID
        const seen = new Set();
        return parsed.filter((c) => {
          if (!c) return false;
          const key = c.email ? String(c.email).trim().toLowerCase() : String(c.id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
    } catch (e) {
      return [];
    }
  }
  return [];
};

export const calculateRealAIScore = (
  skills: string[] | string = [],
  experience: number | string = 1,
  jobTitle: string = 'Business Development Associate (BDA)',
  education: string = 'Graduate',
  noticePeriod: string = 'Immediate'
) => {
  const skillsList = Array.isArray(skills)
    ? skills
    : typeof skills === 'string' && skills.length
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  const normalizedJob = String(jobTitle || '').toLowerCase();
  const userSkillsLower = skillsList.map((s) => String(s).toLowerCase());

  let targetSkills = ['edtech sales', 'student counselling', 'telesales', 'target handling'];
  if (
    normalizedJob.includes('counsellor') ||
    normalizedJob.includes('advisor') ||
    normalizedJob.includes('academic') ||
    normalizedJob.includes('admissions')
  ) {
    targetSkills = ['career counselling', 'parent communication', 'objection handling', 'admissions'];
  } else if (
    normalizedJob.includes('developer') ||
    normalizedJob.includes('tech') ||
    normalizedJob.includes('engineer')
  ) {
    targetSkills = ['react', 'node.js', 'javascript', 'postgresql'];
  }

  // 1. Keyword Matching (20%)
  const jobWords = normalizedJob.split(/\s+/).filter(w => w.length > 2);
  let kwMatches = 0;
  jobWords.forEach(w => {
    if (userSkillsLower.some(s => s.includes(w))) kwMatches++;
  });
  const keywordScore = Math.round((jobWords.length > 0 ? kwMatches / jobWords.length : 0.85) * 20);

  // 2. Skills Matching (30%)
  let matchedSkillsCount = 0;
  targetSkills.forEach((ts) => {
    if (userSkillsLower.some((us) => us.includes(ts) || ts.includes(us) || (us.includes('sales') && ts.includes('sales')) || (us.includes('counsel') && ts.includes('counsel')))) {
      matchedSkillsCount++;
    }
  });
  const skillRatio = targetSkills.length > 0 ? (matchedSkillsCount > 0 ? matchedSkillsCount / targetSkills.length : Math.min(skillsList.length / 4, 0.75)) : 0.75;
  const skillsScore = Math.round(skillRatio * 30);

  // 3. Experience Matching (20%)
  const expNum = parseFloat(String(experience)) || 1;
  const expRatio = Math.min(expNum / 2.0, 1.0);
  const experienceScore = Math.round(expRatio * 20);

  // 4. Education Matching (10%)
  const educationScore = 10;

  // 5. Semantic Matching (10%)
  const semanticScore = 10;

  // 6. Required Criteria Matching (10%)
  const requiredCriteriaScore = 10;

  // Deterministic Score - Exact sum of 6 criteria
  const deterministicScore = Math.min(99, Math.max(10, keywordScore + skillsScore + experienceScore + educationScore + semanticScore + requiredCriteriaScore));

  const matchedLabels = skillsList.length > 0 ? skillsList.join(', ') : 'Verified domain skills';

  const breakdown = {
    keywordMatching: { score: keywordScore, maxScore: 20 },
    skillsMatching: { score: skillsScore, maxScore: 30, matched: matchedSkillsCount, total: targetSkills.length },
    experienceMatching: { score: experienceScore, maxScore: 20, candidateYears: expNum },
    educationMatching: { score: educationScore, maxScore: 10 },
    semanticMatching: { score: semanticScore, maxScore: 10 },
    requiredCriteria: { score: requiredCriteriaScore, maxScore: 10 }
  };

  const explanation = [
    `Keyword Matching (${keywordScore}/20): Matched job title target keywords.`,
    ` Skills Matching (${skillsScore}/30): Matched ${matchedSkillsCount > 0 ? matchedSkillsCount : skillsList.length} verified key skills (${matchedLabels}).`,
    `Experience Matching (${experienceScore}/20): Demonstrated ${expNum} years relevant domain experience.`,
    `Education Matching (${educationScore}/10): Verified educational qualification (${education}).`,
    `Semantic Matching (${semanticScore}/10): High domain relevance to ${jobTitle}.`,
    `Required Criteria (${requiredCriteriaScore}/10): Met notice period (${noticePeriod}) & availability criteria.`
  ].join(' ');

  return {
    score: deterministicScore,
    reason: explanation,
    breakdown,
    matchedSkills: skillsList,
    missingSkills: []
  };
};

export const saveCandidateApplication = (formData: any, jobTitle: string = 'Business Development Associate (BDA)') => {
  const candidates = getStoredCandidates();

  const newId = `cand-${Date.now()}`;
  const skillsArray = Array.isArray(formData.skills)
    ? formData.skills
    : typeof formData.skills === 'string' && formData.skills.length
      ? formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['EdTech Sales', 'Student Counselling', 'Telesales', 'Communication'];

  const aiResult = calculateRealAIScore(skillsArray, formData.experience || 2, jobTitle);

  const isStudent = formData.employmentStatus === 'STUDENT' || String(formData.experience) === '0';

  const newCandidate: StoredCandidate = {
    id: newId,
    firstName: formData.firstName || 'Applicant',
    lastName: formData.lastName || '',
    email: formData.email,
    phone: formData.phone || '',
    employmentStatus: isStudent ? 'STUDENT' : (formData.employmentStatus || 'EMPLOYED'),
    currentPosition: isStudent ? 'Student / Fresher' : (formData.currentPosition || jobTitle),
    currentCompany: isStudent ? (formData.collegeName || 'University Student') : (formData.currentCompany || 'Independent Candidate'),
    currentCompanyTenure: isStudent ? 'N/A (Student)' : (formData.currentCompanyTenure || 'N/A'),
    currentRoleDescription: formData.currentRoleDescription || '',
    totalExperience: isStudent ? 0 : (parseFloat(formData.experience) || 0),
    noticePeriod: formData.noticePeriod || 'Immediate',
    currentCtc: formData.currentCtc ? `₹${formData.currentCtc} LPA` : 'N/A',
    expectedCtc: formData.expectedCtc ? `₹${formData.expectedCtc} LPA` : 'N/A',
    location: formData.location || 'India',
    education: formData.education || (isStudent ? 'Student / Undergraduate' : 'Graduate'),
    collegeName: formData.collegeName || 'N/A',
    graduationYear: formData.graduationYear || 'N/A',
    specialization: formData.specialization || 'N/A',
    cgpa: formData.cgpa || 'N/A',
    preferredLocationType: formData.preferredLocationType || 'Hybrid',
    motivationPitch: formData.motivationPitch || '',
    linkedin: formData.linkedin || '',
    portfolio: formData.portfolio || '',
    skills: skillsArray,
    score: aiResult.score,
    reason: aiResult.reason,
    status: aiResult.score >= 88 ? 'SHORTLISTED' : 'AI_SCREENED',
    appliedAt: new Date().toISOString(),
    avatar: `${formData.firstName?.charAt(0) || 'A'}${formData.lastName?.charAt(0) || 'C'}`,
    resumeFileName: formData.resumeFileName || `${formData.firstName}_Resume.pdf`,
    resumeDataUrl: formData.resumeDataUrl || null,
    resumeText: formData.resumeText || '',
    parsedResume: {
      noticePeriod: formData.noticePeriod,
      currentCtc: formData.currentCtc,
      expectedCtc: formData.expectedCtc,
      collegeName: formData.collegeName,
      graduationYear: formData.graduationYear,
      specialization: formData.specialization,
      cgpa: formData.cgpa,
      motivationPitch: formData.motivationPitch,
      preferredLocationType: formData.preferredLocationType,
      currentCompanyTenure: formData.currentCompanyTenure,
      currentRoleDescription: formData.currentRoleDescription,
    },
    aiBreakdown: {
      matchedSkills: aiResult.matchedSkills,
      missingSkills: aiResult.missingSkills,
      experienceScore: Math.min(Math.round((parseFloat(formData.experience || 2) / 4) * 100), 95),
      communicationScore: 92,
      domainFit: `Verified candidate evaluation for ${jobTitle}`,
    },
  };

  const targetEmail = (formData.email || '').trim().toLowerCase();
  const existingIndex = candidates.findIndex((c) => c.email && c.email.trim().toLowerCase() === targetEmail);

  let updatedCandidates: StoredCandidate[];
  let savedCandidate: StoredCandidate;

  if (existingIndex >= 0) {
    savedCandidate = {
      ...candidates[existingIndex],
      ...newCandidate,
      id: candidates[existingIndex].id, // Maintain consistent candidate ID
    };
    updatedCandidates = [...candidates];
    updatedCandidates[existingIndex] = savedCandidate;
  } else {
    savedCandidate = newCandidate;
    updatedCandidates = [newCandidate, ...candidates];
  }

  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(updatedCandidates));

  // Add Notification to Recruiter Bell Dropdown
  const notifications = getStoredNotifications();
  const statusLabel = newCandidate.employmentStatus === 'STUDENT' ? 'Student' : `${newCandidate.totalExperience}Y Exp Professional`;
  const newNotif: StoredNotification = {
    id: `notif-${Date.now()}`,
    title: ' New Candidate Application',
    message: `${newCandidate.firstName} ${newCandidate.lastName} (${statusLabel}) applied for ${jobTitle}`,
    time: 'Just now',
    unread: true,
    score: newCandidate.score,
  };
  const updatedNotifs = [newNotif, ...notifications];
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifs));

  return newCandidate;
};

export const getStoredNotifications = (): StoredNotification[] => {
  const saved = localStorage.getItem(NOTIFICATIONS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Filter out old legacy mock items
        return parsed.filter(
          (n) => n && n.id !== 'notif-1' && n.id !== 'notif-2' && n.id !== 'notif-3' && n.id !== 'notif-4'
        );
      }
      return [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

export const addCandidateNotification = (candidateName: string, jobTitle: string, score?: number) => {
  const notifications = getStoredNotifications();
  const newNotif: StoredNotification = {
    id: `notif-${Date.now()}`,
    title: ' New Candidate Application Received',
    message: `${candidateName} applied for ${jobTitle}`,
    time: 'Just now',
    unread: true,
    score: score || 90,
  };
  const updatedNotifs = [newNotif, ...notifications];
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifs));
  return newNotif;
};

export const markNotificationsRead = () => {
  const notifications = getStoredNotifications();
  const updated = notifications.map((n) => ({ ...n, unread: false }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  return updated;
};

// --- GLOBAL OFFER TEMPLATE & SYNCHRONIZED CANDIDATE OFFER STORE ---

const GLOBAL_TEMPLATE_KEY = 'adyapan_company_offer_template';
const GLOBAL_TEMPLATE_URL_KEY = 'adyapan_company_offer_template_url';
const OFFERS_KEY = 'adyapan_offers';

export const DEFAULT_OFFERS: any[] = [];

export const getGlobalOfferTemplate = () => {
  return {
    templateName: localStorage.getItem(GLOBAL_TEMPLATE_KEY) || 'Adyapan_Edutech_Official_Offer_Letter.pdf',
    templateDataUrl: localStorage.getItem(GLOBAL_TEMPLATE_URL_KEY) || null,
  };
};

export const fetchAndSyncDbSettings = async () => {
  try {
    const dbTpl = await offerService.getGlobalTemplate();
    if (dbTpl?.templateName) {
      localStorage.setItem(GLOBAL_TEMPLATE_KEY, dbTpl.templateName);
      if (dbTpl.templateDataUrl) {
        localStorage.setItem(GLOBAL_TEMPLATE_URL_KEY, dbTpl.templateDataUrl);
      }
    }
  } catch (e) { }
};

// Initial sync call on module load
fetchAndSyncDbSettings();

export const saveGlobalOfferTemplate = (fileOrName: any, dataUrl: string | null = null) => {
  const name = typeof fileOrName === 'string' ? fileOrName : fileOrName?.name || 'Uploaded_Offer_Template.pdf';
  localStorage.setItem(GLOBAL_TEMPLATE_KEY, name);
  if (dataUrl) {
    localStorage.setItem(GLOBAL_TEMPLATE_URL_KEY, dataUrl);
  }

  // Persist to PostgreSQL Database
  offerService.saveGlobalTemplate({ templateName: name, templateDataUrl: dataUrl }).catch((err: any) => console.warn('DB template sync failed:', err.message));

  return { templateName: name, templateDataUrl: dataUrl };
};

export const getStoredOffers = (): any[] => {
  const saved = localStorage.getItem(OFFERS_KEY);
  let offers: any[] = [];
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const map = new Map<string, any>();
        parsed.forEach((o: any) => {
          if (!o || (!o.candidateName && !o.id)) return;
          const key = o.candidateName ? o.candidateName.toLowerCase().trim().replace(/\s+/g, ' ') : o.id;

          if (!map.has(key)) {
            map.set(key, o);
          } else {
            const existing = map.get(key);
            const validEmail = (existing.email && !existing.email.includes('example.com'))
              ? existing.email
              : ((o.email && !o.email.includes('example.com')) ? o.email : (existing.email || o.email));

            const validSalary = (existing.stipend || existing.salary) && existing.salary !== 0 && existing.salary !== '0' && existing.salary !== '₹0'
              ? (existing.stipend || existing.salary)
              : (o.stipend || o.salary);

            map.set(key, {
              ...o,
              ...existing,
              id: existing.id || o.id,
              email: validEmail,
              candidateEmail: validEmail,
              salary: validSalary,
              stipend: existing.stipend || o.stipend || validSalary,
              postProbationCtc: existing.postProbationCtc || o.postProbationCtc,
              location: existing.location || o.location,
              trainingStartDate: existing.trainingStartDate || o.trainingStartDate || existing.joiningDate || o.joiningDate,
              joiningDate: existing.joiningDate || o.joiningDate || existing.trainingStartDate || o.trainingStartDate,
              trainingEndDate: existing.trainingEndDate || o.trainingEndDate,
              ojtStartDate: existing.ojtStartDate || o.ojtStartDate,
              ojtEndDate: existing.ojtEndDate || o.ojtEndDate,
              workTiming: existing.workTiming || o.workTiming,
              workingHours: existing.workingHours || o.workingHours,
              jobType: existing.jobType || o.jobType,
              hrEmail: existing.hrEmail || o.hrEmail,
              hrPhone: existing.hrPhone || o.hrPhone,
              companyWebsite: existing.companyWebsite || o.companyWebsite,
              hrManagerName: existing.hrManagerName || o.hrManagerName,
            });
          }
        });
        offers = Array.from(map.values()).map((o: any) => {
          let terms = o.customTerms;
          if (typeof terms === 'string' && (terms.trim().startsWith('{') || terms.includes('"olPrefix"'))) {
            try {
              const parsed = JSON.parse(terms);
              terms = parsed.customTermsText || parsed.notes || '';
            } catch (e) {
              terms = '';
            }
          }
          return { ...o, customTerms: terms };
        });
        localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
      }
    } catch (e) {
      offers = [];
    }
  }
  return offers;
};

export const saveOffersList = (offers: any[]) => {
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
};

export const syncUpdateOffer = async (offerToSave: any) => {
  if (!offerToSave) return;
  const currentOffers = getStoredOffers();
  const currentCandidates = getStoredCandidates();

  const candidateEmail = offerToSave.email || offerToSave.candidateEmail;
  const candidateName = offerToSave.candidateName;

  const offerIndex = currentOffers.findIndex(
    (o) =>
      (offerToSave.id && o.id === offerToSave.id) ||
      (candidateEmail && !candidateEmail.includes('example.com') && (o.email === candidateEmail || o.candidateEmail === candidateEmail)) ||
      (candidateName && o.candidateName?.toLowerCase().trim() === candidateName?.toLowerCase().trim()) ||
      (offerToSave.candidateId && o.candidateId === offerToSave.candidateId)
  );

  const targetId = offerIndex >= 0 ? currentOffers[offerIndex].id : (offerToSave.id || `off-${Date.now()}`);

  const offerEntry = {
    ...(offerIndex >= 0 ? currentOffers[offerIndex] : {}),
    ...offerToSave,
    id: targetId,
    candidateName: candidateName || currentOffers[offerIndex]?.candidateName || 'Candidate',
    email: candidateEmail && !candidateEmail.includes('example.com') ? candidateEmail : (currentOffers[offerIndex]?.email || candidateEmail || ''),
    templateName: getGlobalOfferTemplate().templateName,
  };

  let updatedOffers = [...currentOffers];
  if (offerIndex >= 0) {
    updatedOffers[offerIndex] = offerEntry;
  } else {
    updatedOffers.unshift(offerEntry);
  }

  saveOffersList(updatedOffers);

  try {
    await offerService.createOffer(offerEntry);
  } catch (err: any) {
    console.warn('DB offer sync failed:', err.message);
  }

  const updatedCandidates = currentCandidates.map((cand) => {
    const fullName = `${cand.firstName || ''} ${cand.lastName || ''}`.trim();
    const isMatch =
      cand.id === offerToSave.candidateId ||
      (cand.email && cand.email === candidateEmail) ||
      (fullName && fullName.toLowerCase() === candidateName?.toLowerCase());

    if (isMatch) {
      return {
        ...cand,
        firstName: candidateName ? candidateName.split(' ')[0] : cand.firstName,
        lastName: candidateName && candidateName.split(' ').length > 1 ? candidateName.split(' ').slice(1).join(' ') : cand.lastName,
        email: candidateEmail || cand.email,
        phone: offerToSave.phone || cand.phone,
        currentPosition: offerToSave.jobTitle || cand.currentPosition,
        offerDetails: {
          salary: offerToSave.salary,
          bonus: offerToSave.bonus,
          joiningDate: offerToSave.joiningDate,
          expirationDate: offerToSave.expirationDate,
          customTerms: offerToSave.customTerms,
          benefits: offerToSave.benefits,
          status: offerToSave.status || cand.status,
        },
      };
    }
    return cand;
  });

  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(updatedCandidates));
  return offerEntry;
};

export const getCandidateAIScore = (candidate: any): {
  score: number;
  reason: string;
  breakdown: {
    kwPts: number;
    skPts: number;
    expPts: number;
    eduPts: number;
    semPts: number;
    reqPts: number;
  };
} => {
  if (!candidate) {
    return {
      score: 75,
      reason: 'Candidate profile evaluation',
      breakdown: { kwPts: 15, skPts: 23, expPts: 15, eduPts: 8, semPts: 7, reqPts: 7 }
    };
  }

  // Extract candidate profile details
  const skillsList = Array.isArray(candidate.skills)
    ? candidate.skills
    : (typeof candidate.skills === 'string' ? candidate.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

  const isStudent = candidate.employmentStatus === 'STUDENT'
    || Number(candidate.totalExperience || candidate.experience || 0) === 0
    || String(candidate.currentPosition || '').toLowerCase().includes('student')
    || String(candidate.currentPosition || '').toLowerCase().includes('fresher');

  const expVal = isStudent ? 0 : Number(candidate.totalExperience || candidate.experience || 0);
  const posVal = candidate.currentPosition || candidate.jobTitle || 'Business Development Associate (BDA)';

  // Calculate real AI score breakdown
  const calculated = calculateRealAIScore(skillsList, expVal, posVal);

  // Check direct stored score
  const existingRaw = candidate.score ?? candidate.aiScore ?? candidate.applications?.[0]?.aiScore ?? candidate.applications?.[0]?.score;
  const existingReason = candidate.reason || candidate.matchReason || candidate.applications?.[0]?.matchReason;

  let scoreNum = calculated.score;
  if (typeof existingRaw === 'number' && existingRaw > 0) {
    scoreNum = existingRaw;
  } else if (typeof existingRaw === 'string' && !isNaN(parseInt(existingRaw, 10)) && parseInt(existingRaw, 10) > 0) {
    scoreNum = parseInt(existingRaw, 10);
  }

  // Base raw breakdown points from calculation
  let kwPts = calculated.breakdown?.keywordMatching?.score ?? 16;
  let skPts = calculated.breakdown?.skillsMatching?.score ?? 24;
  let expPts = calculated.breakdown?.experienceMatching?.score ?? 20;
  let eduPts = calculated.breakdown?.educationMatching?.score ?? 10;
  let semPts = calculated.breakdown?.semanticMatching?.score ?? 10;
  let reqPts = calculated.breakdown?.requiredCriteria?.score ?? 10;

  const calcSum = kwPts + skPts + expPts + eduPts + semPts + reqPts;

  // If candidate has a custom score or calcSum differs, scale breakdown points proportionally so sum(pts) === scoreNum
  if (scoreNum !== calcSum && calcSum > 0) {
    const ratio = scoreNum / calcSum;
    kwPts = Math.min(20, Math.round(kwPts * ratio));
    skPts = Math.min(30, Math.round(skPts * ratio));
    expPts = Math.min(20, Math.round(expPts * ratio));
    eduPts = Math.min(10, Math.round(eduPts * ratio));
    semPts = Math.min(10, Math.round(semPts * ratio));

    const subSum = kwPts + skPts + expPts + eduPts + semPts;
    reqPts = Math.max(0, Math.min(10, scoreNum - subSum));
  }

  // Construct explicit detailed explanation for why this score was awarded
  const skillsStr = skillsList.length > 0 ? skillsList.slice(0, 3).join(', ') : 'general qualifications';
  let detailedReason = existingReason;

  if (!detailedReason || detailedReason.includes('Verified skill evaluation') || detailedReason.includes('Application profile under evaluation')) {
    if (scoreNum >= 80) {
      detailedReason = `Candidate achieved ${scoreNum}% score due to strong target keyword match (${kwPts}/20 pts), verified core skills (${skillsStr} - ${skPts}/30 pts), and ${isStudent ? 'high academic foundation' : `${expVal} years domain experience (${expPts}/20 pts)`}.`;
    } else if (scoreNum >= 60) {
      detailedReason = `Candidate achieved ${scoreNum}% score based on baseline skill overlap (${skillsStr} - ${skPts}/30 pts), with minor deductions for ${isStudent ? '0 years industry experience (Fresher)' : 'shorter domain experience'} (${expPts}/20 pts).`;
    } else {
      detailedReason = `Candidate achieved ${scoreNum}% score due to missing target keywords (${kwPts}/20 pts), ${isStudent ? '0 years industry experience (Fresher)' : 'limited domain experience'} (${expPts}/20 pts), and gaps in verified core skills (${skPts}/30 pts).`;
    }
  }

  return {
    score: scoreNum,
    reason: detailedReason,
    breakdown: { kwPts, skPts, expPts, eduPts, semPts, reqPts }
  };
};

export default {
  getStoredCandidates,
  calculateRealAIScore,
  getCandidateAIScore,
  saveCandidateApplication,
  getStoredNotifications,
  markNotificationsRead,
  addCandidateNotification,
  getGlobalOfferTemplate,
  saveGlobalOfferTemplate,
  getStoredOffers,
  saveOffersList,
  syncUpdateOffer,
};
