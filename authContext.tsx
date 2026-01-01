
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState, User, UserRole } from './types';
import { StorageService } from './services/storageService';

interface AuthContextType extends AuthState {
  login: (phone: string, password: string) => Promise<boolean>;
  signup: (name: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Normalizes phone numbers for comparison.
 * 1. Removes all non-digit characters.
 * 2. Removes any leading zeros (e.g., 0349... becomes 349...) 
 *    to fix the common Google Sheets numeric conversion issue.
 */
const normalizePhone = (p: string | number) => {
  const s = String(p || '');
  const digits = s.replace(/\D/g, '');
  return digits.replace(/^0+/, '');
};

// Proper SHA-256 Password Hashing
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const logout = useCallback(() => {
    setState({ user: null, isAuthenticated: false, isLoading: false });
    localStorage.removeItem('guestnama_session');
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const savedSession = localStorage.getItem('guestnama_session');
      if (savedSession) {
        try {
          const user = JSON.parse(savedSession);
          const isValid = await StorageService.verifySession(user.id);
          if (isValid) {
            setState({ user, isAuthenticated: true, isLoading: false });
          } else {
            logout();
          }
        } catch (e) {
          logout();
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    initAuth();
  }, [logout]);

  useEffect(() => {
    if (!state.isAuthenticated || !state.user) return;
    const interval = setInterval(async () => {
      try {
        const isValid = await StorageService.verifySession(state.user!.id);
        if (!isValid) {
          logout();
          window.location.reload();
        }
      } catch (e) {}
    }, 300000); 
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.user, logout]);

  const login = useCallback(async (phone: string, password: string) => {
    const normalizedInputPhone = normalizePhone(phone);
    const passHash = await hashPassword(password);
    const users = await StorageService.getUsers();
    
    // Find user using normalized phone comparison
    const user = users.find(u => {
      const normalizedDbPhone = normalizePhone(u.phone);
      return normalizedDbPhone === normalizedInputPhone && u.passwordHash === passHash;
    });
    
    if (user) {
      const { passwordHash: _, ...userWithoutPassword } = user;
      setState({ user: userWithoutPassword, isAuthenticated: true, isLoading: false });
      localStorage.setItem('guestnama_session', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (name: string, phone: string, password: string) => {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) return false;

    const users = await StorageService.getUsers();
    if (users.find(u => normalizePhone(u.phone) === normalizedPhone)) return false;

    const passHash = await hashPassword(password);
    const newUser: User & { passwordHash: string } = {
      id: crypto.randomUUID(),
      name,
      phone: normalizedPhone, // Store normalized digits
      role: UserRole.USER,
      passwordHash: passHash,
      createdAt: new Date().toISOString()
    };

    await StorageService.addUser(newUser);
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    setState({ user: userWithoutPassword, isAuthenticated: true, isLoading: false });
    localStorage.setItem('guestnama_session', JSON.stringify(userWithoutPassword));
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
