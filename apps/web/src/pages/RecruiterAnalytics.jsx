import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecruiterAnalytics } from '../api/analyticsApi';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  ArrowLeft, 
  TrendingUp, 
  Filter, 
  ExternalLink,
  Target,
  Award
} from 'lucide-react';

const RecruiterAnalytics = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getRecruiterAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load recruiter analytics', err);
        setError('Failed to fetch recruitment analytics. Please ensure your company profile is setup.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading Recruitment Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl border max-w-md w-full text-center space-y-4 shadow-sm">
          <p className="text-red-600 font-medium">{error || 'Unable to load analytics'}</p>
          <button 
            onClick={() => navigate('/company/dashboard')} 
            className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Go to Company Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { metrics, funnel, postingsOverview, topRequiredSkills, company } = data;

  const getStatusColor = (status) => {
    switch (status) {
      case 'SELECTED': return 'bg-emerald-500';
      case 'INTERVIEW': return 'bg-purple-500';
      case 'SHORTLISTED': return 'bg-indigo-500';
      case 'UNDER_REVIEW': return 'bg-amber-500';
      case 'REJECTED': return 'bg-rose-400';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/company/dashboard')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold text-xs mb-2 transition"
            >
              <ArrowLeft size={16} />
              Back to Company Portal
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <BarChart3 className="text-indigo-600" />
              Recruitment Analytics
            </h1>
            <p className="text-slate-500 text-sm">
              Talent pipeline, hiring funnel, and candidate skill compatibility for <span className="font-semibold text-slate-700">{company.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/ats')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
            >
              <Users size={16} />
              Open ATS Pipeline
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Postings</p>
              <h3 className="text-2xl font-black text-slate-900">{metrics.totalPostings}</h3>
              <p className="text-xs text-slate-500">{metrics.internshipCount} Internships • {metrics.jobCount} Jobs</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applicants</p>
              <h3 className="text-2xl font-black text-slate-900">{metrics.totalApplicants}</h3>
              <p className="text-xs text-slate-500">Across all active roles</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shortlisted</p>
              <h3 className="text-2xl font-black text-slate-900">{metrics.shortlistedCount}</h3>
              <p className="text-xs text-slate-500">{metrics.selectedCount} Final Hires</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
              <Target size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Match Quality</p>
              <h3 className="text-2xl font-black text-slate-900">{metrics.avgApplicantMatch}%</h3>
              <p className="text-xs text-slate-500">Candidate compatibility</p>
            </div>
          </div>
        </div>

        {/* Funnel Section & Skill Demand */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Funnel Breakdown */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Recruitment Funnel Progress
            </h2>

            <div className="space-y-4">
              {funnel.map((item) => {
                const percentage = metrics.totalApplicants > 0 
                  ? Math.round((item.count / metrics.totalApplicants) * 100) 
                  : 0;

                return (
                  <div key={item.status} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-700 capitalize">
                        {item.status.replace('_', ' ').toLowerCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">{percentage}%</span>
                        <span className="font-bold text-slate-900">{item.count}</span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStatusColor(item.status)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top In-Demand Skills */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award size={20} className="text-indigo-600" />
              Company Skill Requirements
            </h2>
            <p className="text-xs text-slate-500">Skills most frequently required across your postings.</p>

            <div className="space-y-3">
              {topRequiredSkills.length > 0 ? (
                topRequiredSkills.map((sk, idx) => (
                  <div key={sk.name} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-xs text-slate-800">{sk.name}</span>
                    </div>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded border text-indigo-600">
                      {sk.count} {sk.count === 1 ? 'role' : 'roles'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No skills listed in postings yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Opportunity Performance Breakdown */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Postings Performance & Candidate Quality</h2>
            <span className="text-xs text-slate-500">{postingsOverview.length} Postings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="p-3">Role Title</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Applicants</th>
                  <th className="p-3">Shortlisted</th>
                  <th className="p-3">Avg Compatibility</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {postingsOverview.length > 0 ? (
                  postingsOverview.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-800">{opp.title}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          opp.type === 'INTERNSHIP' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {opp.type}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-700">{opp.applicantCount}</td>
                      <td className="p-3 font-bold text-indigo-600">{opp.shortlistedCount}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{opp.avgMatchScore}%</span>
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${opp.avgMatchScore}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => navigate('/ats')}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                        >
                          Review <ExternalLink size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-400 text-xs">
                      No active postings found. Post an opportunity to start seeing analytics!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterAnalytics;
