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
  phone?: string;
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

export const MAIN_ADMIN_ACCOUNT: UserProfile = {
  id: 'usr-admin-primary',
  name: 'Store Administrator',
  email: 'admin@rycarix.com',
  role: 'ADMIN',
  title: 'Store Administrator',
  tier: 'Master Administrator',
  memberSince: '2026',
  avatarInitial: 'A',
  phone: '',
  addresses: [
    {
      id: 'addr-admin-hq',
      type: 'Headquarters',
      street: 'Unit 4, Rycarix Atelier House',
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
  login: (
    email: string,
    password?: string
  ) => Promise<{ success: boolean; error?: string; role?: string }>;
  signup: (
    name: string,
    email: string,
    password?: string,
    deliveryAddress?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    },
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loginAsDemo: (roleKey: 'VIP_CLIENT' | 'ADMIN' | 'USER') => void;
  refreshProfile: () => Promise<UserProfile | null>;
  updateProfile: (
    data: Partial<UserProfile>
  ) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  addAddress: (
    address: Omit<UserAddress, 'id'>
  ) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password?: string) => {
        try {
          const res = await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'login',
              email: email.trim().toLowerCase(),
              password: (password || '').trim(),
            }),
          });
          const data = await res.json();

          if (!res.ok || !data.user) {
            return {
              success: false,
              error: data.error || 'Invalid credentials.',
            };
          }

          set({ user: data.user, isAuthenticated: true });
          return { success: true, role: data.user.role };
        } catch (err: any) {
          return {
            success: false,
            error: err?.message || 'Unable to sign in right now.',
          };
        }
      },

      signup: async (
        name: string,
        email: string,
        password?: string,
        deliveryAddress?: {
          street?: string;
          city?: string;
          state?: string;
          postalCode?: string;
          country?: string;
        },
        phone?: string
      ) => {
        try {
          const res = await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'signup',
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password: (password || '').trim(),
              phone: (phone || '').trim(),
              deliveryAddress,
            }),
          });
          const data = await res.json();

          if (!res.ok || !data.user) {
            return {
              success: false,
              error: data.error || 'Failed to create account.',
            };
          }

          set({ user: data.user, isAuthenticated: true });
          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            error: err?.message || 'Failed to create account.',
          };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      loginAsDemo: (_roleKey: 'VIP_CLIENT' | 'ADMIN' | 'USER') => {
        // disabled in production
      },

      refreshProfile: async () => {
        const currentUser = get().user;
        if (!currentUser?.email) return null;

        try {
          const res = await fetch(
            `/api/user/profile?email=${encodeURIComponent(currentUser.email)}`,
            { cache: 'no-store' }
          );
          if (!res.ok) return null;
          const data = await res.json();
          if (data?.user) {
            set({ user: data.user, isAuthenticated: true });
            return data.user as UserProfile;
          }
        } catch (err) {
          console.warn('Could not refresh user profile from PostgreSQL:', err);
        }
        return null;
      },

      updateProfile: async (data: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (!currentUser) {
          return { success: false, error: 'Not signed in.' };
        }

        const optimisticUser: UserProfile = {
          ...currentUser,
          ...data,
          phone: data.phone !== undefined ? String(data.phone).trim() : currentUser.phone,
          name: data.name !== undefined ? String(data.name).trim() : currentUser.name,
        };
        set({ user: optimisticUser });

        try {
          const res = await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              name: optimisticUser.name,
              phone: optimisticUser.phone,
              addresses: data.addresses,
            }),
          });
          const json = await res.json();
          if (!res.ok || !json.user) {
            return {
              success: false,
              error: json.error || 'Failed to save profile to database.',
            };
          }

          set({ user: json.user, isAuthenticated: true });
          return { success: true, user: json.user };
        } catch (err: any) {
          return {
            success: false,
            error: err?.message || 'Network error while saving profile.',
          };
        }
      },

      addAddress: async (addressData: Omit<UserAddress, 'id'>) => {
        const currentUser = get().user;
        if (!currentUser) {
          return { success: false, error: 'Not signed in.' };
        }

        const newAddress: UserAddress = {
          ...addressData,
          id: `addr-${Date.now().toString().slice(-6)}`,
        };
        const existingAddresses = currentUser.addresses || [];
        const updatedAddresses = addressData.isDefault
          ? [...existingAddresses.map((a) => ({ ...a, isDefault: false })), newAddress]
          : [...existingAddresses, newAddress];

        set({ user: { ...currentUser, addresses: updatedAddresses } });

        try {
          const res = await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              name: currentUser.name,
              phone: currentUser.phone,
              newAddress: addressData,
            }),
          });
          const json = await res.json();
          if (!res.ok || !json.user) {
            return {
              success: false,
              error: json.error || 'Failed to save address.',
            };
          }
          set({ user: json.user, isAuthenticated: true });
          return { success: true, user: json.user };
        } catch (err: any) {
          return {
            success: false,
            error: err?.message || 'Network error while saving address.',
          };
        }
      },
    }),
    {
      name: 'rycarix-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
