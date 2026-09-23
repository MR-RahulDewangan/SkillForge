import React, { useState, useEffect } from 'react';
import { getSkillGaps } from '../api/skillApi';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle2, BookOpen, ArrowRight } from 'lucide-react';

const SkillGapDashboard = () => {
  const { user } = useAuth();
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGaps = async () => {
      try {
        const data = await getSkillGaps();
        setGaps(data);
      } catch (err) {
        console.error('Failed to load skill gaps', err);
      } finally {
        setLoading(false);
      }
    };
    loadGaps();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Gap Analysis...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Skill Gap Analysis</h1>
          <p className="text-slate-500">Identify areas for improvement based on your career goal</p>
        </div>

        {gaps.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Gap Data Available</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Please ensure you have set a career goal and completed the required assessments to see your gap analysis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {gaps.map((gap, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      gap.status === 'Critical' ? 'bg-red-100 text-red-600' : 
                      gap.status === 'Moderate' ? 'bg-yellow-100 text-yellow-600' : 
                      'bg-green-100 text-green-600'
                    }`}>
                      <AlertCircle size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{gap.skillName}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    gap.status === 'Critical' ? 'bg-red-100 text-red-600' : 
                    gap.status === 'Moderate' ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-green-100 text-green-600'
                  }`}>
                    {gap.status} Gap
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Your Current Score</p>
                    <p className="text-2xl font-bold text-slate-900">{gap.currentScore}%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Industry Requirement</p>
                    <p className="text-2xl font-bold text-indigo-600">{gap.requiredScore}%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Deficit</p>
                    <p className="text-2xl font-bold text-red-500">{gap.requiredScore - gap.currentScore}%</p>
                  </div>
                </div>

                <div className="pt-6 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <BookOpen size={18} />
                    <span className="text-sm font-medium">Recommended: {gap.recommendedCourse}</span>
                  </div>
                  <a 
                    href={gap.courseUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                  >
                    Start Learning <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapDashboard;
