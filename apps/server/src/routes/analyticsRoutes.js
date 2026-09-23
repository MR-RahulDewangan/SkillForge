const express = require('express');
const { getInstitutionOverview, getIndustryDemand, getStudentGaps, getPlacementFunnel } = require('../controllers/analyticsController');
const { getDepartmentAnalytics } = require('../controllers/expandedAnalyticsController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/overview', authenticate, authorize('INSTITUTION_ADMIN'), getInstitutionOverview);
router.get('/industry-demand', authenticate, authorize('INSTITUTION_ADMIN'), getIndustryDemand);
router.get('/student-gaps', authenticate, authorize('INSTITUTION_ADMIN'), getStudentGaps);
router.get('/funnel', authenticate, authorize('INSTITUTION_ADMIN'), getPlacementFunnel);
router.get('/departments', authenticate, authorize('INSTITUTION_ADMIN'), getDepartmentAnalytics);

module.exports = router;
