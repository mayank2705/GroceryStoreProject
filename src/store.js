import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    token: localStorage.getItem('mohit_token') || null,
    userId: localStorage.getItem('mohit_user_id') || null,
    isProfileComplete: localStorage.getItem('mohit_profile_complete') === 'true',
    hasWhatsapp: localStorage.getItem('mohit_has_whatsapp') === 'true',
    user: null,

    setAuth: (token, userId, isProfileComplete, hasWhatsapp) => {
        localStorage.setItem('mohit_token', token);
        localStorage.setItem('mohit_user_id', userId);
        localStorage.setItem('mohit_profile_complete', isProfileComplete);
        localStorage.setItem('mohit_has_whatsapp', hasWhatsapp);
        set({ token, userId, isProfileComplete, hasWhatsapp });
    },

    setUser: (user) => {
        if (user) {
            const hasWhatsapp = !!user.whatsapp_number;
            localStorage.setItem('mohit_has_whatsapp', hasWhatsapp);
            set({ user, hasWhatsapp });
        } else {
            set({ user });
        }
    },

    setProfileComplete: (val) => {
        localStorage.setItem('mohit_profile_complete', val);
        set({ isProfileComplete: val });
    },

    logout: () => {
        localStorage.removeItem('mohit_token');
        localStorage.removeItem('mohit_user_id');
        localStorage.removeItem('mohit_profile_complete');
        localStorage.removeItem('mohit_has_whatsapp');
        set({ token: null, userId: null, isProfileComplete: false, hasWhatsapp: false, user: null });
    },
}));

export const useCartStore = create((set, get) => ({
    items: JSON.parse(localStorage.getItem('mohit_cart') || '[]'),

    addItem: (product) => {
        const items = get().items;
        const existing = items.find((i) => i.id === product.id);
        let newItems;
        if (existing) {
            newItems = items.map((i) =>
                i.id === product.id ? { ...i, qty: i.qty + 1 } : i
            );
        } else {
            newItems = [...items, { ...product, qty: 1 }];
        }
        localStorage.setItem('mohit_cart', JSON.stringify(newItems));
        set({ items: newItems });
    },

    removeItem: (productId) => {
        const items = get().items;
        const existing = items.find((i) => i.id === productId);
        let newItems;
        if (existing && existing.qty > 1) {
            newItems = items.map((i) =>
                i.id === productId ? { ...i, qty: i.qty - 1 } : i
            );
        } else {
            newItems = items.filter((i) => i.id !== productId);
        }
        localStorage.setItem('mohit_cart', JSON.stringify(newItems));
        set({ items: newItems });
    },

    clearCart: () => {
        localStorage.removeItem('mohit_cart');
        set({ items: [] });
    },

    getTotal: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.qty, 0);
    },

    getTotalItems: () => {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
    },
}));
