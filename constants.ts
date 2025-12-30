
import { UserRole } from './types';

export const APP_NAME = "GuestNama";

// IMPORTANT: Replace this with your deployed Google Apps Script Web App URL
export const BACKEND_URL = "https://script.google.com/macros/s/AKfycbzf0gTCIiq8PLPTvdvDxGYR2RAHwV2AUCnb1UAFEvivHQL54ufwY_2Sf27kfXupvELY/exec";

export const INITIAL_STORAGE_KEY = "guestnama_db_v1";

export const DEFAULT_ADMIN = {
  id: 'admin-001',
  email: 'admin@guestnama.com',
  name: 'System Administrator',
  role: UserRole.ADMIN,
  passwordHash: '240be518fabd2724ddb6f0403f30bc2e25231735a0ad13a0967db80e227038c1', // SHA-256 hex of 'admin123'
  createdAt: new Date('2024-01-01').toISOString()
};

export const GUEST_GROUPS = ['Family', 'Friends', 'Colleagues', 'Other'] as const;
export const RSVP_STATUSES = ['Pending', 'Confirmed', 'Declined'] as const;

export const RELATIONSHIPS = ['Family', 'Friend', 'Relative', 'Colleague', 'Neighbor'] as const;
export const CAR_STATUS = ['No (Need Transport)', 'Yes (Has Own Car)'] as const;
export const INVITE_STATUS = ['Not Sent', 'Sent', 'Delivered', 'Seen'] as const;
