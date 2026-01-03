
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { Guest, FinanceEntry, Task } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  Users, 
  RefreshCw,
  Wallet,
  CheckSquare,
  Loader2,
  User,
  UserPlus,
  Baby,
  Activity,
  Zap,
  Mail
} from 'lucide-react';

interface DashboardProps {
  onNavigateToGuests: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToGuests }) => {
  const { user } = useAuth();
  const [data, setData] = useState({ 
    guestStats: { total: 0, confirmed: 0, checkedIn: 0, men: 0, women: 0, children: 0, totalHeadcount: 0, invitationNeeded: 0, invitationSentCount: 0 },
    financeStats: { income: 0, expenses: 0, balance: 0 },
    taskStats: { total: 0, completed: 0, percentage: 0 },
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
      const totalHeadcount = men + women + children;

      const invitationNeeded = guests.filter(g => g.invitationRequired).length;
      const invitationSentCount = guests.filter(g => g.invitationRequired && (g.invitationSent === 'Sent' || g.invitationSent === 'Delivered' || g.invitationSent === 'Seen')).length;

      setData({
        guestStats: {
          total: guests.length,
          confirmed: guests.filter(g => g.rsvpStatus === 'Confirmed' || g.rsvpStatus === 'Accepted').length,
          checkedIn: guests.filter(g => g.checkedIn).length,
          men,
          women,
          children,
          totalHeadcount,
          invitationNeeded,
          invitationSentCount
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

  if (data.isLoading && data.guestStats.total === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <p className="font-black tracking-widest uppercase text-[10px]">Processing Telemetry...</p>
      </div>
    );
  }

  const isMobile = window.innerWidth < 768;

  return (
    <div className="space-y-4 lg:space-y-8 animate-in fade-in duration-700 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl lg:text-3xl font-black text-[#0f172a] tracking-tight">Intelligence</h1>
          <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity className="w-3 h-3 text-emerald-500" /> Platform Active
          </p>
        </div>
        <button 
          onClick={() => fetchData(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-sm active:scale-95 transition-all text-[8px] font-black uppercase tracking-widest"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
          Sync
        </button>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
        <StatCard title="Invitees" value={data.guestStats.totalHeadcount} sub="Total Headcount" icon={<Users className="w-4 h-4 text-indigo-500" />} />
        <StatCard title="Families" value={data.guestStats.total} sub="Primary Registries" icon={<Zap className="w-4 h-4 text-amber-500" />} />
        <StatCard title="Finance" value={`Rs. ${(data.financeStats.balance / 1000).toFixed(1)}k`} sub="Net Balance" icon={<Wallet className="w-4 h-4 text-emerald-500" />} />
        <StatCard title="Cards" value={`${data.guestStats.invitationSentCount}/${data.guestStats.invitationNeeded}`} sub="Invitations Sent" icon={<Mail className="w-4 h-4 text-rose-500" />} />
      </div>

      {/* DETAILED DEMOGRAPHICS */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-4 lg:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-xs font-black uppercase tracking-widest text-[#0f172a]">Demographic Breakdown</h3>
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{data.guestStats.totalHeadcount} Total Members Invited</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
           <DemoBox label="Men" count={data.guestStats.men} color="text-indigo-600 bg-indigo-50 border-indigo-100" />
           <DemoBox label="Women" count={data.guestStats.women} color="text-rose-600 bg-rose-50 border-rose-100" />
           <DemoBox label="Children" count={data.guestStats.children} color="text-amber-600 bg-amber-50 border-amber-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 lg:p-8 flex flex-col sm:flex-row items-center gap-6 overflow-hidden">
          <div className="w-full sm:w-1/2 h-[180px] lg:h-[260px] relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Census</p>
                <p className="text-xl font-black text-[#0f172a]">{data.guestStats.totalHeadcount}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographicChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 50 : 70}
                  outerRadius={isMobile ? 65 : 90}
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
          
          <div className="w-full sm:w-1/2 space-y-3">
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Attendance Status</p>
                <ProgressBar label="RSVP Progress" value={data.guestStats.total > 0 ? Math.round((data.guestStats.confirmed / data.guestStats.total) * 100) : 0} />
                <ProgressBar label="Task Readiness" value={data.taskStats.percentage} color="bg-emerald-500" />
                <ProgressBar label="Invites Distributed" value={data.guestStats.invitationNeeded > 0 ? Math.round((data.guestStats.invitationSentCount / data.guestStats.invitationNeeded) * 100) : 0} color="bg-rose-500" />
             </div>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-[24px] p-6 text-white flex flex-col justify-between">
           <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Preparation Checklist</p>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Tasks Complete</span>
                    <span className="text-sm font-black">{data.taskStats.completed} / {data.taskStats.total}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">VIP Check-ins</span>
                    <span className="text-sm font-black text-amber-500">{data.guestStats.checkedIn} verified</span>
                 </div>
              </div>
           </div>
           <div className="mt-8 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">System Cloud Synced</span>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, sub, icon }: any) => (
  <div className="bg-white p-3 lg:p-5 rounded-xl lg:rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      <span className="text-[6px] font-black text-slate-300 uppercase tracking-widest">Live</span>
    </div>
    <div>
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
      <h3 className="text-sm lg:text-xl font-black text-[#0f172a]">{value}</h3>
      <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest">{sub}</p>
    </div>
  </div>
);

const DemoBox = ({ label, count, color }: any) => (
  <div className={`p-2 rounded-lg border text-center ${color}`}>
     <p className="text-[7px] font-black uppercase tracking-widest opacity-60">{label}</p>
     <p className="text-xs font-black">{count}</p>
  </div>
);

const ProgressBar = ({ label, value, color = "bg-amber-500" }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-slate-400">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
      <div className={`${color} h-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);
