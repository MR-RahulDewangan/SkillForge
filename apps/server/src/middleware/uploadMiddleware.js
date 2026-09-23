const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage configuration with memory buffer for secure inspection and proxying
const memoryStorage = multer.memoryStorage();

// Disk storage for saved uploads (with sanitized filenames)
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal
    const safeBase = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${safeBase}`);
  }
});

// Resume file filter: PDF only
const resumeFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf'];
  const allowedMime = ['application/pdf'];

  if (allowedExts.includes(ext) && allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type: Only PDF documents (.pdf) are allowed for resumes'), false);
  }
};

// Certificate file filter: PDF, JPEG, PNG
const certFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
  const allowedMime = ['application/pdf', 'image/jpeg', 'image/png'];

  if (allowedExts.includes(ext) && allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type: Only PDF, JPG, or PNG files are allowed for certificates'), false);
  }
};

const uploadResumeMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: resumeFilter
});

const uploadResumeDisk = multer({
  storage: diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: resumeFilter
});

const uploadCertDisk = multer({
  storage: diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: certFilter
});

module.exports = {
  uploadResumeMemory,
  uploadResumeDisk,
  uploadCertDisk
};
