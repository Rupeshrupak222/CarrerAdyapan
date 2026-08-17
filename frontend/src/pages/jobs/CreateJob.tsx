import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackButton from '../../components/common/BackButton';
import { jobService } from '../../services/jobService';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const EDTECH_TEMPLATES = [
  {
    name: 'Business Development Associate (BDA)',
    role: 'BDA',
    title: 'Business Development Associate (EdTech Sales)',
    department: 'Sales & Growth',
    location: 'Mumbai / Hybrid',
    type: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: 350000,
    salaryMax: 600000,
    description: 'We are seeking an energetic Business Development Associate to drive student course enrolments, manage sales pipelines, conduct counselling calls, and achieve monthly revenue targets.',
    requirements: '1-3 years sales or telesales experience in EdTech or education; excellent English & Hindi communication; strong target achievement mindset; negotiation skills.',
    responsibilities: 'Connect with prospective student leads; conduct detailed course counselling sessions; meet monthly enrolment targets; maintain CRM lead status.',
  },
  {
    name: 'Academic Counsellor',
    role: 'Counsellor',
    title: 'Academic Counsellor / Student Advisor',
    department: 'Student Admissions',
    location: 'Delhi NCR / Remote',
    type: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryMin: 300000,
    salaryMax: 500000,
    description: 'Provide personalized academic guidance to prospective students and parents, understand their career goals, recommend suitable learning programs, and assist with enrolment.',
    requirements: '2+ years experience in academic counselling, student advisement, or education sales; empathetic active listening; objection handling skills; CRM knowledge.',
    responsibilities: 'Guide students on career choices and course curricula; follow up on inbound leads; resolve parent queries; achieve monthly student admissions goals.',
  },
  {
    name: 'Telecaller / Inside Sales',
    role: 'Telecaller',
    title: 'Inside Sales Executive / Telecaller',
    department: 'Inside Sales',
    location: 'Bangalore / On-site',
    type: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: 250000,
    salaryMax: 400000,
    description: 'Responsible for high-volume outbound calling to verified student leads, introducing course programs, scheduling counselling webinars, and closing course admissions.',
    requirements: '0-2 years outbound telecalling or customer service experience; fluent verbal communication; ability to handle high daily call volume (80+ calls/day).',
    responsibilities: 'Make 80-100 calls daily to inbound leads; pitch course offerings; book product demos for Senior Counsellors; maintain daily call logs.',
  },
  {
    name: ' Full Stack Software Engineer',
    role: 'Tech',
    title: 'Senior Full Stack Developer (React & Node.js)',
    department: 'Engineering',
    location: 'Remote',
    type: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salaryMin: 1200000,
    salaryMax: 1800000,
    description: 'Build and scale our next-gen AI-powered learning management and recruitment platform using React, Node.js, Express, and PostgreSQL.',
    requirements: '3+ years experience with React.js, Node.js, REST APIs, and SQL; experience integrating LLM APIs or AI algorithms; strong problem solving skills.',
    responsibilities: 'Develop reusable React UI components; build secure Node.js microservices; integrate AI resume screening APIs; write unit tests.',
  },
];

const CreateJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    requirements: '',
    responsibilities: '',
    type: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryMin: '',
    salaryMax: '',
    location: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const applyTemplate = (tpl) => {
    setFormData({
      title: tpl.title,
      department: tpl.department,
      location: tpl.location,
      type: tpl.type,
      experienceLevel: tpl.experienceLevel,
      salaryMin: tpl.salaryMin,
      salaryMax: tpl.salaryMax,
      description: tpl.description,
      requirements: tpl.requirements,
      responsibilities: tpl.responsibilities,
    });
    toast.success(`Loaded "${tpl.title}" template! `);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title || !formData.department || !formData.description || !formData.requirements || !formData.location) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      const response = await jobService.createJob(formData);

      if (response.success) {
        toast.success('Job created successfully! ');
        navigate('/jobs');
      } else {
        toast.error(response.message || 'Failed to create job');
      }
    } catch (error) {
      console.error('Create Job Error:', error);
      toast.error(error.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = theme === 'dark'
    ? 'w-full px-4 py-2.5 rounded-xl text-xs font-normal bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400'
    : 'w-full px-4 py-2.5 rounded-xl text-xs font-normal bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';

  const labelClass = theme === 'dark'
    ? 'text-xs font-semibold text-slate-200 block mb-1'
    : 'text-xs font-semibold text-slate-800 block mb-1';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <BackButton label="Back to Job Directory" to="/jobs" />
          
          <div className={`p-6 rounded-3xl border transition-all space-y-1 relative overflow-hidden shadow-sm ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Adyapan Job Creation Studio
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create & Publish Job Opening
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              Post a new role opening for Adyapan Edutech or use 1-Click Quick Templates below.
            </p>
          </div>
        </div>

        {/* 1-Click Quick Templates Bar */}
        <div className={`p-5 rounded-3xl shadow-sm border space-y-3 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">1-Click EdTech Role Templates</span>
            <span className="text-[11px] text-slate-500 font-medium">Click to auto-fill form</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EDTECH_TEMPLATES.map((tpl) => (
              <button
                key={tpl.title}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all text-left shadow-sm ${
                  theme === 'dark'
                    ? 'bg-slate-950 text-amber-300 border-slate-800 hover:border-amber-400'
                    : 'bg-white text-amber-900 border-amber-200 hover:bg-orange-100'
                }`}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`rounded-3xl border p-6 md:p-8 space-y-5 shadow-sm ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
        }`}>
          <div>
            <label className={labelClass}>Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., Business Development Associate (BDA)"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department *</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., Sales & Growth"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., Mumbai, Remote"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Job Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Experience Level</label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="ENTRY">Entry Level (0-2 Yrs)</option>
                <option value="MID">Mid Level (2-4 Yrs)</option>
                <option value="SENIOR">Senior Level (4+ Yrs)</option>
                <option value="LEAD">Team Lead</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Min Annual Salary (₹)</label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., 350000"
              />
            </div>
            <div>
              <label className={labelClass}>Max Annual Salary (₹)</label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., 600000"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Job Overview & Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={inputClass}
              placeholder="Describe the company mission and high-level role summary..."
              required
            />
          </div>

          <div>
            <label className={labelClass}>Key Responsibilities & Daily Tasks *</label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows={3}
              className={inputClass}
              placeholder="List core daily responsibilities (e.g. Conduct student counselling sessions; Meet monthly enrolment targets; Maintain CRM leads)..."
              required
            />
          </div>

          <div>
            <label className={labelClass}>Key Requirements & Scoring Criteria *</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={3}
              className={inputClass}
              placeholder="List specific skill requirements (e.g. Sales targets, Student counselling, Telesales)..."
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-md shadow-amber-400/20 text-center"
            >
              {loading ? 'Publishing Job Opening...' : 'Publish Job & Generate Public Shareable Link →'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateJob;