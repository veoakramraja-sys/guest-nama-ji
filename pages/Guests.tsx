
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { Guest } from '../types';
import { RSVP_STATUSES, RELATIONSHIPS, CAR_STATUS, INVITE_STATUS } from '../constants';
import { 
  Plus, 
  Search, 
  Loader2,
  Trash2,
  RefreshCw,
  X,
  Users,
  CheckCircle2,
  MapPin,
  ChevronRight,
  User,
  UserPlus,
  Baby,
  Star,
  Mail,
  MailCheck,
  Info
} from 'lucide-react';

type DemographicFilter = 'All' | 'Has Men' | 'Has Women' | 'Has Children';

export const Guests: React.FC = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [demoFilter, setDemoFilter] = useState<DemographicFilter>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [guestList, setGuestList] = useState<Guest[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const initialFormState: Omit<Guest, 'id' | 'userId' | 'checkedIn' | 'totalPersons'> = {
    name: '',
    phone: '',
    city: '',
    vipStatus: false,
    invitationRequired: false,
    men: 0,
    women: 0,
    children: 0,
    relationship: 'Family',
    ownCar: 'No (Need Transport)',
    invitedBy: '',
    rsvpStatus: 'Pending',
    invitationSent: 'Not Sent',
    notes: '',
    group: 'Other',
    eventDate: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(initialFormState);

  const refreshGuests = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      const data = await StorageService.getGuests(user.id, user.role);
      setGuestList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    refreshGuests();
  }, [user]);

  const filteredGuests = useMemo(() => {
    return guestList.filter(g => {
      const search = searchQuery.toLowerCase();
      const matchesSearch = (g.name || "").toLowerCase().includes(search) || 
                            (g.phone || "").toLowerCase().includes(search) ||
                            (g.city || "").toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'All' || g.rsvpStatus === statusFilter;
      
      let matchesDemo = true;
      if (demoFilter === 'Has Men') matchesDemo = (Number(g.men) || 0) > 0;
      if (demoFilter === 'Has Women') matchesDemo = (Number(g.women) || 0) > 0;
      if (demoFilter === 'Has Children') matchesDemo = (Number(g.children) || 0) > 0;

      return matchesSearch && matchesStatus && matchesDemo;
    });
  }, [guestList, searchQuery, statusFilter, demoFilter]);

  const totals = useMemo(() => {
    return filteredGuests.reduce((acc, g) => ({
      men: acc.men + (Number(g.men) || 0),
      women: acc.women + (Number(g.women) || 0),
      children: acc.children + (Number(g.children) || 0),
      total: acc.total + (Number(g.totalPersons) || 0)
    }), { men: 0, women: 0, children: 0, total: 0 });
  }, [filteredGuests]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !user) return;
    setIsLoading(true);
    try {
      const newGuest: Guest = {
        ...formData,
        id: crypto.randomUUID(),
        userId: user.id,
        checkedIn: false,
        totalPersons: (Number(formData.men) || 0) + (Number(formData.women) || 0) + (Number(formData.children) || 0)
      };
      await StorageService.addGuest(newGuest);
      await refreshGuests();
      setIsFormOpen(false);
      setFormData(initialFormState);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const toggleRsvpStatus = async (guest: Guest) => {
    const statuses = ['Pending', 'Confirmed', 'Accepted', 'Chances', 'Maybe', 'Declined'] as const;
    const currentIndex = statuses.indexOf(guest.rsvpStatus as any);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length] as Guest['rsvpStatus'];
    setGuestList(prev => prev.map(g => g.id === guest.id ? { ...g, rsvpStatus: nextStatus } : g));
    try { await StorageService.updateGuestStatus(guest.id, nextStatus); } catch (err) { refreshGuests(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this entry?")) return;
    try {
      await StorageService.deleteGuest(id);
      await refreshGuests();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-3 lg:space-y-6 animate-in fade-in duration-500 pb-20 max-h-screen overflow-y-auto no-scrollbar">
      {/* HEADER */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div>
          <h1 className="text-xl font-black text-[#0f172a] tracking-tight">Directory</h1>
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em]">{filteredGuests.length} Records</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsFormOpen(true)} className="bg-amber-500 text-white p-2.5 rounded-xl shadow-lg active:scale-95 transition-all">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={refreshGuests} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* COMPACT FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
          <input 
            type="text"
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none text-[10px] font-bold"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Confirmed', 'Pending', 'Accepted', 'Chances', 'Maybe'].map(status => (
            <button 
              key={status} 
              onClick={() => setStatusFilter(status)} 
              className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${statusFilter === status ? 'bg-[#0f172a] text-white border-[#0f172a]' : 'bg-white text-slate-400 border-slate-200'}`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['All', 'Has Men', 'Has Women', 'Has Children'] as DemographicFilter[]).map(cat => (
            <button
              key={cat}
              onClick={() => setDemoFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${demoFilter === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* COMPACT CARDS */}
      <div className="grid grid-cols-1 gap-2">
        {filteredGuests.map(guest => (
          <div key={guest.id} className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-between gap-2 active:bg-slate-50 transition-all shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${guest.vipStatus ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {guest.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] font-black text-slate-800 truncate flex items-center gap-1">
                  {guest.name} 
                  {guest.vipStatus && <Star className="w-2 h-2 fill-amber-500 text-amber-500" />}
                  {guest.invitationRequired && (guest.invitationSent === 'Sent' || guest.invitationSent === 'Delivered' || guest.invitationSent === 'Seen' ? <MailCheck className="w-2.5 h-2.5 text-emerald-500" /> : <Mail className="w-2.5 h-2.5 text-slate-300" />)}
                </h4>
                <div className="flex items-center gap-1.5 text-[7px] text-slate-400 font-bold uppercase tracking-widest truncate">
                  <span className="flex items-center gap-0.5"><MapPin className="w-1.5 h-1.5" />{guest.city || 'City'}</span>
                  <span>{guest.relationship}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-1 rounded-lg">
                <span className="text-[9px] font-black text-slate-700">{guest.totalPersons}P</span>
              </div>
              <button 
                onClick={() => toggleRsvpStatus(guest)} 
                className={`w-12 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-tighter transition-all ${guest.rsvpStatus === 'Confirmed' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'}`}
              >
                {guest.rsvpStatus}
              </button>
              <button onClick={() => handleDelete(guest.id)} className="p-1.5 text-slate-200 active:text-rose-500">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MINI FOOTER TOTALS */}
      {filteredGuests.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-[#0f172a] text-white rounded-xl p-2 flex items-center justify-between px-6 shadow-2xl z-40">
           <div className="text-center"><p className="text-[6px] text-slate-400 uppercase font-black">M</p><p className="text-[10px] font-black">{totals.men}</p></div>
           <div className="text-center"><p className="text-[6px] text-slate-400 uppercase font-black">W</p><p className="text-[10px] font-black">{totals.women}</p></div>
           <div className="text-center"><p className="text-[6px] text-slate-400 uppercase font-black">C</p><p className="text-[10px] font-black">{totals.children}</p></div>
           <div className="h-4 w-[1px] bg-white/10"></div>
           <div className="text-center"><p className="text-[6px] text-amber-400 uppercase font-black">INVITED</p><p className="text-xs font-black text-amber-500">{totals.total}</p></div>
        </div>
      )}

      {/* REGISTRATION FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="absolute inset-0 bg-[#0f172a]/70 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full sm:max-w-xl bg-white rounded-t-[24px] sm:rounded-[24px] p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-1 z-10 border-b border-slate-50">
              <h2 className="text-sm font-black text-[#0f172a]">Registration Portal</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 bg-slate-50 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleAddGuest} className="space-y-4 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Guest / Family Head</label>
                  <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[10px]" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">City / Village</label>
                  <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[10px]" value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Invited By (Ref)</label>
                  <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[10px]" value={formData.invitedBy} onChange={e => setFormData(p => ({ ...p, invitedBy: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl">
                 <div className="text-center">
                   <label className="text-[7px] font-black text-slate-400 uppercase">Men</label>
                   <input type="number" min="0" className="w-full py-2 text-center font-black text-slate-800 bg-white rounded-lg border border-slate-100 outline-none text-[10px]" value={formData.men} onChange={e => setFormData(p => ({ ...p, men: Number(e.target.value) }))} />
                 </div>
                 <div className="text-center">
                   <label className="text-[7px] font-black text-slate-400 uppercase">Women</label>
                   <input type="number" min="0" className="w-full py-2 text-center font-black text-slate-800 bg-white rounded-lg border border-slate-100 outline-none text-[10px]" value={formData.women} onChange={e => setFormData(p => ({ ...p, women: Number(e.target.value) }))} />
                 </div>
                 <div className="text-center">
                   <label className="text-[7px] font-black text-slate-400 uppercase">Kids</label>
                   <input type="number" min="0" className="w-full py-2 text-center font-black text-slate-800 bg-white rounded-lg border border-slate-100 outline-none text-[10px]" value={formData.children} onChange={e => setFormData(p => ({ ...p, children: Number(e.target.value) }))} />
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Relationship Category</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[10px]" value={formData.group} onChange={e => setFormData(p => ({ ...p, group: e.target.value as any }))}>
                    {['Family', 'Friends', 'Colleagues', 'Business', 'Relative', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Transport Required?</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[10px]" value={formData.ownCar} onChange={e => setFormData(p => ({ ...p, ownCar: e.target.value }))}>
                    <option value="Yes (Has Own Car)">Yes (Has Own Car)</option>
                    <option value="No (Need Transport)">No (Need Transport)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Current RSVP Status</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[10px]" value={formData.rsvpStatus} onChange={e => setFormData(p => ({ ...p, rsvpStatus: e.target.value as any }))}>
                    {['Pending', 'Confirmed', 'Accepted', 'Chances', 'Maybe', 'Declined'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Invitation Status</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[10px]" value={formData.invitationSent} onChange={e => setFormData(p => ({ ...p, invitationSent: e.target.value }))}>
                    <option value="Not Sent">Not Sent</option>
                    <option value="Sent">Sent</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Seen">Seen</option>
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex flex-col gap-2">
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-amber-500" checked={formData.vipStatus} 
                      onChange={e => {
                        const isVip = e.target.checked;
                        setFormData(p => ({ ...p, vipStatus: isVip, invitationRequired: isVip ? true : p.invitationRequired }));
                      }} 
                    />
                    <span className="text-[9px] font-black uppercase text-amber-700">VIP / Protocol Guest</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-indigo-500" checked={formData.invitationRequired} onChange={e => setFormData(p => ({ ...p, invitationRequired: e.target.checked }))} />
                    <span className="text-[9px] font-black uppercase text-indigo-700">Requires Physical Invitation Card</span>
                 </label>
              </div>

              <textarea className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[10px] h-16" placeholder="Additional Notes..." value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />

              <button disabled={isLoading} className="w-full py-3 bg-[#0f172a] text-white font-black rounded-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Guest Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
