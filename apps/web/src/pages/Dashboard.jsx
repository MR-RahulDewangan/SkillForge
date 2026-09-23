import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, LogOut, User, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  if (!user) return <div>Loading...</div>;

  const roleConfigs = {
    STUDENT: {
      title: 'Student Portal',
      icon: <GraduationCap className="text-blue-600" />,
      color: 'bg-blue-50',
      welcome: 'Ready to boost your skills?',
      features: ['Skill Assessment', 'Career Path', 'Job Search', 'Portfolio']
    },
    INDUSTRY: {
      title: 'Recruiter Portal',
      icon: <Briefcase className="text-indigo-600" />,
      color: 'bg-indigo-50',
      welcome: 'Looking for top talent?',
      features: ['Post Opportunities', 'Manage Applicants', 'Skill Analytics', 'Company Profile']
    },
    FACULTY: {
      title: 'Academician Portal',
      icon: <User className="text-green-600" />,
      color: 'bg-green-50',
      welcome: 'Collaborate with industry experts',
      features: ['Research Collabs', 'Faculty Internships', 'Mentorship', 'FDP Search']
    },
    INSTITUTION_ADMIN: {
      title: 'Admin Control Panel',
      icon: <ShieldCheck className="text-purple-600" />,
      color: 'bg-purple-50',
      welcome: 'Monitor institutional growth',
      features: ['Student Analytics', 'Placement Tracking', 'Company Verification', 'Faculty Management']
    },
  };

  const config = roleConfigs[user.role];

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
          <a href="#" className="flex items-center gap-3 p-2 rounded bg-slate-800 text-white">Dashboard</a>
          <a href="#" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">Profile</a>
          <a href="#" className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">Settings</a>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.features.map((feature) => (
              <div key={feature} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition cursor-pointer group">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition">
                  <div className="w-5 h-5 bg-slate-400 rounded-sm group-hover:bg-indigo-500" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{feature}</h3>
                <p className="text-sm text-slate-500">Coming soon in next phase...</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
