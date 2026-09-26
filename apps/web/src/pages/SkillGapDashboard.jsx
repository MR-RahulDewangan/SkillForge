import React, { useState, useEffect } from 'react';
import { getSkillGaps } from '../api/skillApi';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle2, BookOpen, ArrowRight } from 'lucide-react';

const SkillGapDashboard = () => {
  const { user } = useAuth();
  const [gaps, setGaps] = useState([]);
  const [readiness, setReadiness] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGaps = async () => {
      try {
        const data = await getSkillGaps();
        if (data && data.gapAnalysis) {
          setReadiness(data.readiness || 0);
          const recs = data.recommendations || [];
          const normalizedGaps = data.gapAnalysis.map(item => {
            const rec = recs.find(r => r.skillName === item.skillName);
            const severityLabel = item.severity 
              ? item.severity.charAt(0) + item.severity.slice(1).toLowerCase() 
              : (item.status === 'SATISFIED' ? 'Satisfied' : 'Gap');

            return {
              skillName: item.skillName,
              currentScore: item.studentScore,
              requiredScore: item.requiredScore,
              status: severityLabel,
              recommendedCourse: rec?.course?.title || 'Core Training Course',
              courseUrl: rec?.course?.url || '#'
            };
          });
          setGaps(normalizedGaps);
        } else if (Array.isArray(data)) {
          setGaps(data);
        }
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

        <div className="flex justify-between items-center bg-indigo-600 text-white p-6 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-xl font-bold">Role Readiness Score</h2>
            <p className="text-indigo-100 text-sm">Calculated deterministically against industry requirements</p>
          </div>
          <div className="text-4xl font-black">{readiness}%</div>
        </div>

        {/* Multi-Step Sequential Learning Roadmap */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Career Milestone Roadmap</h2>
              <p className="text-slate-500 text-xs mt-0.5">Sequential milestones to bridge your skill deficits and become recruitment-ready</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
              {readiness >= 100 ? 'Roadmap Completed' : readiness >= 75 ? 'Phase 3 in Progress' : readiness >= 40 ? 'Phase 2 in Progress' : 'Phase 1 Foundations'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Phase 1 */}
            <div className={`p-4 rounded-xl border relative ${
              readiness >= 40 ? 'bg-emerald-50/50 border-emerald-300' : 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Step 1</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  readiness >= 40 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {readiness >= 40 ? 'Completed' : 'Active'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Foundational Skills</h4>
              <p className="text-xs text-slate-600 mb-3">Core syntax, data types, and programmatic logic.</p>
              <div className="text-[11px] font-semibold text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={readiness >= 40 ? "text-emerald-600" : "text-indigo-600"}>✓</span>
                  <span>Basic Assessments</span>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className={`p-4 rounded-xl border relative ${
              readiness >= 75 ? 'bg-emerald-50/50 border-emerald-300' : readiness >= 40 ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-400' : 'bg-slate-50 border-slate-200 opacity-70'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Step 2</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  readiness >= 75 ? 'bg-emerald-100 text-emerald-800' : readiness >= 40 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {readiness >= 75 ? 'Completed' : readiness >= 40 ? 'Active' : 'Locked'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Core Competency</h4>
              <p className="text-xs text-slate-600 mb-3">Industry-standard tools, database querying & APIs.</p>
              <div className="text-[11px] font-semibold text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={readiness >= 75 ? "text-emerald-600" : "text-slate-400"}>•</span>
                  <span>Role-Specific Gaps</span>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className={`p-4 rounded-xl border relative ${
              readiness >= 90 ? 'bg-emerald-50/50 border-emerald-300' : readiness >= 75 ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-400' : 'bg-slate-50 border-slate-200 opacity-70'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Step 3</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  readiness >= 90 ? 'bg-emerald-100 text-emerald-800' : readiness >= 75 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {readiness >= 90 ? 'Completed' : readiness >= 75 ? 'Active' : 'Locked'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Applied Projects</h4>
              <p className="text-xs text-slate-600 mb-3">Production implementations and verified capstones.</p>
              <div className="text-[11px] font-semibold text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={readiness >= 90 ? "text-emerald-600" : "text-slate-400"}>•</span>
                  <span>Portfolio Verification</span>
                </div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className={`p-4 rounded-xl border relative ${
              readiness >= 100 ? 'bg-emerald-50/50 border-emerald-300' : readiness >= 90 ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-400' : 'bg-slate-50 border-slate-200 opacity-70'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Step 4</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  readiness >= 100 ? 'bg-emerald-100 text-emerald-800' : readiness >= 90 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {readiness >= 100 ? 'Completed' : readiness >= 90 ? 'Active' : 'Locked'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Recruitment Ready</h4>
              <p className="text-xs text-slate-600 mb-3">Targeted job applications with 90%+ match scores.</p>
              <div className="text-[11px] font-semibold text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={readiness >= 100 ? "text-emerald-600" : "text-slate-400"}>•</span>
                  <span>ATS Shortlisting</span>
                </div>
              </div>
            </div>
          </div>
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
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    gap.status === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' : 
                    gap.status === 'Moderate' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                    'bg-green-100 text-green-700 border border-green-200'
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
