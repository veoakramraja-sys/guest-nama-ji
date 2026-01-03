
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
  Download,
  FileSpreadsheet,
  Users
} from 'lucide-react';

type CategoryFilter = 'All' | 'Men' | 'Women' | 'Children';

export const Guests: React.FC = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
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
      
      let matchesCategory = true;
      if (categoryFilter === 'Men') matchesCategory = (Number(g.men) || 0) > 0;
      if (categoryFilter === 'Women') matchesCategory = (Number(g.women) || 0) > 0;
      if (categoryFilter === 'Children') matchesCategory = (Number(g.children) || 0) > 0;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [guestList, searchQuery, statusFilter, categoryFilter]);

  const totals = useMemo(() => {
    return filteredGuests.reduce((acc, g) => ({
      men: acc.men + (Number(g.men) || 0),
      women: acc.women + (Number(g.women) || 0),
      children: acc.children + (Number(g.children) || 0),
      total: acc.total + (Number(g.totalPersons) || 0)
    }), { men: 0, women: 0, children: 0, total: 0 });
  }, [filteredGuests]);

  const handleExportCSV = () => {
    const headers = ["Name", "City", "Men", "Women", "Children", "Total", "Status", "Reference"];
    const csvContent = [
      headers.join(","),
      ...filteredGuests.map(g => [
        `"${g.name}"`,
        `"${g.city}"`,
        g.men,
        g.women,
        g.children,
        g.totalPersons,
        g.rsvpStatus,
        `"${g.invitedBy}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `GuestList_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = filteredGuests.map((g, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><b>${g.name}</b>${g.vipStatus ? ' <span style="color:#f59e0b">(VIP)</span>' : ''}</td>
        <td>${g.city}</td>
        <td style="text-align: center;">${g.men}</td>
        <td style="text-align: center;">${g.women}</td>
        <td style="text-align: center;">${g.children}</td>
        <td style="text-align: center; font-weight: bold;">${g.totalPersons}</td>
        <td>${g.rsvpStatus}</td>
        <td>${g.invitedBy}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Executive Guest Report - GuestNama</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header-container { border-bottom: 4px solid #0f172a; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header-container h1 { margin: 0; color: #0f172a; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; }
            .header-container p { margin: 4px 0 0 0; color: #64748b; font-size: 14px; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { background: #f8fafc; text-align: left; padding: 14px 12px; border: 1px solid #e2e8f0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #475569; font-weight: 700; }
            td { padding: 12px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: middle; }
            .summary-footer { background: #f8fafc; font-weight: 800; }
            .summary-footer td { border-top: 2px solid #0f172a; color: #0f172a; font-size: 12px; }
            .grand-total-box { background: #0f172a; color: white; border-radius: 4px; padding: 4px 8px; }
            .footer-info { margin-top: 48px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 24px; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1>Guest Directory</h1>
              <p>Generated for ${user?.name} • ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div style="text-align: right">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Report Parameters</div>
              <div style="font-size: 14px; font-weight: 600; color: #0f172a;">${statusFilter} RSVP • ${categoryFilter} Demographics</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Location</th>
                <th style="text-align: center;">Men</th>
                <th style="text-align: center;">Women</th>
                <th style="text-align: center;">Children</th>
                <th style="text-align: center;">Total</th>
                <th>Status</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="summary-footer">
                <td colspan="3" style="text-align: right; padding-right: 24px;">AGGREGATE SUMMARY</td>
                <td style="text-align: center;">${totals.men}</td>
                <td style="text-align: center;">${totals.women}</td>
                <td style="text-align: center;">${totals.children}</td>
                <td style="text-align: center;"><span class="grand-total-box">${totals.total}</span></td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
          <div class="footer-info">
            <p>Confidential Event Management Document • Powered by GuestNama Intelligence System</p>
            <p>&copy; ${new Date().getFullYear()} GuestNama Platform. All analytical data is processed securely.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this entry? This action cannot be undone.")) return;
    try {
      await StorageService.deleteGuest(id);
      await refreshGuests();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRsvpStatus = async (guest: Guest) => {
    const currentIndex = RSVP_STATUSES.indexOf(guest.rsvpStatus as any);
    const nextIndex = (currentIndex + 1) % RSVP_STATUSES.length;
    const nextStatus = RSVP_STATUSES[nextIndex] as Guest['rsvpStatus'];
    setGuestList(prev => prev.map(g => g.id === guest.id ? { ...g, rsvpStatus: nextStatus } : g));
    try {
      await StorageService.updateGuestStatus(guest.id, nextStatus);
    } catch (err) {
      refreshGuests();
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-[#0f172a] tracking-tight">Guest Directory</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage family registrations, demographics, and real-time RSVPs</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
            <button onClick={handleExportPDF} className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer" title="Export PDF Report">
              <FileText className="w-5 h-5" />
            </button>
            <div className="w-[1px] bg-slate-100 mx-1"></div>
            <button onClick={handleExportCSV} className="p-3 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer" title="Export CSV Data">
              <FileSpreadsheet className="w-5 h-5" />
            </button>
          </div>
          <button onClick={refreshGuests} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-amber-500 shadow-sm active:scale-90 transition-all cursor-pointer" title="Sync Records">
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin text-amber-500' : ''}`} />
          </button>
          <button onClick={() => setIsFormOpen(true)} className="flex-1 lg:flex-none bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <Plus className="w-6 h-6" /> Add Family
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
        <div className="p-6 lg:p-8 border-b border-slate-100 bg-slate-50/20 flex flex-col space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative w-full lg:max-w-lg group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search by name, phone or city..."
                className="w-full pl-13 pr-6 py-4.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm font-medium shadow-inner"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
              {['All', ...RSVP_STATUSES].map(status => (
                <button 
                  key={status} 
                  onClick={() => setStatusFilter(status)} 
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer whitespace-nowrap active:scale-90 ${statusFilter === status ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-lg shadow-slate-900/20' : 'bg-white text-slate-400 border-slate-200 hover:border-amber-200 hover:text-slate-600'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2.5 text-slate-400">
              <Filter className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quick Demographics:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {(['All', 'Men', 'Women', 'Children'] as CategoryFilter[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer active:scale-95 ${categoryFilter === cat ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                >
                  {cat === 'All' ? 'Everything' : `Families with ${cat}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.15em]">Primary Guest</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.15em] text-center">Men</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.15em] text-center">Women</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.15em] text-center">Children</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.15em] text-center">Total</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.15em]">RSVP Status</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.15em]">Reference</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.length > 0 ? filteredGuests.map(guest => (
                <tr key={guest.id} className="hover:bg-amber-50/20 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shadow-inner shrink-0 group-hover:scale-110 transition-transform ${guest.vipStatus ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-100 text-slate-500'}`}>
                        {guest.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#0f172a] truncate flex items-center gap-2">
                          {guest.name}
                          {guest.vipStatus && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]"></span>}
                        </p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide truncate">{guest.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center text-sm font-bold text-slate-600">{guest.men || 0}</td>
                  <td className="px-6 py-6 text-center text-sm font-bold text-slate-600">{guest.women || 0}</td>
                  <td className="px-6 py-6 text-center text-sm font-bold text-slate-600">{guest.children || 0}</td>
                  <td className="px-6 py-6 text-center">
                    <span className="inline-flex px-4 py-1.5 bg-[#0f172a] text-white rounded-xl text-[11px] font-black group-hover:bg-amber-500 transition-colors">
                      {guest.totalPersons}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <button onClick={() => toggleRsvpStatus(guest)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border transition-all cursor-pointer active:scale-95 ${guest.rsvpStatus === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : guest.rsvpStatus === 'Declined' ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'}`}>
                      {guest.rsvpStatus}
                    </button>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter truncate block max-w-[140px]">{guest.invitedBy}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => handleDelete(guest.id)} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer active:scale-90">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
                        <Users className="w-8 h-8" />
                      </div>
                      <p className="text-slate-400 font-bold tracking-tight">No records found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {filteredGuests.length > 0 && (
              <tfoot className="bg-slate-50/80 backdrop-blur-sm border-t border-slate-200 relative z-10">
                <tr className="font-black text-[#0f172a]">
                  <td className="px-8 py-8 text-xs uppercase tracking-[0.2em] text-slate-400">Directory Totals</td>
                  <td className="px-6 py-8 text-center text-lg">{totals.men}</td>
                  <td className="px-6 py-8 text-center text-lg">{totals.women}</td>
                  <td className="px-6 py-8 text-center text-lg">{totals.children}</td>
                  <td className="px-6 py-8 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-2xl tracking-tighter text-amber-600">{totals.total}</span>
                      <span className="text-[9px] uppercase tracking-[0.1em] text-slate-400 -mt-1">People</span>
                    </div>
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6">
          <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[40px] p-8 lg:p-12 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.3)] animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl lg:text-3xl font-black text-[#0f172a]">Register Family</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Capture demographic data for logistics planning</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all cursor-pointer active:scale-90"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleAddGuest} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 ml-1">Head of Family / Guest Name</label>
                  <input required className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 focus:border-amber-500 focus:bg-white rounded-[20px] outline-none transition-all font-bold text-slate-800" placeholder="e.g. Malik Faisal" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 ml-1">City of Residence</label>
                  <input required className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 focus:border-amber-500 focus:bg-white rounded-[20px] outline-none transition-all font-bold text-slate-800" placeholder="e.g. Islamabad" value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 ml-1">Reference / Relationship</label>
                  <input required className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 focus:border-amber-500 focus:bg-white rounded-[20px] outline-none transition-all font-bold text-slate-800" placeholder="Invited By..." value={formData.invitedBy} onChange={e => setFormData(p => ({ ...p, invitedBy: e.target.value }))} />
                </div>
                
                <div className="md:col-span-2 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5" /> Demographic Breakdown
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Men</label>
                      <input type="number" min="0" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={formData.men} onChange={e => setFormData(p => ({ ...p, men: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Women</label>
                      <input type="number" min="0" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={formData.women} onChange={e => setFormData(p => ({ ...p, women: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Children</label>
                      <input type="number" min="0" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={formData.children} onChange={e => setFormData(p => ({ ...p, children: Number(e.target.value) }))} />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center gap-4 bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0">
                    <Filter className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Calculated Total</p>
                    <p className="text-xl font-black text-slate-800">{(formData.men + formData.women + formData.children)} Persons</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-black text-slate-500 cursor-pointer" htmlFor="vipToggle">VIP Guest?</label>
                    <input id="vipToggle" type="checkbox" className="w-6 h-6 accent-amber-500 cursor-pointer" checked={formData.vipStatus} onChange={e => setFormData(p => ({ ...p, vipStatus: e.target.checked }))} />
                  </div>
                </div>
              </div>
              <button disabled={isLoading} className="w-full py-5 bg-[#0f172a] hover:bg-slate-800 text-white font-black rounded-3xl shadow-2xl shadow-slate-900/30 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-3">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
