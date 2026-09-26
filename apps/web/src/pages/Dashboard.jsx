import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, LogOut, User, Briefcase, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const roleConfigs = {
    STUDENT: {
      title: 'Student Portal',
      icon: <GraduationCap className="text-blue-600" />,
      color: 'bg-blue-50',
      welcome: 'Student Competency & Opportunity Workspace',
      features: [
        { name: 'Skill Assessment', path: '/assess', desc: 'Test and certify your technical skills' },
        { name: 'Skill Gap Analysis', path: '/gap-analysis', desc: 'Analyze gaps against career target' },
        { name: 'Job & Internship Search', path: '/opportunities', desc: 'Browse matched internships and jobs' },
        { name: 'Skill Profile & Portfolio', path: '/profile', desc: 'Manage skills and digital portfolio' },
        { name: 'My Applications', path: '/my-applications', desc: 'Track your application statuses' },
        { name: 'ATS Resume Builder', path: '/resume-builder', desc: 'Generate & export verified ATS resume' },
        { name: 'AI Career Assistant', path: '/ai-assistant', desc: 'Get personalized career guidance' },
        { name: 'AI Resume Import', path: '/resume-parser', desc: 'Autofill profile from resume PDF' }
      ]
    },
    INDUSTRY: {
      title: 'Recruiter Portal',
      icon: <Briefcase className="text-indigo-600" />,
      color: 'bg-indigo-50',
      welcome: 'Recruiter ATS & Talent Acquisition Workspace',
      features: [
        { name: 'Company Dashboard', path: '/company/dashboard', desc: 'Manage organization and post opportunities' },
        { name: 'Applicant Tracking (ATS)', path: '/ats', desc: 'Review candidates and match scores' },
        { name: 'Recruiter Analytics', path: '/recruiter-analytics', desc: 'Hiring funnel and candidate quality' }
      ]
    },
    FACULTY: {
      title: 'Academician Portal',
      icon: <User className="text-emerald-600" />,
      color: 'bg-emerald-50',
      welcome: 'Academic Verification & Faculty Portal',
      features: [
        { name: 'Institution Analytics', path: '/analytics', desc: 'Skill gaps and industry demands' },
        { name: 'Browse Opportunities', path: '/opportunities', desc: 'View student internships and jobs' }
      ]
    },
    INSTITUTION_ADMIN: {
      title: 'Admin Control Panel',
      icon: <ShieldCheck className="text-indigo-600" />,
      color: 'bg-indigo-50',
      welcome: 'Institutional Analytics & Placement Control Panel',
      features: [
        { name: 'Institution Analytics', path: '/analytics', desc: 'KPIs, skill gaps, demand, placement funnel' },
        { name: 'Verification Queue', path: '/verify', desc: 'Review & verify student credentials' },
        { name: 'Browse Opportunities', path: '/opportunities', desc: 'Active company postings' }
      ]
    },
  };

  const config = roleConfigs[user.role] || roleConfigs.STUDENT;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Pinned Viewport Height with Fixed Logout Button */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shrink-0 z-20">
        <div className="p-6 flex items-center gap-3 font-bold text-xl border-b border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            SF
          </div>
          <span>SkillForge</span>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto min-h-0">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-2 mb-2">Main Menu</div>
          <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-lg bg-slate-800 text-white text-sm font-medium">Dashboard</Link>
          <Link to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">Profile</Link>
          {user.role === 'STUDENT' && (
            <>
              <Link to="/assess" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">Assessment</Link>
              <Link to="/gap-analysis" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">Skill Gap</Link>
              <Link to="/opportunities" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">Opportunities</Link>
              <Link to="/my-applications" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">Applications</Link>
              <Link to="/resume-builder" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">ATS Resume</Link>
              <Link to="/ai-assistant" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">AI Assistant</Link>
            </>
          )}
          {user.role === 'INDUSTRY' && (
            <>
              <Link to="/company/dashboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">Company</Link>
              <Link to="/ats" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">ATS Applicants</Link>
              <Link to="/recruiter-analytics" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">Analytics</Link>
            </>
          )}
          {user.role === 'INSTITUTION_ADMIN' && (
            <>
              <Link to="/analytics" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">Analytics</Link>
              <Link to="/verify" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">Verification Queue</Link>
            </>
          )}
          {user.role === 'FACULTY' && (
            <Link to="/analytics" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-sm">Analytics</Link>
          )}
        </nav>
        {/* Pinned Bottom Bar with Logout Button - Always visible without scrolling */}
        <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-900 space-y-2.5">
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/50 hover:text-red-300 border border-red-900/40 transition text-sm font-medium shadow-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
            <Link to="/privacy" className="hover:text-slate-300 transition">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-slate-300 transition">Terms</Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-slate-800">{config.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 font-medium">{user.firstName} {user.lastName}</span>
              <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-700">
                {user.firstName[0]}{user.lastName[0]}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className={`p-8 rounded-2xl ${config.color} border border-slate-200 relative overflow-hidden`}>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                {config.icon}
                <span className="text-sm font-bold uppercase tracking-wider text-slate-500">{user.role}</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{config.welcome}</h2>
              <p className="text-slate-600">Welcome back to your professional collaboration dashboard.</p>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12">
              {React.cloneElement(config.icon, { size: 120 })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.features.map((feature, idx) => (
              <div 
                key={idx} 
                onClick={() => navigate(feature.path)}
                className="bg-white p-6 rounded-2xl border shadow-sm hover:border-indigo-300 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
                    <ArrowRight size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">{feature.name}</h3>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>Open Module</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
