import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, email: string) => void;
  clearAuth: () => void;
}

/**
 * Global authentication store managed by Zustand.
 * Automatically synchronizes with browser localStorage to survive page refreshes.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      isAuthenticated: false,

      setAuth: (token: string, email: string) => 
        set({ token, email, isAuthenticated: true }),

      clearAuth: () => 
        set({ token: null, email: null, isAuthenticated: false }),
    }),
    {
      name: 'trietrack-auth-storage', // Key name inside browser localStorage
    }
  )
);