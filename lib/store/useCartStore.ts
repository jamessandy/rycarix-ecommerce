import { create } from 'zustand';
import { CartItem } from '@/lib/types/ecommerce';

interface CartState {
  isOpen: boolean;
  items: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  
  // Computed helpers
  getCartSubtotal: () => number;
  getTotalCount: () => number;
  getKlarnaInstallment: () => number;
  getClearpayInstallment: () => number;
  getFreeShippingProgress: () => { threshold: number; remaining: number; percent: number };
}

const FREE_SHIPPING_THRESHOLD = 180; // $180 luxury free shipping bar

export const useCartStore = create<CartState>((set, get) => ({
  isOpen: false,
  items: [],

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  addItem: (item) => {
    const qty = item.quantity || 1;
    set((state) => {
      const existingIndex = state.items.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const nextItems = [...state.items];
        nextItems[existingIndex].quantity += qty;
        return { items: nextItems, isOpen: true };
      }
      return {
        items: [...state.items, { ...item, quantity: qty }],
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

  getFreeShippingProgress: () => {
    const subtotal = get().getCartSubtotal();
    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
    return { threshold: FREE_SHIPPING_THRESHOLD, remaining, percent };
  },
}));
