const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VALID_TYPES = ['INTERNSHIP', 'JOB', 'APPRENTICESHIP', 'FULL_TIME'];
const VALID_MODES = ['REMOTE', 'ONSITE', 'HYBRID'];

const createOpportunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      type, title, description, location, workMode, 
      stipend, salary, minCgpa, requiredDegree, 
      requiredBranch, graduationYear, deadline, skills 
    } = req.body;

    if (!type || !VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: `Type must be one of: ${VALID_TYPES.join(', ')}` });
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!workMode || !VALID_MODES.includes(workMode)) {
      return res.status(400).json({ message: `workMode must be one of: ${VALID_MODES.join(', ')}` });
    }
    if (!deadline || isNaN(Date.parse(deadline))) {
      return res.status(400).json({ message: 'Valid deadline date is required' });
    }
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: 'At least one skill requirement is required' });
    }

    const company = await prisma.company.findFirst({ where: { userId } });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });

    const opportunity = await prisma.opportunity.create({
      data: {
        companyId: company.id,
        type, 
        title: title.trim(), 
        description: description.trim(), 
        location: location ? location.trim() : 'Remote', 
        workMode,
        stipend: stipend ? parseFloat(stipend) : null,
        salary: salary ? parseFloat(salary) : null,
        minCgpa: minCgpa ? parseFloat(minCgpa) : null,
        requiredDegree: requiredDegree ? requiredDegree.trim() : null, 
        requiredBranch: requiredBranch ? requiredBranch.trim() : null, 
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        deadline: new Date(deadline),
        skills: {
          create: skills.map(s => ({
            skillId: s.id || s.skillId,
            minRequiredScore: s.minScore || s.minRequiredScore || 50
          }))
        }
      },
      include: {
        skills: { include: { skill: true } },
        company: true
      }
    });
    res.status(201).json(opportunity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const searchOpportunities = async (req, res) => {
  try {
    const { q, type, location, mode, skill } = req.query;
    const where = {};

    if (type && VALID_TYPES.includes(type.toUpperCase())) {
      where.type = type.toUpperCase();
    }
    if (mode && VALID_MODES.includes(mode.toUpperCase())) {
      where.workMode = mode.toUpperCase();
    }
    if (location && location.trim()) {
      where.location = { contains: location.trim(), mode: 'insensitive' };
    }
    if (skill && skill.trim()) {
      where.skills = { some: { skillId: skill.trim() } };
    }
    if (q && q.trim()) {
      const searchTerm = q.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { company: { name: { contains: searchTerm, mode: 'insensitive' } } }
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: { 
        company: { select: { id: true, name: true, isVerified: true, location: true } },
        skills: { include: { skill: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: 'Server error searching opportunities', error: error.message });
  }
};

const getOpportunityDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Opportunity ID is required' });

    const opp = await prisma.opportunity.findUnique({
      where: { id },
      include: { 
        company: true, 
        skills: { include: { skill: true } },
        applications: {
          select: { id: true, status: true, appliedAt: true }
        }
      }
    });
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
    res.json(opp);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createOpportunity, searchOpportunities, getOpportunityDetails };
