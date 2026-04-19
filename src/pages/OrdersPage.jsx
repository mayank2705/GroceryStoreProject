import { useEffect, useState } from 'react';
import { useAuthStore, useCartStore } from '../store';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Footer from '../components/Footer';

export default function OrdersPage() {
    const { user, token } = useAuthStore();
    const { clearCart, addItem } = useCartStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (user?.firebase_uid) {
            loadOrders();
        } else {
            setLoading(false);
        }
    }, [token, user]);

    const loadOrders = async () => {
        try {
            const data = await api.getOrders(user.firebase_uid);
            setOrders(data);
        } catch (err) {
            console.error('Failed to load orders', err);
        }
        setLoading(false);
    };

    const handleRepeatOrder = (orderItems) => {
        clearCart();
        orderItems.forEach(item => {
            for(let i=0; i<item.qty; i++) {
                addItem(item);
            }
        });
        navigate('/'); 
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
                </div>
            </header>
            
            <main className="flex-1 max-w-3xl w-full mx-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center py-10 font-medium text-gray-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 font-medium mb-4">You have no past orders.</p>
                        <button onClick={() => navigate('/')} className="bg-brand-500 text-white px-6 py-2 rounded-xl font-bold">Start Shopping</button>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
                                <div>
                                    <p className="text-xs text-gray-500">Order #{order.id}</p>
                                    <p className="font-bold text-gray-800">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="font-bold text-brand-600">₹{order.total_price}</p>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-700">{item.qty}x {item.name} ({item.weight})</span>
                                        <span className="text-gray-600 font-medium">₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => handleRepeatOrder(order.items)}
                                className="w-full bg-brand-50 text-brand-600 font-bold py-3 rounded-xl border border-brand-200 hover:bg-brand-100 transition-colors"
                            >
                                Repeat Order
                            </button>
                        </div>
                    ))
                )}
            </main>
            <Footer />
        </div>
    );
}
