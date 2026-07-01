import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CLIENT';
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const stored = localStorage.getItem('user');

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: stored ? (JSON.parse(stored) as User) : null,
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
}));
