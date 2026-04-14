import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuthStore } from '../store';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { token, setProfileComplete, setUser } = useAuthStore();
    const [form, setForm] = useState({ full_name: '', mobile: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.full_name.trim() || !form.mobile.trim() || !form.address.trim()) {
            setError('All fields are required');
            return;
        }
        if (form.mobile.length !== 10) {
            setError('Enter valid 10-digit mobile number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const user = await api.updateProfile(token, form);
            setUser(user);
            setProfileComplete(true);
            navigate('/');
        } catch {
            setError('Failed to save profile. Try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 flex items-center justify-center p-4">
            <div className="absolute top-20 right-20 w-64 h-64 bg-accent-yellow/10 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.3 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass rounded-3xl shadow-2xl p-8 border border-white/20">
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                            className="w-16 h-16 bg-accent-yellow rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        >
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </motion.div>
                        <h2 className="text-xl font-bold text-gray-800">Complete Your Profile</h2>
                        <p className="text-gray-500 text-sm mt-1">Required before you can start shopping</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                placeholder="Dhan Prakash"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                id="profile-name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                            <div className="flex gap-2">
                                <span className="flex items-center justify-center w-14 h-12 bg-gray-100 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200">+91</span>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    value={form.mobile}
                                    onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
                                    placeholder="8700842030"
                                    className="flex-1 h-12 px-4 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                    id="profile-mobile"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Address</label>
                            <textarea
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="House No., Street, Landmark, City, Pin Code"
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all resize-none"
                                id="profile-address"
                            />
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-500 text-sm"
                            >
                                {error}
                            </motion.p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-brand-500/30"
                            id="save-profile-btn"
                        >
                            {loading ? 'Saving...' : 'Save & Start Shopping'}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
