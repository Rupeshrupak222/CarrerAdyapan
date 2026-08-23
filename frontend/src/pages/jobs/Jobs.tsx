import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { jobService } from '../../services/jobService';
import toast from 'react-hot-toast';
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Sparkles, 
  RefreshCw,
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchJobs(true);
  }, []);

  const fetchJobs = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      const response = await jobService.getAllJobs(forceRefresh);
      if (response && Array.isArray(response.jobs)) {
        setJobs(response.jobs);
      }
    } catch (error) {
      console.warn('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (job: any) => {
    if (!window.confirm(`Are you sure you want to delete "${job.title}"?`)) return;
    const toastId = toast.loading(`Deleting ${job.title}...`);
    try {
      await jobService.deleteJob(job.id, job.slug, job.title);
      setJobs((prev) => prev.filter((j) => j.id !== job.id && j.slug !== job.slug));
      toast.success(`Job "${job.title}" deleted successfully!`, { id: toastId });
    } catch (err: any) {
      toast.error('Failed to delete job', { id: toastId });
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const q = search.toLowerCase();
    return !q || (j.title || '').toLowerCase().includes(q) || (j.department || '').toLowerCase().includes(q) || (j.location || '').toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                Job Requisitions Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Active Job Openings
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Configure job descriptions, salary brackets, and multi-round interview pipelines.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/jobs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs transition-all shadow-md shadow-amber-500/25"
              >
                <Plus className="w-4 h-4" /> Post New Job
              </Link>

              <button
                onClick={() => fetchJobs(true)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, department, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:border-amber-500 outline-none"
            />
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            {filteredJobs.length} Positions Published
          </span>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading job requisitions...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-medium bg-white border border-slate-200 rounded-3xl">
            No job openings found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => {
              const appCount = job.applications?.length || 0;
              const totalRounds = job.totalRounds || (Array.isArray(job.interviewRounds) ? job.interviewRounds.length : 3);
              return (
                <div
                  key={job.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 transition-all shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block mb-1">
                          {job.department || 'EdTech Growth'}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900">
                          {job.title}
                        </h3>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
                        {job.status || 'Active'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location || 'Mumbai / Hybrid'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.type === 'FULL_TIME' ? 'Full Time' : job.type || 'Full Time'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-amber-700 font-semibold">{totalRounds} Interview Rounds Configured</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span><strong>{appCount}</strong> Candidates</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all border border-slate-200"
                      >
                        View & Edit
                      </Link>

                      <button
                        onClick={() => handleDeleteJob(job)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all border border-slate-200"
                        title="Delete Requisition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Jobs;