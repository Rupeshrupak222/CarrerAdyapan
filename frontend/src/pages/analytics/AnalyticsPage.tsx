import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { analyticsService } from '../../services/analyticsService';
import { 
  TrendingUp, 
  Users, 
  Sparkles, 
  Calendar, 
  Award, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalApplications: 0,
    aiScreened: 0,
    shortlisted: 0,
    round1Selected: 0,
    round2Selected: 0,
    finalSelected: 0,
    offersAccepted: 0,
    averageScore: 88,
  });

  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [velocityData, setVelocityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [statsRes, funnelRes, velocityRes] = await Promise.all([
        analyticsService.getDashboardStats(true).catch(() => null),
        analyticsService.getHiringFunnel(true).catch(() => null),
        analyticsService.getMonthlyVelocity(true).catch(() => null),
      ]);

      if (statsRes) setStats(statsRes);
      if (funnelRes?.data) setFunnelData(funnelRes.data);
      if (velocityRes?.velocity) setVelocityData(velocityRes.velocity);
    } catch (err: any) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const shortlistRate = stats.totalApplications ? Math.round(((stats.shortlisted || stats.aiScreened) / stats.totalApplications) * 100) : 0;
  const offerAcceptanceRate = stats.offersSent ? Math.round((stats.offersAccepted / stats.offersSent) * 100) : 100;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                Hiring Velocity & Analytics
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Recruitment Intelligence & Conversion Metrics
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Real-time recruitment telemetry, round drop-off analysis, and talent pipeline velocity.
              </p>
            </div>

            <button
              onClick={fetchAnalyticsData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Telemetry
            </button>
          </div>
        </div>

        {/* 4 Hero KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Applications</span>
            <p className="text-3xl font-black text-slate-900">{stats.totalApplications || 0}</p>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Direct Inbound Candidates
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Shortlisting Rate</span>
            <p className="text-3xl font-black text-blue-600">{shortlistRate}%</p>
            <span className="text-xs text-slate-400 font-medium">24-Hr ATS Qualification</span>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Avg. ATS Match Score</span>
            <p className="text-3xl font-black text-amber-600">{stats.averageScore || 88}%</p>
            <span className="text-xs text-slate-400 font-medium">Resume Competency Index</span>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Offers Accepted (Hired)</span>
            <p className="text-3xl font-black text-emerald-600">{stats.offersAccepted || 0}</p>
            <span className="text-xs text-emerald-600 font-medium">{offerAcceptanceRate}% Acceptance Rate</span>
          </div>
        </div>

        {/* Funnel Graph */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" /> Multi-Round Conversion Funnel
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Candidate progression across Application, AI Screening, Round 1, Round 2, Final Selection, and Offer Acceptance.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="stage" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {funnelData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        index === 0 ? '#f59e0b' :
                        index === 1 ? '#3b82f6' :
                        index === 2 ? '#8b5cf6' :
                        index === 3 ? '#a855f7' :
                        index === 4 ? '#ec4899' :
                        index === 5 ? '#10b981' :
                        index === 6 ? '#059669' : '#047857'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Velocity Chart */}
        {velocityData.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" /> Monthly Application Inflow Velocity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Volume of candidate applications submitted per month through Career Portal.
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      color: '#0f172a',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="applications" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
