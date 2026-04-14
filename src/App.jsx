import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import NewArrivals from './pages/NewArrivals';
import SplashScreen from './components/SplashScreen';

function App() {
    const { token, isProfileComplete } = useAuthStore();
    const [showSplash, setShowSplash] = useState(true);

    if (showSplash) {
        return <SplashScreen onComplete={() => setShowSplash(false)} />;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Admin Route */}
                <Route
                    path="/admin"
                    element={!token ? <Navigate to="/login" replace /> : <AdminDashboard />}
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
