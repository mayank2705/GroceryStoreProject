import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import api from './api';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import NewArrivals from './pages/NewArrivals';
import SplashScreen from './components/SplashScreen';

function App() {
    const { token, user, isProfileComplete, setAuth, logout, setUser } = useAuthStore();
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const data = await api.syncUser({
                        uid:   firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name:  firebaseUser.displayName || '',
                    });

                    if (data.has_whatsapp_number) {
                        // ── FIX #3: Fully authenticated — set state and redirect ──
                        setAuth(data.access_token, data.user_id, data.is_profile_complete, true);
                        try {
                            const profile = await api.getProfile(data.access_token);
                            setUser(profile);
                        } catch (_) {}
                    } else {
                        // User is Firebase-authenticated but hasn't registered yet.
                        // DO NOT sign out Firebase — let them land on /login and
                        // complete the registration form (the page picks up auth.currentUser).
                        logout();  // clear local app state only
                    }
                } catch (err) {
                    console.error('[App] Auto-login sync failed', err);
                    // Network failure: keep local session alive, don't force logout
                }
            } else {
                logout();
            }
            setShowSplash(false);
        });

        return () => unsubscribe();
    }, [setAuth, logout, setUser]);

    if (showSplash) {
        return <SplashScreen onComplete={() => {}} />;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Admin Route */}
                <Route
                    path="/admin"
                    element={!token || user?.email !== 'mayankbansal231@gmail.com' ? <Navigate to="/" replace /> : <AdminDashboard />}
                />

                {/* New Arrivals */}
                <Route
                    path="/new-arrivals"
                    element={<NewArrivals />}
                />

                {/* Public Route */}
                <Route
                    path="/login"
                    element={!token ? <LoginPage /> : <Navigate to="/" replace />}
                />

                {/* Protected Profile Route */}
                <Route
                    path="/profile"
                    element={
                        !token ? (
                            <Navigate to="/login" replace />
                        ) : isProfileComplete ? (
                            <Navigate to="/" replace />
                        ) : (
                            <ProfilePage />
                        )
                    }
                />

                {/* Public Home Route */}
                <Route
                    path="/"
                    element={
                        token && !isProfileComplete ? (
                            <Navigate to="/profile" replace />
                        ) : (
                            <HomePage />
                        )
                    }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
