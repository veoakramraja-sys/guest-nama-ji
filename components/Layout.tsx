
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
    menuItems.push({ id: 'user-management', label: 'User Directory', icon: UsersRound, roles: [UserRole.ADMIN] });
  }

  const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

  const handleWhatsAppSend = () => {
    if (!feedback.trim()) return;
    const phoneNumber = "923498199472";
    const encodedText = encodeURIComponent(`*GuestNama Feedback*\n\nUser: ${user?.name}\nEmail: ${user?.email}\n\nMessage:\n${feedback}`);
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
      {/* Mobile Glassmorphism Toggle */}
      {!isSidebarOpen && (
        <button 
          className="lg:hidden fixed top-5 right-5 z-[60] p-3.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 active:scale-90 transition-all cursor-pointer"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6 text-[#0f172a]" />
        </button>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-[#0f172a] text-slate-300 transform transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
           <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500 rounded-full blur-3xl translate-x-12 -translate-y-12"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600 rounded-full blur-3xl -translate-x-12 translate-y-12"></div>
        </div>

        <div className="flex flex-col h-full relative z-10">
          <div className="p-8 pb-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg shadow-amber-500/30">G</div>
              <span className="text-xl font-bold tracking-tight text-white">Guest<span className="text-amber-500">Nama</span></span>
            </div>
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer active:scale-90" onClick={() => setSidebarOpen(false)}>
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
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20 translate-x-1' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <div className="flex items-center gap-3.5">
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : ''}`} />
                  {item.label}
                </div>
                {activeTab === item.id && <ChevronRight className="w-4 h-4 animate-in fade-in slide-in-from-left-2" />}
              </button>
            ))}

            {/* Support Trigger Button */}
            <button
              onClick={() => setSupportModalOpen(true)}
              className="w-full flex items-center gap-3.5 px-5 py-4 text-sm font-bold rounded-2xl text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-all duration-300 mt-4 group cursor-pointer active:scale-[0.98]"
            >
              <LifeBuoy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Report & Feedback
            </button>
          </nav>

          <div className="p-6 mt-auto">
            <div className="flex items-center p-4 mb-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-black text-lg mr-4 shadow-lg border border-white/10">
                {user?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-amber-500 uppercase tracking-widest font-black flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  {user?.role}
                </p>
              </div>
            </div>
            <button 
              onClick={() => { logout(); setSidebarOpen(false); }}
              className="w-full flex items-center px-5 py-4 text-sm font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 rounded-2xl transition-all group active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-3.5 group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-300" onClick={() => setSidebarOpen(false)} />
        )}
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-12 relative">
          {/* Top header spacing for mobile toggle */}
          <div className="lg:hidden h-14"></div>
          
          <div className="max-w-6xl mx-auto page-transition pb-12">
            {children}
          </div>
        </div>
      </main>

      {/* Support / Feedback Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSupportModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#0f172a] p-6 lg:p-8 text-white relative">
              <div className="absolute top-0 right-0 p-4 lg:p-6">
                <button onClick={() => setSupportModalOpen(false)} className="text-white/40 hover:text-white transition-colors cursor-pointer active:scale-90">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-amber-500 rounded-2xl flex items-center justify-center mb-4 lg:mb-6 shadow-xl shadow-amber-500/20">
                <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold">Help & Support</h2>
              <p className="text-slate-400 text-xs lg:text-sm mt-1 lg:mt-2">How can we make GuestNama better for you?</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 lg:p-8 space-y-6">
              <div className="bg-slate-50 border border-slate-100 p-4 lg:p-5 rounded-2xl">
                <p className="text-slate-700 text-xs lg:text-sm font-medium leading-relaxed">
                  <span className="block mb-2 font-bold text-[#0f172a]">GuestNama ko behtar banane mein hamari madad karein!</span>
                  Agar aapko istemal mein koi dushwari pesh aa rahi hai, ya aap naye features shamil karwana chahte hain, to nichay diye gaye box mein likhein aur WhatsApp par hum se rabta karein.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
                <textarea 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm resize-none min-h-[120px]"
                  placeholder="Enter your suggestions or report issues here..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <button 
                onClick={handleWhatsAppSend}
                disabled={!feedback.trim()}
                className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] disabled:bg-slate-200 text-white font-bold rounded-2xl shadow-xl shadow-green-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group cursor-pointer"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Send via WhatsApp
              </button>
              
              <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Fast Response • Direct Assistance
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
