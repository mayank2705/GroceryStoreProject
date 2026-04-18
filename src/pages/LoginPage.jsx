import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../api';
import { useAuthStore } from '../store';

// ─── Spinner SVG ─────────────────────────────────────────────────────────────
function Spinner() {
    return (
        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LoginPage() {
    const [step, setStep]                     = useState('google'); // 'google' | 'whatsapp'
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [loading, setLoading]               = useState(false);
    const [error, setError]                   = useState('');
    const [fbUser, setFbUser]                 = useState(null);

    const setAuth = useAuthStore((s) => s.setAuth);
    const setUser = useAuthStore((s) => s.setUser);

    // ── Google Sign In ────────────────────────────────────────────────────────
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;
            setFbUser(firebaseUser);

            // Make a POST request to our FastAPI backend (/api/auth/sync)
            const data = await api.syncUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || ''
            });
            
            if (data.has_whatsapp_number) {
                // Return user, fully logged in
                setAuth(data.access_token, data.user_id, data.is_profile_complete, data.has_whatsapp_number);
                api.getProfile(data.access_token).then(profile => setUser(profile)).catch(console.error);
                window.location.href = data.is_profile_complete ? '/' : '/profile';
            } else {
                // New user or missing whatsapp number
                setStep('whatsapp');
            }
        } catch (err) {
            console.error('[Firebase] Google Login Error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled. Please try again.');
            } else {
                setError(err.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── WhatsApp Submission ───────────────────────────────────────────────────
    const handleWhatsappSubmit = async () => {
        const trimmed = whatsappNumber.trim().replace(/\D/g, '');
        if (trimmed.length !== 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const currentUser = fbUser || auth.currentUser;
            if (!currentUser) throw new Error("Firebase user not found. Please reload and try signing in again.");

            // Final sync with backend providing the whatsapp_number
            const data = await api.syncUser({
                uid: currentUser.uid,
                email: currentUser.email || '',
                name: currentUser.displayName || '',
                whatsapp_number: trimmed
            });

            // User is now fully registered with whatsapp number
            setAuth(data.access_token, data.user_id, data.is_profile_complete, data.has_whatsapp_number);
            api.getProfile(data.access_token).then(profile => setUser(profile)).catch(console.error);
            window.location.href = data.is_profile_complete ? '/' : '/profile';
        } catch (err) {
            console.error('WhatsApp submission error:', err);
            setError(err.message || 'Failed to finish registration. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>

            {/* Decorative blobs */}
            <div style={{
                position: 'absolute', top: '-80px', left: '-80px',
                width: '350px', height: '350px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
                filter: 'blur(40px)', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '-60px', right: '-60px',
                width: '400px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
                filter: 'blur(40px)', pointerEvents: 'none'
            }} />

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}
            >
                <div style={{
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '28px',
                    padding: '40px 36px',
                    boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
                }}>

                    {/* ── Logo & Branding ── */}
                    <motion.div
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.15, type: 'spring', bounce: 0.5 }}
                        style={{ textAlign: 'center', marginBottom: '32px' }}
                    >
                        <div style={{
                            width: '72px', height: '72px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            borderRadius: '20px',
                            margin: '0 auto 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 12px 32px rgba(99,102,241,0.4)',
                        }}>
                            <svg width="36" height="36" fill="white" viewBox="0 0 24 24">
                                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 15.1 5.9 16 7 16h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                        </div>
                        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                            Mohit Store
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: 0 }}>
                            Wholesale Kirana by Dhan Prakash
                        </p>
                    </motion.div>

                    <AnimatePresence mode="wait">

                        {/* ══════════════════════════════════════════════════
                            STEP 1 — Google Login
                        ══════════════════════════════════════════════════ */}
                        {step === 'google' && (
                            <motion.div
                                key="google-step"
                                initial={{ opacity: 0, x: -24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 24 }}
                                transition={{ duration: 0.28 }}
                            >
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
                                    Sign in or create an account to continue
                                </p>

                                {/* Error message */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -8, height: 0 }}
                                            style={{
                                                background: 'rgba(239,68,68,0.15)',
                                                border: '1px solid rgba(239,68,68,0.3)',
                                                borderRadius: '10px',
                                                padding: '10px 14px',
                                                marginBottom: '14px',
                                                color: '#fca5a5',
                                                fontSize: '13px',
                                                display: 'flex', alignItems: 'flex-start', gap: '8px',
                                            }}
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Google Sign In button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    style={{
                                        width: '100%', height: '52px',
                                        background: loading
                                            ? 'rgba(255,255,255,0.7)'
                                            : '#ffffff',
                                        border: 'none', borderRadius: '14px',
                                        color: '#333', fontWeight: '700', fontSize: '16px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                        boxShadow: !loading ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {loading ? <><Spinner /> Connecting...</> : (
                                        <>
                                            <svg width="24" height="24" viewBox="0 0 48 48">
                                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                                <path fill="none" d="M0 0h48v48H0z"/>
                                            </svg>
                                            Continue with Google
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        )}

                        {/* ══════════════════════════════════════════════════
                            STEP 2 — WhatsApp Number
                        ══════════════════════════════════════════════════ */}
                        {step === 'whatsapp' && (
                            <motion.div
                                key="whatsapp-step"
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -24 }}
                                transition={{ duration: 0.28 }}
                            >
                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    <div style={{
                                        width: '52px', height: '52px',
                                        background: 'rgba(37, 211, 102, 0.2)',
                                        borderRadius: '50%',
                                        margin: '0 auto 12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <svg width="24" height="24" fill="none" stroke="#25D366" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <p style={{ color: '#fff', fontSize: '16px', fontWeight: '600', margin: '0 0 4px' }}>
                                        Complete Registration
                                    </p>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
                                        Please provide your WhatsApp number for order updates.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        minWidth: '60px', height: '52px',
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1.5px solid rgba(255,255,255,0.12)',
                                        borderRadius: '14px',
                                        color: '#fff', fontWeight: '700', fontSize: '15px',
                                        userSelect: 'none',
                                    }}>
                                        🇮🇳 +91
                                    </div>

                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={whatsappNumber}
                                        onChange={(e) => {
                                            setWhatsappNumber(e.target.value.replace(/\D/g, ''));
                                            setError('');
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !loading) handleWhatsappSubmit();
                                        }}
                                        placeholder="WhatsApp Number"
                                        autoComplete="tel"
                                        style={{
                                            flex: 1, height: '52px',
                                            padding: '0 16px',
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1.5px solid rgba(255,255,255,0.12)',
                                            borderRadius: '14px',
                                            color: '#fff',
                                            fontSize: '16px', fontWeight: '600',
                                            outline: 'none',
                                            letterSpacing: '1px',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#25D366'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                    />
                                </div>

                                {/* Error message */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -8, height: 0 }}
                                            style={{
                                                background: 'rgba(239,68,68,0.15)',
                                                border: '1px solid rgba(239,68,68,0.3)',
                                                borderRadius: '10px',
                                                padding: '10px 14px',
                                                marginBottom: '14px',
                                                color: '#fca5a5',
                                                fontSize: '13px',
                                                display: 'flex', alignItems: 'flex-start', gap: '8px',
                                            }}
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Verify button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleWhatsappSubmit}
                                    disabled={loading || whatsappNumber.length !== 10}
                                    style={{
                                        width: '100%', height: '52px',
                                        background: loading || whatsappNumber.length !== 10
                                            ? 'rgba(37, 211, 102, 0.4)'
                                            : '#25D366',
                                        border: 'none', borderRadius: '14px',
                                        color: '#fff', fontWeight: '700', fontSize: '16px',
                                        cursor: loading || whatsappNumber.length !== 10 ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        boxShadow: whatsappNumber.length === 10 && !loading ? '0 8px 24px rgba(37, 211, 102, 0.4)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {loading ? <><Spinner /> Saving...</> : 'Finish Registration →'}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
