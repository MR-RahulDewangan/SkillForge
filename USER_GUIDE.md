# SkillForge: User Navigation & Operational Guide

## 1. Project Purpose
SkillForge is an Academia–Industry Collaboration Portal designed to connect students, corporate recruiters, academic faculty, and institutional leaders. The platform facilitates skill verification, objective competency assessment, automated career-opportunity matching, and recruitment analytics.

---

## 2. User Roles & Access Rights
* **Student**: Assesses technical proficiencies, identifies career-specific skill deficits, accesses recommended learning resources, discovers matched opportunities, and submits applications.
* **Industry Partner (Recruiter)**: Publishes hiring opportunities, inspects candidate compatibility metrics, and manages the applicant selection lifecycle.
* **Faculty Member**: Reviews and verifies student-submitted credentials, academic projects, and certifications.
* **Institution Administrator**: Monitors department-level competency benchmarks, placement progression metrics, and macro industry demand trends.

---

## 3. Platform Sections & Functional Navigation

### 3.1. Authentication Portal
* **Navigation Path**: Top-level navigation (`/login`, `/register`)
* **Functionality**:
  * Role-governed registration and authenticated sign-in.
  * Automatic redirection to role-specific dashboard views.
  * Session token preservation and profile management.

### 3.2. Student Workspace

#### A. Central Dashboard (`/dashboard`)
* **Functionality**:
  * Displays personal competency summaries, recent application statuses, and immediate recommended actions.
  * Provides quick-navigation links to examinations, career tools, and open vacancies.

#### B. Assessment Center (`/assessments`)
* **Functionality**:
  * Delivers standardized technical multiple-choice evaluations across core competency domains.
  * Scores submissions objectively against verified benchmarks without exposing answer keys.
  * Records evaluation histories directly to the student competency record.

#### C. Skill Profile (`/skills`)
* **Functionality**:
  * Visualizes current technical proficiencies alongside designated target career roles.
  * Identifies verified capabilities validated through examinations or faculty endorsement.

#### D. Skill Gap Analysis & Learning Directory (`/gap-analysis`)
* **Functionality**:
  * Calculates percentage readiness relative to industry-defined career requirements.
  * Classifies skill deficits by severity level.
  * Directly indexes curated educational documentation and course modules targeting each identified gap.

#### E. Opportunity Search & Compatibility Matching (`/opportunities`)
* **Functionality**:
  * Catalogs available internships, apprenticeships, and entry-level positions.
  * Calculates candidate-opportunity compatibility scores reflecting skill coverage, academic eligibility, and career interest overlap.
  * Provides detailed breakdowns explaining why an opportunity matches or which qualifications remain deficit.
  * Facilitates one-click application submission with duplicate submission safeguards.

#### F. Application Tracking Center (`/applications`)
* **Functionality**:
  * Tracks submitted applications through progression stages: Applied, In Review, Shortlisted, Interview Scheduled, Accepted, or Rejected.
  * Delivers system alerts on recruitment decision updates.

#### G. Digital Portfolio & Resume Manager (`/portfolio`, `/resume-builder`)
* **Functionality**:
  * Enables documentation of academic projects, research initiatives, and verified certifications.
  * Provides resume compilation and document parsing tools to synchronize credentials with active profiles.

#### H. AI Career Assistant (`/career-assistant`)
* **Functionality**:
  * Delivers contextual guidance regarding industry preparation, interview readiness, and competency roadmaps.

---

### 3.3. Industry Recruiter Workspace

#### A. Recruiter Dashboard (`/company/dashboard`)
* **Functionality**:
  * Displays active position metrics, pending applicant volumes, and shortlisting milestones.

#### B. Opportunity Management (`/company/post-opportunity`)
* **Functionality**:
  * Publishes new listings with explicit parameters including employment type, location mode, stipend, duration, and required competency scores.

#### C. Applicant Tracking System (ATS) (`/company/applicants`)
* **Functionality**:
  * Lists candidate submissions ranked by deterministic compatibility score.
  * Surfaces individual candidate profiles, verified skill scores, and academic credentials.
  * Provides candidate status mutation tools to advance candidates through review, shortlisting, and final recruitment stages.

#### D. Recruitment Analytics (`/company/analytics`)
* **Functionality**:
  * Reports applicant funnel conversion metrics and pipeline quality distributions.

---

### 3.4. Faculty Workspace

#### A. Verification Dashboard (`/verification`)
* **Functionality**:
  * Centralizes submitted student credentials, project artifacts, and certifications requiring institutional validation.
  * Allows faculty to verify or reject submitted credentials, directly updating student profile trust ratings.

---

### 3.5. Institutional Administration Workspace

#### A. Institutional Analytics Suite (`/analytics`)
* **Functionality**:
  * Aggregates campus-wide competency data across departments and academic cohorts.
  * Compares institutional student skill proficiencies against macro industry demand patterns.
  * Visualizes institutional placement progression, corporate participation rates, and curriculum alignment opportunities.
