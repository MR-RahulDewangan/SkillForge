# Academia–Industry Collaboration Portal (SIH 2026)

An enterprise-grade SaaS platform bridging the gap between educational institutions and modern industries. The platform connects **Students**, **Industry Partners**, **Faculty**, and **Institution Administrators** through deterministic skill matching, assessment centers, AI-assisted career advisory, and placement analytics.

---

## 🚀 Quick Access & Services

| Service | Technology | URL / Port | Purpose |
| :--- | :--- | :--- | :--- |
| **Web Frontend** | React 18, Vite 5, Tailwind CSS | [http://localhost:3000](http://localhost:3000) | Main user interface for all roles |
| **Backend API** | Node.js, Express, Prisma ORM | [http://localhost:5000](http://localhost:5000) | REST API, RBAC, business logic |
| **AI Microservice** | Python 3.12, FastAPI, Gemini API | [http://localhost:8001](http://localhost:8001) | Resume parsing, JD extraction, AI Assistant |
| **Database** | PostgreSQL 16 | `localhost:5432/sih2026` | Relational storage for all entities |

---

## 🔑 Demo Login Credentials

> **Default Password for All Accounts**: `password123`

### 1. Student Accounts (Role: `STUDENT`)
| Student Name | Email | Career Goal | Department | Key Demo Scenario |
| :--- | :--- | :--- | :--- | :--- |
| **Aarav Sharma** | `stu001@student.edu` | Full Stack Developer | Computer Science & Eng (Sem 6) | **100% Match** for Full Stack Intern; has Shortlisted application |
| **Ananya Iyer** | `stu004@student.edu` | Data Analyst | Data Science (Sem 5) | **Skill Gap Demo**: 80% Readiness, gaps in Python/SQL/PowerBI with course recommendations |
| **Priya Verma** | `stu002@student.edu` | Data Analyst | Information Technology (Sem 6) | Applied to Data Analyst Intern; review status |
| **Rohan Patel** | `stu003@student.edu` | Backend Engineer | Computer Science & Eng (Sem 5) | Applied to DevOps Trainee |
| **Vikram Malhotra** | `stu005@student.edu` | DevOps Engineer | Electronics & Comm (Sem 7) | High container/cloud competency |
| **Neha Singh** | `stu006@student.edu` | Frontend Engineer | Computer Science & Eng (Sem 6) | **Selected** for Frontend React Developer Intern |

### 2. Industry Recruiter Accounts (Role: `INDUSTRY`)
| Company Name | Recruiter Email | Industry Domain | Location | Key Opportunity Posted |
| :--- | :--- | :--- | :--- | :--- |
| **NexaTech Systems** | `contact@comp001.example.com` | Enterprise Software | Bengaluru | Full Stack Web Developer Intern (`OPP001`) |
| **DataPulse Analytics** | `contact@comp002.example.com` | Data Intelligence | Hyderabad | Associate Data Analyst (`OPP002`) |
| **CloudScale Labs** | `contact@comp003.example.com` | Cloud & DevOps | Pune | DevOps & Infrastructure Trainee (`OPP003`) |
| **Apex Digital FinTech** | `contact@comp004.example.com` | Financial Technology | Mumbai | Frontend React Developer Intern (`OPP005`) |

### 3. Institution & Faculty Accounts
| Role | Name | Email | Key Functions |
| :--- | :--- | :--- | :--- |
| **INSTITUTION_ADMIN** | Administrator | `admin@institution.edu` | Real-time skill analytics, industry demand metrics, placement funnel |
| **FACULTY** | Prof. Sharma | `faculty1@university.edu` | Student verification queue (verifying student projects & certificates) |

---

## 🔄 Core Product Workflow

```text
Industry Demand (Postings)
       ↓
Student Skill Assessment (MCQ Engine)
       ↓
Skill Profile & Goal Setting
       ↓
Deterministic Skill Gap Analysis
       ↓
Learning Recommendations (Courses & Docs)
       ↓
Explainable Opportunity Matching (70/20/10)
       ↓
One-Click Application & ATS Tracking
       ↓
Recruiter Evaluation & Shortlisting
       ↓
Institutional Analytics & Placement Reports
```

---

## 🧮 Deterministic Matching Engine

As specified in the hackathon guidelines, candidate-opportunity match scores are calculated **deterministically** without black-box LLM numerical hallucination:

$$\text{Final Score} = (0.70 \times \text{SkillMatch}) + (0.20 \times \text{EligibilityScore}) + (0.10 \times \text{InterestScore})$$

* **Skill Match (70%)**: Compares student assessed skill scores against required benchmarks ($\frac{\text{StudentScore}}{\text{RequiredScore}}$).
* **Eligibility Score (20%)**: Verifies CGPA threshold, degree, department/branch, and graduation year.
* **Career Interest Score (10%)**: Measures overlap between student career goal skills and opportunity required skills.
* **Explainability**: Every match returns exact lists of `matchingSkills`, `missingSkills`, `skillGaps`, and `eligibilityIssues`.

---

## 📂 Seed Datasets (`data/`)

The platform is seeded directly from the 9 root CSV datasets in `data/`:

| Dataset | Records | Description |
| :--- | :---: | :--- |
| `skills.csv` | 15 | Technical and soft skills (Python, React, SQL, Docker, etc.) |
| `career_roles.csv` | 5 | Target career tracks (Full Stack, Data Analyst, DevOps, etc.) |
| `career_skills.csv` | 18 | Role requirements, benchmark levels, and importance tiers |
| `companies.csv` | 4 | Verified employer profiles and office locations |
| `opportunities.csv` | 6 | Internship and job postings with stipends, deadlines, and modes |
| `students.csv` | 6 | Enrolled student profiles, semesters, and departments |
| `assessment_questions.csv` | 10 | Technical MCQ bank with options, answer keys, and explanations |
| `learning_resources.csv` | 8 | Curated tutorials, documentation, and courses mapped to skills |
| `applications.csv` | 6 | Existing applications with real statuses (`APPLIED`, `SHORTLISTED`, etc.) |

---

## 🛠️ Setup & Execution Commands

### Prerequisites
* **Node.js** (v18+)
* **PostgreSQL** (v15+)
* **Python** (v3.10+)

### 1. Database Setup & Seeding
```bash
# From apps/server
cd apps/server

# Apply schema migrations
npx prisma migrate dev

# Seed database with the 9 CSV datasets
npx prisma db seed
```

### 2. Start Backend API Server
```bash
cd apps/server
npm run dev
# Server listens on http://localhost:5000
```

### 3. Start Frontend Web Client
```bash
cd apps/web
npm run dev
# Web app runs on http://localhost:3000
```

### 4. Start AI Microservice
```bash
cd apps/ai-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
# Service runs on http://localhost:8001
```

---

## 🧪 Verification & Testing

Run the included verification scripts to validate database integrity and end-to-end flows:

```bash
# 1. Verify 100% referential integrity across all 9 models
cd apps/server
node verify_datasets.js

# 2. Run complete end-to-end student-to-recruitment simulation
node test_complete_flow.js

# 3. Run full automated QA and security test suite (75 tests)
node tests/e2e_qa_security.test.js

# 4. Verify all 12 demo accounts authentication (100% pass)
node tests/test_all_logins.js
```

---

## ☁️ Free Cloud Deployment Guide

The platform is pre-configured for free cloud deployment:

### 1. Database (PostgreSQL 16) — [Neon.tech](https://neon.tech)
* Create a free PostgreSQL instance on Neon.
* Copy the connection string: `postgresql://<user>:<password>@<host>/neondb?sslmode=require`

### 2. Backend API (Node.js Express) — [Render.com](https://render.com)
* Create a new **Web Service** linked to this GitHub repo.
* **Root Directory**: `apps/server`
* **Build Command**: `npm install && npm run build`
* **Start Command**: `npm run prod` *(runs Prisma migrations, seeds CSV datasets, and starts Express)*
* **Environment Variables**:
  * `DATABASE_URL`: *Your Neon connection string*
  * `JWT_SECRET`: *Any secure random string*
  * `PORT`: `5000`

### 3. Frontend Web App (React Vite SPA) — [Vercel](https://vercel.com)
* Import this GitHub repo on Vercel.
* **Root Directory**: `apps/web`
* **Framework Preset**: `Vite`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variables**:
  * `VITE_API_URL`: `https://your-render-backend-url.onrender.com`

---

## 🛡️ Security Features

* **Strict RBAC**: Route guards on both frontend and backend verifying `STUDENT`, `INDUSTRY`, `FACULTY`, and `INSTITUTION_ADMIN` roles.
* **IDOR Prevention**: Resource ownership verified on all portfolio, application, match, and notification endpoints.
* **Upload Hardening**: 5MB limit, sanitized alphanumeric filenames, and strict MIME validation on PDF/image uploads.
* **Password Hashing**: Bcrypt with 10 salt rounds.
* **Email Normalization**: Automatic whitespace trimming and lowercasing across authentication and user lookup.
* **Sensitive Data Protection**: Assessment solutions and password hashes are never leaked in client responses.

