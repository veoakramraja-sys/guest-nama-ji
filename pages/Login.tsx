import React, { useState } from 'react';
import { useAuth } from '../authContext';
import { Lock, Mail, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginProps {
  onSwitch: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitch }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Logic: Password hashing is now handled inside AuthContext using SHA-256
      const success = await login(email, password);
      if (!success) setError('Invalid email or password combination.');
    } catch (err) {
      setError('A connection error occurred. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white selection:bg-amber-100">
      {/* Brand Panel */}
      <div className="lg:w-1/2 bg-[#0f172a] p-8 lg:p-24 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12 lg:mb-20">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">G</div>
            <span className="text-xl font-bold tracking-tight">Guest<span className="text-amber-500">Nama</span></span>
          </div>
          <h1 className="text-3xl lg:text-6xl font-serif leading-tight">
            Manage your guests <br />
            with <span className="text-amber-500">elegance</span>
          </h1>
          <p className="mt-6 lg:mt-8 text-slate-400 text-sm lg:text-lg max-w-md leading-relaxed">
            A sophisticated platform for organizing events, tracking RSVPs, and ensuring every guest feels welcome.
          </p>
        </div>
        <p className="text-slate-500 text-xs lg:text-sm mt-12 lg:mt-0 relative z-10 font-bold uppercase tracking-widest">© 2024 GuestNama • Secure Access</p>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Form Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-24 bg-slate-50/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a]">Secure Login</h2>
            <p className="text-slate-500 mt-2 text-sm lg:text-base">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-sm flex items-start animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  required
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full py-4.5 bg-[#0f172a] text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 disabled:bg-slate-200 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Need an account?{' '}
            <button onClick={onSwitch} className="font-bold text-amber-500 hover:text-amber-600 underline-offset-4 hover:underline cursor-pointer">Register here</button>
          </p>
        </div>
      </div>
    </div>
  );
};