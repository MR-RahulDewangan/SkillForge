import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudentProfile, updateCareerGoal, getAllRoles, getSkillsByRole } from '../api/skillApi';
import { useAuth } from '../hooks/useAuth';
import { Target, TrendingUp, History, Award, CheckCircle2, AlertCircle, Layout } from 'lucide-react';
import PortfolioManager from '../components/PortfolioManager';

const SkillProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/user/me');
        const { user: authUser } = await res.json();
        const pData = await getStudentProfile(authUser.id);
        setProfile(pData);
        const rolesData = await getAllRoles();
        setRoles(rolesData);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleGoalChange = async (roleId) => {
    try {
      await updateCareerGoal({ studentId: profile.id, careerGoalId: roleId });
      const pData = await getStudentProfile(profile.id);
      setProfile(pData);
    } catch (err) {
      console.error('Failed to update goal');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Skill Profile</h1>
            <p className="text-slate-500">Track your progress and bridge the gap</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-sm">
            <Target className="text-indigo-600" size={20} />
            <span className="text-sm font-medium text-slate-600">Career Goal:</span>
            <select 
              value={profile.careerGoalId || ''} 
              onChange={(e) => handleGoalChange(e.target.value)}
              className="text-sm font-bold text-indigo-600 bg-transparent outline-none"
            >
              <option value="">Select Goal</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600" />
                Skill Proficiency
              </h2>
              <div className="space-y-6">
                {profile.skills.length > 0 ? profile.skills.map(s => (
                  <div key={s.id} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-700">{s.skill.name}</span>
                      <span className="text-indigo-600">{s.score}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-slate-400">
                    No skills assessed yet. Start an assessment to see your profile!
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Layout size={20} className="text-indigo-600" />
                Digital Portfolio
              </h2>
              <PortfolioManager studentId={profile.id} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <History size={20} className="text-indigo-600" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {profile.assessments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm">
                    <span className="text-slate-600">{a.skill.name}</span>
                    <span className="font-bold text-indigo-600">{a.score}%</span>
                  </div>
                ))}
                {profile.assessments.length === 0 && <p className="text-sm text-slate-400 text-center">No activity yet.</p>}
              </div>
            </div>

            <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Award size={20} />
                Next Step
              </h2>
              <p className="text-indigo-100 text-sm mb-6">
                {profile.skills.length === 0 
                  ? "Take your first assessment to unlock your profile." 
                  : "Keep improving your scores to match industry requirements."}
              </p>
              <button 
                onClick={() => navigate('/assess')}
                className="w-full bg-white text-indigo-600 p-3 rounded-xl font-bold hover:bg-indigo-50 transition"
              >
                Take Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillProfile;
