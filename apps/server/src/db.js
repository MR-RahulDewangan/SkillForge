const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Backward compatibility aliases
prisma.course = prisma.learningResource;
prisma.careerRoleSkill = prisma.careerSkill;

module.exports = prisma;
