import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
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
              <Shield size={14} />
              <span>Legal Documentation</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
            <p className="text-sm text-slate-500">
              Effective Date: September 2026 | Last Updated: September 2026
            </p>
          </div>

          {/* Policy Body */}
          <div className="space-y-8 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                1. Overview & Purpose
              </h2>
              <p>
                SkillForge ("we", "our", or "the Platform") is committed to safeguarding the privacy and security of personal and academic information collected through our Academia-Industry Collaboration Platform. This Privacy Policy outlines our procedures regarding the collection, storage, processing, and disclosure of data provided by students, academic institutions, faculty members, and corporate industry recruiters.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Database size={18} className="text-indigo-600" />
                2. Information We Collect
              </h2>
              <div className="space-y-3">
                <p>
                  We collect information necessary to facilitate competency evaluations, opportunity matching, recruitment processes, and institutional accreditation analytics:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                  <li>
                    <strong className="text-slate-800">Account Credentials:</strong> Full name, verified institutional email address, hashed passwords, contact details, and role assignments (Student, Industry Recruiter, Faculty, Administrator).
                  </li>
                  <li>
                    <strong className="text-slate-800">Academic Records:</strong> Educational institution, department, semester, cumulative grade point average (CGPA), graduation year, verified degrees, and faculty audit validations.
                  </li>
                  <li>
                    <strong className="text-slate-800">Skill Assessment Data:</strong> Multiple-choice test responses, objective competency scores, skill proficiencies, and career goal tracks.
                  </li>
                  <li>
                    <strong className="text-slate-800">Portfolio & Application Artifacts:</strong> Submitted resumes (PDF format), project documentation, certification links, application statuses, and recruiter correspondence notes.
                  </li>
                  <li>
                    <strong className="text-slate-800">Corporate Details:</strong> Company registration, recruiter identity, hiring vacancy specifications, required benchmark scores, and ATS review decisions.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Eye size={18} className="text-indigo-600" />
                3. How We Use Collected Data
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Computing deterministic, explainable candidate-opportunity compatibility scores (70% Skill, 20% Eligibility, 10% Career Interest).</li>
                <li>Executing automated skill gap calculations and recommending verified learning coursework.</li>
                <li>Displaying candidate qualification profiles to prospective employers solely when an application is explicitly submitted by the student.</li>
                <li>Providing institutional administrators with aggregated, non-personally identifiable cohort statistics, placement funnels, and industry demand analytics.</li>
                <li>Delivering transaction status notifications regarding application reviews, shortlisting decisions, and assessment results.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Lock size={18} className="text-indigo-600" />
                4. Data Security & Storage Controls
              </h2>
              <p className="mb-3">
                We implement technical and organizational controls to protect personal records against unauthorized access, loss, or manipulation:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>All user passwords are encrypted using Bcrypt with industry-standard salt rounds prior to database ingestion.</li>
                <li>Session authentication is governed via cryptographically signed JSON Web Tokens (JWT) with strict expiration limits.</li>
                <li>Access to candidate applications is restricted via role-based access control (RBAC) and ownership verification checks to prevent Insecure Direct Object References (IDOR).</li>
                <li>Document uploads are restricted to validated MIME formats with file size quotas (maximum 5MB) and filename sanitization.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                5. Disclosure & Third-Party Sharing
              </h2>
              <p>
                SkillForge does not sell, rent, or monetize personal student or institutional records. Information is shared strictly under the following operational conditions:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-2">
                <li><strong className="text-slate-800">Recruiters:</strong> Student data is accessible to an employer only after the student initiates an application for that employer's posting.</li>
                <li><strong className="text-slate-800">Faculty Reviewers:</strong> Academic portfolio submissions are shared with authorized institutional faculty for credential audit purposes.</li>
                <li><strong className="text-slate-800">Legal Compliance:</strong> Information may be disclosed where required by enforceable legal processes or institutional regulations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                6. User Rights & Data Retention
              </h2>
              <p>
                Users maintain the right to inspect, update, or request the deletion of their profile information and uploaded materials. Academic records verified by institutional administrators are retained in accordance with applicable educational retention guidelines. Requests for account deactivation may be directed through designated administrative channels.
              </p>
            </section>

            <section className="pt-6 border-t border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                7. Contact Information
              </h2>
              <p className="text-slate-600">
                For questions, concerns, or inquiries regarding this Privacy Policy, please contact the administrative governance team at:
              </p>
              <p className="mt-2 font-medium text-slate-800">
                Email: privacy@skillforge.edu | SkillForge Governance Office
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

export default PrivacyPolicy;
