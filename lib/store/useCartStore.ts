import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/lib/types/ecommerce';

interface CartState {
  isOpen: boolean;
  items: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: any, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  
  // Computed helpers
  getCartSubtotal: () => number;
  getTotalCount: () => number;
  getKlarnaInstallment: () => number;
  getClearpayInstallment: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (item, maybeQuantity) => {
        const qty = maybeQuantity || item.quantity || 1;
        const isCartItem = Boolean(item.variantId && item.productId);
        const resolvedItem: CartItem = isCartItem
          ? { ...item, quantity: qty }
          : {
              id: item.id,
              productId: item.id,
              variantId: 'default',
              title: item.name || item.title || 'Product',
              variantTitle: item.variantTitle || 'Standard',
              sku: item.sku || `RYC-${item.id?.slice(0, 6) || '01'}`,
              price: Number(item.price ?? item.basePrice ?? 0),
              quantity: qty,
              image: Array.isArray(item.images)
                ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url)
                : item.image || '/images/media_1791069473262.jpg',
            };

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === resolvedItem.id);
          if (existingIndex > -1) {
            const nextItems = [...state.items];
            nextItems[existingIndex].quantity += qty;
            return { items: nextItems, isOpen: true };
          }
          return {
            items: [...state.items, { ...resolvedItem, quantity: qty }],
            isOpen: true,
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, delta) => {
        set((state) => {
          const updated = state.items
            .map((item) => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[];

          return { items: updated };
        });
      },

      clearCart: () => set({ items: [] }),

      getCartSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },

      getTotalCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getKlarnaInstallment: () => {
        const subtotal = get().getCartSubtotal();
        return Math.round((subtotal / 3) * 100) / 100;
      },

      getClearpayInstallment: () => {
        const subtotal = get().getCartSubtotal();
        return Math.round((subtotal / 4) * 100) / 100;
      },
    }),
    {
      name: 'rycarix-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
