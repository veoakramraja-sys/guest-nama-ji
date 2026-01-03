
import React, { useState } from 'react';
import { useAuth } from '../authContext';
import { UserRole } from '../types';
import { 
  Users, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  UsersRound,
  Wallet,
  CheckSquare,
  MessageCircle,
  Send,
  LifeBuoy
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSupportModalOpen, setSupportModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.USER, UserRole.ADMIN] },
    { id: 'guests', label: 'Guests', icon: Users, roles: [UserRole.USER, UserRole.ADMIN] },
    { id: 'finance', label: 'Finance', icon: Wallet, roles: [UserRole.USER, UserRole.ADMIN] },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, roles: [UserRole.USER, UserRole.ADMIN] },
  ];

  if (user?.role === UserRole.ADMIN) {
    menuItems.push({ id: 'admin-stats', label: 'Analytics', icon: ShieldCheck, roles: [UserRole.ADMIN] });
    menuItems.push({ id: 'user-management', label: 'Users', icon: UsersRound, roles: [UserRole.ADMIN] });
  }

  const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

  const handleWhatsAppSend = () => {
    if (!feedback.trim()) return;
    const phoneNumber = "923498199472";
    const encodedText = encodeURIComponent(`*GuestNama Feedback*\n\nUser: ${user?.name}\nPhone: ${user?.phone}\n\nMessage:\n${feedback}`);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
    setFeedback('');
    setSupportModalOpen(false);
  };

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden selection:bg-amber-100">
      {/* Sidebar - Desktop Only (Hidden on Mobile) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-[#0f172a] text-slate-300 transform transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
           <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500 rounded-full blur-3xl translate-x-12 -translate-y-12"></div>
        </div>

        <div className="flex flex-col h-full relative z-10">
          <div className="p-8 pb-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg shadow-amber-500/30">G</div>
              <span className="text-xl font-bold tracking-tight text-white">Guest<span className="text-amber-500">Nama</span></span>
            </div>
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]
                  ${activeTab === item.id 
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <div className="flex items-center gap-3.5">
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </button>
            ))}
            <button
              onClick={() => setSupportModalOpen(true)}
              className="w-full flex items-center gap-3.5 px-5 py-4 text-sm font-bold rounded-2xl text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-all duration-300 mt-4 group cursor-pointer"
            >
              <LifeBuoy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Feedback
            </button>
          </nav>

          <div className="p-6 mt-auto border-t border-white/5">
            <button 
              onClick={() => { logout(); setSidebarOpen(false); }}
              className="w-full flex items-center px-5 py-4 text-sm font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 rounded-2xl transition-all group active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 lg:p-12 relative pb-24 lg:pb-12">
          {/* Mobile Profile Header */}
          <div className="lg:hidden flex items-center justify-between mb-8 pt-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0f172a]">{user?.name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{user?.role}</p>
                </div>
             </div>
             <button 
               className="p-3 bg-white rounded-xl shadow-sm border border-slate-100"
               onClick={() => setSupportModalOpen(true)}
             >
               <LifeBuoy className="w-5 h-5 text-slate-400" />
             </button>
          </div>

          <div className="max-w-6xl mx-auto page-transition">
            {children}
          </div>
        </div>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] to-transparent pointer-events-none">
          <div className="bg-[#0f172a]/95 backdrop-blur-xl rounded-[28px] p-2 flex items-center justify-between shadow-2xl border border-white/10 pointer-events-auto">
            {menuItems.filter(item => item.id !== 'admin-stats' && item.id !== 'user-management').map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  flex-1 flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all duration-300 relative
                  ${activeTab === item.id ? 'text-amber-500 scale-110' : 'text-slate-500'}
                `}
              >
                <item.icon className="w-6 h-6" />
                <span className={`text-[9px] font-bold mt-1 uppercase tracking-widest ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
                {activeTab === item.id && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]"></div>
                )}
              </button>
            ))}
            
            {/* Admin Toggle in Bottom Nav if Admin */}
            {user?.role === UserRole.ADMIN && (
               <button
                onClick={() => setActiveTab(activeTab === 'admin-stats' ? 'dashboard' : 'admin-stats')}
                className={`
                  flex-1 flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all duration-300
                  ${activeTab === 'admin-stats' || activeTab === 'user-management' ? 'text-indigo-400 scale-110' : 'text-slate-500'}
                `}
              >
                <ShieldCheck className="w-6 h-6" />
                <span className="text-[9px] font-bold mt-1 uppercase tracking-widest">Admin</span>
              </button>
            )}

            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
            <button 
              onClick={() => { if(confirm("Sign out from system?")) logout(); }}
              className="flex-1 flex flex-col items-center justify-center py-3 text-slate-500 active:text-rose-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* Support / Feedback Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSupportModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="bg-[#0f172a] p-6 lg:p-8 text-white">
              <div className="flex justify-between items-center mb-6">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <button onClick={() => setSupportModalOpen(false)} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <h2 className="text-xl font-bold">Feedback Hub</h2>
              <p className="text-slate-400 text-xs mt-1">Help us evolve the GuestNama experience</p>
            </div>

            <div className="p-6 lg:p-8 space-y-6">
              <textarea 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm resize-none min-h-[140px]"
                placeholder="Enter suggestions or report issues..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button 
                onClick={handleWhatsAppSend}
                disabled={!feedback.trim()}
                className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] disabled:bg-slate-200 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer"
              >
                <Send className="w-5 h-5" />
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
