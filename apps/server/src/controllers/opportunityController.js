const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createOpportunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      type, title, description, location, workMode, 
      stipend, salary, minCgpa, requiredDegree, 
      requiredBranch, graduationYear, deadline, skills 
    } = req.body;

    const company = await prisma.company.findFirst({ where: { userId } });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });

    const opportunity = await prisma.opportunity.create({
      data: {
        companyId: company.id,
        type, title, description, location, workMode,
        stipend: stipend ? parseFloat(stipend) : null,
        salary: salary ? parseFloat(salary) : null,
        minCgpa: minCgpa ? parseFloat(minCgpa) : null,
        requiredDegree, requiredBranch, 
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        deadline: new Date(deadline),
        skills: {
          create: skills.map(s => ({
            skillId: s.id,
            minRequiredScore: s.minScore || 50
          }))
        }
      }
    });
    res.status(201).json(opportunity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const searchOpportunities = async (req, res) => {
  try {
    const { type, location, mode, skill } = req.query;
    const where = {};
    if (type) where.type = type;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (mode) where.workMode = mode;
    if (skill) where.skills = { some: { skillId: skill } };

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: { 
        company: { select: { name: true, isVerified: true } },
        skills: { include: { skill: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getOpportunityDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const opp = await prisma.opportunity.findUnique({
      where: { id },
      include: { company: true, skills: { include: { skill: true } } }
    });
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
    res.json(opp);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOpportunity, searchOpportunities, getOpportunityDetails };
