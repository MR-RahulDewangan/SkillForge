import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResumeData } from '../api/skillApi';
import { useAuth } from '../hooks/useAuth';
import { 
  Printer, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles, 
  Mail, 
  GraduationCap, 
  Award, 
  FolderGit2, 
  FileText,
  Sliders,
  ExternalLink
} from 'lucide-react';

const ResumeBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Customization state
  const [summary, setSummary] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [location, setLocation] = useState('New Delhi, India');
  const [showScores, setShowScores] = useState(true);
  const [showCgpa, setShowCgpa] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getResumeData();
        setResumeData(data);
        
        // Generate a high-impact default summary based on their career goal and verified skills
        const role = data.careerGoal?.title || 'Technology Specialist';
        const topSkills = (data.skills || []).slice(0, 3).map(s => s.skill.name).join(', ');
        const defaultSumm = `Dedicated and detail-oriented student aspiring as a ${role} with hands-on proficiency in ${topSkills || 'modern software technologies'}. Demonstrated capability through verified technical assessments, academic capstone projects, and industry-standard best practices. Seeking an opportunity to deliver measurable value and scale solutions in a collaborative environment.`;
        setSummary(defaultSumm);
      } catch (err) {
        console.error('Failed to fetch resume data:', err);
        setError('Could not load profile details. Please ensure your profile is created.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Generating ATS-Optimized Resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl border max-w-md w-full text-center space-y-4 shadow-sm">
          <p className="text-red-600 font-medium">{error || 'Profile not found'}</p>
          <button 
            onClick={() => navigate('/profile')} 
            className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Go to Skill Profile
          </button>
        </div>
      </div>
    );
  }

  const studentName = `${resumeData.user?.firstName || user?.firstName || 'Candidate'} ${resumeData.user?.lastName || user?.lastName || ''}`.trim();
  const studentEmail = resumeData.user?.email || user?.email || 'student@university.edu';
  const roleTitle = resumeData.careerGoal?.title || 'Software & Data Analyst';
  const skills = resumeData.skills || [];
  const projects = resumeData.projects || [];
  const certificates = resumeData.certificates || [];

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans text-slate-900">
      {/* Action Toolbar (Hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition"
        >
          <ArrowLeft size={18} />
          Back to Portal
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold shadow-sm transition"
          >
            <Sliders size={16} />
            {isEditing ? 'Close Editor' : 'Customize Content'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-bold shadow-md hover:shadow-indigo-500/20 transition"
          >
            <Printer size={16} />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Customization Drawer (Hidden during print) */}
      {isEditing && (
        <div className="max-w-4xl mx-auto mb-6 p-6 bg-white rounded-2xl border shadow-sm space-y-4 print:hidden transition">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            Resume Preferences & Custom Fields
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm border rounded-lg p-2 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm border rounded-lg p-2 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Professional Summary Statement</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full text-sm border rounded-lg p-2 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showScores}
                onChange={(e) => setShowScores(e.target.checked)}
                className="rounded text-indigo-600"
              />
              Show Assessment Proficiency %
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showCgpa}
                onChange={(e) => setShowCgpa(e.target.checked)}
                className="rounded text-indigo-600"
              />
              Show CGPA on Education
            </label>
          </div>
        </div>
      )}

      {/* ATS-Friendly Document Sheet */}
      <div 
        id="resume-sheet"
        className="max-w-4xl mx-auto bg-white p-10 md:p-12 shadow-xl print:shadow-none print:p-0 print:m-0 rounded-xl print:rounded-none border border-slate-200 print:border-none min-h-[1050px]"
      >
        {/* Document Header */}
        <header className="border-b-2 border-slate-800 pb-5 mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            {studentName}
          </h1>
          <p className="text-base font-semibold text-indigo-700 mt-1 uppercase tracking-wide">
            {roleTitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-3 font-medium">
            <span className="flex items-center gap-1">
              <Mail size={12} />
              {studentEmail}
            </span>
            <span>•</span>
            <span>{phone}</span>
            <span>•</span>
            <span>{location}</span>
            {resumeData.degree && (
              <>
                <span>•</span>
                <span>{resumeData.degree} ({resumeData.branch || 'Eng.'})</span>
              </>
            )}
          </div>
        </header>

        {/* Professional Summary */}
        {summary && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              Professional Summary
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              {summary}
            </p>
          </section>
        )}

        {/* Education */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
            Education
          </h2>
          <div className="flex justify-between items-baseline text-sm">
            <div>
              <span className="font-bold text-slate-900">
                {resumeData.degree || 'Bachelor of Technology'} in {resumeData.branch || 'Computer Science & Engineering'}
              </span>
              <p className="text-xs text-slate-600">Apex Institute of Technology & Management</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-700">
                Graduation: {resumeData.gradYear || '2026'}
              </span>
              {showCgpa && resumeData.cgpa && (
                <p className="text-xs font-bold text-indigo-700">CGPA: {resumeData.cgpa} / 10.0</p>
              )}
            </div>
          </div>
        </section>

        {/* Verified Technical Skills */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
            Technical Competencies & Verified Skills
          </h2>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map(s => (
                <div 
                  key={s.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 font-medium"
                >
                  <span>{s.skill.name}</span>
                  {showScores && (
                    <span className="text-indigo-600 font-bold">
                      ({s.score}%)
                    </span>
                  )}
                  {s.isVerified && (
                    <span className="text-green-600 font-bold text-[10px]" title="Institutional / Platform Verified">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No verified skills recorded yet. Complete an assessment to show skills.</p>
          )}
        </section>

        {/* Key Projects */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-3">
            Academic & Industry Projects
          </h2>
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map(p => (
                <div key={p.id} className="break-inside-avoid">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      {p.name}
                      {p.isVerified && (
                        <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-bold uppercase">
                          Verified Project
                        </span>
                      )}
                    </span>
                    {p.url && (
                      <a 
                        href={p.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        Project URL <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-normal text-justify">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No projects listed. Add projects in your Digital Portfolio.</p>
          )}
        </section>

        {/* Certifications & Badges */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
            Certifications & Verified Credentials
          </h2>
          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {certificates.map(c => (
                <div key={c.id} className="border border-slate-100 p-2.5 rounded bg-slate-50/50 break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-xs text-slate-900">{c.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(c.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-xs text-slate-600">{c.issuer}</span>
                    {c.isVerified && (
                      <span className="text-[10px] text-green-700 font-semibold">✓ Verified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No external certificates added yet.</p>
          )}
        </section>

        {/* Platform Verification Watermark / Footer */}
        <footer className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>Generated by Academia–Industry Collaboration Portal (SIH 2026)</span>
          <span>Verified Student Credential Dossier</span>
        </footer>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body {
            background-color: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #resume-sheet {
            max-width: 100% !important;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0.25in !important;
            margin: 0 !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;
