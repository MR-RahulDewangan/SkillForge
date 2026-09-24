# Academia–Industry Collaboration Portal (SIH 2026)
# AI_CONTEXT.md — Long-Term Persistent Project Memory

> **Notice for Future AI Agents**: This document is the primary source of truth for the project. Read this file before inspecting or modifying code. Do not rewrite existing architecture or repeat completed tasks without checking this file.

---

## 1. PROJECT IDENTITY

* **Project Name**: Academia–Industry Collaboration Portal (SIH 2026)
* **Purpose**: A comprehensive SaaS platform connecting **Students**, **Industries**, **Faculty**, and **Educational Institutions** to bridge the academia-industry skill gap.
* **Core Product Workflow**:
  $$\text{Industry Demand} \rightarrow \text{Student Assessment} \rightarrow \text{Skill Profile} \rightarrow \text{Gap Analysis} \rightarrow \text{Recommendations} \rightarrow \text{Matching} \rightarrow \text{Application} \rightarrow \text{Recruitment} \rightarrow \text{Analytics}$$
* **Current Stage**: **Feature-Complete Core Workflows, Security-Hardened, and Verified** (75/75 automated end-to-end tests passing).
* **Main Technologies**:
  * **Frontend**: React 18 (SPA), Vite 5, Tailwind CSS, Lucide Icons, React Router v6, Zustand, Axios.
  * **Backend API**: Node.js v24, Express 4.18, Prisma ORM v5, PostgreSQL 16, JWT, Bcryptjs, Multer, Zod.
  * **AI Microservice**: Python 3.12, FastAPI, Uvicorn, OpenAI SDK, PyMuPDF, Google AI Studio Gemini API (`gemini-3.6-flash`).
  * **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`).
* **GitHub Repository**: [https://github.com/MR-RahulDewangan/SkillForge.git](https://github.com/MR-RahulDewangan/SkillForge.git)
* **Active Port Mapping**:
  * Frontend: `http://localhost:3000`
  * Backend API: `http://localhost:5000`
  * AI Service: `http://localhost:8001` *(Note: Remapped from 8000 due to external machine port occupancy)*

---

## 2. CURRENT OBJECTIVE

* **Larger Goal**: Prepare an enterprise-grade, deployment-ready submission for the Smart India Hackathon (SIH 2026) meeting all specifications in `AGENTS.md`.
* **Immediate Task**: Session handoff document creation following a 100% successful end-to-end QA and security audit (75/75 tests passing). All discovered security vulnerabilities (Privilege Escalation, IDOR, File Upload risks) have been remediated.

---

## 3. CURRENT STATE

### Feature Status Summary
* **Authentication & RBAC**: `DONE` (JWT-based, 4 roles: `STUDENT`, `INDUSTRY`, `FACULTY`, `INSTITUTION_ADMIN`).
* **Student Skill Assessment**: `DONE` (Question bank, no-leak answers, deterministic scoring, score tracking).
* **Deterministic Skill Gap Analysis**: `DONE` (Readiness percentage, gap severity: `MINOR`, `MODERATE`, `CRITICAL`).
* **Learning Recommendations**: `DONE` (Direct course links from database mapped to deficit skills).
* **Opportunity Management & Search**: `DONE` (Postings, multi-parameter filtering by type, mode, keyword, location, skills).
* **Deterministic Matching Engine**: `DONE` (Strictly follows $0.70 \times \text{Skill} + 0.20 \times \text{Eligibility} + 0.10 \times \text{Interest}$ with complete explainable breakdown).
* **Applications & Recruitment**: `DONE` (Application flow, duplicate prevention, candidate match ranking, recruiter shortlisting/rejection).
* **Digital Portfolio & File Uploads**: `DONE` (Projects, certificates, secure PDF resume upload via Multer with 5MB limit, sanitized filenames).
* **AI Integrations**: `DONE` (Resume parsing, JD parsing, semantic match analysis, live Google Gemini 3.6 Flash career assistant with in-app stop response button).
* **Verification Queue**: `DONE` (Faculty/Admin review queue for student projects, certificates, and skills).
* **Notifications System**: `DONE` (Dispatched on application status changes and credential verification; IDOR protected).
* **Institutional & Recruiter Analytics**: `DONE` (Overview KPIs, industry skill demand, student skill gaps, placement funnel, department metrics, recruiter candidate quality).
* **Advanced Faculty Collaboration**: `NOT STARTED` / `OPTIONAL` (FDPs, research consultancy postings from secondary spec).

### Known Limitations
* Local Ollama server (`http://localhost:11434`) threw memory allocation errors on `deepseek-r1:7b`. The system uses Google Gemini 3.6 Flash via Google AI Studio API (`GEMINI_API_KEY`) as the primary LLM with multi-tier deterministic rule-based fallbacks.
* Port 8000 on the host machine is occupied by an external service (`THERMOS`), so `apps/ai-service` is hosted on port **8001**.

---

## 4. EXACT STOPPING POINT

```text
LAST KNOWN STATE

Task: Integrated all 9 root CSV datasets into PostgreSQL + Prisma schema, built robust seeder, verified 100% referential integrity, and confirmed end-to-end user flows.
Current file: AI_CONTEXT.md
Current function/component: Project Architecture & Seed Data Integration
Last completed change: Successfully migrated schema with `20260923130942_sync_csv_schema`, seeded 15 skills, 5 roles, 18 career skills, 4 companies, 6 opportunities, 6 students, 10 assessment questions, 8 learning resources, and 6 applications with zero orphan records. Verified 100% test pass rate across both verification scripts and automated test suites.
Current incomplete change: None in code.
Next logical change: Ready for live demonstration or final presentation packaging.
Reason work stopped: Requested task completed successfully.
```

---

## 5. DEVELOPMENT HISTORY

* **2026-09-20**: Initialized monorepo with `apps/web` (React/Vite), `apps/server` (Express/Prisma), and `apps/ai-service` (FastAPI).
* **2026-09-21**: Seeded database with realistic students, companies, skills, career roles, opportunities, courses, and assessment questions.
* **2026-09-22**: Implemented deterministic matching engine ($0.70 \times \text{Skill} + 0.20 \times \text{Eligibility} + 0.10 \times \text{Interest}$) and institutional analytics.
* **2026-09-23 (Morning)**: Integrated ATS resume builder, digital portfolio verification dashboard, and Docker containerization.
* **2026-09-23 (Night)**: Integrated 9 CSV Datasets from root `data/`:
  - Inspected and mapped `skills.csv` (15), `career_roles.csv` (5), `career_skills.csv` (18), `companies.csv` (4), `opportunities.csv` (6), `students.csv` (6), `assessment_questions.csv` (10), `learning_resources.csv` (8), and `applications.csv` (6).
  - Executed non-destructive Prisma migration: `20260923130942_sync_csv_schema`.
  - Built robust, idempotent CSV parser and seeder in `apps/server/prisma/seed.js` with 0 orphan records.
  - Verified 100% referential integrity across all models and foreign keys (`apps/server/verify_datasets.js`).
  - Validated complete end-to-end user workflow from student login to assessment, profile, gap analysis, learning recommendations, opportunity search, deterministic matching, application submission, and application tracking (`apps/server/test_complete_flow.js`).
  - All 75/75 QA and security tests passing.
* **2026-09-24**:
  - Hardened authentication controllers with automatic email trimming and lowercase normalization (`authController.js`).
  - Enhanced frontend login page with explicit offline backend error messages and 1-click Quick Fill Demo account buttons for Student, Data Analyst, Recruiter, and Admin (`Login.jsx`).
  - Created automated login test suite (`apps/server/tests/test_all_logins.js`) verifying 100% pass rate (12/12) across all demo accounts.
  - Added SPA client-side routing fallback configuration (`apps/web/public/_redirects` and `apps/web/vercel.json`).
  - Added dynamic `VITE_API_URL` environment variable support to frontend Axios client (`apps/web/src/api/authApi.js`).
  - Added production build and seed startup scripts (`npm run build`, `npm run prod`) in `apps/server/package.json` for one-click cloud deployment on Render/Railway.
  - Pushed all production-ready changes to GitHub repository: `https://github.com/MR-RahulDewangan/SkillForge.git`.

---

## 6. ARCHITECTURE

```text
React 18 SPA (Vite :3000)
    │
    │ HTTP / JSON (Axios + Bearer JWT Interceptor)
    ▼
Node.js Express API (:5000)
    ├── Auth & RBAC Middleware (STUDENT, INDUSTRY, FACULTY, INSTITUTION_ADMIN)
    ├── Validations Layer (Zod Schemas + Controller Guards)
    ├── Upload Middleware (Multer: 5MB limit, PDF/Image filters, Path Traversal Sanitization)
    ├── Controllers (Auth, Student, Opportunity, Application, Matching, Portfolio, Analytics, Notifications)
    ├── Notification Service (In-memory store with user ownership tracking)
    ├── Prisma ORM v5
    │     ▼
    ├── PostgreSQL 16 Database (:5432)
    │
    └── HTTP Proxy (Timeout: 25s + Deterministic Fallback)
          ▼
FastAPI AI Microservice (:8001)
    ├── Google AI Studio API (gemini-3.6-flash via OpenAI-compatible SDK)
    ├── PyMuPDF (PDF resume text & skill extraction)
    └── Rule-Based Fallback Engine (Context-aware career advice & skill matching)
```

---

## 7. IMPORTANT FILES

| File / Directory | Purpose | Status | Important Notes |
| :--- | :--- | :---: | :--- |
| `AGENTS.md` | Core SIH project requirements & constraints | Active | Must be followed at all times. Do NOT rebuild existing features. |
| `TEST_REPORT.md` | Comprehensive QA & Security Audit Report | Verified | Documents 75/75 passing tests and security remediation. |
| `apps/server/src/index.js` | Express app entry point & route mounting | Hardened | Mounts all 13 route modules, CORS, and error handlers. |
| `apps/server/src/middleware/authMiddleware.js` | JWT verification and RBAC authorization | Hardened | Enforces `authenticate` and `authorize(...roles)`. |
| `apps/server/src/middleware/uploadMiddleware.js` | File upload security handler | Hardened | 5MB limit, PDF/image filters, path traversal sanitization. |
| `apps/server/src/controllers/portfolioController.js` | Portfolio projects & certificates | Hardened | Strict IDOR checks (`student.userId === req.user.id`). |
| `apps/server/src/controllers/applicationController.js` | Application submission & recruiter status | Hardened | Enforces company ownership on status updates & duplicate checks. |
| `apps/server/src/services/matchingService.js` | Deterministic matching engine | Verified | Strict mathematical formula ($0.70 \times \text{Skill} + 0.20 \times \text{Elig} + 0.10 \times \text{Int}$). |
| `apps/server/src/services/notificationService.js` | In-memory notification service | Active | Dispatches alerts on status updates & credential verification. |
| `apps/ai-service/app/main.py` | FastAPI AI microservice | Active | Powered by Google Gemini 3.6 Flash on port 8001. |
| `apps/server/tests/e2e_qa_security.test.js` | 75-test automated QA/security runner | Verified | Run with `node tests/e2e_qa_security.test.js`. |
| `apps/web/src/pages/CareerAssistant.jsx` | AI Career Assistant with stop response | Active | Features AbortController to halt live streaming answer. |

---

## 8. CODING DECISIONS

1. **Deterministic Matching Engine**:
   * *Decision*: The numerical match score is computed mathematically in backend business logic ($0.70 \times \text{Skill} + 0.20 \times \text{Eligibility} + 0.10 \times \text{Interest}$).
   * *Reason*: Required by `AGENTS.md`. LLMs hallucinate scores and lack explainability.
   * *Alternatives Considered*: LLM prompt-based scoring (rejected).
2. **Google Gemini 3.6 Flash via OpenAI Client SDK**:
   * *Decision*: Pointed OpenAI SDK to `https://generativelanguage.googleapis.com/v1beta/openai/` using `gemini-3.6-flash`.
   * *Reason*: Fast generation, high reasoning capability, zero local GPU overhead.
   * *Alternatives Considered*: Local Ollama (failed on current host due to memory limits).
3. **Port 8001 for AI Microservice**:
   * *Decision*: Remapped `apps/ai-service` to port 8001.
   * *Reason*: Port 8000 was already bound by an external project (`THERMOS`) on the Windows host.
4. **Server-Side Session Identity (IDOR Mitigation)**:
   * *Decision*: Mutating endpoints (portfolio, application status, assessments) discard client-provided IDs and bind strictly to JWT `req.user.id`.
   * *Reason*: Prevents parameter tampering attacks.

---

## 9. KNOWN PROBLEMS & RESOLUTIONS

* **Problem 1 (Resolved)**: Public registration allowed creating `INSTITUTION_ADMIN` accounts.
  * *Resolution*: Restricted Zod schema to `STUDENT`, `INDUSTRY`, `FACULTY` and added 403 guard in `authController.js`.
* **Problem 2 (Resolved)**: Students could edit or delete other students' portfolio projects by ID.
  * *Resolution*: Added database ownership check in `portfolioController.js` comparing `project.student.userId` with `req.user.id`.
* **Problem 3 (Resolved)**: Recruiters could alter application statuses for other companies.
  * *Resolution*: Added company ownership verification on opportunity in `applicationController.js`.
* **Problem 4 (Resolved)**: Resume parsing crashed without Multer.
  * *Resolution*: Installed Multer, created `uploadMiddleware.js`, added PDF MIME check and 5MB limit.
* **Problem 5 (Resolved)**: `getStudentGaps` returned 500 error due to missing `skill: true` inclusion in Prisma query.
  * *Resolution*: Included `skill: true` in `careerGoal.skills` query and added null check for `rs.skill`.

---

## 10. TESTING STATE

* **Automated Tests**: 75 tests written in `apps/server/tests/e2e_qa_security.test.js`.
* **Status**: **75 / 75 PASSED (100%)**.
* **Command to Run Tests**:
  ```bash
  cd "F:\SIH26\New folder\apps\server"
  node tests/e2e_qa_security.test.js
  ```
* **Frontend Production Build**:
  ```bash
  cd "F:\SIH26\New folder\apps\web"
  npm run build
  ```
  *(Verified: Builds clean in ~1.9s with 0 errors).*

---

## 11. DEPENDENCIES

* **`apps/server`**:
  * `@prisma/client` (^5.0.0): Database ORM.
  * `axios` (^1.20.0): HTTP client for AI microservice communication.
  * `bcryptjs` (^2.4.3): Password hashing (salt rounds: 10).
  * `express` (^4.18.2): Web framework.
  * `jsonwebtoken` (^9.0.1): JWT token generation and verification.
  * `multer` (^1.4.5-lts.1): Secure multipart file upload handling (NEW).
  * `zod` (^3.24.2): Schema validation.
* **`apps/ai-service`**:
  * `fastapi`, `uvicorn`, `openai`, `pymupdf` (PyMuPDF).
* **`apps/web`**:
  * `react` (^18.2.0), `vite` (^5.0.0), `tailwindcss` (^3.3.0), `lucide-react`, `zustand`.

---

## 12. ENVIRONMENT

* **Operating System**: Windows 11
* **Node.js**: v24.13.1
* **Python**: 3.12
* **Database**: PostgreSQL 16
* **Environment Secrets Status**:
  * `DATABASE_URL` = `CONFIGURED`
  * `JWT_SECRET` = `CONFIGURED`
  * `GEMINI_API_KEY` = `CONFIGURED`
  * `AI_MODEL` = `gemini-3.6-flash`
  * `AI_SERVICE_URL` = `http://localhost:8001`
  * `PORT` = `5000`

---

## 13. AI AGENT INSTRUCTIONS

Before making changes:
1. Read `AI_CONTEXT.md` and `SESSION_HANDOFF.md`.
2. Inspect the files relevant to the current task.
3. Check whether the documented state still matches the actual project.
4. Do not assume the context file is perfect.
5. Preserve existing architectural decisions unless there is a clear reason to change them.
6. Continue from the documented "EXACT STOPPING POINT".
7. If the current code differs from the documented state, investigate before modifying it.
8. Do not repeat work that is already marked completed.
9. Do not rewrite unrelated parts of the project.
10. Explain the plan before significant changes.
11. After completing work, update `AI_CONTEXT.md` and `SESSION_HANDOFF.md`.
12. Before ending the session, update the exact stopping point.

---

## 14. NEXT SESSION INSTRUCTIONS

```text
NEXT SESSION STARTUP

1. Read AI_CONTEXT.md and SESSION_HANDOFF.md.
2. Inspect the current project state (git status, running services).
3. Verify the documented stopping point.
4. Inspect the relevant files.
5. Identify whether the previous task is still incomplete.
6. Continue from "NEXT LOGICAL ACTION".
7. Do not restart completed work.
8. Update AI_CONTEXT.md when progress is made.
```

---

## 15. IMMEDIATE NEXT ACTION

```text
NEXT LOGICAL ACTION

Task: Prepare and rehearse the complete SIH 2026 live presentation demo flow (Student -> Industry -> Faculty -> Institution Admin).
File(s): apps/web/src/pages/Dashboard.jsx, apps/web/src/pages/CareerAssistant.jsx, apps/web/src/pages/VerificationDashboard.jsx
Action: Walk through the 18-step SIH demo workflow specified in AGENTS.md in the browser at http://localhost:3000 to ensure seamless UI presentation and visual polish.
Expected result: Flawless demo execution with verified skill matches, live AI guidance, instant shortlisting, and institutional analytics rendering.
Verification: Test login as student1@university.edu, recruiter@innovatetech.com, faculty1@university.edu, and admin@institution.edu in the web interface.
Dependencies/blockers: Backend (:5000) and AI Service (:8001) must remain running.
```

---

## 16. SESSION CHECKPOINT

```text
LAST SESSION CHECKPOINT

Date: 2026-09-23
AI agent: Antigravity (Google DeepMind)
Current task: Persistent Project Handoff Documentation
Current state: COMPLETE (All core features operational, 75/75 tests passing, hardened against IDOR & privilege escalation)
Last completed action: Created AI_CONTEXT.md and SESSION_HANDOFF.md; verified against codebase.
Current incomplete action: None.
Next action: Rehearse live SIH demo presentation flow or extend optional faculty features.
Known blocker: None.
Files changed: AI_CONTEXT.md, SESSION_HANDOFF.md
Tests/status: 75/75 passing (node tests/e2e_qa_security.test.js)
Important decision: Kept matching engine 100% deterministic; Google Gemini 3.6 Flash active for AI Career Assistant with in-app stop streaming button.
```
