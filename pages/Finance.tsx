
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { FinanceEntry } from '../types';
import { Plus, Wallet, TrendingUp, TrendingDown, Trash2, Loader2, X, RefreshCw, FileText } from 'lucide-react';

export const Finance: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    type: 'Expense' as 'Income' | 'Expense',
    category: 'Catering',
    date: new Date().toISOString().split('T')[0]
  });

  const refreshFinance = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      const data = await StorageService.getFinance(user.id);
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    refreshFinance();
  }, [user]);

  const stats = useMemo(() => {
    const income = entries.filter(e => e.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = entries.filter(e => e.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [entries]);

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = entries.map((e) => `
      <tr>
        <td>${e.date}</td>
        <td>${e.description}</td>
        <td>${e.category}</td>
        <td style="color: ${e.type === 'Income' ? 'green' : 'red'}; font-weight: bold;">
          ${e.type === 'Income' ? '+' : '-'}Rs. ${e.amount.toLocaleString('en-PK')}
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Finance Ledger - GuestNama</title>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 11px; }
            td { padding: 12px; border: 1px solid #e2e8f0; font-size: 13px; }
            .summary { margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header"><h1>Financial Report (PKR)</h1><p>Event Ledger for ${user?.name}</p></div>
          <table>
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount (Rs.)</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="summary">
            <p><b>Total Income:</b> Rs. ${stats.income.toLocaleString('en-PK')}</p>
            <p><b>Total Expenses:</b> Rs. ${stats.expenses.toLocaleString('en-PK')}</p>
            <p><b>Net Balance:</b> Rs. ${stats.balance.toLocaleString('en-PK')}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const newEntry: FinanceEntry = { ...formData, id: crypto.randomUUID(), userId: user.id };
      await StorageService.addFinance(newEntry);
      await refreshFinance();
      setIsFormOpen(false);
      setFormData({ description: '', amount: 0, type: 'Expense', category: 'Catering', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this transaction?")) return;
    try {
      await StorageService.deleteFinance(id);
      await refreshFinance();
    } catch (err) {
      console.error(err);
    }
  };

  if (isFetching && entries.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
        <p className="text-slate-400 font-bold">Syncing Ledgers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0f172a]">Finance Tracker</h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time expenditure monitoring (PKR)</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleExportPDF} className="flex-1 lg:flex-none p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 active:scale-90 transition-all cursor-pointer flex justify-center shadow-sm">
            <FileText className="w-5 h-5" />
          </button>
          <button onClick={refreshFinance} className="flex-1 lg:flex-none p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-amber-500 active:scale-90 transition-all cursor-pointer flex justify-center shadow-sm">
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin text-amber-500' : ''}`} />
          </button>
          <button onClick={() => setIsFormOpen(true)} className="w-full lg:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <Plus className="w-5 h-5" /> Add Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <FinanceStat icon={<TrendingUp className="text-emerald-500" />} label="Total Income" value={stats.income} color="text-emerald-600" />
        <FinanceStat icon={<TrendingDown className="text-rose-500" />} label="Total Expenses" value={stats.expenses} color="text-rose-600" />
        <FinanceStat icon={<Wallet className="text-amber-500" />} label="Net Balance" value={stats.balance} color={stats.balance >= 0 ? 'text-amber-600' : 'text-rose-600'} className="sm:col-span-2 lg:col-span-1" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50">
          <h2 className="font-bold text-slate-800">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Amount (PKR)</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.length > 0 ? entries.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">{entry.date}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[150px] lg:max-w-none">{entry.description}</p>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{entry.category}</span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-black text-right ${entry.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {entry.type === 'Income' ? '+' : '-'}Rs. {entry.amount.toLocaleString('en-PK')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(entry.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer active:scale-90">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm italic">No records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-md animate-in fade-in" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] p-6 lg:p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-[#0f172a]">New Ledger Entry</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-50 rounded-full cursor-pointer active:scale-90"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddEntry} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                <input required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-amber-500 rounded-2xl outline-none" placeholder="Catering Advance..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Amount (Rs.)</label>
                  <input type="number" min="0" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-amber-500 rounded-2xl outline-none" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Type</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-amber-500 rounded-2xl outline-none cursor-pointer" value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as any }))}>
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>
              <button disabled={isLoading} className="w-full py-4.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FinanceStat = ({ icon, label, value, color, className = "" }: any) => (
  <div className={`bg-white p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-slate-300 transition-all ${className}`}>
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className={`text-xl lg:text-2xl font-black tracking-tight ${color}`}>Rs. {value.toLocaleString('en-PK')}</h3>
  </div>
);
