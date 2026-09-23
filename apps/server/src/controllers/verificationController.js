const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createNotification } = require('../services/notificationService');

const verifyItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const isVerified = req.body.isVerified !== undefined ? Boolean(req.body.isVerified) : true;

    if (!id) return res.status(400).json({ message: 'Item ID is required' });

    let updatedItem;
    let studentUserId;
    let itemName = 'credential';

    switch (type) {
      case 'project': {
        const existing = await prisma.project.findUnique({
          where: { id },
          include: { student: { select: { userId: true } } }
        });
        if (!existing) return res.status(404).json({ message: 'Project not found' });
        studentUserId = existing.student?.userId;
        itemName = existing.name;

        updatedItem = await prisma.project.update({
          where: { id },
          data: { isVerified }
        });
        break;
      }
      case 'certificate': {
        const existing = await prisma.certificate.findUnique({
          where: { id },
          include: { student: { select: { userId: true } } }
        });
        if (!existing) return res.status(404).json({ message: 'Certificate not found' });
        studentUserId = existing.student?.userId;
        itemName = existing.name;

        updatedItem = await prisma.certificate.update({
          where: { id },
          data: { isVerified }
        });
        break;
      }
      case 'skill': {
        const existing = await prisma.studentSkill.findUnique({
          where: { id },
          include: { 
            student: { select: { userId: true } },
            skill: { select: { name: true } }
          }
        });
        if (!existing) return res.status(404).json({ message: 'Skill not found' });
        studentUserId = existing.student?.userId;
        itemName = existing.skill?.name;

        updatedItem = await prisma.studentSkill.update({
          where: { id },
          data: { isVerified }
        });
        break;
      }
      default:
        return res.status(400).json({ message: 'Invalid verification type. Allowed: project, certificate, skill' });
    }

    if (studentUserId && isVerified) {
      createNotification(studentUserId, {
        title: 'Credential Verified',
        message: `Your ${type} "${itemName}" has been verified by the institution/faculty review panel!`,
        type: 'VERIFICATION',
        metadata: { type, id }
      });
    }

    res.json({ message: 'Item verified successfully', item: updatedItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { verifyItem };
