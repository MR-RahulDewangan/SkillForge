import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginUser({ email, password });
      setAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <LogIn size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Welcome Back</h2>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              required 
            />
          </div>
          <button className="w-full bg-indigo-600 text-white p-2 rounded font-semibold hover:bg-indigo-700 transition">
            Sign In
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-slate-600">
          Don't have an account? <a href="/register" className="text-indigo-600 font-semibold">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
