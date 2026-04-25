import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useAuthStore } from '../store';
import { Navigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { toast, Toaster } from 'react-hot-toast';

export default function AdminDashboard() {
    const { token, logout } = useAuthStore();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStock, setFilterStock] = useState('');

    // Add/Edit Item Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [weight, setWeight] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [inStock, setInStock] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Edit mode tracking
    const [editingId, setEditingId] = useState(null);

    // Orders Tab State
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'
    const [orders, setOrders] = useState([]);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // In a strict app we would do: if (!user || !user.is_admin) return <Navigate to="/" />

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cats, prods] = await Promise.all([
                api.getCategories(),
                api.getAdminProducts(token) // Assuming api.js has getAdminProducts or getProducts without limit
            ]);
            setCategories(cats);
            setProducts(prods);
        } catch (err) {
            console.error('Failed to load admin data:', err);
            // fallback
            try {
                const prods = await api.getProducts(null, 5000, 0);
                setProducts(prods);
            } catch(e) {}
        }
        setLoading(false);
    };

    const loadOrders = async (date) => {
        setLoadingOrders(true);
        try {
            const fetchedOrders = await api.getAdminOrders(token, date);
            setOrders(fetchedOrders);
        } catch (err) {
            console.error('Failed to load admin orders:', err);
            toast.error('Failed to load orders');
        }
        setLoadingOrders(false);
    };

    useEffect(() => {
        if (activeTab === 'orders') {
            loadOrders(dateFilter);
        }
    }, [activeTab, dateFilter]);

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let finalImageUrl = imageUrl;
            if (imageFile) {
                const fileRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
                await uploadBytes(fileRef, imageFile);
                finalImageUrl = await getDownloadURL(fileRef);
            }

            const payload = {
                name,
                price: parseFloat(price),
                weight: weight || "1 pc",
                category_id: parseInt(categoryId),
                image_url: finalImageUrl || "https://source.unsplash.com/400x400/?grocery",
                in_stock: inStock
            };

            if (editingId) {
                const updatedProd = await api.editProduct(token, editingId, payload);
                setProducts(products.map(p => p.id === editingId ? updatedProd : p));
                toast.success('Product updated successfully!');
            } else {
                const newProd = await api.addProduct(token, payload);
                setProducts([newProd, ...products]);
                toast.success('Product added successfully!');
            }
            cancelEdit();
        } catch (err) {
            toast.error(`Error ${editingId ? 'updating' : 'adding'} product: ` + err.message);
        }
        setUploading(false);
    };

    const handleEditClick = (product) => {
        setEditingId(product.id);
        setName(product.name);
        setPrice(product.price);
        setWeight(product.weight || '');
        setCategoryId(product.category_id);
        setImageUrl(product.image_url || '');
        setInStock(product.in_stock);
        setImageFile(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setName('');
        setPrice('');
        setWeight('');
        setCategoryId('');
        setImageUrl('');
        setInStock(true);
        setImageFile(null);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.deleteProduct(token, id);
            setProducts(products.filter(p => p.id !== id));
            toast.success("Product deleted");
        } catch (err) {
            toast.error('Error deleting product: ' + err.message);
        }
    };

    const handleToggleStock = async (id) => {
        try {
            const updatedProd = await api.toggleStock(token, id);
            setProducts(products.map(p => p.id === id ? updatedProd : p));
            toast.success(updatedProd.in_stock ? "Marked In Stock" : "Marked Out of Stock");
        } catch (err) {
            toast.error('Error toggling stock: ' + err.message);
        }
    };

    const filteredProducts = products.filter(p => {
        if (filterCategory && p.category_id.toString() !== filterCategory) return false;
        if (filterStock === 'in_stock' && !p.in_stock) return false;
        if (filterStock === 'out_of_stock' && p.in_stock) return false;
        return true;
    });

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
        logout();
        window.location.href = '/';
    };

    if (loading) {
        return <div className="p-10 text-center font-bold">Loading Admin Portal...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <Toaster position="top-center" />
            <div className="w-full max-w-7xl flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 font-outfit">Mohit Store Admin Portal</h1>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="w-full max-w-7xl flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-6 py-2 rounded-xl font-bold transition-colors ${activeTab === 'inventory' ? 'bg-brand-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                    Inventory Management
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-2 rounded-xl font-bold transition-colors ${activeTab === 'orders' ? 'bg-brand-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                    Order History
                </button>
            </div>

            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">

                {activeTab === 'inventory' && (
                    <>
                        {/* Left Panel: Add Item Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 h-fit sticky top-6"
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
                            className="bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-500 w-full"
                        />
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <select
                                required
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-500 w-full"
                            >
                                <option value="" disabled>Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select
                                value={inStock ? "true" : "false"}
                                onChange={(e) => setInStock(e.target.value === "true")}
                                className="bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-500 w-full"
                            >
                                <option value="true">In Stock</option>
                                <option value="false">Out of Stock</option>
                            </select>
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="Price (Rs)"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-500 w-full"
                            />
                            <input
                                required
                                type="text"
                                placeholder="Weight (e.g. 1kg)"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-500 w-full"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-600">Product Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files[0])}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 bg-gray-50 border border-gray-200 rounded-xl"
                            />
                            <p className="text-xs text-gray-400 mt-1 ml-1">Recommended: Square image</p>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <button disabled={uploading} type="submit" className="flex-1 bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                                {uploading ? "Saving..." : editingId ? "Save Changes" : "Add Product"}
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
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2 overflow-hidden flex flex-col"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-lg font-bold text-gray-700">Inventory ({filteredProducts.length})</h2>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <select 
                                value={filterCategory} 
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-brand-500 flex-1"
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select 
                                value={filterStock} 
                                onChange={(e) => setFilterStock(e.target.value)}
                                className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-brand-500 flex-1"
                            >
                                <option value="">All Stock</option>
                                <option value="in_stock">In Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-t-xl">
                                <tr>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.sort((a, b) => b.id - a.id).map(p => (
                                    <tr key={p.id} className="border-b last:border-0 border-gray-100 font-medium hover:bg-gray-50/50">
                                        <td className="px-4 py-3 flex items-center gap-3 min-w-[200px]">
                                            <img src={p.image_url} alt="" className="w-10 h-10 rounded-md object-contain bg-white" />
                                            <span className="line-clamp-2 max-w-[200px] whitespace-normal">{p.name} ({p.weight})</span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-700">₹{p.price}</td>
                                        <td className="px-4 py-3 text-center">
                                            {p.in_stock ? (
                                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">In Stock</span>
                                            ) : (
                                                <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full">Out of Stock</span>
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-10 text-gray-400 font-medium">No products found matching filters.</div>
                        )}
                    </div>
                </motion.div>
                    </>
                )}

                {activeTab === 'orders' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-3 flex flex-col"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h2 className="text-xl font-bold text-gray-800">Order History</h2>
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-semibold text-gray-600">Filter by Date:</label>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-500 font-medium text-gray-700"
                                />
                                <button
                                    onClick={() => setDateFilter('')}
                                    className="px-3 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {loadingOrders ? (
                            <div className="py-10 text-center font-medium text-gray-500">Loading orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="py-20 text-center font-medium text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                No orders found for the selected date.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {orders.map(order => (
                                    <div key={order.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-3 border-b border-gray-200 pb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg">Order #{order.id}</h3>
                                                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-extrabold text-brand-600 text-lg">₹{order.total_price}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-gray-700 mb-1">Customer Details</p>
                                            <p className="text-xs text-gray-600"><strong>Name:</strong> {order.customer_name || 'N/A'}</p>
                                            <p className="text-xs text-gray-600"><strong>Phone:</strong> {order.customer_phone || 'N/A'}</p>
                                            <p className="text-xs text-gray-600"><strong>Email:</strong> {order.customer_email || 'N/A'}</p>
                                            <p className="text-xs text-gray-600 mt-1"><strong>Address:</strong> {order.customer_address || 'N/A'}</p>
                                        </div>

                                        <div className="mt-auto pt-3 border-t border-gray-200">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Items Ordered</p>
                                            <div className="space-y-1">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-xs">
                                                        <span className="text-gray-700">{item.qty}x {item.name} ({item.weight})</span>
                                                        <span className="font-medium text-gray-600">₹{item.price * item.qty}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

            </div>
        </div>
    );
}
