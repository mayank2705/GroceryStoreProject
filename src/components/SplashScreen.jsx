import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Wait for fade out animation to finish before calling onComplete
            setTimeout(onComplete, 500);
        }, 2500); // 2.5 seconds

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 flex items-center justify-center bg-green-600 z-50"
                >
                    <motion.h1
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                        className="text-5xl md:text-7xl font-extrabold text-white tracking-widest drop-shadow-xl font-outfit"
                    >
                        Mohit Store
                    </motion.h1>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
