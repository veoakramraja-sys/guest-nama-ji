
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { TimelineEvent } from '../types';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  X, 
  RefreshCw, 
  Clock, 
  MapPin, 
  Calendar,
  ChevronRight,
  Info
} from 'lucide-react';

export const Timeline: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    time: '20:00',
    location: '',
    description: ''
  });

  const refreshTimeline = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      const data = await StorageService.getTimeline(user.id);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    refreshTimeline();
  }, [user]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.time.localeCompare(b.time));
  }, [events]);

  const handleAddTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const newEvent: TimelineEvent = { ...formData, id: crypto.randomUUID(), userId: user.id };
      await StorageService.addTimeline(newEvent);
      await refreshTimeline();
      setIsFormOpen(false);
      setFormData({ title: '', time: '20:00', location: '', description: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this event from schedule?")) return;
    try {
      await StorageService.deleteTimeline(id);
      await refreshTimeline();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a]">Event Itinerary</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{events.length} Milestones</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsFormOpen(true)} className="bg-[#0f172a] text-white p-2.5 rounded-xl shadow-lg active:scale-95 transition-all">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={refreshTimeline} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400">
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="relative pl-6 lg:pl-10 space-y-6">
        {/* The timeline line */}
        <div className="absolute left-6 lg:left-10 top-0 bottom-0 w-[2px] bg-slate-100 -translate-x-1/2"></div>

        {isFetching && events.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Clock...</p>
          </div>
        ) : sortedEvents.length > 0 ? sortedEvents.map((event, idx) => (
          <div key={event.id} className="relative pl-8">
            {/* Dot */}
            <div className={`absolute left-0 top-6 w-4 h-4 rounded-full border-4 border-white shadow-sm -translate-x-1/2 z-10 ${
              idx === 0 ? 'bg-amber-500' : 'bg-slate-300'
            }`}></div>
            
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3 relative group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-[#0f172a] text-white rounded-lg text-[10px] font-black tracking-widest">
                    {event.time}
                  </span>
                  <h3 className="font-black text-slate-800 text-sm">{event.title}</h3>
                </div>
                <button onClick={() => handleDelete(event.id)} className="p-2 text-slate-100 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {event.location && (
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </div>
              )}

              {event.description && (
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        )) : (
          <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No schedule registered</div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="absolute inset-0 bg-[#0f172a]/70 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full sm:max-w-xl bg-white rounded-t-[24px] sm:rounded-[24px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white py-1 z-10">
              <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-widest">Add Milestone</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 bg-slate-50 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddTimeline} className="space-y-4">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[11px]" placeholder="e.g. Guest Reception" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                  <input type="time" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[11px]" value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[11px]" placeholder="e.g. Main Garden" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Execution Notes</label>
                <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[11px] h-20" placeholder="e.g. Ensure DJ is ready with intro music..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>
              <button disabled={isLoading} className="w-full py-4 bg-[#0f172a] text-white font-black rounded-xl shadow-xl active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em] mt-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Milestone'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
