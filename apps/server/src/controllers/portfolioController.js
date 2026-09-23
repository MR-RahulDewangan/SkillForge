const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPortfolio = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const portfolio = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        projects: true,
        certificates: true,
        skills: {
          include: { skill: true }
        },
        user: { select: { firstName: true, lastName: true, email: true } },
        careerGoal: true
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
    const student = await prisma.student.findFirst({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(403).json({ message: 'Only registered students can add portfolio projects' });
    }

    const { name, description, url } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'Project description is required' });
    }

    // Bind strictly to authenticated student.id (IDOR mitigation)
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        url: url ? url.trim() : null,
        studentId: student.id
      }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Project ID is required' });

    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Ownership check (IDOR mitigation)
    if (existingProject.student.userId !== req.user.id && req.user.role !== 'INSTITUTION_ADMIN') {
      return res.status(403).json({ message: 'Forbidden: You cannot modify another student\'s project' });
    }

    const { name, description, url } = req.body;
    const updateData = {};
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Project name cannot be empty' });
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      if (!description || typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({ message: 'Project description cannot be empty' });
      }
      updateData.description = description.trim();
    }
    if (url !== undefined) updateData.url = url ? url.trim() : null;

    const project = await prisma.project.update({
      where: { id },
      data: updateData
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Project ID is required' });

    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Ownership check (IDOR mitigation)
    if (existingProject.student.userId !== req.user.id && req.user.role !== 'INSTITUTION_ADMIN') {
      return res.status(403).json({ message: 'Forbidden: You cannot delete another student\'s project' });
    }

    await prisma.project.delete({ where: { id } });
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addCertificate = async (req, res) => {
  try {
    const student = await prisma.student.findFirst({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(403).json({ message: 'Only registered students can add certificates' });
    }

    const { name, issuer, issueDate, url } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Certificate name is required' });
    }
    if (!issuer || typeof issuer !== 'string' || !issuer.trim()) {
      return res.status(400).json({ message: 'Issuer is required' });
    }
    if (!issueDate || isNaN(Date.parse(issueDate))) {
      return res.status(400).json({ message: 'Valid issue date is required' });
    }

    // Bind strictly to authenticated student.id (IDOR mitigation)
    const certificate = await prisma.certificate.create({
      data: {
        name: name.trim(),
        issuer: issuer.trim(),
        issueDate: new Date(issueDate),
        url: url ? url.trim() : null,
        studentId: student.id
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
    if (!id) return res.status(400).json({ message: 'Certificate ID is required' });

    const existingCert = await prisma.certificate.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!existingCert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Ownership check (IDOR mitigation)
    if (existingCert.student.userId !== req.user.id && req.user.role !== 'INSTITUTION_ADMIN') {
      return res.status(403).json({ message: 'Forbidden: You cannot modify another student\'s certificate' });
    }

    const { name, issuer, issueDate, url } = req.body;
    const updateData = {};
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Certificate name cannot be empty' });
      }
      updateData.name = name.trim();
    }
    if (issuer !== undefined) {
      if (!issuer || typeof issuer !== 'string' || !issuer.trim()) {
        return res.status(400).json({ message: 'Issuer cannot be empty' });
      }
      updateData.issuer = issuer.trim();
    }
    if (issueDate !== undefined) {
      if (isNaN(Date.parse(issueDate))) {
        return res.status(400).json({ message: 'Invalid issue date' });
      }
      updateData.issueDate = new Date(issueDate);
    }
    if (url !== undefined) updateData.url = url ? url.trim() : null;

    const certificate = await prisma.certificate.update({
      where: { id },
      data: updateData
    });
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Certificate ID is required' });

    const existingCert = await prisma.certificate.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!existingCert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Ownership check (IDOR mitigation)
    if (existingCert.student.userId !== req.user.id && req.user.role !== 'INSTITUTION_ADMIN') {
      return res.status(403).json({ message: 'Forbidden: You cannot delete another student\'s certificate' });
    }

    await prisma.certificate.delete({ where: { id } });
    res.status(200).json({ message: 'Certificate deleted successfully' });
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
