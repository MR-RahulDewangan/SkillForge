const express = require('express');
const { applyToOpportunity, updateApplicationStatus, getCompanyApplications, getStudentApplications } = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/apply', authenticate, authorize('STUDENT'), applyToOpportunity);
router.patch('/:applicationId/status', authenticate, authorize('INDUSTRY'), updateApplicationStatus);
router.get('/company', authenticate, authorize('INDUSTRY'), getCompanyApplications);
router.get('/student', authenticate, authorize('STUDENT'), getStudentApplications);

module.exports = router;
