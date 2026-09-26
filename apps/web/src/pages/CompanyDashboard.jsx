import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Building2, Globe, MapPin, FileText, CheckCircle, Edit3, PlusCircle, Briefcase, MapPin as PinIcon } from 'lucide-react';
import axios from 'axios';
import PostOpportunityModal from '../components/PostOpportunityModal';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

      const [profileRes, oppRes] = await Promise.all([
        axios.get('/api/company/profile', authHeader),
        axios.get('/api/opportunities/search', authHeader)
      ]);

      setProfile(profileRes.data);
      setEditForm(profileRes.data);
      setOpportunities(oppRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/api/company/profile', editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Company Dashboard</h1>
            <p className="text-slate-500">Manage your organization and industry presence</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold ${
            profile.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {profile.isVerified && <CheckCircle size={14} />}
            {profile.isVerified ? 'Verified Partner' : 'Pending Verification'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Company Profile</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition text-indigo-600"
                >
                  <Edit3 size={18} />
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Company Name</label>
                    <input
                      className="w-full p-2 border rounded-lg text-sm"
                      value={editForm.name || ''}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Industry</label>
                    <input
                      className="w-full p-2 border rounded-lg text-sm"
                      value={editForm.industry || ''}
                      onChange={e => setEditForm({...editForm, industry: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Website</label>
                    <input
                      className="w-full p-2 border rounded-lg text-sm"
                      value={editForm.website || ''}
                      onChange={e => setEditForm({...editForm, website: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Location</label>
                    <input
                      className="w-full p-2 border rounded-lg text-sm"
                      value={editForm.location || ''}
                      onChange={e => setEditForm({...editForm, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Description</label>
                    <textarea
                      className="w-full p-2 border rounded-lg text-sm h-24"
                      value={editForm.description || ''}
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white p-2 rounded-lg text-sm font-bold">Save</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 text-slate-600 p-2 rounded-lg text-sm font-bold">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="text-indigo-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{profile.name}</p>
                      <p className="text-xs text-slate-500">{profile.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="text-indigo-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{profile.website || 'No website'}</p>
                      <p className="text-xs text-slate-500">Company Website</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="text-indigo-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{profile.location || 'Not specified'}</p>
                      <p className="text-xs text-slate-500">Headquarters</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="text-indigo-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-slate-600">{profile.description || 'No description provided.'}</p>
                      <p className="text-xs text-slate-500">About Us</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Your Opportunities</h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition"
                >
                  <PlusCircle size={18} />
                  Post New Opportunity
                </button>
              </div>

              {opportunities.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {opportunities.map(opp => (
                    <div key={opp.id} className="p-4 border rounded-xl hover:bg-slate-50 transition flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{opp.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><PinIcon size={12} /> {opp.location}</span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded">{opp.workMode}</span>
                            <span className="text-indigo-600 font-medium">{opp.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-700">{opp.salary || opp.stipend || 'Unpaid'}</span>
                        <button className="p-2 opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-indigo-600">
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p>You haven't posted any opportunities yet.</p>
                  <p className="text-sm">Start attracting top talent by posting internships or jobs!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <PostOpportunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOpportunityCreated={loadInitialData}
      />
    </div>
  );
};

export default CompanyDashboard;
