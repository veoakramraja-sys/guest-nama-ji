
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { User } from '../types';
import { Mail, Calendar, UserCheck, Shield, Loader2, RefreshCw } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<(User & { passwordHash: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsers = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      const data = await StorageService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold tracking-tight">Accessing User Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a]">User Management</h1>
          <p className="text-slate-500 mt-1">Review and manage platform access</p>
        </div>
        <button 
          onClick={() => fetchUsers(true)}
          className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">User Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">System Role</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Join Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Credentials</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.length > 0 ? users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-amber-100 transition-colors">
                        <UserCheck className="w-5 h-5 text-slate-400 group-hover:text-amber-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{user.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-tighter">ID: {user.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-700'}
                    `}>
                      <Shield className="w-3 h-3 mr-1.5" /> {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-slate-300" />
                      {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    <div className="flex items-center font-medium">
                      <Mail className="w-4 h-4 mr-2 text-slate-300" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase tracking-widest">
                      Verified
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 italic">No users registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
