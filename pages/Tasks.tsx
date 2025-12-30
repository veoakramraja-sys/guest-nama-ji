
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { Task } from '../types';
import { Plus, Trash2, Loader2, X, Check, Calendar, FileText, RefreshCw } from 'lucide-react';

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  });

  const refreshTasks = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      const data = await StorageService.getTasks(user.id);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, [user]);

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const taskRows = sortedTasks.map((t) => `
      <tr>
        <td>${t.isCompleted ? '✓' : '☐'}</td>
        <td><b>${t.title}</b></td>
        <td>${t.priority}</td>
        <td>${t.dueDate}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Task List - GuestNama</title>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            h1 { color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 11px; }
            td { padding: 12px; border: 1px solid #e2e8f0; font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>Event Preparation Checklist</h1>
          <p>Assigned to: ${user?.name}</p>
          <table>
            <thead><tr><th>Status</th><th>Task</th><th>Priority</th><th>Due Date</th></tr></thead>
            <tbody>${taskRows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const toggleTask = async (task: Task) => {
    try {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t));
      await StorageService.updateTask(task.id, { isCompleted: !task.isCompleted });
    } catch (err) {
      refreshTasks();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this task?")) return;
    try {
      await StorageService.deleteTask(id);
      await refreshTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const newTask: Task = { ...formData, id: crypto.randomUUID(), userId: user.id, isCompleted: false, description: '' };
      await StorageService.addTask(newTask);
      await refreshTasks();
      setIsFormOpen(false);
      setFormData({ title: '', description: '', dueDate: new Date().toISOString().split('T')[0], priority: 'Medium' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    });
  }, [tasks]);

  if (isFetching && tasks.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
        <p className="text-slate-400 font-bold">Organizing Tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0f172a]">Event Checklist</h1>
          <p className="text-slate-500 mt-1 text-sm">Keep track of every detail</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleExportPDF} className="flex-1 lg:flex-none p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 active:scale-90 transition-all cursor-pointer flex justify-center shadow-sm">
            <FileText className="w-5 h-5" />
          </button>
          <button onClick={refreshTasks} className="flex-1 lg:flex-none p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-amber-500 active:scale-90 transition-all cursor-pointer flex justify-center shadow-sm">
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setIsFormOpen(true)} className="w-full lg:w-auto bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <Plus className="w-5 h-5" /> New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remaining Items</h2>
          {sortedTasks.filter(t => !t.isCompleted).length > 0 ? (
            sortedTasks.filter(t => !t.isCompleted).map(task => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={handleDelete} />
            ))
          ) : (
            <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-slate-400 text-sm font-medium">All preparation tasks complete!</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Completed Items</h2>
          {sortedTasks.filter(t => t.isCompleted).length > 0 ? (
            sortedTasks.filter(t => t.isCompleted).map(task => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={handleDelete} />
            ))
          ) : (
             <div className="bg-white/50 p-6 rounded-3xl border border-dashed border-slate-100 text-center">
               <p className="text-slate-300 text-xs italic">No items completed yet.</p>
             </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-md animate-in fade-in" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] p-6 lg:p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-[#0f172a]">New Preparation Task</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-50 rounded-full cursor-pointer active:scale-90"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Task Title</label>
                <input required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" placeholder="Arrange flowers..." value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Priority</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none cursor-pointer" value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value as any }))}>
                    <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Deadline</label>
                  <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={formData.dueDate} onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>
              <button disabled={isLoading} className="w-full py-4.5 bg-[#0f172a] text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Task Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskItem = ({ task, onToggle, onDelete }: any) => (
  <div className={`group flex items-center gap-4 p-4 lg:p-5 bg-white border border-slate-200 rounded-2xl transition-all ${task.isCompleted ? 'opacity-60 bg-slate-50 grayscale' : 'hover:border-amber-200 shadow-sm'}`}>
    <button onClick={() => onToggle(task)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0 ${task.isCompleted ? 'bg-amber-500 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'border-slate-200 bg-white hover:border-amber-300'}`}>
      {task.isCompleted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </button>
    <div className="flex-1 min-w-0">
      <h3 className={`font-bold text-sm lg:text-base text-slate-800 truncate ${task.isCompleted ? 'line-through' : ''}`}>{task.title}</h3>
      <div className="flex items-center gap-3 mt-1">
        <span className={`text-[8px] lg:text-[9px] font-black uppercase px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-rose-50 text-rose-500' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'}`}>{task.priority}</span>
        <div className="flex items-center gap-1 text-[9px] lg:text-[10px] text-slate-400 font-bold"><Calendar className="w-3 h-3" /> {task.dueDate}</div>
      </div>
    </div>
    <button onClick={() => onDelete(task.id)} className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer active:scale-90">
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);
