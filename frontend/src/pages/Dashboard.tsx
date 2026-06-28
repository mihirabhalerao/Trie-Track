import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';

export default function Dashboard() {
  const email = useAuthStore((state) => state.email);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Outgoing network interceptor handles attaching the current active Bearer JWT token automatically
      await api.post('/api/v1/auth/logout');
    } catch (err) {
      console.error('Failed to notify backend of session logout', err);
    } finally {
      // Always wipe local memory state even if server container connection times out
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl text-center">
        <span className="bg-sky-500/10 border border-sky-500/20 text-sky-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          Secure Session Active
        </span>
        <h1 className="text-4xl font-black text-white mt-4 mb-2">Trie-Track Dashboard</h1>
        <p className="text-slate-400 mb-6">Welcome back, <span className="text-white font-medium">{email}</span></p>
        
        <hr className="border-slate-800 mb-6" />

        <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-slate-950 text-red-400 font-semibold px-6 py-2.5 rounded-lg cursor-pointer transition-all">
          Terminate Session (Logout)
        </button>
      </div>
    </div>
  );
}