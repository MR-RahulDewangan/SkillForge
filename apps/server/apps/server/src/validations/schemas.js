const { z } = require('zod');

const schemas = {
  auth: {
    register: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      role: z.enum(['STUDENT', 'INDUSTRY', 'FACULTY', 'INSTITUTION_ADMIN']),
    }),
    login: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
  },
  opportunity: {
    create: z.object({
      type: z.enum(['INTERNSHIP', 'JOB', 'APPRENTICESHIP']),
      title: z.string().min(3, 'Title must be at least 3 characters'),
      description: z.string().min(10, 'Description must be at least 10 characters'),
      location: z.string().min(1, 'Location is required'),
      workMode: z.enum(['REMOTE', 'ONSITE', 'HYBRID']),
      stipend: z.preprocess((val) => (val === '' ? null : parseFloat(val)), z.number().positive().nullable()),
      salary: z.preprocess((val) => (val === '' ? null : parseFloat(val)), z.number().positive().nullable()),
      minCgpa: z.preprocess((val) => (val === '' ? null : parseFloat(val)), z.number().min(0).max(10).nullable()),
      requiredDegree: z.string().optional(),
      requiredBranch: z.string().optional(),
      graduationYear: z.preprocess((val) => (val === '' ? null : parseInt(val)), z.number().int().min(2000).max(2100).nullable()),
      deadline: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format' }),
      skills: z.array(z.object({
        id: z.string().uuid(),
        minScore: z.number().min(0).max(100).optional(),
      })).min(1, 'At least one skill is required'),
    }),
  },
  portfolio: {
    project: z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      url: z.string().url('Invalid URL').optional().or(z.literal('')),
    }),
    certificate: z.object({
      name: z.string().min(1, 'Certificate name is required'),
      issuer: z.string().min(1, 'Issuer is required'),
      issueDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date' }),
      url: z.string().url('Invalid URL').optional().or(z.literal('')),
    }),
  },
};

module.exports = schemas;
