import React from 'react';
import { Users, Calendar, CheckCircle, Shield, ArrowRight } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  onLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart, onLogin }) => {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-transparent selection:bg-amber-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 py-4 lg:px-20 border-b border-slate-200/50 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/20">G</div>
          <span className="text-xl font-bold tracking-tight text-[#0f172a]">Guest<span className="text-amber-500">Nama</span></span>
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          <button onClick={scrollToFeatures} className="hidden md:block text-sm font-bold text-slate-500 hover:text-amber-500 transition-colors">Features</button>
          <button onClick={onLogin} className="text-sm font-bold flex items-center gap-1 hover:text-amber-600 transition-all bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm active:scale-95">
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 lg:py-32 text-center max-w-4xl mx-auto relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] lg:text-xs font-bold mb-8 shadow-sm border border-amber-100/50">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Hospitality made simple
        </div>
        <h1 className="text-4xl lg:text-7xl font-serif text-[#0f172a] mb-6 tracking-tight leading-[1.1]">
          Manage your guests <br />
          <span className="text-amber-500">with elegance</span>
        </h1>
        <p className="text-base lg:text-lg text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
          A sophisticated platform for organizing events, tracking RSVPs, and ensuring every guest feels welcome. From intimate gatherings to grand celebrations.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onStart} className="w-full sm:w-auto px-8 py-4 bg-[#0f172a] text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95">
            Start Free <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={scrollToFeatures} className="w-full sm:w-auto px-8 py-4 border border-slate-200 rounded-2xl font-bold hover:bg-white transition-all bg-white/50 backdrop-blur-sm active:scale-95">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white/40 backdrop-blur-xl border-y border-slate-200/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-[#0f172a] mb-4">Everything you need</h2>
            <p className="text-slate-500">Powerful features to make guest management effortless</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-amber-500" />}
              title="Guest Management"
              desc="Organize and track all your guests in one place"
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6 text-amber-500" />}
              title="Event Tracking"
              desc="Manage multiple events with ease"
            />
            <FeatureCard 
              icon={<CheckCircle className="w-6 h-6 text-amber-500" />}
              title="RSVP Status"
              desc="Track confirmations and check-ins in real-time"
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-amber-500" />}
              title="Secure Access"
              desc="Role-based permissions for your team"
            />
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto bg-[#1e293b] rounded-[32px] lg:rounded-[40px] p-8 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-50"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl font-serif mb-6 leading-tight">Ready to streamline your <br className="hidden lg:block" /> guest management?</h2>
            <p className="text-slate-400 mb-10 max-w-lg mx-auto text-sm lg:text-base">Join thousands of event organizers who trust GuestNama for their hospitality needs.</p>
            <button onClick={onStart} className="inline-flex items-center gap-2 text-amber-500 font-bold hover:text-amber-400 transition-all text-lg group active:scale-95">
              Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-200/50 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-6 bg-white/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 opacity-80">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">G</div>
          <span className="text-xl font-bold tracking-tight text-[#0f172a]">Guest<span className="text-amber-500">Nama</span></span>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
          <p className="text-slate-400 text-xs">© 2024 GuestNama. All rights reserved.</p>
          <p className="text-slate-300 text-[10px] uppercase tracking-widest font-bold">Secure Cloud Hosting</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
      <div className="group-hover:text-white transition-colors">{icon}</div>
    </div>
    <h3 className="text-lg font-bold text-[#0f172a] mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);