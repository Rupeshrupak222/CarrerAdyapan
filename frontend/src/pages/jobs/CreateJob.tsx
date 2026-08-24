import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { jobService } from '../../services/jobService';
import toast from 'react-hot-toast';
import { 
  Briefcase, 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  DollarSign 
} from 'lucide-react';

const EDTECH_TEMPLATES = [
  {
    name: 'Business Development Associate (BDA)',
    title: 'Business Development Associate (EdTech Sales)',
    department: 'Sales & Growth',
    location: 'Mumbai / Hybrid',
    type: 'FULL_TIME',
    experienceLevel: '1-3 Years',
    salaryMin: 350000,
    salaryMax: 600000,
    description: 'Drive student course enrolments, conduct counselling calls, and achieve monthly revenue targets.',
    requirements: '1-3 years sales experience; fluent communication; target orientation.',
    responsibilities: 'Connect with prospective students; counsel on career choices; achieve monthly admissions quota.',
    rounds: [
      { roundNumber: 1, name: 'Round 1: Screening & Domain', type: 'VIDEO' },
      { roundNumber: 2, name: 'Round 2: Technical & Sales Pitch', type: 'VIDEO' },
    ],
  },
  {
    name: 'Academic Counsellor / Student Advisor',
    title: 'Academic Counsellor / Student Advisor',
    department: 'Student Admissions',
    location: 'Delhi NCR / Remote',
    type: 'FULL_TIME',
    experienceLevel: '2+ Years',
    salaryMin: 300000,
    salaryMax: 500000,
    description: 'Provide personalized academic guidance to prospective students and parents.',
    requirements: '2+ years academic counselling experience; empathetic communication.',
    responsibilities: 'Guide students on career choices; follow up on inbound leads; meet enrolment goals.',
    rounds: [
      { roundNumber: 1, name: 'Round 1: Screening & Domain', type: 'VIDEO' },
      { roundNumber: 2, name: 'Round 2: Counselling Roleplay Round', type: 'VIDEO' },
    ],
  },
];

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: 'Business Development Associate (EdTech Sales)',
    department: 'Sales & Growth',
    location: 'Mumbai / Hybrid',
    type: 'FULL_TIME',
    experienceLevel: '1-3 Years',
    salaryMin: '350000',
    salaryMax: '600000',
    description: 'We are seeking an energetic Business Development Associate to drive student course enrolments, conduct counselling calls, and achieve monthly revenue targets for Adyapan Edutech.',
    requirements: '1-3 years sales or telesales experience in EdTech; excellent English & Hindi communication; strong target achievement mindset.',
    responsibilities: 'Connect with prospective student leads; conduct detailed course counselling sessions; meet monthly enrolment targets.',
    interviewRounds: [
      { roundNumber: 1, name: 'Round 1: Screening & Domain', type: 'VIDEO' },
      { roundNumber: 2, name: 'Round 2: Technical & Sales Pitch', type: 'VIDEO' },
    ],
  });

  const handleApplyTemplate = (tpl: typeof EDTECH_TEMPLATES[0]) => {
    setFormData({
      title: tpl.title,
      department: tpl.department,
      location: tpl.location,
      type: tpl.type,
      experienceLevel: tpl.experienceLevel,
      salaryMin: String(tpl.salaryMin),
      salaryMax: String(tpl.salaryMax),
      description: tpl.description,
      requirements: tpl.requirements,
      responsibilities: tpl.responsibilities,
      interviewRounds: tpl.rounds,
    });
    toast.success(`Template applied: ${tpl.name}`);
  };

  const handleAddRound = () => {
    const nextNum = formData.interviewRounds.length + 1;
    setFormData({
      ...formData,
      interviewRounds: [
        ...formData.interviewRounds,
        { roundNumber: nextNum, name: `Round ${nextNum}: Evaluation Round`, type: 'VIDEO' },
      ],
    });
  };

  const handleRemoveRound = (index: number) => {
    if (formData.interviewRounds.length <= 1) {
      toast.error('At least 1 interview round is required.');
      return;
    }
    const updated = formData.interviewRounds.filter((_, i) => i !== index).map((r, i) => ({
      ...r,
      roundNumber: i + 1,
    }));
    setFormData({ ...formData, interviewRounds: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.department || !formData.location) {
      toast.error('Please fill in required fields');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Publishing job requisition with interview rounds...');

    try {
      await jobService.createJob({
        ...formData,
        totalRounds: formData.interviewRounds.length,
        status: 'PUBLISHED',
      });

      toast.success('Job requisition published successfully!', { id: toastId });
      navigate('/jobs');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create job', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Requisitions
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Briefcase className="w-3.5 h-3.5 text-amber-600" />
              New Requisition Builder
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Create Job Opening
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Configure job parameters, salary bands, and multi-round interview pipeline.
            </p>
          </div>

          {/* 1-Click Role Templates */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Fast Role Templates
            </span>
            <div className="flex flex-wrap gap-2">
              {EDTECH_TEMPLATES.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 shadow-sm transition-all"
                >
                  + {tpl.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Core Job Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-600 font-semibold uppercase">Job Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold uppercase">Department</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold uppercase">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold uppercase">Employment Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-amber-500 text-sm"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="PART_TIME">Part Time</option>
                </select>
              </div>
            </div>

            {/* Description & Requirements */}
            <div className="space-y-4">
              <div>
                <label className="text-slate-600 font-semibold uppercase">Job Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-amber-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold uppercase">Key Requirements & Skills</label>
                <textarea
                  rows={2}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-amber-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Multi-Round Interview Pipeline Builder */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" /> Multi-Round Interview Pipeline Configuration
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Define the rounds required for candidates applying to this role.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddRound}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold border border-amber-300 transition-all text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Round
                </button>
              </div>

              <div className="space-y-3">
                {formData.interviewRounds.map((round, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={round.name}
                      onChange={(e) => {
                        const updated = [...formData.interviewRounds];
                        updated[idx].name = e.target.value;
                        setFormData({ ...formData, interviewRounds: updated });
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-amber-500"
                    />
                    <select
                      value={round.type}
                      onChange={(e) => {
                        const updated = [...formData.interviewRounds];
                        updated[idx].type = e.target.value;
                        setFormData({ ...formData, interviewRounds: updated });
                      }}
                      className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold outline-none"
                    >
                      <option value="PHONE">Phone</option>
                      <option value="VIDEO">Google Meet Video</option>
                      <option value="ON_SITE">In-Office</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveRound(idx)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Remove Round"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Publish Job Requisition'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateJob;