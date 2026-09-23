const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const verifyItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const isVerified = req.body.isVerified !== undefined ? req.body.isVerified : true;

    let updatedItem;

    switch (type) {
      case 'project':
        updatedItem = await prisma.project.update({
          where: { id },
          data: { isVerified }
        });
        break;
      case 'certificate':
        updatedItem = await prisma.certificate.update({
          where: { id },
          data: { isVerified }
        });
        break;
      case 'skill':
        updatedItem = await prisma.studentSkill.update({
          where: { id },
          data: { isVerified }
        });
        break;
      default:
        return res.status(400).json({ message: 'Invalid verification type' });
    }

    res.json({ message: 'Item verified successfully', item: updatedItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { verifyItem };
