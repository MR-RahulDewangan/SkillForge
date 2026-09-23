# Academia–Industry Collaboration Portal

## SIH 2026 Development Instructions

You are the primary AI software development agent for this project.

Your responsibility is to design, implement, test, debug, document, and prepare the application for deployment.

The application is an Academia–Industry Collaboration Portal connecting:

* Students
* Industries
* Faculty/Academicians
* Educational Institutions

The main product workflow is:

Industry Skill Demand
→ Student Skill Assessment
→ Skill Profile
→ Skill Gap Analysis
→ Learning Recommendation
→ Internship/Job Matching
→ Application
→ Recruitment
→ Institution Analytics

---

# IMPORTANT RULE

Do NOT rebuild the application from scratch when a feature already exists.

Before modifying code:

1. Inspect the existing project.
2. Understand the current architecture.
3. Inspect database schema.
4. Inspect existing API routes.
5. Inspect frontend routes/components.
6. Reuse existing components and services.
7. Make the smallest safe changes necessary.

Never assume that a feature is missing without checking the repository.

---

# DEVELOPMENT PRINCIPLES

## Code Quality

Write:

* Modular code
* Reusable components
* Strong typing where applicable
* Clear service boundaries
* Proper error handling
* Input validation
* Secure authentication
* Proper authorization
* Maintainable database queries

Avoid:

* Duplicate code
* Hard-coded IDs
* Hard-coded user-specific results
* Hard-coded analytics
* Fake production statistics
* Secrets in source code
* Business logic inside UI components
* Unnecessary dependencies

---

# CORE ROLES

STUDENT
INDUSTRY
FACULTY
INSTITUTION_ADMIN

Every protected resource must verify authorization on the backend.

Never rely only on frontend route protection.

---

# CORE FEATURES

## Student

* Authentication
* Profile
* Career goal
* Skills
* Skill assessment
* Skill profile
* Skill gap analysis
* Learning recommendations
* Internship search
* Job search
* Opportunity matching
* Applications
* Application tracking
* Resume
* Certificates
* Projects
* Achievements
* Digital portfolio
* Notifications
* Career assistant

## Industry

* Company profile
* Company verification
* Internship posting
* Job posting
* Apprenticeship posting
* Training programs
* Workshops
* Mentorship
* Live projects
* Applicant management
* Candidate matching
* Recruitment analytics

## Faculty

* Faculty profile
* Expertise
* Faculty internships
* FDPs
* Consultancy
* Research collaboration
* Industry projects
* Mentorship
* Workshops

## Institution

* Student management
* Faculty management
* Company management
* Verification
* Skill analytics
* Industry demand analytics
* Internship analytics
* Placement analytics
* Department analytics

---

# MATCHING ENGINE

The matching engine must be deterministic and explainable.

Default formula:

Skill Match = 70%
Eligibility = 20%
Career Interest = 10%

Final Score:

0.70 × SkillMatch

* 0.20 × EligibilityScore
* 0.10 × InterestScore

Return:

* overallMatch
* skillMatch
* eligibilityScore
* interestScore
* matchingSkills
* missingSkills
* skillGaps
* eligibilityIssues

Do NOT ask an LLM to generate the numerical final score.

---

# AI FEATURES

AI may be used for:

1. Resume parsing
2. Job-description parsing
3. Skill extraction
4. Resume/job semantic analysis
5. Personalized career guidance
6. Skill-gap explanations
7. Learning recommendations
8. Career assistant

AI must NOT directly determine:

* Eligibility
* User permissions
* Application status
* Verification status
* Final numerical matching score

Those must be controlled by backend business logic.

---

# DATA

Use realistic seed/demo data for development.

Clearly separate:

DEMO DATA

from

REAL USER DATA.

Never present demo data as real-world statistics.

Industry skill requirements should support a source/reference field.

---

# SECURITY

Check:

* Authentication
* Authorization
* Password hashing
* JWT handling
* Input validation
* File upload validation
* CORS
* Rate limiting
* SQL/ORM safety
* API authorization
* Environment variables
* Sensitive data exposure
* Role escalation
* IDOR vulnerabilities

A user must never access another user's private resources by changing an ID in an API request.

---

# TESTING

Every major feature must have:

1. Happy-path test
2. Invalid-input test
3. Unauthorized-access test
4. Wrong-role test
5. Empty-state test
6. Error-state test

Before declaring a feature complete:

* Run frontend
* Run backend
* Run tests
* Check database
* Check API responses
* Check browser console
* Check server logs

Fix errors rather than merely reporting them.

---

# UI

Use a modern professional SaaS design.

Prioritize:

* Responsive design
* Accessibility
* Clear navigation
* Consistent components
* Loading states
* Empty states
* Error states
* Success feedback

The application should look like a serious education/industry platform, not a generic CRUD dashboard.

---

# IMPORTANT SIH DEMO

The complete demo should support:

Student:

1. Login
2. Select Data Analyst
3. Take assessment
4. Receive skill profile
5. See skill gaps
6. Receive learning recommendations
7. Browse internships
8. See match percentage
9. See why the opportunity matches
10. Apply

Industry:

11. Login
12. View applicants
13. See candidate compatibility
14. Shortlist candidate

Institution:

15. Login
16. View student skill gaps
17. View industry skill demand
18. View internship/placement analytics

This complete workflow must work reliably.

---

# WORKING STYLE

Work incrementally.

Before each major task:

1. Inspect relevant code.
2. Create a short implementation plan.
3. Implement.
4. Test.
5. Fix errors.
6. Summarize changes.
7. Update documentation.

Do not make unrelated changes.

Do not silently remove existing functionality.

If a requirement conflicts with the existing architecture, explain the conflict and choose the least disruptive solution.

---

# WHEN YOU ARE BLOCKED

Do not invent credentials, API keys, production URLs, or external data.

Clearly identify:

BLOCKED BY:
What is missing

REQUIRED FROM USER:
What needs to be supplied

SAFE DEFAULT:
What can be implemented without it

Continue all independent work.

---

# COMPLETION STANDARD

A feature is NOT complete merely because code was written.

A feature is complete only when:

* Code exists
* Database works
* API works
* Frontend works
* Authorization works
* Error handling works
* Tests pass
* Feature works in the browser
* Documentation is updated

Always prefer working software over generating large amounts of code.
