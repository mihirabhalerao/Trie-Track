import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/v1/auth/register', { name, email, password });
      const { token } = response.data;
      
      // Save identity token straight into global Zustand memory
      setAuth(token, email);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-sky-400 mb-6 text-center">Create Account</h2>
        
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-sm">{error}</div>}
        
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Full Name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded text-white focus:outline-none focus:border-sky-500 transition-colors" />
        </div>

        <div className="mb-4">
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Email Address</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded text-white focus:outline-none focus:border-sky-500 transition-colors" />
        </div>

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded text-white focus:outline-none focus:border-sky-500 transition-colors" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-800 text-slate-950 font-bold py-3 rounded-lg cursor-pointer transition-colors">
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-sky-400 hover:underline">Log In</Link>
        </p>
      </form>
    </div>
  );
}