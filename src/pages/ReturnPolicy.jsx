import React from 'react';
import Footer from '../components/Footer';

export default function ReturnPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Return Policy</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-gray-700 leading-relaxed text-lg">
                    <p>Returns are strictly managed. Products must be returned in person by coming to the physical store. Items will be checked and can be returned within 2 days of the delivery date. Absolutely no open products will be accepted for return. Please check your items carefully.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
