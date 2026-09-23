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
      welcome: 'Ready to boost your skills?',
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
      welcome: 'Looking for top talent?',
      features: [
        { name: 'Company Dashboard', path: '/company/dashboard', desc: 'Manage organization and post opportunities' },
        { name: 'Applicant Tracking (ATS)', path: '/ats', desc: 'Review candidates and match scores' },
        { name: 'Recruiter Analytics', path: '/recruiter-analytics', desc: 'Hiring funnel and candidate quality' }
      ]
    },
    FACULTY: {
      title: 'Academician Portal',
      icon: <User className="text-green-600" />,
      color: 'bg-green-50',
      welcome: 'Collaborate with industry experts',
      features: [
        { name: 'Institution Analytics', path: '/analytics', desc: 'Skill gaps and industry demands' },
        { name: 'Browse Opportunities', path: '/opportunities', desc: 'View student internships and jobs' }
      ]
    },
    INSTITUTION_ADMIN: {
      title: 'Admin Control Panel',
      icon: <ShieldCheck className="text-purple-600" />,
      color: 'bg-purple-50',
      welcome: 'Monitor institutional growth',
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
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 font-bold text-xl border-b border-slate-800">
          <LayoutDashboard size={24} />
          <span>SIH Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs uppercase text-slate-500 font-semibold px-2 mb-4">Main Menu</div>
          <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded bg-slate-800 text-white">Dashboard</Link>
          <Link to="/profile" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">Profile</Link>
          {user.role === 'STUDENT' && (
            <>
              <Link to="/assess" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">Assessment</Link>
              <Link to="/gap-analysis" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">Skill Gap</Link>
              <Link to="/opportunities" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">Opportunities</Link>
              <Link to="/my-applications" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">Applications</Link>
              <Link to="/resume-builder" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">ATS Resume</Link>
              <Link to="/ai-assistant" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">AI Assistant</Link>
            </>
          )}
          {user.role === 'INDUSTRY' && (
            <>
              <Link to="/company/dashboard" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">Company</Link>
              <Link to="/ats" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">ATS Applicants</Link>
              <Link to="/recruiter-analytics" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">Analytics</Link>
            </>
          )}
          {user.role === 'INSTITUTION_ADMIN' && (
            <>
              <Link to="/analytics" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">Analytics</Link>
              <Link to="/verify" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">Verification Queue</Link>
            </>
          )}
          {user.role === 'FACULTY' && (
            <Link to="/analytics" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">Analytics</Link>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full p-2 rounded text-red-400 hover:bg-red-900/20 transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">{config.title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user.firstName} {user.lastName}</span>
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
              {user.firstName[0]}{user.lastName[0]}
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
