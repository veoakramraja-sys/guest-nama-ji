
import React from 'react';
/* Added Wallet to the imports */
import { Users, Calendar, CheckCircle, Shield, ArrowRight, Star, Zap, Layout, Heart, Wallet } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  onLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart, onLogin }) => {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-amber-100 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation - Ultra Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-slate-200/40 bg-white/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 bg-[#0f172a] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-slate-900/20 group-hover:scale-105 transition-transform">G</div>
            <span className="text-xl font-black tracking-tighter text-[#0f172a]">Guest<span className="text-amber-500">Nama</span></span>
          </div>
          <div className="flex items-center gap-4 lg:gap-8">
            <button onClick={scrollToFeatures} className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-amber-500 transition-colors">Intelligence</button>
            <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
            <button onClick={onLogin} className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-[#0f172a] transition-all">
              Sign In
            </button>
            <button onClick={onStart} className="hidden sm:flex items-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95 transition-all">
              Join Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Visual Impact */}
      <section className="relative z-10 pt-32 lg:pt-52 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100/50">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Premier Event Intelligence</span>
            </div>
            <h1 className="text-5xl lg:text-8xl font-black text-[#0f172a] leading-[0.9] tracking-tight">
              Hospitality <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">Redefined.</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              The ultimate high-density dashboard for event planners. Track guests, manage logistics, and monitor finances with surgical precision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button onClick={onStart} className="w-full sm:w-auto px-10 py-5 bg-[#0f172a] text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                Launch System <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
              </button>
              <button onClick={scrollToFeatures} className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all">
                System Tour
              </button>
            </div>
            
            {/* Real-time stats simulation */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-10">
              <div className="space-y-1">
                <p className="text-3xl font-black text-[#0f172a]">24k+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Events Managed</p>
              </div>
              <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-[#0f172a]">99.9%</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cloud Uptime</p>
              </div>
            </div>
          </div>

          {/* Hero Visual - Dashboard Preview */}
          <div className="relative group perspective">
            <div className="absolute inset-0 bg-amber-500/10 rounded-[40px] blur-3xl group-hover:bg-amber-500/20 transition-all duration-700"></div>
            <div className="relative bg-white border border-slate-200 rounded-[40px] shadow-2xl p-6 lg:p-10 transform lg:rotate-[-4deg] group-hover:rotate-0 transition-all duration-700">
              {/* Fake Dashboard Elements */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Feed</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-slate-50 rounded-2xl border border-slate-100 p-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Headcount</p>
                    <p className="text-2xl font-black text-indigo-600">842</p>
                  </div>
                  <div className="h-24 bg-slate-50 rounded-2xl border border-slate-100 p-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Liquidity</p>
                    <p className="text-2xl font-black text-emerald-600">Rs. 4.2M</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-amber-500"></div>
                      <div className="w-20 h-2 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="w-12 h-4 bg-emerald-50 rounded-full"></div>
                  </div>
                  <div className="h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500"></div>
                      <div className="w-24 h-2 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="w-12 h-4 bg-amber-50 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid Style */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] tracking-tight">System Capabilities</h2>
            <p className="text-slate-500 font-medium">GuestNama provides a military-grade toolset for the most demanding organizers.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BentoCard 
              icon={<Users className="w-6 h-6 text-indigo-500" />}
              title="Census Control"
              desc="Real-time guest breakdown by demographic. Track men, women, and children with live headcount telemetry."
              span="md:col-span-2"
              bg="bg-indigo-50/50"
            />
            <BentoCard 
              icon={<Heart className="w-6 h-6 text-rose-500" />}
              title="Relationship Mapping"
              desc="Organize guests by family, friendship, or business ties for perfect seating plans."
              bg="bg-rose-50/50"
            />
            <BentoCard 
              icon={<Wallet className="w-6 h-6 text-emerald-500" />}
              title="Asset Liquidity"
              desc="Comprehensive PKR finance ledger. Monitor inflow, expenditure, and net balances automatically."
              bg="bg-emerald-50/50"
            />
            <BentoCard 
              icon={<CheckCircle className="w-6 h-6 text-amber-500" />}
              title="RSVP Intelligence"
              desc="Five-stage confirmation tracking: Pending, Chances, Maybe, Accepted, and Confirmed."
              span="md:col-span-2"
              bg="bg-amber-50/50"
            />
          </div>
        </div>
      </section>

      {/* CTA Box - Modern & High Impact */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto bg-[#0f172a] rounded-[40px] lg:rounded-[60px] p-10 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-amber-500/20 rounded-full blur-[120px] translate-x-[20%] translate-y-[-20%]"></div>
          
          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-7xl font-black leading-[1] tracking-tighter">Ready to take <br className="hidden lg:block" /> command?</h2>
            <p className="text-lg lg:text-xl text-slate-400 font-medium leading-relaxed">Join elite event organizers who demand absolute control over their guest logistics.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button onClick={onStart} className="w-full sm:w-auto px-12 py-5 bg-amber-500 text-[#0f172a] rounded-2xl font-black uppercase tracking-widest hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-3">
                Deploy System <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center text-[10px] font-black">
                     {String.fromCharCode(64 + i)}
                   </div>
                 ))}
                 <div className="pl-4 text-[10px] font-black text-slate-500 uppercase flex items-center">
                    +4k Online Now
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Precision Design */}
      <footer className="relative z-10 py-20 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center text-white font-black text-lg">G</div>
              <span className="text-xl font-black tracking-tighter text-[#0f172a]">Guest<span className="text-amber-500">Nama</span></span>
            </div>
            <p className="text-slate-500 font-medium max-w-sm">Built for perfectionists. Orchestrate your most complex events with the world's most detailed guest management system.</p>
          </div>
          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Security</h4>
             <ul className="space-y-2 text-sm font-bold text-[#0f172a]">
                <li>Cloud Verification</li>
                <li>SHA-256 Hashing</li>
                <li>Audit Logging</li>
             </ul>
          </div>
          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Compliance</h4>
             <ul className="space-y-2 text-sm font-bold text-[#0f172a]">
                <li>Privacy Policy</li>
                <li>System Terms</li>
                <li>SLA Registry</li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <p>© 2024 GuestNama Intelligence Platform</p>
          <div className="flex gap-6">
             <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> API v2.3.0 Stable</span>
             <span>Asia-Pacific Region</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const BentoCard = ({ icon, title, desc, span = "", bg = "" }: any) => (
  <div className={`${span} ${bg} p-10 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden`}>
    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-150 transition-all duration-700 pointer-events-none transform rotate-12">
      {/* Added <any> to fix 'className' property check error in React.cloneElement */}
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-32 h-32" })}
    </div>
    <div className="relative z-10 space-y-4">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-black text-[#0f172a]">{title}</h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);
