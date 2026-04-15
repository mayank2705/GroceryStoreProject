import React from 'react';
import { motion } from 'framer-motion';

export default function CategorySlider({ categories, activeCategory, onCategoryClick }) {
    return (
        <div className="max-w-7xl mx-auto py-2">
            <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCategoryClick(null)}
                    className="shrink-0 flex flex-col items-center gap-1 min-w-[70px]"
                >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm border transition-all ${!activeCategory ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300'}`}>
                        All
                    </div>
                    <span className={`text-[11px] font-medium text-center leading-tight mt-1 ${!activeCategory ? 'text-brand-600' : 'text-gray-600'}`}>
                        All Items
                    </span>
                </motion.button>

                {categories.map((cat) => (
                    <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCategoryClick(cat.id)}
                        className="shrink-0 flex flex-col items-center gap-1 min-w-[70px]"
                    >
                        <div className={`w-16 h-16 rounded-2xl overflow-hidden shadow-sm border transition-all ${activeCategory === cat.id ? 'border-brand-500 border-2' : 'border-gray-100 hover:border-gray-300'}`}>
                            <img
                                src={cat.image_url}
                                alt={cat.name}
                                className="w-full h-full object-cover bg-gray-50"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <span className={`text-[11px] font-medium w-full text-center truncate px-1 mt-1 ${activeCategory === cat.id ? 'text-brand-600' : 'text-gray-600'}`}>
                            {cat.name}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
