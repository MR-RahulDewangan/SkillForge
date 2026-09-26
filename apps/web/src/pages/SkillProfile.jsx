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
        const pData = await getStudentProfile(user?.id || 'me');
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
  }, [user]);

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

  // Dynamic Milestone Badges
  const hasAttempt = (profile.assessments || []).length > 0;
  const hasHighSkill = (profile.skills || []).some(s => s.score >= 80);
  const isPolymath = (profile.skills || []).length >= 3;
  const hasProject = (profile.projects || []).length > 0;
  const hasCertificate = (profile.certificates || []).length > 0;
  const avgScore = (profile.skills || []).length > 0 
    ? Math.round(profile.skills.reduce((acc, c) => acc + c.score, 0) / profile.skills.length)
    : 0;
  const isPlacementReady = avgScore >= 70;

  const badges = [
    {
      id: 'pioneer',
      name: 'Skill Pioneer',
      desc: 'Completed first assessment',
      icon: '🌟',
      unlocked: hasAttempt
    },
    {
      id: 'specialist',
      name: 'Domain Specialist',
      desc: 'Scored 80%+ on any skill',
      icon: '🏆',
      unlocked: hasHighSkill
    },
    {
      id: 'polymath',
      name: 'Tech Polymath',
      desc: 'Assessed across 3+ skills',
      icon: '💡',
      unlocked: isPolymath
    },
    {
      id: 'builder',
      name: 'Portfolio Builder',
      desc: 'Added projects to portfolio',
      icon: '🚀',
      unlocked: hasProject
    },
    {
      id: 'certified',
      name: 'Certified Achiever',
      desc: 'Added accredited certificate',
      icon: '📜',
      unlocked: hasCertificate
    },
    {
      id: 'ready',
      name: 'Industry Ready',
      desc: 'Average skill score >= 70%',
      icon: '🎯',
      unlocked: isPlacementReady
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Skill Profile</h1>
            <p className="text-slate-500">Track your progress and bridge the gap</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/resume-builder')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-sm transition"
            >
              <Award size={18} />
              Generate ATS Resume
            </button>
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border shadow-sm">
              <Target className="text-indigo-600" size={18} />
              <span className="text-sm font-medium text-slate-600">Career Goal:</span>
              <select 
                value={profile.careerGoalId || ''} 
                onChange={(e) => handleGoalChange(e.target.value)}
                className="text-sm font-bold text-indigo-600 bg-transparent outline-none cursor-pointer"
              >
                <option value="">Select Goal</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>
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
            {/* Milestone Badges */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Award size={20} className="text-amber-500" />
                  Milestone Badges
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  {badges.filter(b => b.unlocked).length} / {badges.length} Earned
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {badges.map(b => (
                  <div 
                    key={b.id} 
                    className={`p-3 rounded-xl border transition flex flex-col items-center text-center ${
                      b.unlocked 
                        ? 'bg-amber-50/50 border-amber-200 text-slate-800 shadow-sm' 
                        : 'bg-slate-50/60 border-slate-100 text-slate-400 grayscale opacity-60'
                    }`}
                  >
                    <span className="text-2xl mb-1">{b.icon}</span>
                    <span className="text-xs font-bold leading-tight">{b.name}</span>
                    <span className="text-[10px] mt-1 line-clamp-1">{b.desc}</span>
                    <span className={`text-[9px] font-bold mt-2 px-1.5 py-0.5 rounded ${
                      b.unlocked ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {b.unlocked ? 'Earned' : 'Locked'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

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
