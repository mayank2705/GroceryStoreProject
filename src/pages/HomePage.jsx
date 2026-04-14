import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useCartStore, useAuthStore } from '../store';
import CartSidebar from '../components/CartSidebar';

export default function HomePage() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { addItem, removeItem, items: cartItems, getTotalItems } = useCartStore();
    const { user, token, setUser, logout } = useAuthStore();

    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        loadData();
        if (token) {
            loadProfile();
        }
    }, [token]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cats, prods, recents] = await Promise.all([
                api.getCategories(),
                api.getProducts(),
                api.getRecentProducts()
            ]);
            setCategories(cats);
            setProducts(prods);
            setRecentProducts(recents);
        } catch (err) {
            console.error('Failed to load data:', err);
        }
        setLoading(false);
    };

    const loadProfile = async () => {
        try {
            const profile = await api.getProfile(token);
            setUser(profile);
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
    };

    const handleCategoryClick = async (catId) => {
        if (activeCategory === catId) {
            setActiveCategory(null);
            const prods = await api.getProducts();
            setProducts(prods);
        } else {
            setActiveCategory(catId);
            const prods = await api.getProducts(catId);
            setProducts(prods);
        }
    };

    const getItemQty = (productId) => {
        const item = cartItems.find((i) => i.id === productId);
        return item ? item.qty : 0;
    };

    const filteredProducts = searchQuery
        ? products.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : products;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-40 glass border-b border-gray-200/50">
                {/* Recent Items Banner */}
                {recentProducts.length > 0 && (
                    <div
                        onClick={() => window.location.href = '/new-arrivals'}
                        className="bg-accent-yellow/20 hover:bg-accent-yellow/40 cursor-pointer transition-colors w-full px-4 py-2 border-b border-accent-yellow/30 flex items-center justify-center gap-2"
                    >
                        <span className="text-orange-600 font-bold text-sm text-center">🎉 New items have been updated today! <span className="underline">Click here to view.</span></span>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/20">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold text-gray-800 leading-tight">Mohit Store</h1>
                                <p className="text-xs text-gray-400">Wholesale Kirana</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-xl">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder='Search "atta, dal, milk..."'
                                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-100 border border-gray-200 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm"
                                    id="search-input"
                                />
                            </div>
                        </div>

                        {/* Cart & User */}
                        <div className="flex items-center gap-3 shrink-0">
                            {user && token ? (
                                <span className="hidden md:block text-sm text-gray-600 font-medium">
                                    Hi, {user.full_name?.split(' ')[0]}
                                </span>
                            ) : (
                                <button
                                    onClick={() => window.location.href = '/login'}
                                    className="hidden md:flex items-center gap-2 h-11 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Sign Up / Login
                                </button>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCartOpen(true)}
                                className="relative flex items-center gap-2 h-11 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-md shadow-brand-500/20"
                                id="cart-btn"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                                <span className="hidden sm:inline">Cart</span>
                                {getTotalItems() > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-accent-orange text-white text-xs font-bold rounded-full flex items-center justify-center"
                                    >
                                        {getTotalItems()}
                                    </motion.span>
                                )}
                            </motion.button>

                            {token && (
                                <button
                                    onClick={logout}
                                    className="h-11 w-11 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
                                    title="Logout"
                                    id="logout-btn"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Category Bar */}
            <div className="sticky top-[68px] z-30 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="flex gap-3 px-4 py-3 overflow-x-auto hide-scrollbar">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setActiveCategory(null); api.getProducts().then(setProducts); }}
                            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${!activeCategory
                                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            id="category-all"
                        >
                            All Items
                        </motion.button>
                        {categories.map((cat) => (
                            <motion.button
                                key={cat.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat.id
                                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                id={`category-${cat.id}`}
                            >
                                <img
                                    src={cat.image_url}
                                    alt={cat.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                {cat.name}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Active category heading */}
                {activeCategory && (
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl font-bold text-gray-800 mb-4"
                    >
                        {categories.find((c) => c.id === activeCategory)?.name}
                    </motion.h2>
                )}

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 space-y-3">
                                <div className="w-full h-32 shimmer rounded-xl" />
                                <div className="h-4 shimmer rounded w-3/4" />
                                <div className="h-3 shimmer rounded w-1/2" />
                                <div className="h-10 shimmer rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                    >
                        <AnimatePresence>
                            {filteredProducts.map((product) => {
                                const qty = getItemQty(product.id);
                                return (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ type: 'spring', bounce: 0.2 }}
                                        className="bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 overflow-hidden group"
                                    >
                                        {/* Product Image */}
                                        <div className="relative p-4 pb-2">
                                            <div className="w-full h-28 sm:h-32 flex items-center justify-center">
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=e8f5e9&color=0c831f&size=128&font-size=0.33`;
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="px-4 pb-4">
                                            <p className="text-xs text-gray-400 font-medium mb-1">{product.weight}</p>
                                            <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-2 line-clamp-2 h-10">
                                                {product.name}
                                            </h3>

                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-gray-900">
                                                    <span className="text-sm font-normal">Rs.</span>{product.price}
                                                </span>

                                                {qty === 0 ? (
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.85 }}
                                                        onClick={() => addItem(product)}
                                                        className="h-9 px-4 bg-brand-50 hover:bg-brand-100 border border-brand-500 text-brand-500 font-bold text-sm rounded-lg transition-colors"
                                                        id={`add-btn-${product.id}`}
                                                    >
                                                        ADD
                                                    </motion.button>
                                                ) : (
                                                    <motion.div
                                                        initial={{ scale: 0.8 }}
                                                        animate={{ scale: 1 }}
                                                        className="flex items-center gap-1 bg-brand-500 rounded-lg overflow-hidden"
                                                    >
                                                        <motion.button
                                                            whileTap={{ scale: 0.8 }}
                                                            onClick={() => removeItem(product.id)}
                                                            className="w-8 h-9 flex items-center justify-center text-white font-bold text-lg hover:bg-brand-600 transition-colors"
                                                        >
                                                            -
                                                        </motion.button>
                                                        <motion.span
                                                            key={qty}
                                                            initial={{ scale: 1.3 }}
                                                            animate={{ scale: 1 }}
                                                            className="w-6 text-center text-white font-bold text-sm"
                                                        >
                                                            {qty}
                                                        </motion.span>
                                                        <motion.button
                                                            whileTap={{ scale: 0.8 }}
                                                            onClick={() => addItem(product)}
                                                            className="w-8 h-9 flex items-center justify-center text-white font-bold text-lg hover:bg-brand-600 transition-colors"
                                                        >
                                                            +
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No products found</p>
                    </div>
                )}
            </main>

            {/* Floating Cart Bar (mobile) */}
            <AnimatePresence>
                {getTotalItems() > 0 && !cartOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0.3 }}
                        className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:hidden"
                    >
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCartOpen(true)}
                            className="w-full h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl flex items-center justify-between px-6 shadow-xl shadow-brand-500/30"
                        >
                            <div className="flex items-center gap-2">
                                <span className="bg-brand-600 px-2 py-0.5 rounded-md text-sm font-bold">
                                    {getTotalItems()} items
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">View Cart</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Sidebar */}
            <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
}
