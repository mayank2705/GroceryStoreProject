import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useCartStore, useAuthStore } from '../store';
import CartSidebar from '../components/CartSidebar';
import HeroCarousel from '../components/HeroCarousel';
import CategorySlider from '../components/CategorySlider';

export default function HomePage() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 20;

    const [cartOpen, setCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { addItem, removeItem, items: cartItems, getTotalItems, getTotalPrice } = useCartStore();
    const { user, token, setUser, logout } = useAuthStore();

    const observer = useRef();
    const lastProductElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setOffset(prev => prev + LIMIT);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);


    useEffect(() => {
        fetchInitialData();
        if (token) {
            loadProfile();
        }
    }, [token]);

    // Listen to offset change to fetch more
    useEffect(() => {
        if (offset > 0) {
            fetchMoreProducts();
        }
    }, [offset]);

    const fetchInitialData = async () => {
        setLoading(true);
        setHasMore(true);
        setOffset(0);
        try {
            const [cats, prods] = await Promise.all([
                api.getCategories(),
                api.getProducts(activeCategory, LIMIT, 0)
            ]);
            setCategories(cats);
            setProducts(prods);
            if (prods.length < LIMIT) setHasMore(false);
        } catch (err) {
            console.error('Failed to load data:', err);
        }
        setLoading(false);
    };

    const fetchMoreProducts = async () => {
        if (!hasMore) return;
        setLoadingMore(true);
        try {
            const newProds = await api.getProducts(activeCategory, LIMIT, offset);
            if (newProds.length === 0) {
                setHasMore(false);
            } else {
                setProducts(prev => [...prev, ...newProds]);
                if (newProds.length < LIMIT) setHasMore(false);
            }
        } catch (err) {
            console.error('Failed to load more products:', err);
        }
        setLoadingMore(false);
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
        setActiveCategory(catId);
        setOffset(0);
        setHasMore(true);
        setLoading(true);
        try {
            const prods = await api.getProducts(catId, LIMIT, 0);
            setProducts(prods);
            if (prods.length < LIMIT) setHasMore(false);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
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
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Blinkit Style Sticky Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex flex-col gap-3">
                        {/* Top row: Location & Profile/Cart */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity">
                                <div className="flex items-center gap-1">
                                    <h2 className="text-lg font-bold text-gray-900 leading-tight flex items-center gap-1">
                                    Delivery in 10 minutes
                                    </h2>
                                </div>
                                <div className="flex items-center gap-1">
                                    <p className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-sm">
                                        {user?.full_name ? `${user.full_name} - ${user.address || 'Select Address'}` : 'Home - Select Delivery Location'}
                                    </p>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0">
                                {user && token ? (
                                    <button
                                        onClick={logout}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                                        title="Logout"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => window.location.href = '/login'}
                                        className="h-9 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        Login
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder='Search "atta", "milk", "vegetables"...'
                                className="w-full h-12 pl-10 pr-4 rounded-xl bg-gray-100 border-none focus:ring-1 focus:ring-brand-500 outline-none text-sm font-medium"
                                id="search-input"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Carousel */}
            {!searchQuery && <HeroCarousel />}

            {/* Category Slider */}
            {!searchQuery && (
                <div className="bg-white mt-1 mb-2 py-3 border-y border-gray-100">
                    <CategorySlider 
                        categories={categories} 
                        activeCategory={activeCategory} 
                        onCategoryClick={handleCategoryClick} 
                    />
                </div>
            )}

            {/* Products Grid */}
            <main className="max-w-7xl mx-auto px-4 py-4">
                {activeCategory && (
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {categories.find((c) => c.id === activeCategory)?.name}
                    </h2>
                )}

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 space-y-3">
                                <div className="w-full aspect-square shimmer rounded-lg" />
                                <div className="h-3 shimmer rounded w-3/4" />
                                <div className="h-8 shimmer rounded mt-2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        <AnimatePresence>
                            {filteredProducts.map((product, index) => {
                                const qty = getItemQty(product.id);
                                const isLastElement = index === filteredProducts.length - 1;

                                return (
                                    <div
                                        key={product.id}
                                        ref={isLastElement ? lastProductElementRef : null}
                                        className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors duration-200 overflow-hidden relative flex flex-col"
                                    >
                                        {/* Product Image */}
                                        <div className="relative p-2 flex items-center justify-center aspect-square bg-white">
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                loading="lazy"
                                                className="w-full h-full object-contain mix-blend-multiply"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f0fdf4&color=0c831f&font-size=0.33`;
                                                }}
                                            />
                                            {/* Blinkit style clock badge */}
                                            <div className="absolute bottom-2 left-2 bg-gray-100/90 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm border border-black/5">
                                                <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-[10px] font-bold text-gray-800">8 MINS</span>
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="p-3 flex flex-col flex-1">
                                            <h3 className="text-[13px] font-semibold text-gray-800 leading-tight mb-1 line-clamp-2 min-h-[32px]">
                                                {product.name}
                                            </h3>
                                            <p className="text-[11px] text-gray-500 font-medium mb-3">{product.weight}</p>

                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        ₹{product.price}
                                                    </span>
                                                </div>

                                                {/* Blinkit Style ADD Button Pill */}
                                                {qty === 0 ? (
                                                    <button
                                                        onClick={() => addItem(product)}
                                                        className="h-8 px-5 bg-brand-50 border border-brand-500 text-brand-600 font-bold text-xs rounded-lg hover:bg-brand-100 transition-colors shadow-sm"
                                                    >
                                                        ADD
                                                    </button>
                                                ) : (
                                                    <div className="h-8 flex items-center bg-brand-500 rounded-lg shadow-sm w-20 justify-between px-1">
                                                        <button
                                                            onClick={() => removeItem(product.id)}
                                                            className="w-6 h-6 flex items-center justify-center text-white font-bold text-lg leading-none"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-white font-bold text-xs">
                                                            {qty}
                                                        </span>
                                                        <button
                                                            onClick={() => addItem(product)}
                                                            className="w-6 h-6 flex items-center justify-center text-white font-bold text-lg leading-none"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Loading More Spinner */}
                {loadingMore && (
                    <div className="flex justify-center py-6">
                        <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
                    </div>
                )}

                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg font-medium">No items found</p>
                    </div>
                )}
            </main>

            {/* Desktop Cart Float */}
            <div className="hidden sm:block fixed right-6 bottom-6 z-40">
                <button
                    onClick={() => setCartOpen(true)}
                    className="h-14 px-6 bg-brand-500 hover:bg-brand-600 text-white rounded-full font-bold flex items-center gap-3 shadow-xl transition-all hover:scale-105"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                    My Cart {getTotalItems() > 0 && `• ${getTotalItems()}`}
                </button>
            </div>

            {/* Standard Blinkit Sticky Bottom Cart Banner (Mobile) */}
            <AnimatePresence>
                {getTotalItems() > 0 && !cartOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:hidden bg-white/80 backdrop-blur-md border-t border-gray-100"
                    >
                        <button
                            onClick={() => setCartOpen(true)}
                            className="w-full h-14 bg-brand-500 active:bg-brand-600 text-white rounded-xl flex items-center justify-between px-4 shadow-lg"
                        >
                            <div className="flex flex-col items-start leading-tight">
                                <span className="font-bold text-sm">{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}</span>
                                <span className="font-extrabold text-lg flex items-center"><span className="text-sm font-normal mr-0.5">₹</span>{getTotalPrice()}</span>
                            </div>
                            <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
                                View cart
                                <svg className="w-5 h-5 bg-white/20 rounded-full p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
}
