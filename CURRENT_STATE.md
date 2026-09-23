# Current State of Academia–Industry Collaboration Portal

## 📁 Project Structure
The project is a monorepo consisting of three main applications:
- `apps/web`: React frontend (Vite, Tailwind CSS, Zustand).
- `apps/server`: Node.js/Express backend (Prisma ORM, PostgreSQL).
- `apps/ai-service`: Python/FastAPI service for AI-driven parsing and guidance.

## 🛠️ Technical Stack
- **Frontend**: React, Vite, Tailwind, React Router, Zustand.
- **Backend**: Node.js, Express, Prisma, PostgreSQL.
- **AI**: FastAPI, Local Ollama (`http://localhost:11434/v1`) / OpenAI-compatible API, PyMuPDF with rule-based fallback.
- **Auth**: JWT-based authentication with Role-Based Access Control (RBAC) and Axios client request interceptors.
- **Version Control**: Git repository initialized with strict `.gitignore` protecting secrets and build artifacts.

## 🗄️ Database Schema
The database is managed via Prisma and includes models for:
- `User`: Core authentication and role (`STUDENT`, `INDUSTRY`, `FACULTY`, `INSTITUTION_ADMIN`).
- `Student`: Academic details, career goals, and links to skills, projects, and certificates.
- `Company`: Industry profiles and verification status.
- `Skill`: Master list of skills and their categories.
- `CareerRole`: Industry roles with required minimum skill scores.
- `Opportunity`: Internships, Jobs, and Apprenticeships.
- `Application`: Links students to opportunities with tracking status.
- `Project` & `Certificate`: Digital portfolio items for students.
- `StudentSkill`: Tracks student proficiency and verification status per skill.

## 🔌 API Integration
- **Backend $\rightarrow$ AI**: The server interacts with the AI service for unstructured data extraction (Resumes/JDs).
- **Frontend $\rightarrow$ Backend**: REST API utilizing Bearer tokens for authentication (via Axios request interceptor).

## 🚦 Environment Configuration
- Uses `.env` files for `DATABASE_URL`, `JWT_SECRET`, `PORT`, and `AI_SERVICE_URL`.
- Port mapping: Frontend (3000), Backend (5000), AI Service (8000).
