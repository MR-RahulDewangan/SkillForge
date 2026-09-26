import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Briefcase, Clock, CheckCircle2, XCircle, AlertCircle, Calendar, MapPin, Building2 } from 'lucide-react';
import axios from 'axios';

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/applications/student', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setApplications(res.data);
    } catch (err) {
      setError('Failed to load your applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'SELECTED': return 'bg-green-100 text-green-600 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-600 border-red-200';
      case 'SHORTLISTED': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'INTERVIEW': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'UNDER_REVIEW': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Applications...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
            <p className="text-slate-500">Track the status of your job and internship applications</p>
          </div>
        </div>

        {applications.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-300 transition">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Briefcase size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800">{app.opportunity.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Building2 size={14} /> {app.opportunity.company.name}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {app.opportunity.location}</span>
                      <span className="flex items-center gap-1"><Calendar size={14} /> Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusStyles(app.status)}`}>
                    {app.status.replace('_', ' ')}
                  </div>
                  {app.status === 'SELECTED' && <CheckCircle2 className="text-green-500" size={20} />}
                  {app.status === 'REJECTED' && <XCircle className="text-red-500" size={20} />}
                  {app.status === 'UNDER_REVIEW' && <Clock className="text-indigo-500" size={20} />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Applications Yet</h3>
            <p className="text-slate-500 mb-6">You haven't applied to any opportunities yet.</p>
            <button
              onClick={() => window.location.href = '/opportunities'}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              Browse Opportunities
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
