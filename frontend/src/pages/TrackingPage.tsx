import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import type { Product } from '../api';
import { Activity, CheckCircle, Clock, MapPin, Package, Truck, AlertCircle } from 'lucide-react';

export const TrackingPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const result = await api.getProduct(id);
                setProduct(result);
            } catch (err) {
                console.error("Failed to fetch product", err);
                setError("Unable to load tracking information.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Tracking Not Found</h2>
                <p className="text-gray-600">{error || "The requested product could not be found."}</p>
            </div>
        );
    }

    // Use tracking history from product or mock if empty (for demo purposes)
    const trackingSteps = product.tracking_history && product.tracking_history.length > 0
        ? product.tracking_history
        : [
            { status: 'No Tracking Info', date: '-', loc: '-', completed: false }
        ];

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-gray-900">Tracking Information</h1>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${product.predicted_status === 'Authentic'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {product.predicted_status}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h2>
                        <p className="text-sm text-gray-500 mb-2">ID: {product.id}</p>
                        <div className="flex items-center text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded truncate">
                            <span className="mr-2 font-sans text-gray-500">Hash:</span>
                            {product.meta_hash.substring(0, 20)}...
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-600" />
                        Shipment Progress
                    </h3>

                    <div className="relative pl-2">
                        {/* Vertical Line */}
                        <div className="absolute left-6 top-2 bottom-4 w-0.5 bg-gray-100"></div>

                        <div className="space-y-8">
                            {trackingSteps.map((step: any, idx: number) => {
                                // Simple icon mapping based on status keywords
                                let Icon = Activity;
                                const statusLower = step.status.toLowerCase();
                                if (statusLower.includes('manufacture')) Icon = Package;
                                else if (statusLower.includes('quality') || statusLower.includes('check')) Icon = CheckCircle;
                                else if (statusLower.includes('transit') || statusLower.includes('ship')) Icon = Truck;
                                else if (statusLower.includes('deliver')) Icon = MapPin;

                                return (
                                    <div key={idx} className="relative flex items-start group">
                                        <div className={`absolute left-0 p-2 rounded-full border-2 z-10 ${step.completed
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-white border-gray-200 text-gray-300'
                                            }`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="ml-14 pt-1">
                                            <h4 className={`font-semibold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {step.status}
                                            </h4>
                                            <p className="text-sm text-gray-500">{step.loc}</p>
                                            <div className="flex items-center mt-1 text-xs text-gray-400">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {step.date}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        Powered by Blockchain Supplychain Management
                    </p>
                </div>
            </div>
        </div>
    );
};
