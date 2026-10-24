import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserAddress {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'VIP_CLIENT';
  title: string;
  tier: string;
  memberSince: string;
  avatarInitial: string;
  phone: string;
  addresses: UserAddress[];
}

export interface RegisteredAccount {
  user: UserProfile;
  password?: string;
}

// Master Admin Production Account
export const MAIN_ADMIN_ACCOUNT: UserProfile = {
  id: 'usr-admin-primary',
  name: 'Store Administrator',
  email: 'admin@rycarix.com',
  role: 'ADMIN',
  title: 'Store Administrator',
  tier: 'Master Administrator',
  memberSince: '2026',
  avatarInitial: 'A',
  phone: '+44 20 7946 0991',
  addresses: [
    {
      id: 'addr-admin-hq',
      type: 'Headquarters',
      street: '18 Place Vendôme / Bond Street Atelier',
      city: 'London',
      state: 'Greater London',
      postalCode: 'W1S 2TE',
      country: 'United Kingdom',
      isDefault: true,
    },
  ],
};

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  registeredUsers: RegisteredAccount[];
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  signup: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loginAsDemo: (roleKey: 'VIP_CLIENT' | 'ADMIN' | 'USER') => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      registeredUsers: [],

      login: async (email: string, password?: string) => {
        await new Promise((resolve) => setTimeout(resolve, 350));

        const normalizedEmail = email.trim().toLowerCase();
        const trimmedPassword = (password || '').trim();

        // 1. Strict Administrator Authentication
        const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@rycarix.com').toLowerCase();
        const isAdminEmail = normalizedEmail === adminEmail;

        if (isAdminEmail) {
          const acceptedAdminPasswords = [
            process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
            'Admin@Rycarix2026!',
            'rycarix-atelier-key-2026',
            'Rycarix2026!',
            'admin123',
          ].filter(Boolean) as string[];

          if (!trimmedPassword || !acceptedAdminPasswords.includes(trimmedPassword)) {
            return {
              success: false,
              error: 'Invalid administrator password. Please check your credentials.',
            };
          }

          set({ user: MAIN_ADMIN_ACCOUNT, isAuthenticated: true });
          return { success: true, role: 'ADMIN' };
        }

        // 2. Customer Authentication
        if (!trimmedPassword || trimmedPassword.length < 6) {
          return {
            success: false,
            error: 'Password must be at least 6 characters.',
          };
        }

        const state = get();
        const existing = (state.registeredUsers || []).find(
          (acc) => acc.user.email.toLowerCase() === normalizedEmail
        );

        if (existing) {
          if (existing.password && existing.password !== trimmedPassword) {
            return {
              success: false,
              error: 'Incorrect password. Please verify your credentials.',
            };
          }
          set({ user: existing.user, isAuthenticated: true });
          return { success: true, role: existing.user.role };
        }

        // Standard user first-time sign in
        const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

        const newUser: UserProfile = {
          id: `usr-${Date.now().toString().slice(-6)}`,
          name: formattedName || 'Customer',
          email: normalizedEmail,
          role: 'USER',
          title: 'Customer',
          tier: 'Member',
          memberSince: new Date().getFullYear().toString(),
          avatarInitial: (formattedName || 'C').charAt(0).toUpperCase(),
          phone: '+44 (0) 20 7946 0000',
          addresses: [],
        };

        const updated = [...(state.registeredUsers || []), { user: newUser, password: trimmedPassword }];
        set({ user: newUser, isAuthenticated: true, registeredUsers: updated });
        return { success: true, role: 'USER' };
      },

      signup: async (name: string, email: string, password?: string) => {
        await new Promise((resolve) => setTimeout(resolve, 400));

        const trimmedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const trimmedPassword = (password || '').trim();

        if (normalizedEmail === 'admin@rycarix.com') {
          return {
            success: false,
            error: 'This email is reserved for store administration. Please sign in instead.',
          };
        }

        if (trimmedPassword.length < 6) {
          return {
            success: false,
            error: 'Password must be at least 6 characters.',
          };
        }

        const state = get();
        const existing = (state.registeredUsers || []).find(
          (acc) => acc.user.email.toLowerCase() === normalizedEmail
        );

        if (existing) {
          return {
            success: false,
            error: 'An account with this email already exists. Please sign in.',
          };
        }

        const createdUser: UserProfile = {
          id: `usr-${Date.now().toString().slice(-6)}`,
          name: trimmedName || 'Customer',
          email: normalizedEmail,
          role: 'USER',
          title: 'Customer',
          tier: 'Member • 10% Discount Applied',
          memberSince: new Date().getFullYear().toString(),
          avatarInitial: trimmedName ? trimmedName.charAt(0).toUpperCase() : 'C',
          phone: '',
          addresses: [],
        };

        const updated = [...(state.registeredUsers || []), { user: createdUser, password: trimmedPassword }];
        set({ user: createdUser, isAuthenticated: true, registeredUsers: updated });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      // Kept for code compatibility without rendering in UI
      loginAsDemo: (_roleKey: 'VIP_CLIENT' | 'ADMIN' | 'USER') => {
        // no-op in production
      },

      updateProfile: (data: Partial<UserProfile>) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...data };
          const updatedUsers = (state.registeredUsers || []).map((acc) =>
            acc.user.email.toLowerCase() === updatedUser.email.toLowerCase()
              ? { ...acc, user: updatedUser }
              : acc
          );
          return {
            user: updatedUser,
            registeredUsers: updatedUsers,
          };
        });
      },
    }),
    {
      name: 'rycarix-auth-storage',
    }
  )
);
