import { UserRole } from './types';

export const APP_NAME = "GuestNama";

// IMPORTANT: Replace this with your deployed Google Apps Script Web App URL
export const BACKEND_URL = "https://script.google.com/macros/s/AKfycbzjQLqCO8SPJZLamV1duZ7VtjAMVwX4Gajb5UxGF3BKDLZRX1iIUax_kdlD7uQ0e9ORQQ/exec";

export const INITIAL_STORAGE_KEY = "guestnama_db_v1";

export const DEFAULT_ADMIN = {
  id: 'admin-001',
  email: 'admin@guestnama.com',
  name: 'System Administrator',
  role: UserRole.ADMIN,
  passwordHash: 'YWRtaW4xMjM=', // b64 of 'admin123'
  createdAt: new Date('2024-01-01').toISOString()
};

export const GUEST_GROUPS = ['Family', 'Friends', 'Colleagues', 'Other'] as const;
export const RSVP_STATUSES = ['Pending', 'Confirmed', 'Declined'] as const;

export const RELATIONSHIPS = ['Family', 'Friend', 'Relative', 'Colleague', 'Neighbor'] as const;
export const CAR_STATUS = ['No (Need Transport)', 'Yes (Has Own Car)'] as const;
export const INVITE_STATUS = ['Not Sent', 'Sent', 'Delivered', 'Seen'] as const;