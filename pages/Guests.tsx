
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { Guest } from '../types';
import { RSVP_STATUSES } from '../constants';
import { 
  Plus, 
  Search, 
  Loader2,
  Trash2,
  RefreshCw,
  FileText,
  X,
  Filter,
  Users,
  CheckCircle2,
  MapPin,
  ChevronRight,
  User,
  UserPlus,
  Baby
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

  const initialFormState = {
    name: '',
    phone: '',
    city: '',
    vipStatus: false,
    men: 0,
    women: 0,
    children: 0,
    relationship: 'Family',
    ownCar: 'No (Need Transport)',
    invitedBy: '',
    rsvpStatus: 'Pending' as Guest['rsvpStatus'],
    invitationSent: 'Not Sent',
    notes: '',
    group: 'Other' as Guest['group'],
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
      const name = g.name || "";
      const phone = g.phone || "";
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            phone.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const rowsHtml = filteredGuests.map((g, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><b>${g.name}</b></td>
        <td>${g.city}</td>
        <td style="text-align: center;">${g.men}</td>
        <td style="text-align: center;">${g.women}</td>
        <td style="text-align: center;">${g.children}</td>
        <td style="text-align: center; font-weight: bold;">${g.totalPersons}</td>
        <td>${g.rsvpStatus}</td>
      </tr>`).join('');
    printWindow.document.write(`<html><head><style>body { font-family: sans-serif; padding: 20px; font-size: 10px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #eee; padding: 6px; }</style></head><body><h2>GuestNama Directory</h2><table><thead><tr><th>#</th><th>Name</th><th>City</th><th>M</th><th>W</th><th>C</th><th>Total</th><th>RSVP</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

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
    const currentIndex = RSVP_STATUSES.indexOf(guest.rsvpStatus as any);
    const nextStatus = RSVP_STATUSES[(currentIndex + 1) % RSVP_STATUSES.length] as Guest['rsvpStatus'];
    setGuestList(prev => prev.map(g => g.id === guest.id ? { ...g, rsvpStatus: nextStatus } : g));
    try { await StorageService.updateGuestStatus(guest.id, nextStatus); } catch (err) { refreshGuests(); }
  };

  return (
    <div className="space-y-4 lg:space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#0f172a] tracking-tight">Directory</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{filteredGuests.length} Active Records</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={() => setIsFormOpen(true)} className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-xs">
            <Plus className="w-4 h-4" /> Register Family
          </button>
          <button onClick={refreshGuests} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 active:rotate-180 transition-transform duration-500">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-slate-50 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text"
              placeholder="Quick search..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-xs font-bold shadow-inner"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0">RSVP:</span>
              {['All', ...RSVP_STATUSES].map(status => (
                <button 
                  key={status} 
                  onClick={() => setStatusFilter(status)} 
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${statusFilter === status ? 'bg-[#0f172a] text-white border-[#0f172a]' : 'bg-white text-slate-400 border-slate-200'}`}
                >
                  {status}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0">Demo:</span>
              {(['All', 'Has Men', 'Has Women', 'Has Children'] as DemographicFilter[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setDemoFilter(cat)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${demoFilter === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* HIGH-DENSITY LIST (MOBILE) */}
        <div className="lg:hidden divide-y divide-slate-50">
          {filteredGuests.length > 0 ? filteredGuests.map(guest => (
            <div key={guest.id} className="p-4 flex items-center justify-between group active:bg-slate-50 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${guest.vipStatus ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-slate-100 text-slate-400'}`}>
                  {guest.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-800 truncate flex items-center gap-1">
                    {guest.name} {guest.vipStatus && <CheckCircle2 className="w-3 h-3 text-amber-500" />}
                  </h4>
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-0.5"><User className="w-2.5 h-2.5" />{guest.men}</span>
                    <span className="flex items-center gap-0.5"><UserPlus className="w-2.5 h-2.5" />{guest.women}</span>
                    <span className="flex items-center gap-0.5"><Baby className="w-2.5 h-2.5" />{guest.children}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] font-black text-indigo-600">{guest.totalPersons}P</p>
                  <button onClick={() => toggleRsvpStatus(guest)} className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${guest.rsvpStatus === 'Confirmed' ? 'text-emerald-500 bg-emerald-50' : 'text-amber-500 bg-amber-50'}`}>
                    {guest.rsvpStatus}
                  </button>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-200" />
              </div>
            </div>
          )) : (
            <div className="py-12 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No records found</div>
          )}
        </div>

        {/* TABLE (DESKTOP) */}
        <div className="hidden lg:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Entry</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 text-center">M</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 text-center">W</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 text-center">K</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 text-center">Total</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400">RSVP</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.map(guest => (
                <tr key={guest.id} className="hover:bg-amber-50/10 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${guest.vipStatus ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{guest.name.charAt(0)}</div>
                      <div>
                        <p className="text-xs font-black text-slate-800">{guest.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{guest.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-xs font-bold text-slate-600">{guest.men}</td>
                  <td className="px-4 py-4 text-center text-xs font-bold text-slate-600">{guest.women}</td>
                  <td className="px-4 py-4 text-center text-xs font-bold text-slate-600">{guest.children}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="px-2 py-0.5 bg-[#0f172a] text-white rounded-md text-[9px] font-black">{guest.totalPersons}</span>
                  </td>
                  <td className="px-4 py-4">
                    <button onClick={() => toggleRsvpStatus(guest)} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest transition-all ${guest.rsvpStatus === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {guest.rsvpStatus}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { if(confirm("Remove?")) StorageService.deleteGuest(guest.id).then(refreshGuests); }} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            {filteredGuests.length > 0 && (
              <tfoot className="bg-slate-50/50 font-black text-[#0f172a] text-xs">
                <tr>
                  <td className="px-6 py-4">TOTALS</td>
                  <td className="text-center">{totals.men}</td>
                  <td className="text-center">{totals.women}</td>
                  <td className="text-center">{totals.children}</td>
                  <td className="text-center text-indigo-600">{totals.total}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-[#0f172a]">New Registry</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleAddGuest} className="space-y-4 pb-8 sm:pb-0">
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Guest Name</label>
                    <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-amber-500 font-bold text-xs" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                    <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-amber-500 font-bold text-xs" value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference</label>
                    <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-amber-500 font-bold text-xs" value={formData.invitedBy} onChange={e => setFormData(p => ({ ...p, invitedBy: e.target.value }))} />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-center">
                    <label className="text-[8px] font-black text-slate-400 uppercase">Men</label>
                    <input type="number" min="0" className="w-full py-2 text-center font-black text-slate-800 bg-white rounded-lg border border-slate-200 outline-none text-xs" value={formData.men} onChange={e => setFormData(p => ({ ...p, men: Number(e.target.value) }))} />
                  </div>
                  <div className="text-center">
                    <label className="text-[8px] font-black text-slate-400 uppercase">Women</label>
                    <input type="number" min="0" className="w-full py-2 text-center font-black text-slate-800 bg-white rounded-lg border border-slate-200 outline-none text-xs" value={formData.women} onChange={e => setFormData(p => ({ ...p, women: Number(e.target.value) }))} />
                  </div>
                  <div className="text-center">
                    <label className="text-[8px] font-black text-slate-400 uppercase">Kids</label>
                    <input type="number" min="0" className="w-full py-2 text-center font-black text-slate-800 bg-white rounded-lg border border-slate-200 outline-none text-xs" value={formData.children} onChange={e => setFormData(p => ({ ...p, children: Number(e.target.value) }))} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                   <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Calculated Total: {formData.men + formData.women + formData.children}P</p>
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-slate-500 uppercase">VIP?</span>
                     <input type="checkbox" className="w-5 h-5 accent-amber-500" checked={formData.vipStatus} onChange={e => setFormData(p => ({ ...p, vipStatus: e.target.checked }))} />
                   </div>
                </div>
              </div>
              <button disabled={isLoading} className="w-full py-4 bg-[#0f172a] text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 text-sm">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
