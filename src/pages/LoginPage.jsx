import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from '../firebase';
import api from '../api';
import { useAuthStore } from '../store';

export default function LoginPage() {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // Firebase uses 6 digits
    const [step, setStep] = useState('mobile'); // 'mobile' | 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const setAuth = useAuthStore((s) => s.setAuth);
    const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    // Store the recaptcha verifier and confirmation result
    const [confirmationResult, setConfirmationResult] = useState(null);

    useEffect(() => {
        // Setup Invisible Recaptcha when component mounts
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible'
            });
        }
    }, []);

    const handleSendOTP = async () => {
        if (mobile.length !== 10) {
            setError('Enter valid 10-digit mobile number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const formattedNumber = "+91" + mobile;
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
            setConfirmationResult(confirmation);
            setStep('otp');
        } catch (err) {
            console.error(err);
            setError('Failed to send OTP via Firebase. Check your keys.');
        }
        setLoading(false);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            otpRefs[index + 1].current.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current.focus();
        }
    };

    const handleVerifyOTP = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Enter 6-digit Firebase OTP');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await confirmationResult.confirm(otpString);
            const user = result.user;

            // Now authenticate with backend
            const data = await api.verifyFirebaseUID(mobile, user.uid);
            setAuth(data.access_token, data.user_id, data.is_profile_complete);
        } catch (err) {
            console.error(err);
            setError('Invalid OTP code.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 flex items-center justify-center p-4">
            <div id="recaptcha-container"></div>

            {/* Decorative circles */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-yellow/10 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass rounded-3xl shadow-2xl p-8 border border-white/20">
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                        className="text-center mb-8"
                    >
                        <div className="w-20 h-20 bg-brand-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-brand-500/30">
                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Mohit Store</h1>
                        <p className="text-gray-500 text-sm mt-1">Wholesale Kirana by Dhan Prakash</p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {step === 'mobile' ? (
                            <motion.div
                                key="mobile"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mobile Number
                                </label>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="flex items-center justify-center w-14 h-12 bg-gray-100 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter mobile number"
                                        className="flex-1 h-12 px-4 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-lg font-medium"
                                        id="mobile-input"
                                    />
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-500 text-sm mb-3"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSendOTP}
                                    disabled={loading}
                                    className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-brand-500/30"
                                    id="send-otp-btn"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Sending...
                                        </span>
                                    ) : (
                                        'Send OTP'
                                    )}
                                </motion.button>

                                <p className="text-center text-xs text-gray-400 mt-4">
                                    Demo OTP: <span className="font-bold text-brand-500">1234</span>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <button
                                    onClick={() => { setStep('mobile'); setOtp(['', '', '', '']); setError(''); }}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 mb-4 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Change number
                                </button>

                                <p className="text-sm text-gray-600 mb-1">
                                    Enter OTP sent to <span className="font-semibold">+91 {mobile}</span>
                                </p>
                                <p className="text-xs text-gray-400 mb-4">Use code: 1234</p>

                                <div className="flex gap-3 justify-center mb-6">
                                    {otp.map((digit, i) => (
                                        <motion.input
                                            key={i}
                                            ref={otpRefs[i]}
                                            type="tel"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                            id={`otp-input-${i}`}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-500 text-sm mb-3 text-center"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleVerifyOTP}
                                    disabled={loading}
                                    className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-brand-500/30"
                                    id="verify-otp-btn"
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
