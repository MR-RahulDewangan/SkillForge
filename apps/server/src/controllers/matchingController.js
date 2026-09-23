const { calculateMatch, getRecommendedOpportunities, getRecommendedCandidates } = require('../services/matchingService');

const getMatchDetails = async (req, res) => {
  try {
    const { studentId, opportunityId } = req.params;
    const match = await calculateMatch(studentId, opportunityId);
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Matching error', error: error.message });
  }
};

const getOpportunitiesForStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
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
    const candidates = await getRecommendedCandidates(opportunityId);
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMatchDetails, getOpportunitiesForStudent, getCandidatesForOpportunity };
