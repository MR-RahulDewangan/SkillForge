import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser({ email: email.trim().toLowerCase(), password });
      setAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000');
      } else {
        setError(err.response.data?.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <LogIn size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">SkillForge Login</h2>
        <p className="text-center text-sm text-slate-500 mb-6">Academia–Industry Collaboration Portal</p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. stu001@student.edu"
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast-Login Selector */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Quick Fill Demo Accounts (Password: password123)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('stu001@student.edu')}
              className="p-2 border border-slate-200 rounded text-left hover:bg-slate-50 hover:border-indigo-400 transition"
            >
              <div className="font-medium text-slate-800">🎓 Student (Full Stack)</div>
              <div className="text-slate-500 truncate">stu001@student.edu</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('stu004@student.edu')}
              className="p-2 border border-slate-200 rounded text-left hover:bg-slate-50 hover:border-indigo-400 transition"
            >
              <div className="font-medium text-slate-800">📊 Student (Data Analyst)</div>
              <div className="text-slate-500 truncate">stu004@student.edu</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('contact@comp001.example.com')}
              className="p-2 border border-slate-200 rounded text-left hover:bg-slate-50 hover:border-indigo-400 transition"
            >
              <div className="font-medium text-slate-800">🏢 Industry (NexaTech)</div>
              <div className="text-slate-500 truncate">comp001</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@institution.edu')}
              className="p-2 border border-slate-200 rounded text-left hover:bg-slate-50 hover:border-indigo-400 transition"
            >
              <div className="font-medium text-slate-800">🏛️ Admin (Institution)</div>
              <div className="text-slate-500 truncate">admin@institution.edu</div>
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-slate-600">
          Don't have an account? <a href="/register" className="text-indigo-600 font-semibold hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
