# Project TODO List

This document lists the remaining work required to bring the Academia–Industry Collaboration Portal to a production-ready state for the SIH Demo.

## 🔴 High Priority (Critical for Demo)

### 1. Industry-Side Implementation
- [x] **Company Dashboard**: Create a landing page for Industry users to manage their profile.
- [x] **Opportunity Management**: Implement the "Post Internship/Job" form (Frontend + Backend).
- [x] **Applicant Tracking System (ATS)**: Create a view for recruiters to see all applications for a specific job.
- [x] **Matching Integration**: Integrate the deterministic matching score into the recruiter's view so they can see *why* a candidate is a good match.

### 2. Student Application Flow
- [x] **Job Search Page**: Create a searchable list of opportunities with live match percentage.
- [x] **One-Click Apply**: Implement the "Apply" button that links a student to an opportunity.
- [x] **Application Status Tracker**: a "My Applications" page for students to see if they were shortlisted/selected.

### 3. AI Integration (Frontend & Backend)
- [x] **Career Assistant Chat**: Implement the UI for the AI Career Assistant in the Student Dashboard with Ollama/fallback support.
- [x] **Resume Parser UI**: Create a "Upload Resume to Auto-Fill Profile" feature using `/parse-resume` and `/api/resume/autofill`.

---

## 🟡 Medium Priority (Quality & Polish)

### 4. Institutional Analytics
- [x] **Industry Demand Report**: a page showing which skills are most requested by companies.
- [x] **Placement Analytics**: Charts showing the percentage of students placed vs. unemployed.
- [x] **Departmental Breakdown**: Analytics filtered by academic branch.

### 5. Student Experience
- [x] **Resume Generator**: Implement a "Download PDF Resume" feature based on verified skills (`ResumeBuilder.jsx`, `GET /api/student/resume`).
- [x] **Gamification**: Add badges for skill milestones (e.g., "SQL Expert", "Skill Pioneer", "Domain Specialist", "Industry Ready" in `SkillProfile.jsx`).
- [x] **Learning Roadmaps**: Transition from single course recs to a sequential 4-phase milestone path (`SkillGapDashboard.jsx`).

---

## 🟢 Low Priority (Hardening & Optimization)

### 6. Security & Stability
- [x] **Input Validation**: implemented `Zod` schemas for auth, opportunity, and portfolio endpoints.
- [x] **Error Handling**: Standardized API error responses across all controllers via `errorHandler.js`.
- [x] **Loading States**: Skeletons/spinners in frontend fetch calls (`UIFeedback.jsx`).
- [x] **Empty States**: Empty state components for portfolio, search, and applications.

### 7. Deployment
- [x] **Production Build**: Configured Vite for production (compiled successfully).
- [x] **Dockerization**: Created `Dockerfile` for `apps/server`, `apps/web`, `apps/ai-service`, and root `docker-compose.yml`.
- [x] **CI/CD**: Created GitHub Actions workflow `.github/workflows/ci.yml` validating backend, frontend, and AI service.
