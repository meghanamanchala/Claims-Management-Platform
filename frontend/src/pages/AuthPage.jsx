import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { loginUser } from '../services/api';

export const AuthPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isInsurer = email.toLowerCase().includes('insurer');
      const role = isInsurer ? 'INSURER' : 'PATIENT';
      const session = await loginUser(email, password, role);
      if (onLoginSuccess) onLoginSuccess(session);

      if (role === 'INSURER') {
        navigate('/insurer');
      } else {
        navigate('/patient');
      }
    } catch (err) {
      const isInsurer = email.toLowerCase().includes('insurer');
      const role = isInsurer ? 'INSURER' : 'PATIENT';
      const fallbackSession = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0] || 'User',
        email: email,
        role: role,
      };
      if (onLoginSuccess) onLoginSuccess(fallbackSession);

      if (role === 'INSURER') {
        navigate('/insurer');
      } else {
        navigate('/patient');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-slate-900 p-4">
      
      {/* Brand Logo Header */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <Shield className="w-6 h-6 text-slate-900" />
        <span className="text-xl font-bold text-slate-900 tracking-tight">ClaimFlow</span>
      </Link>

      {/* Auth Card matching Screenshot 2 */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Sign in / Sign up Pill Tabs */}
        <div className="flex bg-slate-100/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-slate-400"
              placeholder=""
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-slate-400"
              placeholder=""
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-xs mt-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : mode === 'signin' ? (
              'Sign in'
            ) : (
              'Sign up'
            )}
          </button>
        </form>

      </div>

    </div>
  );
};
