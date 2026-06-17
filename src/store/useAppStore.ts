import { create } from 'zustand';
import { Order, Batch, Delivery, SterilePack } from '@/types/instrument';
import { mockOrders, mockBatches, mockDeliveries, mockSterilePacks, mockUser } from '@/data/mock';

interface AppState {
  user: typeof mockUser;
  orders: Order[];
  batches: Batch[];
  deliveries: Delivery[];
  sterilePacks: SterilePack[];
  currentRole: 'clinic' | 'center';
  setRole: (role: 'clinic' | 'center') => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  updateDelivery: (id: string, updates: Partial<Delivery>) => void;
  updateSterilePack: (id: string, updates: Partial<SterilePack>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: mockUser,
  orders: mockOrders,
  batches: mockBatches,
  deliveries: mockDeliveries,
  sterilePacks: mockSterilePacks,
  currentRole: 'clinic',
  setRole: (role) => set({ currentRole: role }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (id, updates) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o))
    })),
  updateBatch: (id, updates) =>
    set((state) => ({
      batches: state.batches.map((b) => (b.id === id ? { ...b, ...updates } : b))
    })),
  updateDelivery: (id, updates) =>
    set((state) => ({
      deliveries: state.deliveries.map((d) => (d.id === id ? { ...d, ...updates } : d))
    })),
  updateSterilePack: (id, updates) =>
    set((state) => ({
      sterilePacks: state.sterilePacks.map((p) => (p.id === id ? { ...p, ...updates } : p))
    }))
}));
