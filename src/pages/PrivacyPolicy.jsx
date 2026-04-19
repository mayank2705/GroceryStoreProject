import React from 'react';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Privacy Policy</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-gray-700 leading-relaxed text-lg">
                    <p>We are dedicated to selling products at wholesale prices. Kindly do not attempt to hack or harm this website. Please simply place your orders and enjoy your groceries securely.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
