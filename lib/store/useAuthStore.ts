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
  role: 'VIP_CLIENT' | 'ADMIN' | 'USER';
  title: string;
  tier: string;
  memberSince: string;
  avatarInitial: string;
  phone: string;
  addresses: UserAddress[];
}

export const DEMO_USERS: Record<'VIP_CLIENT' | 'ADMIN' | 'USER', UserProfile> = {
  VIP_CLIENT: {
    id: 'usr-vip-001',
    name: 'Éléonore de Vance',
    email: 'eleonore.devance@luxury-atelier.com',
    role: 'VIP_CLIENT',
    title: 'VIP Customer',
    tier: 'VIP Member',
    memberSince: '2024',
    avatarInitial: 'E',
    phone: '+1 (212) 555-0194',
    addresses: [
      {
        id: 'addr-1',
        type: 'Home Address',
        street: '740 Park Avenue, Apt 11B',
        city: 'New York',
        state: 'NY',
        postalCode: '10021',
        country: 'United States',
        isDefault: true,
      },
    ],
  },
  ADMIN: {
    id: 'usr-admin-001',
    name: 'Henri Laurent',
    email: 'admin@rycarix.com',
    role: 'ADMIN',
    title: 'Store Admin',
    tier: 'Administrator',
    memberSince: '2023',
    avatarInitial: 'H',
    phone: '+33 1 42 68 55 00',
    addresses: [
      {
        id: 'addr-admin-1',
        type: 'Office',
        street: '18 Place Vendôme',
        city: 'Paris',
        state: 'Île-de-France',
        postalCode: '75001',
        country: 'France',
        isDefault: true,
      },
    ],
  },
  USER: {
    id: 'usr-collector-001',
    name: 'Julian Vance',
    email: 'julian.vance@atelier-private.com',
    role: 'USER',
    title: 'Customer',
    tier: 'Member',
    memberSince: '2025',
    avatarInitial: 'J',
    phone: '+1 (415) 890-2100',
    addresses: [
      {
        id: 'addr-usr-1',
        type: 'Home Address',
        street: '2840 Pacific Avenue',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94115',
        country: 'United States',
        isDefault: true,
      },
    ],
  },
};

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loginAsDemo: (roleKey: 'VIP_CLIENT' | 'ADMIN' | 'USER') => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Start logged out for real users
      user: null,
      isAuthenticated: false,

      login: async (email: string, _password?: string) => {
        await new Promise((resolve) => setTimeout(resolve, 350));

        const normalizedEmail = email.trim().toLowerCase();

        // Match against known demo personas or construct an authenticated session
        if (normalizedEmail.includes('admin') || normalizedEmail.includes('henri')) {
          set({ user: DEMO_USERS.ADMIN, isAuthenticated: true });
          return { success: true };
        }

        if (normalizedEmail.includes('eleonore') || normalizedEmail.includes('vance')) {
          set({ user: DEMO_USERS.VIP_CLIENT, isAuthenticated: true });
          return { success: true };
        }

        // Standard user login
        const existing = get().user;
        const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName =
          existing?.email.toLowerCase() === normalizedEmail
            ? existing.name
            : namePart.charAt(0).toUpperCase() + namePart.slice(1);

        const newUser: UserProfile = {
          id: existing?.email.toLowerCase() === normalizedEmail ? existing.id : `usr-${Date.now().toString().slice(-6)}`,
          name: formattedName || 'Customer',
          email: normalizedEmail,
          role: 'USER',
          title: 'Customer',
          tier: 'Member',
          memberSince: existing?.memberSince || '2026',
          avatarInitial: (formattedName || 'C').charAt(0).toUpperCase(),
          phone: existing?.phone || '+1 (555) 012-3456',
          addresses: existing?.addresses || [],
        };

        set({ user: newUser, isAuthenticated: true });
        return { success: true };
      },

      signup: async (name: string, email: string, _password?: string) => {
        await new Promise((resolve) => setTimeout(resolve, 400));

        const trimmedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        const createdUser: UserProfile = {
          id: `usr-${Date.now().toString().slice(-6)}`,
          name: trimmedName || 'Customer',
          email: normalizedEmail,
          role: 'USER',
          title: 'Customer',
          tier: 'Member • 10% Discount Applied',
          memberSince: new Date().getFullYear().toString(),
          avatarInitial: trimmedName ? trimmedName.charAt(0).toUpperCase() : 'C',
          phone: '+1 (555) 019-8800',
          addresses: [],
        };

        set({ user: createdUser, isAuthenticated: true });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      loginAsDemo: (roleKey: 'VIP_CLIENT' | 'ADMIN' | 'USER') => {
        const demoUser = DEMO_USERS[roleKey];
        if (demoUser) {
          set({ user: demoUser, isAuthenticated: true });
        }
      },

      updateProfile: (data: Partial<UserProfile>) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: { ...state.user, ...data },
          };
        });
      },
    }),
    {
      name: 'rycarix-auth-storage',
    }
  )
);
