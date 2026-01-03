
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

  if (data.isLoading && data.guestStats.total === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <p className="font-black tracking-widest uppercase text-[10px]">Syncing Enterprise Hub...</p>
      </div>
    );
  }

  const isMobile = window.innerWidth < 768;

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-700 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#0f172a] tracking-tight">Intelligence</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3 h-3 text-emerald-500" /> Live Data Stream
          </p>
        </div>
        <button 
          onClick={() => fetchData(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-sm active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
          Sync
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard title="Guests" value={data.guestStats.total} sub={`${data.guestStats.confirmed} RSVPs`} icon={<Users className="w-4 h-4 text-indigo-500" />} color="hover:border-indigo-200" />
        <StatCard title="Liquidity" value={`Rs. ${(data.financeStats.balance / 1000).toFixed(1)}k`} sub="Net Balance" icon={<Wallet className="w-4 h-4 text-emerald-500" />} color="hover:border-emerald-200" />
        <StatCard title="Arrivals" value={data.guestStats.checkedIn} sub="Check-ins" icon={<CheckSquare className="w-4 h-4 text-amber-500" />} color="hover:border-amber-200" />
        <div className="bg-white p-4 lg:p-7 rounded-[24px] lg:rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between group transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <h3 className="text-xl lg:text-3xl font-black text-[#0f172a] tracking-tighter">{readinessScore}%</h3>
            </div>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="w-full bg-slate-100 h-1.5 lg:h-2.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${readinessScore}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white rounded-[24px] lg:rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/40 p-6 lg:p-10 flex flex-col sm:flex-row items-center gap-6 lg:gap-10 overflow-hidden">
          <div className="w-full sm:w-1/2 h-[200px] lg:h-[300px] relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Census</p>
                <p className="text-2xl lg:text-3xl font-black text-[#0f172a] tracking-tighter">{(data.guestStats.men + data.guestStats.women + data.guestStats.children)}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographicChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 55 : 85}
                  outerRadius={isMobile ? 75 : 110}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {demographicChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full sm:w-1/2 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-[#0f172a]">Demographics</h2>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Census Breakdown</p>
            </div>
            <div className="space-y-3">
              <DemoRow icon={<User className="w-3 h-3" />} label="Men" count={data.guestStats.men} color="bg-indigo-500" total={data.guestStats.men + data.guestStats.women + data.guestStats.children} />
              <DemoRow icon={<UserPlus className="w-3 h-3" />} label="Women" count={data.guestStats.women} color="bg-rose-500" total={data.guestStats.men + data.guestStats.women + data.guestStats.children} />
              <DemoRow icon={<Baby className="w-3 h-3" />} label="Kids" count={data.guestStats.children} color="bg-amber-500" total={data.guestStats.men + data.guestStats.women + data.guestStats.children} />
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-[24px] lg:rounded-[40px] p-6 lg:p-10 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 space-y-6">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Financial Velocity</p>
            <div>
              <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Total Assets</p>
              <p className="text-xl font-bold">Rs. {data.financeStats.income.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Expenditure</p>
              <p className="text-xl font-bold text-rose-400">Rs. {data.financeStats.expenses.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Sync Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, sub, icon, color }: any) => (
  <div className={`bg-white p-4 lg:p-7 rounded-[24px] lg:rounded-[32px] border border-slate-200 shadow-sm transition-all group ${color}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="w-8 h-8 lg:w-11 lg:h-11 bg-slate-50 rounded-lg lg:rounded-2xl flex items-center justify-center shrink-0 shadow-inner">{icon}</div>
      <div className="px-1.5 py-0.5 rounded-md bg-slate-50 text-[7px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest">Active</div>
    </div>
    <div>
      <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-xl lg:text-3xl font-black text-[#0f172a] tracking-tighter mb-0.5">{value}</h3>
      <p className="text-[7px] lg:text-[9px] text-slate-400 font-bold uppercase tracking-widest">{sub}</p>
    </div>
  </div>
);

const DemoRow = ({ icon, label, count, color, total }: { icon: any, label: string, count: number, color: string, total: number }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
      <div className="flex items-center gap-1.5">
        <span className={`${color} p-1 rounded text-white`}>{icon}</span>
        {label}
      </div>
      <span>{count} / {total}</span>
    </div>
    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
      <div className={`${color} h-full transition-all duration-1000`} style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}></div>
    </div>
  </div>
);
