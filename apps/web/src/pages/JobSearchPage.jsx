import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Search, Filter, Briefcase, MapPin, Calendar, GraduationCap, CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { LoadingScreen, EmptyState } from '../components/UIFeedback';

const JobSearchPage = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    workMode: '',
    location: ''
  });
  const [selectedOpp, setSelectedOpp] = useState(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = {
        location: filters.location,
        mode: filters.workMode,
        type: filters.type
      };
      const res = await axios.get('/api/opportunities/search', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOpportunities(res.data);
    } catch (err) {
      console.error('Failed to fetch opportunities', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (oppId) => {
    try {
      await axios.post('/api/applications/apply', { opportunityId: oppId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Application submitted successfully!');
    } catch (err) {
      alert('Application failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingScreen message="Loading opportunities..." />;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Find Your Opportunity</h1>
            <p className="text-slate-500">Discover internships and jobs that match your skills</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2 border rounded-xl outline-indigo-600"
              placeholder="Search roles, companies or skills..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="p-2 border rounded-xl text-sm outline-indigo-600"
              value={filters.type}
              onChange={e => { setFilters({...filters, type: e.target.value}); fetchOpportunities(); }}
            >
              <option value="">All Types</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="JOB">Full-time</option>
              <option value="APPRENTICESHIP">Apprenticeship</option>
            </select>
            <select
              className="p-2 border rounded-xl text-sm outline-indigo-600"
              value={filters.workMode}
              onChange={e => { setFilters({...filters, workMode: e.target.value}); fetchOpportunities(); }}
            >
              <option value="">All Modes</option>
              <option value="REMOTE">Remote</option>
              <option value="ONSITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {filteredOpportunities.length > 0 ? filteredOpportunities.map(opp => (
              <div key={opp.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:border-indigo-300 transition cursor-pointer" onClick={() => setSelectedOpp(opp)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{opp.title}</h3>
                      <p className="text-sm text-slate-500">{opp.company.name} {opp.company.isVerified && <CheckCircle2 size={14} className="inline text-indigo-600" />}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-600">
                    {opp.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {opp.location}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Briefcase size={14} /> {opp.workMode}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-bold text-slate-800">{opp.salary || opp.stipend || 'Not Specified'}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApply(opp.id); }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            )) : (
              <EmptyState
                title="No Opportunities Found"
                description="Try adjusting your filters or search query to find matching roles."
                icon={Search}
                actionText="Clear Filters"
                onAction={() => { setFilters({type: '', workMode: '', location: ''}); setSearchQuery(''); fetchOpportunities(); }}
              />
            )}
          </div>

          <div className="space-y-6">
            {selectedOpp ? (
              <div className="bg-white p-6 rounded-2xl border shadow-sm sticky top-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Opportunity Details</h2>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-2">About the Role</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedOpp.description}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-2">Academic Requirements</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-slate-50 rounded-lg text-xs">
                        <span className="text-slate-400 block">Min CGPA</span>
                        <span className="font-bold text-slate-700">{selectedOpp.minCgpa || 'N/A'}</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg text-xs">
                        <span className="text-slate-400 block">Degree</span>
                        <span className="font-bold text-slate-700">{selectedOpp.requiredDegree || 'Any'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOpp.skills.map(s => (
                        <span key={s.skill.id} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium border border-indigo-100">
                          {s.skill.name} ({s.minRequiredScore}%)
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleApply(selectedOpp.id)}
                    className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  >
                    Apply Now <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg sticky top-8">
                <h2 className="text-xl font-bold mb-4">Match Analysis</h2>
                <p className="text-indigo-100 text-sm mb-6">
                  Select an opportunity to see how your profile matches the industry requirements.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-indigo-500 rounded-xl text-xs">
                    <CheckCircle2 size={16} />
                    <span>Verified Skills improve match %</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-indigo-500 rounded-xl text-xs">
                    <GraduationCap size={16} />
                    <span>Academic eligibility is checked automatically</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearchPage;
