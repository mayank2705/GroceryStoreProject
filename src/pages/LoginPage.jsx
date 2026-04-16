import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../api';
import { useAuthStore } from '../store';

// ─── Translate Firebase error codes to human-readable messages ───────────────
function getFirebaseErrorMessage(code) {
    const messages = {
        'auth/invalid-phone-number':      'The phone number you entered is invalid. Please check and try again.',
        'auth/too-many-requests':         'Too many attempts. Please wait a few minutes before trying again.',
        'auth/invalid-verification-code': 'The OTP you entered is incorrect. Please check and re-enter.',
        'auth/code-expired':             'This OTP has expired. Please go back and request a new one.',
        'auth/captcha-check-failed':      'Security check failed. Please refresh the page and try again.',
        'auth/network-request-failed':    'Network error. Please check your internet connection.',
        'auth/quota-exceeded':            'SMS quota exceeded. Please try again later.',
        'auth/user-disabled':             'This account has been disabled. Please contact support.',
        'auth/missing-phone-number':      'Please enter your mobile number to continue.',
        'auth/app-not-authorized':        'This app is not authorized to use Firebase Authentication.',
    };
    return messages[code] || 'Something went wrong. Please try again.';
}

// ─── Safely clear and reset the global reCAPTCHA ─────────────────────────────
function clearRecaptcha() {
    try {
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
        }
    } catch (e) {
        // Ignore — verifier may already be gone
        window.recaptchaVerifier = null;
    }
}

// ─── Setup invisible reCAPTCHA anchored to the send-otp button ───────────────
function setupRecaptcha() {
    clearRecaptcha();
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'send-otp-btn', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
            clearRecaptcha();
        },
    });
    return window.recaptchaVerifier;
}

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
    const [mobile, setMobile]                 = useState('');
    const [otp, setOtp]                       = useState(['', '', '', '', '', '']);
    const [step, setStep]                     = useState('mobile'); // 'mobile' | 'otp'
    const [loading, setLoading]               = useState(false);
    const [error, setError]                   = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [resendTimer, setResendTimer]       = useState(0);

    const setAuth   = useAuthStore((s) => s.setAuth);
    const otpRefs   = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
    const timerRef  = useRef(null);

    // Countdown for resend cooldown
    useEffect(() => {
        if (resendTimer > 0) {
            timerRef.current = setTimeout(() => setResendTimer((t) => t - 1), 1000);
        }
        return () => clearTimeout(timerRef.current);
    }, [resendTimer]);

    // Cleanup reCAPTCHA when component unmounts
    useEffect(() => {
        return () => clearRecaptcha();
    }, []);

    // ── Send OTP ──────────────────────────────────────────────────────────────
    const handleSendOTP = async () => {
        const trimmed = mobile.trim().replace(/\D/g, '');
        if (trimmed.length !== 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formattedNumber = '+91' + trimmed; // E.164 format
            const verifier = setupRecaptcha();
            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, verifier);
            setConfirmationResult(confirmation);
            setStep('otp');
            setResendTimer(30); // 30-second resend cooldown
            // Focus first OTP box after transition
            setTimeout(() => otpRefs[0]?.current?.focus(), 350);
        } catch (err) {
            console.error('[Firebase] Send OTP error:', err);
            setError(getFirebaseErrorMessage(err.code));
            clearRecaptcha(); // Reset so user can try again without refresh
        } finally {
            setLoading(false);
        }
    };

    // ── OTP Input Handlers ────────────────────────────────────────────────────
    const handleOtpChange = (index, value) => {
        // Only allow single digit
        const digit = value.replace(/\D/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        setError('');

        // Auto-advance to next box
        if (digit && index < 5) {
            otpRefs[index + 1]?.current?.focus();
        }

        // Auto-submit when all 6 digits filled
        if (digit && index === 5) {
            const full = [...newOtp.slice(0, 5), digit].join('');
            if (full.length === 6) handleVerifyOTP([...newOtp.slice(0, 5), digit]);
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (otp[index]) {
                // Clear current
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                // Move to previous
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                otpRefs[index - 1]?.current?.focus();
            }
        }
        // Allow pasting full OTP
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) return;
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            const newOtp = pasted.split('');
            setOtp(newOtp);
            otpRefs[5]?.current?.focus();
            setTimeout(() => handleVerifyOTP(newOtp), 100);
        }
        e.preventDefault();
    };

    // ── Verify OTP ────────────────────────────────────────────────────────────
    const handleVerifyOTP = useCallback(async (otpArr = otp) => {
        const otpString = Array.isArray(otpArr) ? otpArr.join('') : otpArr;
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits of your OTP.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await confirmationResult.confirm(otpString);
            const firebaseUser = result.user;

            // Make a POST request to our FastAPI backend (/api/auth/sync)
            const data = await api.syncUser(firebaseUser.phoneNumber, firebaseUser.uid);
            
            // Update the global React state to reflect the user is logged in
            setAuth(data.access_token, data.user_id, data.is_profile_complete);
            
            // "close the modal" (or in this case, navigate from the page)
            if (data.is_profile_complete) {
                window.location.href = '/';
            } else {
                window.location.href = '/profile';
            }
        } catch (err) {
            console.error('[Firebase] Verify OTP error:', err);
            setError(getFirebaseErrorMessage(err.code));
            // Reset OTP boxes on failure
            setOtp(['', '', '', '', '', '']);
            otpRefs[0]?.current?.focus();
        } finally {
            setLoading(false);
        }
    }, [confirmationResult, mobile, otp, setAuth]);

    // ── Timer helpers ─────────────────────────────────────────────────────────
    const clearTimer = () => {
        clearTimeout(timerRef.current);
        setResendTimer(0);
    };

    // ── Go back to phone input ────────────────────────────────────────────────
    const handleGoBack = () => {
        setStep('mobile');
        setOtp(['', '', '', '', '', '']);
        setError('');
        setConfirmationResult(null);
        clearTimer();
        clearRecaptcha();
    };

    // ── Resend OTP ────────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (resendTimer > 0) return;
        setOtp(['', '', '', '', '', '']);
        setError('');
        setStep('mobile');
        // Small delay to reset state cleanly
        setTimeout(handleSendOTP, 100);
    };

    // ─────────────────────────────────────────────────────────────────────────
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
                            STEP 1 — Phone Number Input
                        ══════════════════════════════════════════════════ */}
                        {step === 'mobile' && (
                            <motion.div
                                key="mobile-step"
                                initial={{ opacity: 0, x: -24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 24 }}
                                transition={{ duration: 0.28 }}
                            >
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
                                    Enter your mobile number to receive an OTP
                                </p>

                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.02em' }}>
                                    Mobile Number
                                </label>

                                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                    {/* Country code badge */}
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

                                    {/* Phone input */}
                                    <input
                                        id="mobile-input"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={mobile}
                                        onChange={(e) => {
                                            setMobile(e.target.value.replace(/\D/g, ''));
                                            setError('');
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !loading) handleSendOTP();
                                        }}
                                        placeholder="98765 43210"
                                        autoComplete="tel"
                                        style={{
                                            flex: 1, height: '52px',
                                            padding: '0 16px',
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1.5px solid rgba(255,255,255,0.12)',
                                            borderRadius: '14px',
                                            color: '#fff',
                                            fontSize: '18px', fontWeight: '600',
                                            outline: 'none',
                                            letterSpacing: '2px',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(99,102,241,0.7)'}
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
                                            <svg width="16" height="16" fill="currentColor" style={{ marginTop: '1px', flexShrink: 0 }} viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Send OTP button — reCAPTCHA anchors here */}
                                <motion.button
                                    id="send-otp-btn"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleSendOTP}
                                    disabled={loading || mobile.length !== 10}
                                    style={{
                                        width: '100%', height: '52px',
                                        background: loading || mobile.length !== 10
                                            ? 'rgba(99,102,241,0.4)'
                                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        border: 'none', borderRadius: '14px',
                                        color: '#fff', fontWeight: '700', fontSize: '16px',
                                        cursor: loading || mobile.length !== 10 ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        boxShadow: mobile.length === 10 && !loading ? '0 8px 24px rgba(99,102,241,0.4)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {loading ? <><Spinner /> Sending OTP...</> : 'Send OTP →'}
                                </motion.button>

                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
                                    Protected by Firebase & Google reCAPTCHA
                                </p>
                            </motion.div>
                        )}

                        {/* ══════════════════════════════════════════════════
                            STEP 2 — OTP Verification
                        ══════════════════════════════════════════════════ */}
                        {step === 'otp' && (
                            <motion.div
                                key="otp-step"
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -24 }}
                                transition={{ duration: 0.28 }}
                            >
                                {/* Back button */}
                                <button
                                    onClick={handleGoBack}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: 'none', border: 'none',
                                        color: 'rgba(255,255,255,0.5)', fontSize: '13px',
                                        cursor: 'pointer', marginBottom: '20px',
                                        padding: 0, transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                                >
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Change number
                                </button>

                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    {/* Phone icon */}
                                    <div style={{
                                        width: '52px', height: '52px',
                                        background: 'rgba(99,102,241,0.2)',
                                        borderRadius: '50%',
                                        margin: '0 auto 12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <svg width="24" height="24" fill="none" stroke="rgba(165,180,252,1)" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <p style={{ color: '#fff', fontSize: '15px', fontWeight: '600', margin: '0 0 4px' }}>
                                        OTP sent to +91 {mobile}
                                    </p>
                                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: 0 }}>
                                        Check your SMS and enter the 6-digit code below
                                    </p>
                                </div>

                                {/* 6 OTP boxes */}
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                                    {otp.map((digit, i) => (
                                        <motion.input
                                            key={i}
                                            ref={otpRefs[i]}
                                            id={`otp-input-${i}`}
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            onPaste={i === 0 ? handleOtpPaste : undefined}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            style={{
                                                width: '48px', height: '56px',
                                                textAlign: 'center',
                                                fontSize: '22px', fontWeight: '800',
                                                background: digit ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.07)',
                                                border: `2px solid ${digit ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.12)'}`,
                                                borderRadius: '14px',
                                                color: '#fff',
                                                outline: 'none',
                                                transition: 'all 0.15s',
                                                caretColor: 'transparent',
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = 'rgba(139,92,246,0.9)';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = digit ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.12)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    ))}
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
                                            <svg width="16" height="16" fill="currentColor" style={{ marginTop: '1px', flexShrink: 0 }} viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Verify button */}
                                <motion.button
                                    id="verify-otp-btn"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleVerifyOTP()}
                                    disabled={loading || otp.join('').length !== 6}
                                    style={{
                                        width: '100%', height: '52px',
                                        background: loading || otp.join('').length !== 6
                                            ? 'rgba(99,102,241,0.4)'
                                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        border: 'none', borderRadius: '14px',
                                        color: '#fff', fontWeight: '700', fontSize: '16px',
                                        cursor: loading || otp.join('').length !== 6 ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        boxShadow: otp.join('').length === 6 && !loading ? '0 8px 24px rgba(99,102,241,0.4)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {loading ? <><Spinner /> Verifying...</> : 'Verify & Continue →'}
                                </motion.button>

                                {/* Resend */}
                                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                    {resendTimer > 0 ? (
                                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>
                                            Resend OTP in <span style={{ color: '#a5b4fc', fontWeight: '600' }}>{resendTimer}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleResend}
                                            style={{
                                                background: 'none', border: 'none',
                                                color: '#a5b4fc', fontSize: '13px',
                                                fontWeight: '600', cursor: 'pointer',
                                                textDecoration: 'underline', textUnderlineOffset: '3px',
                                            }}
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
