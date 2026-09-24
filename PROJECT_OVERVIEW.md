# Project Overview: Academia–Industry Collaboration Portal (SkillForge)

## 1. Executive Summary
SkillForge is a multi-tier web application designed to bridge the skill deficit between academic institutions and industry employers. The platform enables student competency evaluation, deterministic skill gap computation, contextual learning resource alignment, automated internship and job matching, applicant tracking, and institutional workforce analytics.

---

## 2. Core Capabilities
* **Role-Based Access Control**: Tailored workflows and granular access permissions for Students, Industry Recruiters, Faculty, and Institutional Administrators.
* **Deterministic Skill Assessment**: MCQ-based evaluation engine measuring technical proficiencies against standardized role benchmarks.
* **Explainable Matching Engine**: A deterministic matching algorithm evaluating candidates across skill compatibility (70%), academic eligibility criteria (20%), and career interest overlap (10%).
* **Skill Gap Analysis & Recommendations**: Automated identification of skill deficits paired directly with curated learning materials.
* **Applicant Tracking System (ATS)**: End-to-end recruitment lifecycle tracking covering job postings, candidate submissions, shortlisting, and status notifications.
* **Academic Verification Queue**: Faculty-supervised audit mechanisms for authenticating student projects, credentials, and achievements.
* **Institutional Analytics**: Aggregated real-time metrics analyzing industry hiring trends, departmental performance, and placement outcomes.

---

## 3. System Architecture & Directory Structure

```text
SkillForge/
├── apps/
│   ├── web/            # Frontend Single Page Application (SPA)
│   ├── server/         # Backend Core REST API
│   └── ai-service/     # AI & Document Processing Microservice
├── data/               # Canonical Baseline Datasets (CSV)
├── prisma/             # Primary Database Schema & Migrations
└── docker-compose.yml  # Multi-Service Container Orchestration
```

---

## 4. Module Specifications & Functional Breakdown

### 4.1. Web Application Client (`apps/web/`)
* **Location**: `apps/web/src/`
* **Technologies**: React 18, Vite 5, Tailwind CSS, React Router, Zustand, Axios
* **Functional Scope**:
  * `pages/Login.jsx`, `pages/Register.jsx`: Public authentication and account provisioning interfaces.
  * `pages/Dashboard.jsx`: Central routing hub directing users to role-specific workspaces.
  * `pages/SkillAssessment.jsx`, `pages/AssessmentCenter.jsx`: Technical MCQ examination delivery interfaces.
  * `pages/SkillProfile.jsx`: Graphical representation of verified student skills and proficiency tiers.
  * `pages/SkillGapDashboard.jsx`: Comparative deficiency visualizer with integrated educational resource directories.
  * `pages/JobSearchPage.jsx`: Opportunity discovery catalog with real-time match percentage breakdowns.
  * `pages/MyApplications.jsx`: Candidate application progress tracker.
  * `pages/CompanyDashboard.jsx`, `pages/ApplicantTrackingSystem.jsx`: Recruiter interface for posting positions and managing candidate pipelines.
  * `pages/InstitutionAnalytics.jsx`, `pages/RecruiterAnalytics.jsx`: Executive intelligence dashboards displaying demographic and hiring statistics.
  * `pages/VerificationDashboard.jsx`: Administrative and faculty queue for reviewing submitted portfolios.
  * `pages/CareerAssistant.jsx`: Conversational career guidance interface.
  * `api/`: Modular HTTP service layer handling authenticated API communication.

### 4.2. Core Backend REST API (`apps/server/`)
* **Location**: `apps/server/src/`
* **Technologies**: Node.js, Express, Prisma ORM, PostgreSQL, JSON Web Tokens (JWT), Bcrypt, Multer
* **Functional Scope**:
  * `routes/`: Network route definitions enforcing HTTP method specifications and authorization gates.
  * `controllers/authController.js`: Registration, credential verification, and JWT issuance.
  * `controllers/studentController.js`: Student profile management, academic records, and career track configuration.
  * `controllers/skillController.js`: Skill taxonomy and benchmark definitions.
  * `controllers/assessmentController.js`: Question bank retrieval, test submission processing, and scoring logic.
  * `controllers/gapController.js`: Mathematical deficit calculations comparing user score profiles against target career roles.
  * `controllers/opportunityController.js`: CRUD operations for internships, apprenticeships, and permanent job listings.
  * `controllers/matchingController.js`: Algorithmic evaluation computing explainable compatibility scores.
  * `controllers/applicationController.js`: Application lifecycle mutations, duplicate submission checks, and status management.
  * `controllers/analyticsController.js`: Aggregated query pipelines delivering institutional and corporate performance metrics.
  * `controllers/verificationController.js`: Credential review operations for student submissions.
  * `controllers/notificationController.js`: User event dispatching and notification delivery.
  * `middleware/auth.js`: Bearer token decryption and role enforcement.
  * `middleware/upload.js`: Sanitized document and resume handling with MIME-type validation.
  * `prisma/schema.prisma`: Relational database schema declarations and entity relationships.
  * `prisma/seed.js`: Automated data ingestion pipeline populating baseline system entities from raw storage.

### 4.3. AI Microservice (`apps/ai-service/`)
* **Location**: `apps/ai-service/app/`
* **Technologies**: Python 3.12, FastAPI, Uvicorn, PyMuPDF, Google Gemini API
* **Functional Scope**:
  * `main.py`: Microservice endpoint orchestration and routing.
  * `services/resume_parser.py`: PDF document ingestion, text sanitization, and structured skill extraction.
  * `services/job_parser.py`: Job specification processing and qualification extraction.
  * `services/career_advisor.py`: Automated professional guidance generation with integrated deterministic fallbacks.

### 4.4. Canonical Datasets (`data/`)
* **Location**: `data/`
* **Format**: Comma-Separated Values (CSV)
* **Functional Scope**:
  * `skills.csv`: Master taxonomy of technical and interpersonal competencies.
  * `career_roles.csv`: Standardized industry career tracks.
  * `career_skills.csv`: Competency benchmarks, importance tiers, and proficiency thresholds per role.
  * `companies.csv`: Verified corporate employer profiles.
  * `opportunities.csv`: Active vacancy postings with requirement attributes.
  * `students.csv`: Enrolled student profiles across academic departments.
  * `assessment_questions.csv`: Validated technical question repository.
  * `learning_resources.csv`: Curated educational courses and documentation references.
  * `applications.csv`: Canonical application state records.

---

## 5. Deployment & Runtime Infrastructure
* **Containerization**: Configured via `docker-compose.yml` to provision the web client, application API, AI microservice, and relational database in isolated environments.
* **Continuous Integration**: Configured under `.github/workflows/` for automated build validation, linting, and regression testing.
* **Database Migrations**: Managed via Prisma CLI to maintain deterministic schema synchronization across deployment targets.
