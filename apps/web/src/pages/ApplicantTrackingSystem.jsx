import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Briefcase, Clock, CheckCircle2, XCircle, FileText, User, Building2, TrendingUp, Info } from 'lucide-react';
import axios from 'axios';
import { LoadingScreen, EmptyState } from '../components/UIFeedback';

const ApplicantTrackingSystem = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchDetails, setMatchDetails] = useState({});
  const [loadingMatch, setLoadingMatch] = useState({});

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/applications/company', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOpportunities(res.data);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatch = async (studentId, opportunityId) => {
    const matchKey = `${studentId}-${opportunityId}`;
    if (matchDetails[matchKey]) return;

    setLoadingMatch(prev => ({ ...prev, [matchKey]: true }));
    try {
      const res = await axios.get(`/api/matching/match/${studentId}/${opportunityId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMatchDetails(prev => ({ ...prev, [matchKey]: res.data }));
    } catch (err) {
      console.error('Failed to fetch match score', err);
    } finally {
      setLoadingMatch(prev => ({ ...prev, [matchKey]: false }));
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    try {
      await axios.patch(`/api/applications/${applicationId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchApplications();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SELECTED': return 'bg-green-100 text-green-600';
      case 'REJECTED': return 'bg-red-100 text-red-600';
      case 'SHORTLISTED': return 'bg-blue-100 text-blue-600';
      case 'INTERVIEW': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) return <LoadingScreen message="Loading Applicants..." />;
  if (error) return <EmptyState title="Error" description={error} icon={XCircle} />;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Applicant Tracking System</h1>
            <p className="text-slate-500">Manage and evaluate candidates for your opportunities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {opportunities.length > 0 ? opportunities.map(opp => (
            <div key={opp.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Briefcase className="text-indigo-600" size={24} />
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{opp.title}</h2>
                    <p className="text-sm text-slate-500">{opp.type} • {opp.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700">{opp.applications.length} Applicants</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Candidate</th>
                      <th className="px-6 py-4">Academic Info</th>
                      <th className="px-6 py-4">Match Score</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {opp.applications.map(app => {
                      const matchKey = `${app.student.id}-${opp.id}`;
                      const match = matchDetails[matchKey];

                      return (
                        <tr key={app.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                                {app.student.user.firstName[0]}{app.student.user.lastName[0]}
                              </div>
                              <div className="cursor-pointer" onClick={() => fetchMatch(app.student.id, opp.id)}>
                                <p className="text-sm font-bold text-slate-800">{app.student.user.firstName} {app.student.user.lastName}</p>
                                <p className="text-xs text-slate-500">{app.student.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-slate-600">
                              <p>{app.student.degree} ({app.student.branch})</p>
                              <p>CGPA: {app.student.cgpa || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {loadingMatch[matchKey] ? (
                              <div className="text-xs text-slate-400 animate-pulse">Calculating...</div>
                            ) : match ? (
                              <div className="flex flex-col">
                                <span className={`text-sm font-bold ${match.overallMatch > 70 ? 'text-green-600' : match.overallMatch > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {match.overallMatch}%
                                </span>
                                <span className="text-[10px] text-slate-400">Overall Match</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => fetchMatch(app.student.id, opp.id)}
                                className="text-xs text-indigo-600 font-medium hover:underline"
                              >
                                Calculate Match
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <select
                              className="text-xs p-1 border rounded outline-indigo-600"
                              value={app.status}
                              onChange={(e) => updateStatus(app.id, e.target.value)}
                            >
                              <option value="APPLIED">Applied</option>
                              <option value="UNDER_REVIEW">Review</option>
                              <option value="SHORTLISTED">Shortlist</option>
                              <option value="INTERVIEW">Interview</option>
                              <option value="SELECTED">Select</option>
                              <option value="REJECTED">Reject</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )) : (
            <EmptyState
              title="No Applications Yet"
              description="Once students apply to your opportunities, they will appear here."
              icon={FileText}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantTrackingSystem;
