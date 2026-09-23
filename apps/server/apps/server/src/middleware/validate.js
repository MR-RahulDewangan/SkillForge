const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors.map(err => ({
        path: err.path[0],
        message: err.message
      }))
    });
  }
};

module.exports = { validate };
