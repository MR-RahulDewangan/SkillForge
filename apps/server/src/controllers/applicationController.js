const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createNotification } = require('../services/notificationService');

const VALID_STATUSES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

const applyToOpportunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { opportunityId } = req.body;

    if (!opportunityId || typeof opportunityId !== 'string') {
      return res.status(400).json({ message: 'Valid opportunityId is required' });
    }

    const student = await prisma.student.findFirst({ where: { userId } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { skills: true, company: true }
    });
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });

    if (opp.deadline && new Date() > new Date(opp.deadline)) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    // Eligibility verification
    if (opp.minCgpa && (!student.cgpa || student.cgpa < opp.minCgpa)) {
      return res.status(400).json({ message: `Minimum CGPA of ${opp.minCgpa} required` });
    }
    if (opp.requiredDegree && student.degree && student.degree.toLowerCase() !== opp.requiredDegree.toLowerCase()) {
      return res.status(400).json({ message: `Degree ${opp.requiredDegree} required` });
    }
    if (opp.requiredBranch && student.branch) {
      const bReq = opp.requiredBranch.toLowerCase().trim();
      const bStud = student.branch.toLowerCase().trim();
      if (bReq !== bStud && !bStud.includes(bReq) && !bReq.includes(bStud)) {
        return res.status(400).json({ message: `Branch ${opp.requiredBranch} required` });
      }
    }
    if (opp.graduationYear && student.gradYear && student.gradYear !== opp.graduationYear) {
      return res.status(400).json({ message: `Graduation year ${opp.graduationYear} required` });
    }

    // Duplicate check
    const existing = await prisma.application.findUnique({
      where: {
        studentId_opportunityId: {
          studentId: student.id,
          opportunityId
        }
      }
    });

    if (existing) {
      return res.status(409).json({ message: 'You have already applied to this opportunity' });
    }

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        opportunityId,
        status: 'APPLIED'
      }
    });

    // Notify recruiter of new application
    if (opp.company && opp.company.userId) {
      createNotification(opp.company.userId, {
        title: 'New Candidate Application',
        message: `A candidate has submitted an application for "${opp.title}".`,
        type: 'INFO',
        metadata: { applicationId: application.id, opportunityId }
      });
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: 'Application ID is required' });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid application status. Allowed: ${VALID_STATUSES.join(', ')}` 
      });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: { select: { userId: true } },
        opportunity: {
          include: { company: true }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // IDOR Check: Ensure calling user owns the company hosting this opportunity
    if (req.user.role !== 'INSTITUTION_ADMIN' && application.opportunity.company.userId !== req.user.id) {
      return res.status(403).json({ 
        message: 'Forbidden: You do not have permission to update applications for other companies' 
      });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });

    // Notify student of status update
    if (application.student && application.student.userId) {
      createNotification(application.student.userId, {
        title: `Application Status: ${status}`,
        message: `Your application for "${application.opportunity.title}" at ${application.opportunity.company.name} is now ${status}.`,
        type: 'APPLICATION_STATUS',
        metadata: { applicationId, status }
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCompanyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const company = await prisma.company.findFirst({ where: { userId } });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const opportunities = await prisma.opportunity.findMany({
      where: { companyId: company.id },
      include: {
        applications: {
          include: { 
            student: { 
              include: { 
                user: { select: { firstName: true, lastName: true, email: true } }, 
                skills: { include: { skill: true } } 
              } 
            } 
          }
        }
      }
    });
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getStudentApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await prisma.student.findFirst({ where: { userId } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const apps = await prisma.application.findMany({
      where: { studentId: student.id },
      include: { opportunity: { include: { company: true } } },
      orderBy: { appliedAt: 'desc' }
    });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  applyToOpportunity, 
  updateApplicationStatus, 
  getCompanyApplications, 
  getStudentApplications 
};
