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
        const rawQty = Number(maybeQuantity || item.quantity || 1);
        const qty = Math.max(1, Math.floor(rawQty));
        const rawMax =
          item.maxStock !== undefined
            ? Number(item.maxStock)
            : item.stock !== undefined
            ? Number(item.stock)
            : item.inventory !== undefined
            ? Number(item.inventory)
            : undefined;
        const maxStock =
          rawMax !== undefined && !Number.isNaN(rawMax) ? Math.max(0, Math.floor(rawMax)) : undefined;

        if (maxStock !== undefined && maxStock <= 0) {
          return;
        }

        const isCartItem = Boolean(item.variantId && item.productId);
        const resolvedItem: CartItem = isCartItem
          ? {
              ...item,
              quantity: maxStock !== undefined ? Math.min(qty, maxStock) : qty,
              maxStock,
            }
          : {
              id: item.id,
              productId: item.id,
              variantId: 'default',
              title: item.name || item.title || 'Product',
              variantTitle: item.variantTitle || 'Standard',
              sku: item.sku || `RYC-${item.id?.slice(0, 6) || '01'}`,
              price: Number(item.price ?? item.basePrice ?? 0),
              quantity: maxStock !== undefined ? Math.min(qty, maxStock) : qty,
              maxStock,
              image: Array.isArray(item.images)
                ? typeof item.images[0] === 'string'
                  ? item.images[0]
                  : item.images[0]?.url
                : item.image || '/images/perfumes/princess-reef.jpg',
            };

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === resolvedItem.id);
          if (existingIndex > -1) {
            const nextItems = [...state.items];
            const existing = nextItems[existingIndex];
            const effectiveMax = maxStock !== undefined ? maxStock : existing.maxStock;
            const summedQty = existing.quantity + qty;
            nextItems[existingIndex] = {
              ...existing,
              price: resolvedItem.price,
              image: resolvedItem.image || existing.image,
              maxStock: effectiveMax,
              quantity: effectiveMax !== undefined ? Math.min(summedQty, effectiveMax) : summedQty,
            };
            return { items: nextItems, isOpen: true };
          }
          return {
            items: [...state.items, resolvedItem],
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
                const rawNext = item.quantity + delta;
                const clampedNext =
                  item.maxStock !== undefined ? Math.min(rawNext, item.maxStock) : rawNext;
                return clampedNext > 0 ? { ...item, quantity: clampedNext } : null;
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
