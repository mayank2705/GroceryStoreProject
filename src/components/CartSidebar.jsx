import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, useAuthStore } from '../store';

export default function CartSidebar({ open, onClose }) {
    const { items, addItem, removeItem, clearCart, getTotal, getTotalItems } = useCartStore();
    const { user } = useAuthStore();

    const handleWhatsAppCheckout = () => {
        if (!user || !user.full_name || !user.address) {
            alert('Please complete your profile before checkout.');
            return;
        }

        const itemsList = items
            .map(
                (item, i) =>
                    `${i + 1}. ${item.name} (${item.weight}) x ${item.qty} = Rs.${(item.price * item.qty).toFixed(0)}`
            )
            .join('\n');

        const total = getTotal();

        const message = `*NEW ORDER - Mohit Store*
----------------------------
*Customer Details:*
Name: ${user.full_name}
Mobile: ${user.mobile}
Address: ${user.address}

*Order Items:*
${itemsList}

----------------------------
*Total: Rs.${total.toFixed(0)}*
----------------------------
Please confirm this order. Thank you!`;

        const encoded = encodeURIComponent(message);

        // Check if the user is on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        let whatsappUrl = '';
        if (isMobile) {
            whatsappUrl = `https://wa.me/918700842030?text=${encoded}`;
        } else {
            whatsappUrl = `https://web.whatsapp.com/send?phone=918700842030&text=${encoded}`;
        }

        window.open(whatsappUrl, '_blank');
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
                        id="cart-sidebar"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Your Cart</h2>
                                <p className="text-sm text-gray-400">{getTotalItems()} items</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {items.length > 0 && (
                                    <button
                                        onClick={clearCart}
                                        className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                                        id="clear-cart-btn"
                                    >
                                        Clear All
                                    </button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                                    id="close-cart-btn"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </motion.button>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-medium">Your cart is empty</p>
                                    <p className="text-gray-400 text-sm mt-1">Add items to get started</p>
                                </div>
                            ) : (
                                <motion.div layout className="space-y-3">
                                    <AnimatePresence>
                                        {items.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, x: 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -50, height: 0 }}
                                                transition={{ type: 'spring', bounce: 0.2 }}
                                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                                            >
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-14 h-14 rounded-lg object-cover bg-white"
                                                    onError={(e) => {
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=e8f5e9&color=0c831f&size=56&font-size=0.33`;
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h4>
                                                    <p className="text-xs text-gray-400">{item.weight}</p>
                                                    <p className="text-sm font-bold text-gray-900 mt-0.5">Rs.{item.price}</p>
                                                </div>
                                                <div className="flex items-center gap-1 bg-brand-500 rounded-lg shrink-0">
                                                    <motion.button
                                                        whileTap={{ scale: 0.8 }}
                                                        onClick={() => removeItem(item.id)}
                                                        className="w-8 h-8 flex items-center justify-center text-white font-bold text-lg"
                                                    >
                                                        -
                                                    </motion.button>
                                                    <motion.span
                                                        key={item.qty}
                                                        initial={{ scale: 1.4 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-6 text-center text-white font-bold text-sm"
                                                    >
                                                        {item.qty}
                                                    </motion.span>
                                                    <motion.button
                                                        whileTap={{ scale: 0.8 }}
                                                        onClick={() => addItem(item)}
                                                        className="w-8 h-8 flex items-center justify-center text-white font-bold text-lg"
                                                    >
                                                        +
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer - Checkout */}
                        {items.length > 0 && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="border-t border-gray-100 p-6 space-y-4"
                            >
                                {/* Bill Details */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal ({getTotalItems()} items)</span>
                                        <span className="font-semibold text-gray-800">Rs.{getTotal().toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Delivery</span>
                                        <span className="font-semibold text-brand-500">FREE</span>
                                    </div>
                                    <div className="h-px bg-gray-100 my-2" />
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-800">Total</span>
                                        <span className="text-xl font-bold text-gray-900">Rs.{getTotal().toFixed(0)}</span>
                                    </div>
                                </div>

                                {/* WhatsApp Checkout Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleWhatsAppCheckout}
                                    className="w-full h-14 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#25D366]/30 text-lg"
                                    id="whatsapp-checkout-btn"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Place Order via WhatsApp
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
