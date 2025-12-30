
import { User, Guest, UserRole, FinanceEntry, Task } from '../types';
import { BACKEND_URL } from '../constants';

const callBackend = async (action: string, payload: any = {}) => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      body: JSON.stringify({ action, payload }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  } catch (error) {
    console.error(`Backend Error (${action}):`, error);
    throw error;
  }
};

export const StorageService = {
  getUsers: async (): Promise<(User & { passwordHash: string })[]> => {
    return await callBackend('getUsers') || [];
  },
  
  addUser: async (user: User & { passwordHash: string }) => {
    await callBackend('signup', user);
  },

  verifySession: async (userId: string): Promise<boolean> => {
    return await callBackend('verifySession', { userId });
  },

  getGuests: async (userId: string, role: UserRole): Promise<Guest[]> => {
    return await callBackend('getGuests', { userId, role }) || [];
  },

  addGuest: async (guest: Guest) => {
    await callBackend('addGuest', guest);
  },

  deleteGuest: async (guestId: string) => {
    await callBackend('deleteGuest', { guestId });
  },

  updateGuestStatus: async (guestId: string, status: Guest['rsvpStatus']) => {
    await callBackend('updateGuestStatus', { guestId, status });
  },

  getFinance: async (userId: string): Promise<FinanceEntry[]> => {
    return await callBackend('getFinance', { userId }) || [];
  },

  addFinance: async (entry: FinanceEntry) => {
    await callBackend('addFinance', entry);
  },

  deleteFinance: async (financeId: string) => {
    await callBackend('deleteFinance', { financeId });
  },

  getTasks: async (userId: string): Promise<Task[]> => {
    return await callBackend('getTasks', { userId }) || [];
  },

  addTask: async (task: Task) => {
    await callBackend('addTask', task);
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    await callBackend('updateTask', { taskId, ...updates });
  },

  deleteTask: async (taskId: string) => {
    await callBackend('deleteTask', { taskId });
  }
};
