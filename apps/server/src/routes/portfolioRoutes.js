const express = require('express');
const {
  getPortfolio,
  addProject,
  updateProject,
  deleteProject,
  addCertificate,
  updateCertificate,
  deleteCertificate
} = require('../controllers/portfolioController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:studentId', authenticate, getPortfolio);
router.post('/projects', authenticate, addProject);
router.put('/projects/:id', authenticate, updateProject);
router.delete('/projects/:id', authenticate, deleteProject);
router.post('/certificates', authenticate, addCertificate);
router.put('/certificates/:id', authenticate, updateCertificate);
router.delete('/certificates/:id', authenticate, deleteCertificate);

module.exports = router;
