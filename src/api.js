const API_BASE = '/api';

const api = {
    syncUser: async (userData) => {
        const res = await fetch(`${API_BASE}/auth/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!res.ok) throw new Error('Failed to sync user with backend');
        return res.json();
    },

    // User
    getProfile: async (token) => {
        const res = await fetch(`${API_BASE}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },

    updateProfile: async (token, data) => {
        const res = await fetch(`${API_BASE}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // Products
    getCategories: async () => {
        const res = await fetch(`${API_BASE}/categories`);
        return res.json();
    },

    getProducts: async (categoryId, limit = 20, offset = 0) => {
        let url = `${API_BASE}/products?limit=${limit}&offset=${offset}`;
        if (categoryId) {
            url += `&category_id=${categoryId}`;
        }
        const res = await fetch(url);
        return res.json();
    },

    getRecentProducts: async () => {
        const res = await fetch(`${API_BASE}/products/recent`);
        return res.json();
    },

    // Admin
    toggleStock: async (token, productId) => {
        const res = await fetch(`${API_BASE}/admin/products/${productId}/toggle_stock`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to toggle stock');
        return res.json();
    },

    addProduct: async (token, productData) => {
        const res = await fetch(`${API_BASE}/admin/products/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        if (!res.ok) throw new Error('Failed to add product');
        return res.json();
    },

    editProduct: async (token, productId, updates) => {
        const res = await fetch(`${API_BASE}/admin/products/${productId}/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to edit product');
        return res.json();
    }
};

export default api;
