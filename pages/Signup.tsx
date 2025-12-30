import React, { useState } from 'react';
import { useAuth } from '../authContext';
import { User, Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface SignupProps {
  onSwitch: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSwitch }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm) return setError('Passwords do not match');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');

    setIsLoading(true);
    try {
      // Logic: Password hashing is now handled inside AuthContext using SHA-256
      const success = await signup(formData.name, formData.email, formData.password);
      if (!success) setError('This email is already registered.');
    } catch (err) {
      setError('An error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Brand Panel */}
      <div className="lg:w-1/2 bg-[#0f172a] p-12 lg:p-24 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-20">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">G</div>
            <span className="text-xl font-bold tracking-tight">Guest<span className="text-amber-500">Nama</span></span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-serif leading-tight">
            Create your <br />
            <span className="text-amber-500">professional</span> account
          </h1>
          <p className="mt-8 text-slate-400 text-lg max-w-md leading-relaxed">
            Organize weddings, corporate events, and parties with the most elegant guest management tool.
          </p>
        </div>
        <p className="text-slate-500 text-sm relative z-10 font-bold tracking-widest uppercase">© 2024 GuestNama Platform</p>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Form Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-slate-50/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0f172a]">Registration</h2>
            <p className="text-slate-500 mt-2">Join GuestNama for smart hospitality management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm flex items-start animate-in fade-in">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required
                  type="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                  placeholder="you@domain.com"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input 
                  required
                  type="password"
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm</label>
                <input 
                  required
                  type="password"
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                  placeholder="••••••"
                  value={formData.confirm}
                  onChange={e => setFormData(p => ({ ...p, confirm: e.target.value }))}
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full mt-4 py-4.5 bg-[#0f172a] text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Signup <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <button onClick={onSwitch} className="font-bold text-amber-500 hover:text-amber-600 cursor-pointer underline-offset-4 hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
};