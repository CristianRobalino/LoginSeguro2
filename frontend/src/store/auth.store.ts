import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum Role {
    ADMIN = 'admin',
    CLIENT = 'client',
}

interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

/**
 * Auth Store - Estado global de autenticación
 * Usa Zustand con persistencia en localStorage
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,

            setAuth: (user, token) => {
                localStorage.setItem('accessToken', token);
                localStorage.setItem('user', JSON.stringify(user));
                set({ user, accessToken: token, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                set({ user: null, accessToken: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
