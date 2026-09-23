const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { calculateMatch, getRecommendedOpportunities, getRecommendedCandidates } = require('../services/matchingService');

const getMatchDetails = async (req, res) => {
  try {
    const { studentId, opportunityId } = req.params;
    if (!studentId || !opportunityId) {
      return res.status(400).json({ message: 'Both studentId and opportunityId are required' });
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { company: true }
    });
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    // IDOR / Permission checks:
    // If student, can only view their own match
    if (req.user.role === 'STUDENT' && student.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You cannot view match calculations for other students' });
    }
    // If industry, can only view match for their company's opportunities
    if (req.user.role === 'INDUSTRY' && opportunity.company.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You cannot view candidate matches for opportunities of other companies' });
    }

    const match = await calculateMatch(studentId, opportunityId);
    res.json(match);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Matching error', error: error.message });
  }
};

const getOpportunitiesForStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await prisma.student.findFirst({ where: { userId } });
    
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    
    const recommendations = await getRecommendedOpportunities(student.id);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCandidatesForOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    if (!opportunityId) return res.status(400).json({ message: 'Opportunity ID is required' });

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { company: true }
    });
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    // IDOR Check
    if (req.user.role === 'INDUSTRY' && opportunity.company.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You cannot view candidates for opportunities of other companies' });
    }

    const candidates = await getRecommendedCandidates(opportunityId);
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMatchDetails, getOpportunitiesForStudent, getCandidatesForOpportunity };
