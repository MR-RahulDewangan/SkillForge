const express = require('express');
const { register, login } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const schemas = require('../validations/schemas');
const router = express.Router();

router.post('/register', validate(schemas.auth.register), register);
router.post('/login', validate(schemas.auth.login), login);
router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

module.exports = router;
