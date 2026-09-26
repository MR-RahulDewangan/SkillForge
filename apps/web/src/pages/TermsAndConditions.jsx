import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, AlertTriangle, FileCheck, Scale } from 'lucide-react';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              SF
            </div>
            <span>SkillForge</span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 md:p-12">
          {/* Header */}
          <div className="border-b border-slate-200 pb-8 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-100">
              <Scale size={14} />
              <span>Terms of Service</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms and Conditions</h1>
            <p className="text-sm text-slate-500">
              Effective Date: September 2026 | Last Updated: September 2026
            </p>
          </div>

          {/* Terms Body */}
          <div className="space-y-8 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing, registering with, or utilizing the SkillForge platform ("the Platform"), users agree to be legally bound by these Terms and Conditions. If you do not accept these terms in their entirety, you must discontinue use of the platform immediately. These terms apply equally to all participating students, educational institutions, faculty reviewers, and corporate recruiters.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-indigo-600" />
                2. User Account Responsibilities
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong className="text-slate-800">Account Accuracy:</strong> Users must provide accurate, current, and truthful information during registration, profile creation, and opportunity publication.
                </li>
                <li>
                  <strong className="text-slate-800">Credential Security:</strong> Users are solely responsible for maintaining the confidentiality of their login credentials. Any activity conducted under an authenticated account is the responsibility of the account holder.
                </li>
                <li>
                  <strong className="text-slate-800">Role Integrity:</strong> Users must not misrepresent their identity, affiliation, student standing, corporate position, or administrative authority.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <FileCheck size={18} className="text-indigo-600" />
                3. Assessment & Academic Conduct
              </h2>
              <p className="mb-2">
                The SkillForge assessment center is designed to provide objective, verifiable skill ratings. Users participating in technical assessments agree to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Complete all evaluation questions independently without unauthorized automated assistance or shared answer repositories.</li>
                <li>Refrain from capturing, distributing, or publishing proprietary examination questions and answer keys.</li>
                <li>Accept that verified skill ratings are subject to faculty audit and potential revocation if academic dishonesty is determined.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} className="text-indigo-600" />
                4. Employer & Recruiter Commitments
              </h2>
              <p className="mb-2">
                Corporate entities and recruiters publishing opportunities through SkillForge agree to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Post legitimate, bona fide employment, internship, or apprenticeship vacancies with accurate stipend, duration, and qualification parameters.</li>
                <li>Utilize candidate profile data exclusively for legitimate hiring evaluations relating to the posted vacancy.</li>
                <li>Comply with applicable non-discrimination laws and fair hiring guidelines throughout applicant review, shortlisting, and hiring decisions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                5. Intellectual Property & Platform Ownership
              </h2>
              <p>
                All software source code, interface designs, deterministic matching algorithms, assessment frameworks, and branding elements associated with SkillForge remain the exclusive intellectual property of the SkillForge development team and its institutional partners. Users retain ownership of their original portfolio projects and resume content uploaded to the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                6. Service Availability & Modifications
              </h2>
              <p>
                SkillForge reserves the right to modify, suspend, or update platform features, assessment banks, and matching criteria to improve educational and recruitment quality. While we strive for continuous service reliability, we make no guarantee of uninterrupted or error-free platform operation.
              </p>
            </section>

            <section className="pt-6 border-t border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                7. Contact Information
              </h2>
              <p className="text-slate-600">
                For legal inquiries or questions concerning these Terms and Conditions, please contact:
              </p>
              <p className="mt-2 font-medium text-slate-800">
                Email: legal@skillforge.edu | SkillForge Governance Office
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} SkillForge Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TermsAndConditions;
