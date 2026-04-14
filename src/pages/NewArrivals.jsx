import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useCartStore } from '../store';
import { useNavigate } from 'react-router-dom';
import CartSidebar from '../components/CartSidebar';

export default function NewArrivals() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartOpen, setCartOpen] = useState(false);
    const { addItem, removeItem, items: cartItems, getTotalItems } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        api.getRecentProducts().then(prods => {
            setProducts(prods);
            setLoading(false);
        }).catch(err => {
            console.error('Failed to load recent items:', err);
            setLoading(false);
        });
    }, []);

    const getItemQty = (productId) => {
        const item = cartItems.find((i) => i.id === productId);
        return item ? item.qty : 0;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-40 glass border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-700 hover:text-brand-500 transition-colors font-bold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Home
                        </button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCartOpen(true)}
                            className="relative flex items-center gap-2 h-11 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-md shadow-brand-500/20"
                        >
                            <span>Cart</span>
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent-orange text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {getTotalItems()}
                                </span>
                            )}
                        </motion.button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-gray-800 mb-6 font-outfit"
                >
                    Freshly Stocked / Added Today! 🚀
                </motion.h2>

                {loading ? (
                    <div className="text-center py-20 font-bold text-gray-500">Loading new arrivals...</div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                    >
                        <AnimatePresence>
                            {products.map((product) => {
                                const qty = getItemQty(product.id);
                                return (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-white rounded-2xl border border-gray-100 hover:border-brand-200 shadow-md overflow-hidden group"
                                    >
                                        <div className="relative p-4 pb-2 flex items-center justify-center h-28 sm:h-32">
                                            <span className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold z-10">NEW</span>
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                            />
                                        </div>
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
                                                    <button
                                                        onClick={() => addItem(product)}
                                                        className="h-9 px-4 bg-brand-50 hover:bg-brand-100 border border-brand-500 text-brand-500 font-bold text-sm rounded-lg"
                                                    >
                                                        ADD
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-1 bg-brand-500 rounded-lg overflow-hidden">
                                                        <button
                                                            onClick={() => removeItem(product.id)}
                                                            className="w-8 h-9 flex items-center justify-center text-white font-bold text-lg hover:bg-brand-600"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-6 text-center text-white font-bold text-sm">
                                                            {qty}
                                                        </span>
                                                        <button
                                                            onClick={() => addItem(product)}
                                                            className="w-8 h-9 flex items-center justify-center text-white font-bold text-lg hover:bg-brand-600"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                {!loading && products.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No new items found today</p>
                    </div>
                )}
            </main>

            <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
}
