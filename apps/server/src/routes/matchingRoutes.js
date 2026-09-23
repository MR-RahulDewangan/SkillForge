const express = require('express');
const { getMatchDetails, getOpportunitiesForStudent, getCandidatesForOpportunity } = require('../controllers/matchingController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/match/:studentId/:opportunityId', authenticate, getMatchDetails);
router.get('/recommendations/opportunities', authenticate, authorize('STUDENT'), getOpportunitiesForStudent);
router.get('/recommendations/candidates/:opportunityId', authenticate, authorize('INDUSTRY'), getCandidatesForOpportunity);

module.exports = router;
