export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Guest {
  id: string;
  userId: string;
  name: string;
  phone: string;
  rsvpStatus: 'Pending' | 'Confirmed' | 'Declined';
  checkedIn: boolean;
  eventDate: string;
  group: 'Family' | 'Friends' | 'Colleagues' | 'Other';
  vipStatus: boolean;
  city: string;
  men: number;
  women: number;
  children: number;
  totalPersons: number;
  relationship: string;
  ownCar: string;
  invitedBy: string;
  invitationSent: string;
  notes: string;
}

export interface FinanceEntry {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  date: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface StorageSchema {
  users: (User & { passwordHash: string })[];
  guests: Guest[];
  finance: FinanceEntry[];
  tasks: Task[];
}