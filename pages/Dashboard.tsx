
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { Guest, FinanceEntry, Task } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
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
  ArrowRight,
  User,
  UserPlus,
  Baby,
  Activity,
  Zap
} from 'lucide-react';

interface DashboardProps {
  onNavigateToGuests: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToGuests }) => {
  const { user } = useAuth();
  const [data, setData] = useState({ 
    guestStats: { total: 0, confirmed: 0, checkedIn: 0, men: 0, women: 0, children: 0 },
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

      const men = guests.reduce((acc, g) => acc + (Number(g.men) || 0), 0);
      const women = guests.reduce((acc, g) => acc + (Number(g.women) || 0), 0);
      const children = guests.reduce((acc, g) => acc + (Number(g.children) || 0), 0);

      setData({
        guestStats: {
          total: guests.length,
          confirmed: guests.filter(g => g.rsvpStatus === 'Confirmed').length,
          checkedIn: guests.filter(g => g.checkedIn).length,
          men,
          women,
          children
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

  const demographicChartData = useMemo(() => [
    { name: 'Men', value: data.guestStats.men, color: '#6366f1' },
    { name: 'Women', value: data.guestStats.women, color: '#f43f5e' },
    { name: 'Children', value: data.guestStats.children, color: '#f59e0b' },
  ].filter(d => d.value > 0), [data.guestStats]);

  const readinessScore = useMemo(() => {
    const taskPart = data.taskStats.percentage;
    const rsvpPart = data.guestStats.total > 0 ? (data.guestStats.confirmed / data.guestStats.total) * 100 : 0;
    return Math.round((taskPart + rsvpPart) / 2);
  }, [data]);

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
        <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-6" />
        <p className="font-black tracking-widest uppercase text-xs">Syncing Intelligence Cloud...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Intelligence Hub</h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Real-time status of your event ecosystem
          </p>
        </div>
        <button 
          onClick={() => fetchData(true)}
          className="group flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-500' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span className="text-xs font-black uppercase tracking-widest">Refresh Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Families" value={data.guestStats.total} subtitle={`${data.guestStats.confirmed} Confirmed`} icon={<Users className="w-5 h-5 text-indigo-500" />} color="hover:border-indigo-200 shadow-indigo-100" />
        <StatCard title="Wallet Balance" value={`Rs. ${data.financeStats.balance.toLocaleString('en-PK')}`} subtitle="Net Liquidity" icon={<Wallet className="w-5 h-5 text-emerald-500" />} color="hover:border-emerald-200 shadow-emerald-100" />
        <StatCard title="Check-ins" value={data.guestStats.checkedIn} subtitle="Guest Arrivals" icon={<CheckSquare className="w-5 h-5 text-amber-500" />} color="hover:border-amber-200 shadow-amber-100" />
        
        <div className="bg-white p-7 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between group transition-all hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Readiness Score</p>
              <h3 className="text-3xl font-black text-[#0f172a] tracking-tighter">{readinessScore}%</h3>
            </div>
            <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-full transition-all duration-1000 ease-out" 
                style={{ width: `${readinessScore}%` }}
              ></div>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target: 100% Prepared</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/40 p-8 lg:p-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2 h-[300px] relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Population</p>
                <p className="text-4xl font-black text-[#0f172a] tracking-tighter">{(data.guestStats.men + data.guestStats.women + data.guestStats.children)}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographicChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {demographicChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '800' }}
                  itemStyle={{ padding: '4px 0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-1/2 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Population Center</h2>
              <p className="text-slate-400 text-sm font-medium">Demographic intensity mapping</p>
            </div>
            <div className="space-y-4">
              <DemoRow icon={<User className="w-4 h-4" />} label="Men" count={data.guestStats.men} color="bg-indigo-500" total={data.guestStats.men + data.guestStats.women + data.guestStats.children} />
              <DemoRow icon={<UserPlus className="w-4 h-4" />} label="Women" count={data.guestStats.women} color="bg-rose-500" total={data.guestStats.men + data.guestStats.women + data.guestStats.children} />
              <DemoRow icon={<Baby className="w-4 h-4" />} label="Children" count={data.guestStats.children} color="bg-amber-500" total={data.guestStats.men + data.guestStats.women + data.guestStats.children} />
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-[40px] p-8 lg:p-10 text-white relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-amber-500/20"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Asset Liquidity</p>
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Revenue Flow</span>
                </div>
                <p className="text-2xl font-bold tracking-tight">Rs. {data.financeStats.income.toLocaleString()}</p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Expense Overhead</span>
                </div>
                <p className="text-2xl font-bold tracking-tight">Rs. {data.financeStats.expenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Platform Integrity</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="text-sm font-bold text-emerald-500">Cloud Sync Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/20 flex flex-col overflow-hidden group">
          <div className="p-8 lg:px-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <h2 className="font-black text-[#0f172a] flex items-center gap-3 tracking-tight">
              <Users className="w-6 h-6 text-amber-500" /> Recent Arrivals
            </h2>
            <button 
              onClick={onNavigateToGuests} 
              className="text-xs font-black text-amber-500 hover:text-amber-600 flex items-center gap-2 group/btn cursor-pointer uppercase tracking-widest transition-all hover:gap-3"
            >
              Directory <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 lg:p-6 divide-y divide-slate-50">
            {data.recentGuests.length > 0 ? data.recentGuests.map(guest => (
              <div key={guest.id} className="py-5 px-4 flex items-center justify-between group/row hover:bg-slate-50/80 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-400 shadow-sm group-hover/row:scale-110 group-hover/row:border-amber-200 transition-all">{guest.name.charAt(0)}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{guest.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{guest.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">{guest.totalPersons}P</span>
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(guest.rsvpStatus)}`}>{guest.rsvpStatus}</span>
                </div>
              </div>
            )) : <p className="text-center py-16 text-slate-400 text-sm font-bold uppercase tracking-widest">No activity log found.</p>}
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/20 flex flex-col overflow-hidden group">
          <div className="p-8 lg:px-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <h2 className="font-black text-[#0f172a] flex items-center gap-3 tracking-tight">
              <AlertCircle className="w-6 h-6 text-indigo-500" /> Operational Readiness
            </h2>
          </div>
          <div className="p-4 lg:p-6 divide-y divide-slate-50">
            {data.urgentTasks.length > 0 ? data.urgentTasks.map(task => (
              <div key={task.id} className="py-5 px-4 flex items-center justify-between group/task hover:bg-slate-50/80 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${task.priority === 'High' ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-amber-500'} `} />
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{task.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-widest mt-0.5"><Clock className="w-3 h-3" /> Due {task.dueDate}</p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>{task.priority}</div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mb-6 shadow-inner animate-bounce">
                  <Check className="w-8 h-8" strokeWidth={3} />
                </div>
                <p className="text-[#0f172a] text-sm font-black uppercase tracking-[0.2em]">Operational Perfection</p>
                <p className="text-slate-400 text-xs mt-1">All event objectives synchronized</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color }: any) => (
  <div className={`bg-white p-7 rounded-[32px] border border-slate-200 shadow-sm transition-all duration-500 flex flex-col justify-between group cursor-default ${color} hover:-translate-y-2 hover:shadow-2xl`}>
    <div className="flex justify-between items-start mb-6">
      <div className="w-11 h-11 bg-slate-50 group-hover:bg-white rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-inner border border-transparent group-hover:border-slate-100 group-hover:shadow-lg">{icon}</div>
      <div className="px-2 py-0.5 rounded-lg bg-slate-50 text-[9px] font-black text-slate-400 group-hover:bg-white group-hover:text-slate-600 transition-colors uppercase tracking-widest">Active</div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 transition-colors group-hover:text-slate-600">{title}</p>
      <h3 className="text-3xl font-black text-[#0f172a] tracking-tighter mb-1.5">{value}</h3>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{subtitle}</p>
    </div>
  </div>
);

const DemoRow = ({ icon, label, count, color, total }: { icon: any, label: string, count: number, color: string, total: number }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-[11px] font-black text-slate-600 uppercase tracking-widest">
      <div className="flex items-center gap-2">
        <span className={`${color} p-1 rounded text-white shadow-sm`}>{icon}</span>
        {label}
      </div>
      <span>{count} <span className="text-slate-300 font-bold">/ {total}</span></span>
    </div>
    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
      <div 
        className={`${color} h-full transition-all duration-1000 ease-out shadow-sm`} 
        style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
      ></div>
    </div>
  </div>
);
