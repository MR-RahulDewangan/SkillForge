# Project TODO List

This document lists the remaining work required to bring the Academia–Industry Collaboration Portal to a production-ready state for the SIH Demo.

## 🔴 High Priority (Critical for Demo)

### 1. Industry-Side Implementation
- [ ] **Company Dashboard**: Create a landing page for Industry users to manage their profile.
- [ ] **Opportunity Management**: Implement the "Post Internship/Job" form (Frontend + Backend).
- [ ] **Applicant Tracking System (ATS)**: Create a view for recruiters to see all applications for a specific job.
- [ ] **Matching Integration**: Integrate the deterministic matching score into the recruiter's view so they can see *why* a candidate is a good match.

### 2. Student Application Flow
- [ ] **Job Search Page**: Create a searchable list of opportunities.
- [ ] **One-Click Apply**: Implement the "Apply" button that links a student to an opportunity.
- [ ] **Application Status Tracker**: a "My Applications" page for students to see if they were shortlisted/selected.

### 3. AI Integration (Frontend)
- [ ] **Career Assistant Chat**: Implement the UI for the AI Career Assistant in the Student Dashboard.
- [ ] **Resume Parser UI**: Create a "Upload Resume to Auto-Fill Profile" feature using the existing `/parse-resume` endpoint.

---

## 🟡 Medium Priority (Quality & Polish)

### 4. Institutional Analytics
- [ ] **Industry Demand Report**: a page showing which skills are most requested by companies.
- [ ] **Placement Analytics**: Charts showing the percentage of students placed vs. unemployed.
- [ ] **Departmental Breakdown**: Analytics filtered by academic branch.

### 5. Student Experience
- [ ] **Resume Generator**: Implement a "Download PDF Resume" feature based on verified skills.
- [ ] **Gamification**: Add badges for skill milestones (e.g., "SQL Expert").
- [ ] **Learning Roadmaps**: Transition from single course recs to a step-by-step path.

---

## 🟢 Low Priority (Hardening & Optimization)

### 6. Security & Stability
- [ ] **Input Validation**: implement `Zod` or `Joi` for all POST/PUT request bodies.
- [ ] **Error Handling**: Standardize API error responses across all controllers.
- [ ] **Loading States**: Add skeletons/spinners to all frontend fetch calls.
- [ ] **Empty States**: Improve "No data found" screens for portfolio and applications.

### 7. Deployment
- [ ] **Production Build**: Configure Vite for production.
- [ ] **Dockerization**: Create `Dockerfile` for server and AI service.
- [ ] **CI/CD**: Basic GitHub Actions for testing.
