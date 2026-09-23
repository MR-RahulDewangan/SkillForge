const express = require('express');
const { createOpportunity, searchOpportunities, getOpportunityDetails } = require('../controllers/opportunityController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const schemas = require('../validations/schemas');
const router = express.Router();

router.post('/', authenticate, authorize('INDUSTRY'), validate(schemas.opportunity.create), createOpportunity);
router.get('/', authenticate, searchOpportunities);
router.get('/search', authenticate, searchOpportunities);
router.get('/:id', authenticate, getOpportunityDetails);

module.exports = router;
