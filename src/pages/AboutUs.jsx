import React from 'react';
import Footer from '../components/Footer';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6">About Us</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-gray-700 leading-relaxed text-lg">
                    <p>Mohit Store is a wholesale-based grocery store providing groceries at wholesale prices. We provide the best rates for trusted brands of products with free delivery. Our Store is situated at A-1/179 Sector-4 Rohini Delhi-110085 Near Khadi Grahmodhyog Bhawan. We provide free delivery up to a 2 km range.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
