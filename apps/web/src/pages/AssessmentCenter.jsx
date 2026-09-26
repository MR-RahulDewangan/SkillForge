import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoles, getSkillsByRole } from '../api/skillApi';
import { BookOpen, ChevronRight, Target } from 'lucide-react';

const AssessmentCenter = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await getAllRoles();
        setRoles(data);
      } catch (err) {
        console.error('Failed to load roles');
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, []);

  const handleRoleSelect = async (roleId) => {
    setSelectedRole(roleId);
    try {
      const data = await getSkillsByRole(roleId);
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skills');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Assessment Center</h1>
          <p className="text-slate-500">Select your target career and prove your skills</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Target size={16} className="text-indigo-600" />
              Choose Your Career Path
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRole === role.id 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100' 
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-semibold">{role.title}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedRole && (
            <div className="pt-6 border-t">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-600" />
                Available Assessments
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {skills.length > 0 ? skills.map(skill => (
                  <div key={skill.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition group">
                    <div>
                      <span className="font-semibold text-slate-700">{skill.name}</span>
                      <span className="ml-3 text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium">{skill.category}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/assess/${skill.id}`)}
                      className="flex items-center gap-1 text-indigo-600 font-bold text-sm hover:text-indigo-800 transition"
                    >
                      Start Test <ChevronRight size={16} />
                    </button>
                  </div>
                )) : (
                  <p className="text-center py-4 text-slate-400">Loading skills...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentCenter;
