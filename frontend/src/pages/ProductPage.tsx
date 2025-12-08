import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import type { Product } from '../api';
import { ArrowLeft, ShieldCheck, Box, Activity } from 'lucide-react';

export const ProductPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [trackingHistory, setTrackingHistory] = useState<any[]>([]);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const result = await api.getProduct(id);
                setProduct(result);
                // Initialize tracking history from product or default
                setTrackingHistory(result.tracking_history || [
                    { status: 'Manufactured', date: '2025-01-15', loc: 'Factory A', completed: true },
                    { status: 'Quality Check', date: '2025-01-16', loc: 'Warehouse B', completed: true },
                ]);
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSaveTracking = async () => {
        if (!product) return;
        try {
            await api.updateTracking(product.id, trackingHistory);
            setIsEditing(false);
            // Ideally show a success toast
        } catch (error) {
            console.error("Failed to save tracking", error);
            alert("Failed to save changes");
        }
    };

    const updateTrackingStep = (index: number, field: string, value: any) => {
        const newHistory = [...trackingHistory];
        newHistory[index] = { ...newHistory[index], [field]: value };
        setTrackingHistory(newHistory);
    };

    const addTrackingStep = () => {
        setTrackingHistory([
            ...trackingHistory,
            { status: 'New Step', date: new Date().toISOString().split('T')[0], loc: 'Location', completed: false }
        ]);
    };

    const removeTrackingStep = (index: number) => {
        setTrackingHistory(trackingHistory.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
                <Link to="/" className="text-blue-600 hover:underline">Return Home</Link>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Catalogue
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <p className="text-sm text-gray-500">ID: {product.id}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-medium self-start ${product.predicted_status === 'Authentic'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {product.predicted_status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <span className="block text-sm text-gray-500 mb-1">Price</span>
                                <span className="font-bold text-2xl text-green-600">₹{product.price}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <span className="block text-sm text-gray-500 mb-1">Color</span>
                                <span className="font-medium text-gray-900 text-lg">{product.color}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <span className="block text-sm text-gray-500 mb-1">Year</span>
                                <span className="font-medium text-gray-900 text-lg">{product.year}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
                                Blockchain Verification
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Meta Hash</span>
                                    <code className="text-xs text-gray-600 break-all font-mono">{product.meta_hash}</code>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">PID Hash</span>
                                    <code className="text-xs text-gray-600 break-all font-mono">{product.pid_hash}</code>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Box className="w-5 h-5 mr-2 text-blue-600" />
                                Product QR Code
                            </h3>
                            <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-xl border border-gray-100 border-dashed">
                                {product.qr_file ? (
                                    <>
                                        <div className="bg-white p-2 rounded-lg shadow-sm mb-3">
                                            <img
                                                src={api.getImageUrl(product.qr_file)}
                                                alt={`QR Code for ${product.name}`}
                                                className="w-48 h-48 object-contain"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500 text-center max-w-xs">
                                            Scan this QR code to view the tracking information on your mobile device.
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-sm">QR Code not available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tracking Section (Editable) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <Activity className="w-6 h-6 mr-2 text-blue-600" />
                            Supply Chain Tracking
                        </h3>
                        <button
                            onClick={() => {
                                if (isEditing) {
                                    handleSaveTracking();
                                } else {
                                    setIsEditing(true);
                                }
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditing
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {isEditing ? 'Save Changes' : 'Edit Tracking'}
                        </button>
                    </div>

                    <div className="relative pl-2">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                        <div className="space-y-8 relative">
                            {(trackingHistory || []).map((step, idx) => (
                                <div key={idx} className="flex items-start ml-10 relative group">
                                    <div className={`absolute -left-[2.65rem] w-4 h-4 rounded-full border-4 border-white shadow-sm ${step.completed ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}></div>

                                    <div className="flex-1">
                                        {isEditing ? (
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                                                        <input
                                                            type="text"
                                                            value={step.status}
                                                            onChange={(e) => updateTrackingStep(idx, 'status', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                            placeholder="e.g. In Transit"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                                                        <input
                                                            type="text"
                                                            value={step.date}
                                                            onChange={(e) => updateTrackingStep(idx, 'date', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                            placeholder="YYYY-MM-DD"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                                                        <input
                                                            type="text"
                                                            value={step.loc}
                                                            onChange={(e) => updateTrackingStep(idx, 'loc', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                            placeholder="e.g. Warehouse A"
                                                        />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <label className="flex items-center space-x-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={step.completed}
                                                                onChange={(e) => updateTrackingStep(idx, 'completed', e.target.checked)}
                                                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                            />
                                                            <span className="text-sm text-gray-700">Completed</span>
                                                        </label>
                                                        <button
                                                            onClick={() => removeTrackingStep(idx)}
                                                            className="ml-auto text-red-500 text-xs hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{step.status}</h4>
                                                <p className="text-sm text-gray-500">{step.loc} • {step.date}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isEditing && (
                                <button
                                    onClick={addTrackingStep}
                                    className="ml-10 flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    + Add Step
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
