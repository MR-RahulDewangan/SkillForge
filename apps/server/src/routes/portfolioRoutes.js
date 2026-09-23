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
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { uploadResumeDisk, uploadCertDisk } = require('../middleware/uploadMiddleware');
const router = express.Router();

router.get('/:studentId', authenticate, getPortfolio);
router.post('/projects', authenticate, authorize('STUDENT'), addProject);
router.put('/projects/:id', authenticate, updateProject);
router.delete('/projects/:id', authenticate, deleteProject);
router.post('/certificates', authenticate, authorize('STUDENT'), addCertificate);
router.put('/certificates/:id', authenticate, updateCertificate);
router.delete('/certificates/:id', authenticate, deleteCertificate);

// Document upload routes
router.post('/resume/upload', authenticate, authorize('STUDENT'), (req, res) => {
  uploadResumeDisk.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No resume file uploaded' });
    res.json({
      message: 'Resume uploaded successfully',
      filename: req.file.filename,
      size: req.file.size
    });
  });
});

router.post('/certificates/upload', authenticate, authorize('STUDENT'), (req, res) => {
  uploadCertDisk.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No certificate file uploaded' });
    res.json({
      message: 'Certificate document uploaded successfully',
      filename: req.file.filename,
      size: req.file.size
    });
  });
});

module.exports = router;
