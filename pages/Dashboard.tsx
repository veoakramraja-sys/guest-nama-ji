
import React, { useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { Guest, FinanceEntry, Task } from '../types';
import { 
  Users, 
  RefreshCw,
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckSquare,
  AlertCircle,
  Clock,
  Check,
  Loader2,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  onNavigateToGuests: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToGuests }) => {
  const { user } = useAuth();
  const [data, setData] = useState({ 
    guestStats: { total: 0, confirmed: 0, checkedIn: 0 },
    financeStats: { income: 0, expenses: 0, balance: 0 },
    taskStats: { total: 0, completed: 0, percentage: 0 },
    recentGuests: [] as Guest[],
    urgentTasks: [] as Task[],
    isLoading: true
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (showRefresh = false) => {
    if (!user) return;
    if (showRefresh) setIsRefreshing(true);
    else setData(p => ({ ...p, isLoading: true }));
    
    try {
      const [guests, finance, tasks] = await Promise.all([
        StorageService.getGuests(user.id, user.role),
        StorageService.getFinance(user.id),
        StorageService.getTasks(user.id)
      ]);

      const income = finance.filter(f => f.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
      const expenses = finance.filter(f => f.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
      
      const completedTasks = tasks.filter(t => t.isCompleted).length;
      const totalTasks = tasks.length;

      setData({
        guestStats: {
          total: guests.length,
          confirmed: guests.filter(g => g.rsvpStatus === 'Confirmed').length,
          checkedIn: guests.filter(g => g.checkedIn).length,
        },
        financeStats: {
          income,
          expenses,
          balance: income - expenses
        },
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        },
        recentGuests: [...guests].reverse().slice(0, 5),
        urgentTasks: tasks.filter(t => !t.isCompleted).slice(0, 5),
        isLoading: false
      });
    } catch (err) {
      console.error(err);
      setData(p => ({ ...p, isLoading: false }));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'text-emerald-500 bg-emerald-50';
      case 'Declined': return 'text-rose-500 bg-rose-50';
      default: return 'text-amber-500 bg-amber-50';
    }
  };

  if (data.isLoading && data.guestStats.total === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
        <p className="font-bold tracking-tight">Syncing Event Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a]">Event Overview</h1>
          <p className="text-slate-500 mt-1">Real-time pulse of your event management</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchData(true)}
            title="Refresh Data"
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Guests" value={data.guestStats.total} subtitle={`${data.guestStats.confirmed} Confirmed`} icon={<Users className="w-5 h-5 text-blue-500" />} color="hover:border-blue-200" />
        <StatCard title="Net Balance" value={`Rs. ${data.financeStats.balance.toLocaleString('en-PK')}`} subtitle="Revenue vs Cost" icon={<Wallet className="w-5 h-5 text-emerald-500" />} color="hover:border-emerald-200" />
        <StatCard title="Check-ins" value={data.guestStats.checkedIn} subtitle="Arrived at venue" icon={<CheckSquare className="w-5 h-5 text-amber-500" />} color="hover:border-amber-200" />
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group transition-all hover:border-indigo-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Task Progress</p>
              <h3 className="text-3xl font-bold text-[#0f172a]">{data.taskStats.percentage}%</h3>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${data.taskStats.percentage}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm hover:border-emerald-200 transition-all group">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest group-hover:text-slate-600">Total Revenue</p>
            <h4 className="text-xl font-bold text-emerald-600">Rs. {data.financeStats.income.toLocaleString('en-PK')}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm hover:border-rose-200 transition-all group">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-inner">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest group-hover:text-slate-600">Total Expenses</p>
            <h4 className="text-xl font-bold text-rose-600">Rs. {data.financeStats.expenses.toLocaleString('en-PK')}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-[#0f172a] flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" /> Recent Guests
            </h2>
            <button 
              onClick={onNavigateToGuests} 
              className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 group/btn cursor-pointer transition-colors"
            >
              View All <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="p-6 divide-y divide-slate-50">
            {data.recentGuests.length > 0 ? data.recentGuests.map(guest => (
              <div key={guest.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group/row hover:bg-slate-50/50 -mx-6 px-6 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 shadow-inner group-hover/row:bg-white transition-colors">{guest.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{guest.name}</p>
                    <p className="text-[10px] text-slate-400">{guest.city}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(guest.rsvpStatus)}`}>{guest.rsvpStatus}</span>
              </div>
            )) : <p className="text-center py-10 text-slate-400 text-sm italic">No guests yet.</p>}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-[#0f172a] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-500" /> Action Items
            </h2>
          </div>
          <div className="p-6 divide-y divide-slate-50">
            {data.urgentTasks.length > 0 ? data.urgentTasks.map(task => (
              <div key={task.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group/task hover:bg-slate-50/50 -mx-6 px-6 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-rose-500' : 'bg-amber-500'} shadow-[0_0_8px_rgba(244,63,94,0.4)]`} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{task.title}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium"><Clock className="w-3 h-3" /> {task.dueDate}</p>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>{task.priority}</div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-slate-400 text-sm font-bold">All clear!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color }: any) => (
  <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 flex items-start justify-between group cursor-default ${color} hover:shadow-lg`}>
    <div className="flex-1">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-slate-600">{title}</p>
      <h3 className="text-3xl font-black text-[#0f172a] mb-1 tracking-tight">{value}</h3>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{subtitle}</p>
    </div>
    <div className="w-10 h-10 bg-slate-50 group-hover:bg-white rounded-xl flex items-center justify-center shrink-0 transition-all shadow-inner border border-transparent group-hover:border-slate-100 group-hover:shadow-md">{icon}</div>
  </div>
);
