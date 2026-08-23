import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackButton from '../../components/common/BackButton';
import { useTheme } from '../../context/ThemeContext';
import { interviewService } from '../../services/interviewService';
import { toast } from 'react-hot-toast';

const InterviewDetails = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  const fetchInterviewDetails = async () => {
    setLoading(true);
    try {
      const res = await interviewService.getInterviewById(id);
      if (res?.interview) {
        setInterview(res.interview);
        if (res.interview.rating) setRating(res.interview.rating);
        if (res.interview.feedback) setFeedback(res.interview.feedback);
      } else {
        setInterview(null);
      }
    } catch (error) {
      console.warn('Failed to fetch interview from DB:', error);
      setInterview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interview) return;
    setSubmitting(true);
    try {
      await interviewService.updateInterviewFeedback(interview.id, {
        feedback,
        rating,
        status: 'COMPLETED',
      });
      setInterview((prev: any) => ({ ...prev, feedback, rating, status: 'COMPLETED' }));
      toast.success('Interview feedback and rating saved to database!');
    } catch (err: any) {
      console.error('Error saving feedback:', err);
      toast.error('Failed to save interview feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-slate-500">Loading interview details from database...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!interview) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <BackButton label="Back to Interview Directory" to="/interviews" />
          <div className={`p-12 rounded-3xl border text-center space-y-4 shadow-sm ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-2xl font-bold">
              📅
            </div>
            <h2 className="text-xl font-bold">Interview Not Found</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              The requested interview record does not exist in the database or may have been removed.
            </p>
            <Link
              to="/interviews"
              className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Browse All Interviews
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const candName = interview.candidateName || (interview.application?.candidate ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}` : 'Candidate');
  const candEmail = interview.candidateEmail || interview.application?.candidate?.email || 'N/A';
  const roleName = interview.jobTitle || interview.application?.job?.title || 'Business Development Associate (BDA)';
  const candId = interview.candidateId || interview.application?.candidateId || interview.application?.candidate?.id;
  const questions = interview.generatedQuestions || [
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
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>

          <div className="space-y-1.5 pt-1">
            <BackButton label="Back to Interview Directory" to="/interviews" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Interview with {candName}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              {roleName} • {String(interview.type || 'VIDEO').replace(/_/g, ' ')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {candId && (
              <Link
                to={`/candidates/${candId}`}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition-all shadow-sm"
              >
                View Candidate Profile
              </Link>
            )}
            {interview.meetingLink && (
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all"
              >
                Join Video Meeting
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Interview Info & Generated AI Questions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metadata Card */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <h2 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <span>📋</span> Interview Specifications
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Candidate Email</span>
                  <span className="font-semibold">{candEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Scheduled Time</span>
                  <span className="font-semibold">
                    {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Duration</span>
                  <span className="font-semibold">{interview.duration || 30} Minutes</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Interview Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    interview.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  }`}>
                    {interview.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Meeting Link</span>
                  <a
                    href={interview.meetingLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-amber-600 hover:underline truncate block"
                  >
                    {interview.meetingLink || 'No link provided'}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Interview Type</span>
                  <span className="font-semibold">{String(interview.type || 'VIDEO').replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>

            {/* AI Evaluator Questions */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <h2 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <span>🤖</span> AI-Generated Evaluator Questions
              </h2>

              <div className="space-y-4">
                {questions.map((q: any, idx: number) => (
                  <div key={q.id || idx} className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                        Question {idx + 1} • {q.category}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white">{q.question}</p>
                    {q.expected && (
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                        <strong className="text-slate-700 dark:text-slate-300">Expected Signals: </strong>{q.expected}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Feedback & Rating Form */}
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <h2 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-3">
                Interviewer Scorecard
              </h2>

              <form onSubmit={handleSaveFeedback} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                    Candidate Rating (1-5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-xl transition-all ${
                          rating >= star ? 'text-amber-400 scale-110' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="font-bold ml-2 text-slate-600 dark:text-slate-400">{rating} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                    Detailed Interview Feedback
                  </label>
                  <textarea
                    rows={6}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter observations on candidate pitch quality, communication, domain expertise, and recommendation..."
                    className={`w-full p-3 rounded-xl border text-xs leading-relaxed focus:outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving to Database...' : 'Save Feedback & Mark Completed'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewDetails;
