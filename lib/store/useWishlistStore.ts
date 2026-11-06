// lib/store/useWishlistStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/types/ecommerce';

interface WishlistState {
  items: Product[];
  toggleItem: (product: Product) => boolean; // returns true if added, false if removed
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product: Product) => {
        const exists = get().items.some((item) => item.id === product.id);
        if (exists) {
          set({ items: get().items.filter((item) => item.id !== product.id) });
          return false;
        } else {
          set({ items: [...get().items, product] });
          return true;
        }
      },
      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },
      removeItem: (productId: string) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'rycarix-wishlist-storage',
    }
  )
);
