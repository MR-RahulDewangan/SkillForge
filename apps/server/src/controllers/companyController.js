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

    const updateData = {};
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Company name cannot be empty' });
      }
      updateData.name = name.trim();
    }
    if (industry !== undefined) {
      if (!industry || typeof industry !== 'string' || !industry.trim()) {
        return res.status(400).json({ message: 'Industry cannot be empty' });
      }
      updateData.industry = industry.trim();
    }
    if (website !== undefined) updateData.website = website ? website.trim() : null;
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (location !== undefined) updateData.location = location ? location.trim() : null;

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: updateData
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const verifyCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) return res.status(400).json({ message: 'companyId is required' });

    const existing = await prisma.company.findUnique({ where: { id: companyId } });
    if (!existing) return res.status(404).json({ message: 'Company not found' });

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
