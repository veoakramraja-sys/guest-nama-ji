
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { Vendor } from '../types';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  X, 
  RefreshCw, 
  Briefcase, 
  Phone, 
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';

export const Vendors: React.FC = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Catering',
    phone: '',
    status: 'Shortlisted' as Vendor['status'],
    budget: 0,
    paid: 0
  });

  const refreshVendors = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      const data = await StorageService.getVendors(user.id);
      setVendors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    refreshVendors();
  }, [user]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vendors, searchQuery]);

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const newVendor: Vendor = { ...formData, id: crypto.randomUUID(), userId: user.id };
      await StorageService.addVendor(newVendor);
      await refreshVendors();
      setIsFormOpen(false);
      setFormData({ name: '', category: 'Catering', phone: '', status: 'Shortlisted', budget: 0, paid: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this vendor?")) return;
    try {
      await StorageService.deleteVendor(id);
      await refreshVendors();
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['Catering', 'Photography', 'Venue', 'Decorator', 'Apparel', 'Jewelry', 'Music', 'Transport', 'Other'];

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a]">Vendors</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{vendors.length} Partners</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsFormOpen(true)} className="bg-amber-500 text-white p-2.5 rounded-xl shadow-lg active:scale-95 transition-all">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={refreshVendors} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400">
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Search by name or category..."
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-amber-500/20"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isFetching && vendors.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Acquiring Logistics...</p>
          </div>
        ) : filteredVendors.length > 0 ? filteredVendors.map(vendor => (
          <div key={vendor.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 hover:border-amber-200 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">{vendor.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{vendor.category}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter ${
                vendor.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                vendor.status === 'Hired' ? 'bg-indigo-50 text-indigo-600' : 
                'bg-amber-50 text-amber-600'
              }`}>
                {vendor.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
               <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-slate-400 uppercase mb-1">Total Budget</p>
                  <p className="text-slate-800 text-sm font-black">Rs. {vendor.budget.toLocaleString()}</p>
               </div>
               <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-slate-400 uppercase mb-1">Paid Amount</p>
                  <p className="text-emerald-600 text-sm font-black">Rs. {vendor.paid.toLocaleString()}</p>
               </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <a href={`tel:${vendor.phone}`} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-amber-50 hover:text-amber-500 transition-all">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
              <button onClick={() => handleDelete(vendor.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No partners discovered</div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="absolute inset-0 bg-[#0f172a]/70 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full sm:max-w-xl bg-white rounded-t-[24px] sm:rounded-[24px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white py-1 z-10">
              <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-widest">New Partner</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 bg-slate-50 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Company / Individual Name</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[11px]" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[11px]" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[11px]" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Budget (PKR)</label>
                  <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[11px]" value={formData.budget} onChange={e => setFormData(p => ({ ...p, budget: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Paid Amount (PKR)</label>
                  <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[11px]" value={formData.paid} onChange={e => setFormData(p => ({ ...p, paid: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Hiring Status</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[11px]" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))}>
                  {['Hired', 'Shortlisted', 'Paid', 'Negotiating'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button disabled={isLoading} className="w-full py-4 bg-[#0f172a] text-white font-black rounded-xl shadow-xl active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em] mt-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Register Partner'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
