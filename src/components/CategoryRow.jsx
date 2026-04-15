import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useCartStore } from '../store';

export default function CategoryRow({ category, onSeeAll }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addItem, removeItem, items: cartItems } = useCartStore();

    useEffect(() => {
        let isMounted = true;
        const fetchRowProducts = async () => {
            try {
                // Fetch top 15 items for this category row
                const prods = await api.getProducts(category.id, 15, 0);
                if (isMounted) setProducts(prods);
            } catch (err) {
                console.error('Failed to load row products:', err);
            }
            if (isMounted) setLoading(false);
        };
        fetchRowProducts();
        return () => { isMounted = false; };
    }, [category.id]);

    const getItemQty = (productId) => {
        const item = cartItems.find((i) => i.id === productId);
        return item ? item.qty : 0;
    };

    if (loading) {
        return (
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3 px-4">
                    <div className="h-6 w-32 shimmer rounded"></div>
                    <div className="h-4 w-12 shimmer rounded"></div>
                </div>
                <div className="flex gap-3 px-4 overflow-x-hidden">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="min-w-[140px] w-[140px] md:min-w-[180px] bg-white rounded-xl border border-gray-100 p-3 space-y-3 shrink-0">
                            <div className="w-full aspect-square shimmer rounded-lg" />
                            <div className="h-3 shimmer rounded w-3/4" />
                            <div className="h-8 shimmer rounded mt-2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div className="mb-6">
            {/* Row Header */}
            <div className="flex justify-between items-center mb-3 px-4">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{category.name}</h2>
                <button 
                    onClick={() => onSeeAll(category.id)}
                    className="text-brand-600 font-bold text-sm tracking-wide hover:text-brand-700 transition-colors"
                >
                    see all
                </button>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar snap-x pb-4 pt-1">
                <AnimatePresence>
                    {products.map((product) => {
                        const qty = getItemQty(product.id);
                        return (
                            <div
                                key={product.id}
                                className="snap-start shrink-0 w-[150px] sm:w-[160px] md:w-[180px] bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors duration-200 overflow-hidden relative flex flex-col shadow-sm"
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
                                    {/* Clock badge */}
                                    <div className="absolute bottom-1 left-2 bg-gray-100/90 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm border border-black/5">
                                        <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-[10px] font-bold text-gray-800">10 MINS</span>
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className="p-3 flex flex-col flex-1 pb-4">
                                    <h3 className="text-[13px] font-semibold text-gray-800 leading-snug mb-1 line-clamp-2 min-h-[36px]">
                                        {product.name}
                                    </h3>
                                    <p className="text-[11px] text-gray-500 font-medium mb-3">{product.weight}</p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">
                                                ₹{product.price}
                                            </span>
                                        </div>

                                        {/* ADD Button */}
                                        {qty === 0 ? (
                                            <button
                                                onClick={() => addItem(product)}
                                                className="h-8 px-4 bg-brand-50 border border-brand-200 text-brand-600 font-bold text-xs rounded-lg hover:bg-brand-100 hover:border-brand-500 transition-colors shadow-sm"
                                            >
                                                ADD
                                            </button>
                                        ) : (
                                            <div className="h-8 flex items-center bg-brand-500 rounded-lg shadow-sm w-16 justify-between px-1">
                                                <button
                                                    onClick={() => removeItem(product.id)}
                                                    className="w-5 h-5 flex items-center justify-center text-white font-bold text-lg leading-none"
                                                >
                                                    -
                                                </button>
                                                <span className="text-white font-bold text-xs">
                                                    {qty}
                                                </span>
                                                <button
                                                    onClick={() => addItem(product)}
                                                    className="w-5 h-5 flex items-center justify-center text-white font-bold text-lg leading-none"
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
        </div>
    );
}
