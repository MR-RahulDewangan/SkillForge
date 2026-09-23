const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const applyToOpportunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { opportunityId } = req.body;
    const student = await prisma.student.findFirst({ where: { userId } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { skills: true }
    });
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });

    if (opp.minCgpa && (!student.cgpa || student.cgpa < opp.minCgpa)) {
      return res.status(400).json({ message: `Minimum CGPA of ${opp.minCgpa} required` });
    }
    if (opp.requiredDegree && student.degree !== opp.requiredDegree) {
      return res.status(400).json({ message: `Degree ${opp.requiredDegree} required` });
    }
    if (opp.requiredBranch && student.branch !== opp.requiredBranch) {
      return res.status(400).json({ message: `Branch ${opp.requiredBranch} required` });
    }
    if (opp.graduationYear && student.gradYear !== opp.graduationYear) {
      return res.status(400).json({ message: `Graduation year ${opp.graduationYear} required` });
    }

    const application = await prisma.application.upsert({
      where: { studentId_opportunityId: { studentId: student.id, opportunityId } },
      update: {},
      create: { studentId: student.id, opportunityId }
    });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
          include: { student: { include: { user: true, skills: { include: { skill: true } } } } }
        }
      }
    });
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { applyToOpportunity, updateApplicationStatus, getCompanyApplications, getStudentApplications };
