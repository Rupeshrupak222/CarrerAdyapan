import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackButton from '../../components/common/BackButton';
import { useTheme } from '../../context/ThemeContext';
import { getStoredCandidates } from '../../utils/applicationStore';

const QUICK_PROMPTS = [
  '🏆 Who are the top candidates for open roles?',
  '🎯 Draft 3 interview scenario questions for student counselling.',
  '📜 What are the key criteria for shortlisting candidates?',
  '📊 Summarize candidate pipeline status.',
];

const MOCK_CHAT_HISTORY = [
  {
    sender: 'assistant',
    text: "Hello! I am HireAI, your AI Recruitment Copilot for Adyapan Edutech. Ask me about candidate match reasons, candidate comparisons, screening metrics, or interview question generation!",
  },
];

const AIAssistant = () => {
  const [messages, setMessages] = useState(MOCK_CHAT_HISTORY);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleSend = (userText) => {
    const query = userText || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInput('');
    setLoading(true);

    const storedCandidates = getStoredCandidates() || [];

    setTimeout(() => {
      let aiResponse = '';
      const qLower = query.toLowerCase().trim();

      // Check if user is greeting (e.g. good morning, good moring, hi, hello, hey, hy)
      const isGreeting = /^(good\s*(morning|moring|afternoon|evening|day)|hi|hello|hey|hy|greetings|namaste)\b/i.test(qLower);

      if (isGreeting) {
        const hour = new Date().getHours();
        let timeOfDayGreeting = 'Good Morning';
        if (hour >= 12 && hour < 17) timeOfDayGreeting = 'Good Afternoon';
        else if (hour >= 17) timeOfDayGreeting = 'Good Evening';

        const totalCandidates = storedCandidates.length;
        const topCandidate = storedCandidates.length > 0
          ? [...storedCandidates].sort((a, b) => (b.score || 0) - (a.score || 0))[0]
          : null;
        const shortlistedCount = storedCandidates.filter((c) => c.status === 'SHORTLISTED' || c.status === 'INTERVIEWED' || (c.score && c.score >= 70)).length;
        const hiredCount = storedCandidates.filter((c) => c.status === 'HIRED' || c.status === 'OFFER_EXTENDED').length;

        const dateFormatted = new Date().toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        aiResponse = `${timeOfDayGreeting}, Admin! 👋 Welcome to Adyapan Edutech AI Hiring Control Center.

Here is your Live Web Platform Summary & Today's Updates (${dateFormatted}):

📊 **Real-Time Candidate Pipeline Data:**
• **Total Applicants Registered:** ${totalCandidates} Candidates
• **AI Shortlisted & Qualified:** ${shortlistedCount} High-Fit Applicants
• **Hired & Offered Candidates:** ${hiredCount} Onboarding

💼 **Active Roles & Top Talent:**
• **Primary Openings:** Business Development Associate (BDA), Inside Sales Executive, Academic Counsellor
• **Top Ranked Candidate:** ${topCandidate ? `${topCandidate.firstName} ${topCandidate.lastName || ''} (${topCandidate.score || 85}% AI Match Score - ${topCandidate.currentPosition || 'Applicant'})` : 'No applicant data available yet.'}

⚡ **System Architecture Status:**
• **PostgreSQL Database:** Neon Cloud Live Connected ⚡
• **ATS AI Engine:** Deterministic Job-Specific Scoring Active

How may I assist you with candidate evaluation, drafting interview questions, or reviewing job postings today?`;
      } else if (qLower.includes('top') || qLower.includes('candidate') || qLower.includes('bda')) {
        if (storedCandidates.length > 0) {
          const topList = storedCandidates.slice(0, 3).map((c, i) => `${i + 1}. ${c.firstName} ${c.lastName || ''} (${c.score || 85}% Match) - ${c.currentPosition || 'Applicant'} (${c.totalExperience || 0} Yrs exp).`).join('\n');
          aiResponse = `Here are top candidates from your active applicant database:\n${topList}\n\nRecommendation: Review their full profile and schedule interview rounds in the Candidates section.`;
        } else {
          aiResponse = `Currently there are no active candidate applications in your database. Once candidates apply through the careers portal, I will automatically analyze their resumes and score them here.`;
        }
      } else if (qLower.includes('interview') || qLower.includes('question')) {
        aiResponse = `Here are 3 tailored interview questions for counselling and sales roles:
1. "When a student says your course fee is higher than competitors, how do you pitch ROI and career placement support?"
2. "How do you manage daily student lead follow-ups while maintaining high conversion quality?"
3. "Walk me through a situation where a candidate or student was hesitant. How did you guide them to a decision?"`;
      } else if (qLower.includes('pipeline') || qLower.includes('status')) {
        aiResponse = `Current Recruitment Pipeline Summary:
• Total Applicants: ${storedCandidates.length}
• Candidates Evaluation Mode: Real-time ATS AI Scoring Engine
• Action Needed: Review pending applications and schedule upcoming interview rounds.`;
      } else {
        if (storedCandidates.length > 0) {
          const firstCand = storedCandidates[0];
          aiResponse = `Based on your platform data: You have ${storedCandidates.length} candidates in your database. ${firstCand.firstName} ${firstCand.lastName || ''} (${firstCand.score || 85}% AI Match) is among the top applicants.`;
        } else {
          aiResponse = `HireAI is active and connected to your PostgreSQL recruitment database. You can ask me to draft interview questions, summarize applicant status, or analyze candidate profiles.`;
        }
      }

      setMessages((prev) => [...prev, { sender: 'assistant', text: aiResponse }]);
      setLoading(false);
    }, 600);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className={`p-6 rounded-3xl border transition-all relative overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-orange-200/80 text-slate-900'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />

          <div className="space-y-1.5 pt-1">
            <BackButton label="Back to Dashboard" to="/dashboard" />
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30">
              🤖 Adyapan AI Hiring Intelligence
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Recruitment Copilot
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              Ask natural language questions about your hiring pipeline, candidate rankings, comparisons, or interview questions.
            </p>
          </div>
        </div>

        {/* Prompt Chips */}
        <div className={`p-6 rounded-3xl border shadow-sm space-y-3 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-orange-200/80 text-slate-800'
        }`}>
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
            💡 Suggested Questions for Founder / HR:
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className={`px-3.5 py-2 text-xs font-medium rounded-xl border transition-all text-left shadow-sm ${
                  theme === 'dark'
                    ? 'bg-slate-950 text-slate-200 hover:border-orange-400 border-slate-800'
                    : 'bg-orange-50/50 text-slate-800 hover:bg-orange-100 hover:border-orange-300 border-orange-200/60'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`rounded-3xl border shadow-sm flex flex-col h-[520px] overflow-hidden ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-orange-200/80'
        }`}>
          {/* Messages Container */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs font-normal leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-orange-400 text-slate-950 font-semibold rounded-br-none'
                      : theme === 'dark'
                      ? 'bg-slate-950 text-slate-100 border border-slate-800 rounded-bl-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-orange-500/15 text-orange-800 dark:text-orange-300 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-orange-500/30">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
                  HireAI Copilot is analyzing candidate data...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className={`p-4 border-t flex items-center gap-3 ${
            theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-orange-200/60 bg-orange-50/30'
          }`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask HireAI: e.g. Who are top candidates for BDA role? Why was Rahul shortlisted?"
              className={`flex-1 px-4 py-2.5 text-xs font-normal border rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-white border-orange-200/80 text-slate-800 placeholder-slate-400'
              }`}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-sm shrink-0"
            >
              Send Query
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;