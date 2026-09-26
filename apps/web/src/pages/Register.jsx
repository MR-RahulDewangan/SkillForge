import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerUser(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
            <UserPlus size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">SkillForge Registration</h2>
        <p className="text-center text-sm text-slate-500 mb-6">Academia-Industry Collaboration Platform</p>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input 
                type="text" 
                value={formData.firstName} 
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input 
                type="text" 
                value={formData.lastName} 
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                required 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="STUDENT">Student</option>
              <option value="INDUSTRY">Industry/Recruiter</option>
              <option value="FACULTY">Faculty/Academician</option>
              <option value="INSTITUTION_ADMIN">Institution Admin</option>
            </select>
          </div>
          <button className="w-full bg-emerald-600 text-white p-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition">
            Sign Up
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Login</Link>
        </p>
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link to="/privacy" className="hover:text-slate-700 transition">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-slate-700 transition">Terms & Conditions</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
