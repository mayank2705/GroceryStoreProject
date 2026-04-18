import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { useAuthStore } from '../store';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
    const { token, user } = useAuthStore();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add/Edit Item Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [weight, setWeight] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // Edit mode tracking
    const [editingId, setEditingId] = useState(null);

    // Let's assume for this demo that if we reach here legally, we are an admin.
    // In a strict app we would do: if (!user || !user.is_admin) return <Navigate to="/" />

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cats, prods] = await Promise.all([
                api.getCategories(),
                api.getProducts(),
            ]);
            setCategories(cats);
            setProducts(prods);
        } catch (err) {
            console.error('Failed to load admin data:', err);
        }
        setLoading(false);
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Editing existing product
                const updatedProd = await api.editProduct(token, editingId, {
                    name,
                    price: parseFloat(price),
                    weight: weight || "1 pc",
                    category_id: parseInt(categoryId),
                    image_url: imageUrl || "https://source.unsplash.com/400x400/?grocery"
                });
                setProducts(products.map(p => p.id === editingId ? updatedProd : p));
                alert('Product updated successfully!');
            } else {
                // Adding new product
                const newProd = await api.addProduct(token, {
                    name,
                    price: parseFloat(price),
                    weight: weight || "1 pc",
                    category_id: parseInt(categoryId),
                    image_url: imageUrl || "https://source.unsplash.com/400x400/?grocery"
                });
                setProducts([...products, newProd]);
                alert('Product added successfully!');
            }
            cancelEdit();
        } catch (err) {
            alert(`Error ${editingId ? 'updating' : 'adding'} product: ` + err.message);
        }
    };

    const handleEditClick = (product) => {
        setEditingId(product.id);
        setName(product.name);
        setPrice(product.price);
        setWeight(product.weight || '');
        setCategoryId(product.category_id);
        setImageUrl(product.image_url || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setName('');
        setPrice('');
        setWeight('');
        setCategoryId('');
        setImageUrl('');
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.deleteProduct(token, id);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert('Error deleting product: ' + err.message);
        }
    };

    const handleToggleStock = async (id) => {
        try {
            const updatedProd = await api.toggleStock(token, id);
            setProducts(products.map(p => p.id === id ? updatedProd : p));
        } catch (err) {
            alert('Error toggling stock: ' + err.message);
        }
    };

    if (loading) {
        return <div className="p-10 text-center font-bold">Loading Admin Portal...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-8 font-outfit">Mohit Store Admin Portal</h1>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Panel: Add Item Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1"
                >
                    <h2 className="text-lg font-bold text-gray-700 mb-4">
                        {editingId ? "Edit Item" : "Add New Item"}
                    </h2>
                    <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
                        <input
                            required
                            type="text"
                            placeholder="Product Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-500"
                        />
                        <select
                            required
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-500"
                        >
                            <option value="" disabled>Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input
                            required
                            type="number"
                            step="0.01"
                            placeholder="Price (Rs)"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-500"
                        />
                        <input
                            required
                            type="text"
                            placeholder="Weight (e.g., 500g, 1kg, 1 pc)"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-500"
                        />
                        <input
                            type="text"
                            placeholder="Image URL (Optional)"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-500"
                        />
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition-colors">
                                {editingId ? "Save Changes" : "Add Product"}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="w-1/3 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>

                {/* Right Panel: Inventory Table */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 md:col-span-2 overflow-x-auto"
                >
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Current Inventory ({products.length})</h2>
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-t-xl">
                            <tr>
                                <th className="px-4 py-3">Product</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.sort((a, b) => b.id - a.id).map(p => (
                                <tr key={p.id} className="border-b last:border-0 border-gray-100 font-medium">
                                    <td className="px-4 py-3 flex items-center gap-3">
                                        <img src={p.image_url} alt="" className="w-10 h-10 rounded-md object-cover" />
                                        <span className="line-clamp-2 max-w-[150px]">{p.name}</span>
                                    </td>
                                    <td className="px-4 py-3">Rs. {p.price}</td>
                                    <td className="px-4 py-3 text-center">
                                        {p.in_stock ? (
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">In Stock</span>
                                        ) : (
                                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Out of Stock</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditClick(p)}
                                                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleStock(p.id)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${p.in_stock ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                                            >
                                                {p.in_stock ? "Mark Empty" : "Mark Full"}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(p.id)}
                                                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors bg-red-50 text-red-600 hover:bg-red-100 ml-1"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

            </div>
        </div>
    );
}
