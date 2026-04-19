import React from 'react';
import Footer from '../components/Footer';

export default function TermsOfUse() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Terms of Use</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-gray-700 leading-relaxed text-lg">
                    <p>By using our website, you agree to our order flow: Browse our catalog, add your desired groceries to the cart, and proceed to checkout. Your final order will be placed securely via WhatsApp directly to our store for confirmation and fulfillment.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
