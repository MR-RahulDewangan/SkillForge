const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const company = await prisma.company.findFirst({
      where: { userId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } }
    });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, industry, website, description, location } = req.body;
    const company = await prisma.company.findFirst({ where: { userId } });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });
    const updated = await prisma.company.update({
      where: { id: company.id },
      data: { name, industry, website, description, location }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const verifyCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const updated = await prisma.company.update({
      where: { id: companyId },
      data: { isVerified: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProfile, updateProfile, verifyCompany };
