const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPortfolio = async (req, res) => {
  try {
    const { studentId } = req.params;
    const portfolio = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        projects: true,
        certificates: true,
        skills: {
          include: { skill: true }
        }
      }
    });

    if (!portfolio) return res.status(404).json({ message: 'Student not found' });
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addProject = async (req, res) => {
  try {
    const { name, description, url, studentId } = req.body;
    const project = await prisma.project.create({
      data: { name, description, url, studentId }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, url } = req.body;
    const project = await prisma.project.update({
      where: { id },
      data: { name, description, url }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addCertificate = async (req, res) => {
  try {
    const { name, issuer, issueDate, url, studentId } = req.body;
    const certificate = await prisma.certificate.create({
      data: {
        name,
        issuer,
        issueDate: new Date(issueDate),
        url,
        studentId
      }
    });
    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, issuer, issueDate, url } = req.body;
    const certificate = await prisma.certificate.update({
      where: { id },
      data: {
        name,
        issuer,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        url
      }
    });
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.certificate.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPortfolio,
  addProject,
  updateProject,
  deleteProject,
  addCertificate,
  updateCertificate,
  deleteCertificate
};
