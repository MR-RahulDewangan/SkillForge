# Academia–Industry Collaboration Portal (SIH 2026)
## End-to-End Senior QA & Security Engineering Audit Report

**Date of Audit**: September 23, 2026  
**Auditor**: Senior QA Engineer & Lead Security Architect  
**Environment**: Production-Equivalent Staging (Node.js API :5000, Python AI Microservice :8001, React Vite Frontend :3000, PostgreSQL Prisma ORM)  
**Overall Test Result**: **75 / 75 PASSED (100%)** — ZERO FAILURES  
**Security Status**: **HARDENED & VERIFIED** (All discovered vulnerabilities remediated and validated)

---

## 1. Executive Summary

A comprehensive quality assurance, end-to-end integration, and penetration security audit was conducted on the Academia–Industry Collaboration Portal. Testing encompassed all 4 core platform roles (**STUDENT**, **INDUSTRY**, **FACULTY**, **INSTITUTION_ADMIN**), all functional modules, every edge-case failure mode, and high-risk security threat vectors.

### Test Execution Metrics
| Category | Test Cases Executed | Passed | Failed | Pass Rate | Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Authentication & Auth** | 11 | 11 | 0 | 100% | ✅ PASSED |
| **JWT Security & Role Control** | 5 | 5 | 0 | 100% | ✅ PASSED |
| **Student Profile & Goal** | 5 | 5 | 0 | 100% | ✅ PASSED |
| **Skill Assessment & Scoring** | 6 | 6 | 0 | 100% | ✅ PASSED |
| **Skill Gap & Recommendations** | 3 | 3 | 0 | 100% | ✅ PASSED |
| **Opportunity Management & Search**| 7 | 7 | 0 | 100% | ✅ PASSED |
| **Deterministic Matching Engine** | 5 | 5 | 0 | 100% | ✅ PASSED |
| **Applications & Recruitment** | 8 | 8 | 0 | 100% | ✅ PASSED |
| **Digital Portfolio & IDOR Defense**| 7 | 7 | 0 | 100% | ✅ PASSED |
| **File Uploads & Malware Defense** | 4 | 4 | 0 | 100% | ✅ PASSED |
| **AI Features & Resilience** | 3 | 3 | 0 | 100% | ✅ PASSED |
| **Notifications & Verification** | 6 | 6 | 0 | 100% | ✅ PASSED |
| **Analytics (Institution & Industry)**| 5 | 5 | 0 | 100% | ✅ PASSED |
| **TOTAL** | **75** | **75** | **0** | **100%** | 🏆 **ALL PASS** |

---

## 2. Security Vulnerability Discoveries & Fixes

During the initial security audit, 5 critical and moderate vulnerabilities were uncovered. All were remediated immediately and re-verified through regression tests.

### Vulnerability 1: Privilege Escalation via Public Registration
* **Severity**: Critical (CVSS 9.1)
* **Finding**: The public registration schema and controller allowed any unauthenticated user to pass `role: 'INSTITUTION_ADMIN'` and immediately obtain full administrative rights.
* **Remediation**:
  1. Updated `schemas.auth.register` in `validations/schemas.js` to restrict role enum to `['STUDENT', 'INDUSTRY', 'FACULTY']`.
  2. Added an explicit controller guard in `authController.js` returning `403 Forbidden` if an administrative role is requested publicly.
* **Verification Test**: Automated penetration test attempting public admin registration was successfully blocked with HTTP 400/403.

### Vulnerability 2: Insecure Direct Object Reference (IDOR) on Digital Portfolio
* **Severity**: High (CVSS 8.5)
* **Finding**: `portfolioController.js` accepted `studentId` from the client request body on creation, and allowed any authenticated student to modify (`PUT`) or delete (`DELETE`) another student's projects and certificates by simply passing their UUID in the URL parameter.
* **Remediation**:
  1. Replaced client-provided `studentId` with the verified `student.id` resolved directly from `req.user.id`.
  2. Enforced ownership checks on all project and certificate mutation endpoints: verified `record.student.userId === req.user.id` (or `INSTITUTION_ADMIN`).
  3. Added input validation to reject blank titles and descriptions with `400 Bad Request`.
* **Verification Test**: Student 2 attempting to modify Student 1's project or delete Student 1's certificate returned `403 Forbidden`.

### Vulnerability 3: IDOR & Arbitrary Status Modification on Applications
* **Severity**: High (CVSS 8.3)
* **Finding**: `PATCH /api/applications/:applicationId/status` allowed any recruiter to modify the application status of any candidate belonging to another company's opportunity, without checking opportunity ownership.
* **Remediation**:
  1. Added ownership verification: `application.opportunity.company.userId === req.user.id` (or `INSTITUTION_ADMIN`).
  2. Added status validation against `VALID_STATUSES` enum (`APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW`, `SELECTED`, `REJECTED`).
  3. Returned `404 Not Found` for non-existent applications instead of 500 crashes.
* **Verification Test**: Cross-company status tampering rejected with `403 Forbidden`; invalid status values rejected with `400 Bad Request`.

### Vulnerability 4: File Upload & Remote Code Execution / Path Traversal Risk
* **Severity**: High (CVSS 7.8)
* **Finding**: The AI resume parsing endpoint lacked multipart file parsing middleware (`multer`), causing unhandled crashes. Additionally, unrestricted file uploads without extension/MIME validation posed risks of dangerous payloads (`.exe`, `.sh`).
* **Remediation**:
  1. Implemented `uploadMiddleware.js` using `multer` with a 5MB size limit.
  2. Configured strict MIME & extension filters (resumes: `.pdf` / `application/pdf`; certificates: `.pdf`, `.jpg`, `.jpeg`, `.png`).
  3. Sanitized filenames using regex stripping path traversal sequences (`../`, null bytes).
* **Verification Test**: Uploading executable payloads (`malicious.exe`) was successfully rejected with `400 Bad Request`; valid PDF and image documents uploaded cleanly.

### Vulnerability 5: IDOR on Matching Engine & Notification Marking
* **Severity**: Medium (CVSS 6.5)
* **Finding**: Any student could query `GET /api/matching/match/:studentId/:opportunityId` to inspect other students' match evaluations and skill gaps. Additionally, cross-user notification marking lacked ownership validation.
* **Remediation**:
  1. Restricted match queries: Students can only view their own score; recruiters can only view candidates for their opportunities.
  2. Implemented owner check in `notificationController.js` returning `403 Forbidden` if a user attempts to mark another user's notification as read.
* **Verification Test**: Cross-user match access and cross-user notification read requests blocked with `403 Forbidden`.

---

## 3. Role-by-Role Test Coverage Matrix

### Role: STUDENT (`student1@university.edu`)
| Journey Step | Endpoint Tested | Inputs / Scenarios | Result |
| :--- | :--- | :--- | :--- |
| **Authentication** | `POST /api/auth/login` | Valid email & password | ✅ 200 OK |
| **View Profile** | `GET /api/student/profile/me` | Valid Bearer token | ✅ 200 OK |
| **Select Goal** | `POST /api/student/career-goal` | Data Analyst role UUID | ✅ 200 OK |
| **Goal Validation** | `POST /api/student/career-goal` | Non-existent role UUID / Empty payload | ✅ 404 / 400 |
| **Assessment Questions** | `GET /api/assessments/questions/:id` | Valid skill UUID; verifies no answer leak | ✅ 200 OK |
| **Submit Assessment** | `POST /api/assessments/submit` | Valid answer array -> 100% score | ✅ 200 OK |
| **Assessment Inputs** | `POST /api/assessments/submit` | Missing input / non-existent skill | ✅ 400 / 404 |
| **Skill Gap Analysis** | `GET /api/gap/analyze` | Deterministic score vs benchmark | ✅ 200 OK |
| **Recommendations** | `GET /api/gap/analyze` | Returns course links for deficit skills | ✅ 200 OK |
| **Search Opportunities**| `GET /api/opportunities/search?q=QA` | Filter by title, type, remote workMode | ✅ 200 OK |
| **Opportunity Matching**| `GET /api/matching/match/:sId/:oId` | 70/20/10 weighted explainable formula | ✅ 200 OK |
| **Apply** | `POST /api/applications/apply` | Valid opportunity ID | ✅ 201 Created |
| **Duplicate Apply** | `POST /api/applications/apply` | Re-applying to same opportunity | ✅ 409 Conflict |
| **My Applications** | `GET /api/applications/student` | Verify applied status and company details | ✅ 200 OK |
| **Portfolio Project** | `POST /api/portfolio/projects` | Name, description, GitHub URL | ✅ 201 Created |
| **Portfolio Cert** | `POST /api/portfolio/certificates` | Name, issuer, issue date, credential URL | ✅ 201 Created |
| **Resume Upload** | `POST /api/portfolio/resume/upload` | Multipart valid PDF document (<5MB) | ✅ 200 OK |
| **AI Resume Parser** | `POST /api/ai/parse-resume` | Multipart PDF -> skills extraction | ✅ 200 OK |
| **AI Career Guidance**| `POST /api/ai/assistant` | "what skills should i learn for it" | ✅ 200 OK (Gemini 3.6 Flash) |
| **Notifications** | `GET /api/notifications` | Application shortlisted alerts | ✅ 200 OK |

---

### Role: INDUSTRY (`recruiter@innovatetech.com`)
| Journey Step | Endpoint Tested | Inputs / Scenarios | Result |
| :--- | :--- | :--- | :--- |
| **Authentication** | `POST /api/auth/login` | Valid recruiter credentials | ✅ 200 OK |
| **Post Opportunity** | `POST /api/opportunities` | Internship with stipend, CGPA, skills | ✅ 201 Created |
| **Invalid Post** | `POST /api/opportunities` | Missing title/skills/deadline | ✅ 400 Bad Request |
| **Candidate Matches** | `GET /api/matching/recommendations/candidates/:id` | Ranked applicants by compatibility | ✅ 200 OK |
| **View Applicants** | `GET /api/applications/company` | Received applications with student data | ✅ 200 OK |
| **Shortlist Applicant** | `PATCH /api/applications/:id/status` | `status: "SHORTLISTED"` | ✅ 200 OK |
| **Invalid Status** | `PATCH /api/applications/:id/status` | `status: "BOGUS_STATUS"` | ✅ 400 Bad Request |
| **Recruiter Analytics** | `GET /api/analytics/recruiter` | Postings overview, hiring funnel, matches | ✅ 200 OK |
| **AI Job Parser** | `POST /api/ai/parse-jd` | Unstructured JD text -> skills & reqs | ✅ 200 OK |

---

### Role: FACULTY (`faculty1@university.edu`)
| Journey Step | Endpoint Tested | Inputs / Scenarios | Result |
| :--- | :--- | :--- | :--- |
| **Authentication** | `POST /api/auth/login` | Valid faculty credentials | ✅ 200 OK |
| **Verification Queue**| `GET /api/student/all` | View students with unverified projects/certs | ✅ 200 OK |
| **Verify Project** | `PATCH /api/verify/project/:id` | `isVerified: true` -> triggers notification | ✅ 200 OK |
| **Verify Certificate**| `PATCH /api/verify/certificate/:id` | `isVerified: true` -> verified status | ✅ 200 OK |
| **Non-existent Item** | `PATCH /api/verify/project/000-000` | Non-existent UUID | ✅ 404 Not Found |
| **Wrong Role Guard** | `PATCH /api/verify/project/:id` | Student attempting to self-verify | ✅ 403 Forbidden |

---

### Role: INSTITUTION_ADMIN (`admin@institution.edu`)
| Journey Step | Endpoint Tested | Inputs / Scenarios | Result |
| :--- | :--- | :--- | :--- |
| **Authentication** | `POST /api/auth/login` | Valid administrator credentials | ✅ 200 OK |
| **Institution KPIs** | `GET /api/analytics/overview` | Total students, readiness count, avg score | ✅ 200 OK |
| **Industry Demand** | `GET /api/analytics/industry-demand` | Top in-demand skills ranked by postings | ✅ 200 OK |
| **Student Skill Gaps**| `GET /api/analytics/student-gaps` | Average gap per skill across student body | ✅ 200 OK |
| **Placement Funnel** | `GET /api/analytics/funnel` | Applications by stage (Applied -> Selected) | ✅ 200 OK |
| **Department Stats** | `GET /api/analytics/departments` | Breakdown by branch & placement readiness | ✅ 200 OK |
| **Verify Company** | `PATCH /api/company/verify/:id` | Mark enterprise partner verified | ✅ 200 OK |
| **Non-existent Comp** | `PATCH /api/company/verify/000-000`| Non-existent company ID | ✅ 404 Not Found |

---

## 4. Matching Engine Validation

In strict adherence to `AGENTS.md`, the platform matching engine is **100% deterministic and explainable**, governed by the formula:

$$\text{Final Score} = (0.70 \times \text{SkillMatch}) + (0.20 \times \text{EligibilityScore}) + (0.10 \times \text{InterestScore})$$

### Automated Formula Verification Test Case:
* **Student**: `Alice One` (SQL: 90, Python: 85, Power BI: 80, Statistics: 78, Communication: 70; CGPA: 8.4; B.Tech Computer Science 2026)
* **Opportunity**: `QA Automated Test Engineer Intern` (Requires SQL: 70, Min CGPA: 7.5, B.Tech CS 2026)
* **Calculation Output**:
  - `skillMatch`: **100%** (Student meets required score)
  - `eligibilityScore`: **100%** (CGPA 8.4 $\ge$ 7.5, Degree & Branch match)
  - `interestScore`: **100%** (Aligned with student's career role)
  - `overallMatch`: $0.70(100) + 0.20(100) + 0.10(100) = \mathbf{100\%}$
* **Explainable Payload Verified**:
  - `matchingSkills`: `["SQL"]`
  - `missingSkills`: `[]`
  - `skillGaps`: `[]`
  - `eligibilityIssues`: `[]`
* **Test Verdict**: **PASS** — Numerical calculation exactly matches mathematical benchmark with complete explainability.

---

## 5. Security & Threat Vector Defense Matrix

| Threat Vector | Attack Scenario | Defense Mechanism | Test Status |
| :--- | :--- | :--- | :---: |
| **Privilege Escalation** | Attacker registers with `role: "INSTITUTION_ADMIN"` | Schema enum filter + Controller guard | ✅ BLOCKED (403) |
| **IDOR (Portfolio)** | Student 2 sends `PUT /api/portfolio/projects/<Student1_ID>` | Ownership verification on `student.userId` | ✅ BLOCKED (403) |
| **IDOR (Application)** | Recruiter A updates application for Recruiter B's job | Company ownership check on opportunity | ✅ BLOCKED (403) |
| **IDOR (Notifications)**| User A marks User B's notification read | Owner ID verification in notification store | ✅ BLOCKED (403) |
| **IDOR (Match Details)**| Student A views match breakdown of Student B | Role-based identity check on `studentId` | ✅ BLOCKED (403) |
| **JWT Tampering** | Tampered signature or malformed base64 string | `jwt.verify` rejects invalid signatures | ✅ BLOCKED (401) |
| **Missing Auth** | Request to protected API without `Bearer` header | `authenticate` middleware gatekeeper | ✅ BLOCKED (401) |
| **Wrong Role Access** | Student calls `/api/analytics/overview` | `authorize('INSTITUTION_ADMIN')` | ✅ BLOCKED (403) |
| **Malicious File Upload**| Attacker uploads `malicious.exe` to resume endpoint | MIME & extension filter (`application/pdf`) | ✅ BLOCKED (400) |
| **Path Traversal** | Filename with `../../etc/passwd` | Filename sanitization via basename regex | ✅ MITIGATED |
| **DoS File Upload** | Uploading files > 5MB | Multer `limits: { fileSize: 5MB }` | ✅ BLOCKED (400) |
| **Data Leakage** | API exposes user password hash or quiz answers | Explicit Prisma `select` / projection guards | ✅ ZERO LEAKS |
| **Duplicate Requests** | Student spams apply endpoint multiple times | Database unique constraint + duplicate 409 check | ✅ BLOCKED (409) |

---

## 6. End-to-End Major User Journey Certification

The platform was verified against the primary SIH 2026 demo workflows:

1. **Student Journey (10 Steps)**:
   - Login $\rightarrow$ Select Career Role (Data Analyst) $\rightarrow$ Take Assessment $\rightarrow$ Receive Verified Skill Profile $\rightarrow$ View Gap Analysis $\rightarrow$ Receive Course Recommendations $\rightarrow$ Search Internships $\rightarrow$ View Explainable Match % $\rightarrow$ Apply $\rightarrow$ Manage Portfolio & AI Career Guidance. **Status: 100% Functional.**
2. **Industry Journey (4 Steps)**:
   - Login $\rightarrow$ Post Internship $\rightarrow$ View Matched Candidates $\rightarrow$ Shortlist Applicant $\rightarrow$ Track Recruitment Funnel. **Status: 100% Functional.**
3. **Faculty Journey (3 Steps)**:
   - Login $\rightarrow$ View Student Verification Queue $\rightarrow$ Inspect and Verify Project & Certificate Credentials. **Status: 100% Functional.**
4. **Institution Admin Journey (4 Steps)**:
   - Login $\rightarrow$ Review Student Skill Gaps $\rightarrow$ Analyze Industry Demand $\rightarrow$ Inspect Placement Funnel & KPIs. **Status: 100% Functional.**

---

## 7. Sign-off & Conclusion

All 75 automated integration tests across all roles and system components passed with zero errors. All discovered security vulnerabilities (Privilege Escalation, IDOR, and File Upload flaws) have been patched and verified. The application is robust, deterministic, secure, and ready for deployment.

**Signed**:  
*Senior QA Engineer & Security Architect*  
*Academia–Industry Collaboration Platform (SIH 2026)*
