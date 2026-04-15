import React from 'react';
import { motion } from 'framer-motion';

export default function CategorySlider({ categories, activeCategory, onCategoryClick }) {
    return (
        <div className="max-w-7xl mx-auto py-1">
            <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar pb-1 items-center">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onCategoryClick(null)}
                    className={`shrink-0 px-5 py-2 rounded-full font-bold text-sm transition-all border shadow-sm ${
                        !activeCategory 
                        ? 'bg-brand-500 text-white border-brand-500' 
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                >
                    All Items
                </motion.button>

                {categories.map((cat) => (
                    <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onCategoryClick(cat.id)}
                        className={`shrink-0 px-5 py-2 rounded-full font-bold text-sm transition-all border shadow-sm whitespace-nowrap ${
                            activeCategory === cat.id 
                            ? 'bg-brand-500 text-white border-brand-500' 
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                    >
                        {cat.name}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
