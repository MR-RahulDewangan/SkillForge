import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';

const API_BASE = '/api/verify';

const VerificationDashboard = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      // In a real app, we'd have a dedicated endpoint for pending items.
      // For this implementation, we simulate fetching items from the portfolio.
      // We'll fetch students and their unverified projects/certs.
      const res = await axios.get('/api/student/all'); // Assume this exists or we'd create it
      const students = res.data;
      let allPending = [];

      students.forEach(s => {
        s.projects?.filter(p => !p.isVerified).forEach(p =>
          allPending.push({ ...p, type: 'project', studentName: s.user?.firstName || 'Student' }));
        s.certificates?.filter(c => !c.isVerified).forEach(c =>
          allPending.push({ ...c, type: 'certificate', studentName: s.user?.firstName || 'Student' }));
        s.skills?.filter(sk => !sk.isVerified).forEach(sk =>
          allPending.push({ ...sk, type: 'skill', skillName: sk.skill?.name, studentName: s.user?.firstName || 'Student' }));
      });

      setPendingItems(allPending);
    } catch (err) {
      console.error('Error fetching pending items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, type, status) => {
    try {
      await axios.patch(`${API_BASE}/${type}/${id}`, { isVerified: status });
      setPendingItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Verification failed', err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading verification queue...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Verification Dashboard</h1>

      {pendingItems.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border shadow-sm">
          <p className="text-slate-500">No pending items for verification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingItems.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-xl border shadow-sm flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase px-2 py-1 bg-slate-100 rounded text-slate-600">
                    {item.type}
                  </span>
                  <span className="text-sm font-medium text-slate-500">{item.studentName}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {item.name || item.skillName}
                </h3>
                <p className="text-sm text-slate-600">{item.description || item.issuer}</p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 text-xs hover:underline">
                    <ExternalLink size={12} /> View Evidence
                  </a>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleVerify(item.id, item.type, false)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition"
                  title="Reject"
                >
                  <XCircle size={22} />
                </button>
                <button
                  onClick={() => handleVerify(item.id, item.type, true)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-200 transition"
                  title="Verify"
                >
                  <CheckCircle size={22} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerificationDashboard;
