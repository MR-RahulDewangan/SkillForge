import React, { useState, useEffect } from 'react';
import { X, Plus, Search, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const PostOpportunityModal = ({ isOpen, onClose, onOpportunityCreated }) => {
  const [formData, setFormData] = useState({
    type: 'INTERNSHIP',
    title: '',
    description: '',
    location: '',
    workMode: 'HYBRID',
    stipend: '',
    salary: '',
    minCgpa: '',
    requiredDegree: '',
    requiredBranch: '',
    graduationYear: '',
    deadline: '',
    selectedSkills: [],
  });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSkills();
    }
  }, [isOpen]);

  const fetchSkills = async () => {
    try {
      const res = await axios.get('/api/skills/roles/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // If the endpoint /all doesn't exist, we might need to implement it or use a different one
      setAvailableSkills(res.data);
    } catch (err) {
      console.error('Error fetching skills', err);
    }
  };

  const handleSkillToggle = (skill) => {
    if (formData.selectedSkills.find(s => s.id === skill.id)) {
      setFormData({
        ...formData,
        selectedSkills: formData.selectedSkills.filter(s => s.id !== skill.id)
      });
    } else {
      setFormData({
        ...formData,
        selectedSkills: [...formData.selectedSkills, { ...skill, minScore: 50 }]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        skills: formData.selectedSkills
      };
      delete payload.selectedSkills;

      await axios.post('/api/opportunities', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onOpportunityCreated();
      onClose();
    } catch (err) {
      alert('Failed to post opportunity: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800">Post New Opportunity</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">Opportunity Title*</label>
                <input
                  required
                  className="w-full p-2 border rounded-lg outline-indigo-600"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Junior Data Analyst"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Type*</label>
                  <select
                    className="w-full p-2 border rounded-lg outline-indigo-600"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="INTERNSHIP">Internship</option>
                    <option value="JOB">Full-time Job</option>
                    <option value="APPRENTICESHIP">Apprenticeship</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Work Mode*</label>
                  <select
                    className="w-full p-2 border rounded-lg outline-indigo-600"
                    value={formData.workMode}
                    onChange={e => setFormData({...formData, workMode: e.target.value})}
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="ONSITE">On-site</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">Location*</label>
                <input
                  required
                  className="w-full p-2 border rounded-lg outline-indigo-600"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">Deadline*</label>
                <input
                  required
                  type="date"
                  className="w-full p-2 border rounded-lg outline-indigo-600"
                  value={formData.deadline}
                  onChange={e => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">Description*</label>
                <textarea
                  required
                  className="w-full p-2 border rounded-lg outline-indigo-600 h-32"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the role, responsibilities and benefits..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Stipend/Salary</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-lg outline-indigo-600"
                    value={formData.stipend}
                    onChange={e => setFormData({...formData, stipend: e.target.value})}
                    placeholder="Amount"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Min CGPA</label>
                  <input
                    type="number" step="0.1"
                    className="w-full p-2 border rounded-lg outline-indigo-600"
                    value={formData.minCgpa}
                    onChange={e => setFormData({...formData, minCgpa: e.target.value})}
                    placeholder="e.g. 7.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Required Degree</label>
                  <input
                    className="w-full p-2 border rounded-lg outline-indigo-600"
                    value={formData.requiredDegree}
                    onChange={e => setFormData({...formData, requiredDegree: e.target.value})}
                    placeholder="e.g. B.Tech"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Required Branch</label>
                  <input
                    className="w-full p-2 border rounded-lg outline-indigo-600"
                    value={formData.requiredBranch}
                    onChange={e => setFormData({...formData, requiredBranch: e.target.value})}
                    placeholder="e.g. CS"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skill Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-600">Required Skills*</label>
              <span className="text-xs text-slate-400">{formData.selectedSkills.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border">
              {availableSkills.length > 0 ? availableSkills.map(skill => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    formData.selectedSkills.find(s => s.id === skill.id)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border hover:border-indigo-400'
                  }`}
                >
                  {skill.name}
                </button>
              )) : (
                <p className="text-sm text-slate-400">Loading available skills...</p>
              )}
            </div>
          </div>
        </form>

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.description || formData.selectedSkills.length === 0}
            className="px-6 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : 'Post Opportunity'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostOpportunityModal;
