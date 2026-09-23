import React, { useState, useEffect } from 'react';
import api from '../api/authApi';

const API_BASE = '/portfolio';

const PortfolioManager = ({ studentId }) => {
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', url: '' });
  const [certForm, setCertForm] = useState({ name: '', issuer: '', issueDate: '', url: '' });

  useEffect(() => {
    if (studentId) {
      fetchPortfolio();
    }
  }, [studentId]);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get(`${API_BASE}/${studentId}`);
      setProjects(res.data.projects || []);
      setCertificates(res.data.certificates || []);
    } catch (err) {
      console.error('Error fetching portfolio', err);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await api.post(`${API_BASE}/projects`, { ...projectForm, studentId });
      setProjectForm({ name: '', description: '', url: '' });
      fetchPortfolio();
    } catch (err) {
      console.error('Error adding project', err);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`${API_BASE}/projects/${id}`);
      fetchPortfolio();
    } catch (err) {
      console.error('Error deleting project', err);
    }
  };

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`${API_BASE}/certificates`, { ...certForm, studentId });
      setCertForm({ name: '', issuer: '', issueDate: '', url: '' });
      fetchPortfolio();
    } catch (err) {
      console.error('Error adding certificate', err);
    }
  };

  const handleDeleteCertificate = async (id) => {
    try {
      await api.delete(`${API_BASE}/certificates/${id}`);
      fetchPortfolio();
    } catch (err) {
      console.error('Error deleting certificate', err);
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Projects</h3>
        <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            className="border p-2 rounded"
            placeholder="Project Name"
            value={projectForm.name}
            onChange={e => setProjectForm({...projectForm, name: e.target.value})}
            required
          />
          <input
            className="border p-2 rounded"
            placeholder="Description"
            value={projectForm.description}
            onChange={e => setProjectForm({...projectForm, description: e.target.value})}
            required
          />
          <input
            className="border p-2 rounded"
            placeholder="URL"
            value={projectForm.url}
            onChange={e => setProjectForm({...projectForm, url: e.target.value})}
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Project</button>
        </form>
        <div className="space-y-3">
          {projects.map(p => (
            <div key={p.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <span className="font-semibold">{p.name}</span>
                {p.isVerified && <span className="ml-2 text-green-600 text-xs font-bold">✓ Verified</span>}
                <p className="text-sm text-gray-600">{p.description}</p>
                {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs">View Project</a>}
              </div>
              <button onClick={() => handleDeleteProject(p.id)} className="text-red-500 hover:text-red-700">Delete</button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Certificates</h3>
        <form onSubmit={handleAddCertificate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            className="border p-2 rounded"
            placeholder="Certificate Name"
            value={certForm.name}
            onChange={e => setCertForm({...certForm, name: e.target.value})}
            required
          />
          <input
            className="border p-2 rounded"
            placeholder="Issuer"
            value={certForm.issuer}
            onChange={e => setCertForm({...certForm, issuer: e.target.value})}
            required
          />
          <input
            className="border p-2 rounded"
            type="date"
            value={certForm.issueDate}
            onChange={e => setCertForm({...certForm, issueDate: e.target.value})}
            required
          />
          <input
            className="border p-2 rounded"
            placeholder="URL"
            value={certForm.url}
            onChange={e => setCertForm({...certForm, url: e.target.value})}
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Certificate</button>
        </form>
        <div className="space-y-3">
          {certificates.map(c => (
            <div key={c.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <span className="font-semibold">{c.name}</span>
                {c.isVerified && <span className="ml-2 text-green-600 text-xs font-bold">✓ Verified</span>}
                <p className="text-sm text-gray-600">{c.issuer} - {new Date(c.issueDate).toLocaleDateString()}</p>
                {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs">View Certificate</a>}
              </div>
              <button onClick={() => handleDeleteCertificate(c.id)} className="text-red-500 hover:text-red-700">Delete</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PortfolioManager;
