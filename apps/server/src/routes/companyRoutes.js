const express = require('express');
const { getProfile, updateProfile, verifyCompany } = require('../controllers/companyController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', authenticate, authorize('INDUSTRY'), getProfile);
router.put('/profile', authenticate, authorize('INDUSTRY'), updateProfile);
router.patch('/verify/:companyId', authenticate, authorize('INSTITUTION_ADMIN'), verifyCompany);

module.exports = router;
