const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

const autoFillProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { parsedData } = req.body; // JSON from AI service

    const student = await prisma.student.findFirst({ where: { userId } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    // 1. Update Basic Profile (Education)
    const education = parsedData.education?.[0] || '';
    const degree = education.split(',')[0] || null;
    
    await prisma.student.update({
      where: { id: student.id },
      data: { degree: degree }
    });

    // 2. Add Projects
    if (parsedData.projects && Array.isArray(parsedData.projects)) {
      for (const projDesc of parsedData.projects) {
        // Extract a title from the description (simple split)
        const title = projDesc.split('-')[0].split(':')[0].trim();
        await prisma.project.create({
          data: {
            studentId: student.id,
            title: title,
            description: projDesc,
            url: '' // Placeholder
          }
        });
      }
    }

    // 3. Add Certifications
    if (parsedData.certifications && Array.isArray(parsedData.certifications)) {
      for (const cert of parsedData.certifications) {
        await prisma.certificate.create({
          data: {
            studentId: student.id,
            name: cert,
            issuer: 'Unknown',
            issueDate: new Date(),
            url: '' // Placeholder
          }
        });
      }
    }

    res.json({ message: 'Profile auto-filled successfully from resume!' });
  } catch (error) {
    console.error('Auto-fill error:', error);
    res.status(500).json({ message: 'Server error during auto-fill', error: error.message });
  }
};

module.exports = { autoFillProfile };
