import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackButton from '../../components/common/BackButton';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';

const InterviewDetails = () => {
  const { id } = useParams();
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { theme } = useTheme();

  const interview = {
    id: id || 'int-101',
    candidateName: 'Rahul Sharma',
    candidateRole: 'Senior Business Development Associate',
    jobTitle: 'Business Development Associate (BDA)',
    scheduledAt: '2026-08-14T14:00:00Z',
    type: 'TECHNICAL_SALES_PITCH',
    duration: 45,
    interviewer: 'Adyapan Hiring Lead',
    status: 'SCHEDULED',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    questions: [
      {
        id: 'q1',
        category: 'Course Fee Objection Handling',
        question: 'When a parent says your course fee is higher than competitors, how do you pitch ROI and career placement support?',
        expected: 'Candidate should emphasize job-ready skills, placement assistance, faculty support, and student success track record.',
      },
      {
        id: 'q2',
        category: 'Telesales Call Volume & CRM',
        question: 'How do you manage 60+ follow-up calls daily in CRM while ensuring high conversion quality?',
        expected: 'Prioritizing hot leads, structured call scripts, diligent note-taking, and scheduled call backs.',
      },
      {
        id: 'q3',
        category: 'Sales Pitch & Closing',
        question: 'Walk me through a situation where a student was hesitant to enroll. How did you guide them to a decision?',
        expected: 'Active listening, resolving core doubts, offering trial classes or parent consultation.',
      },
    ],
  };

  const handleSaveFeedback = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Interview feedback and rating saved successfully! 🎯');
    }, 600);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

          <div className="space-y-1.5 pt-1">
            <BackButton label="Back to Interview Directory" to="/interviews" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Interview with {interview.candidateName}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              {interview.jobTitle} • {interview.type.replace(/_/g, ' ')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all"
            >
              <span>🎥</span> Join Video Meeting
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Interview Info & Generated AI Questions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metadata Card */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
            }`}>
              <h2 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <span className="text-amber-500">📌</span> Interview Details & Schedule
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-normal">
                <div>
                  <span className="text-slate-400 block">Date & Time</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {new Date(interview.scheduledAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Duration</span>
                  <span className="font-bold text-slate-900 dark:text-white">{interview.duration} Minutes</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Interviewer</span>
                  <span className="font-bold text-slate-900 dark:text-white">{interview.interviewer}</span>
                </div>
              </div>
            </div>

            {/* AI Generated Questions Bank */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <h2 className="text-sm font-bold">AI Generated Interview Questions</h2>
                </div>
                <span className="px-3 py-1 text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-full border border-amber-500/30">
                  Tailored for {interview.candidateRole}
                </span>
              </div>

              <div className="space-y-3">
                {interview.questions.map((q, idx) => (
                  <div key={q.id} className={`p-4 rounded-2xl border space-y-2 text-xs font-normal ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                        Q{idx + 1}. {q.category}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">{q.question}</p>
                    <p className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      <strong className="text-amber-600 dark:text-amber-400 font-bold">Expected Evaluation Criteria:</strong> {q.expected}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Rating & Feedback Form */}
          <div className="space-y-6">
            <form onSubmit={handleSaveFeedback} className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
            }`}>
              <h2 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-3">
                Submit Candidate Feedback
              </h2>

              <div>
                <label className="text-xs font-semibold block mb-2">Overall Rating (1-5)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform hover:scale-125 ${
                        star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Interviewer Feedback & Notes</label>
                <textarea
                  rows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write clear, constructive feedback on candidate's sales pitch, communication, and target orientation..."
                  className={`w-full p-3 text-xs border rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-normal ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-amber-200/80 text-slate-800'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm"
              >
                {submitting ? 'Saving Feedback...' : 'Submit Evaluation'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewDetails;
