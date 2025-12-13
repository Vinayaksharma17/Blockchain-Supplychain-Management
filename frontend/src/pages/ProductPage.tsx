import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import type { Product } from '../api'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import {
  ShieldCheck,
  Box,
  Activity,
  Star,
  Truck,
  MapPin,
  RotateCcw,
  Shield,
  CheckCircle,
  Clock,
  Share2,
  Heart,
  ChevronRight,
  ImageOff,
} from 'lucide-react'
import { SimilarProducts } from '../components/SimilarProducts'

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  type TrackingStep = {
    status: string
    date: string
    loc: string
    completed: boolean
  }
  const [trackingHistory, setTrackingHistory] = useState<TrackingStep[]>([])
  const [imageError, setImageError] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedTab, setSelectedTab] = useState<
    'description' | 'blockchain' | 'tracking'
  >('description')

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const result = await api.getProduct(id)
        setProduct(result)
        // Initialize tracking history from product or default
        setTrackingHistory(
          result.tracking_history || [
            {
              status: 'Manufactured',
              date: '2025-01-15',
              loc: 'Factory A',
              completed: true,
            },
            {
              status: 'Quality Check',
              date: '2025-01-16',
              loc: 'Warehouse B',
              completed: true,
            },
          ]
        )
      } catch (error) {
        console.error('Failed to fetch product', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleSaveTracking = async () => {
    if (!product) return
    try {
      await api.updateTracking(product.id, trackingHistory)
      setIsEditing(false)
      // Ideally show a success toast
    } catch (error) {
      console.error('Failed to save tracking', error)
      alert('Failed to save changes')
    }
  }

  const updateTrackingStep = (
    index: number,
    field: keyof TrackingStep,
    value: string | boolean
  ) => {
    const newHistory = [...trackingHistory]
    newHistory[index] = { ...newHistory[index], [field]: value }
    setTrackingHistory(newHistory)
  }

  const addTrackingStep = () => {
    setTrackingHistory([
      ...trackingHistory,
      {
        status: 'New Step',
        date: new Date().toISOString().split('T')[0],
        loc: 'Location',
        completed: false,
      },
    ])
  }

  const removeTrackingStep = (index: number) => {
    setTrackingHistory(trackingHistory.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eaeded]">
        <Header />
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff9900]"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#eaeded]">
        <Header />
        <div className="flex flex-col justify-center items-center h-[60vh]">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h2>
          <Link
            to="/"
            className="text-[#007185] hover:text-[#c7511f] hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const isAuthentic = product.predicted_status === 'Authentic'
  const rating = (product.pred_proba * 2 + 3).toFixed(1)
  const reviewCount = Math.floor((parseInt(product.id) || 100) % 5000) + 100

  return (
    <div className="min-h-screen flex flex-col bg-[#eaeded]">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-[#c7511f]">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-700">{product.name}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Image Section */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg p-4 sticky top-24">
              <div className="aspect-square bg-[#f7f7f7] rounded-lg flex items-center justify-center mb-4">
                {!imageError ? (
                  <img
                    src={api.getProductImage(product, 800)}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageOff className="w-16 h-16 mb-2" />
                    <span className="text-sm">Image not available</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="w-5 h-5" />
                  Add to List
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg p-6">
              {/* Title */}
              <h1 className="text-2xl font-medium text-[#0f1111] mb-2">
                {product.name}
              </h1>

              {/* Brand */}
              <p className="text-sm text-[#007185] hover:text-[#c7511f] cursor-pointer mb-2">
                Visit the Garment Store
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(Number(rating))
                          ? 'text-[#ffa41c] fill-[#ffa41c]'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-[#007185]">{rating}</span>
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm text-[#007185] hover:text-[#c7511f] cursor-pointer">
                  {reviewCount.toLocaleString()} ratings
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-500">-23%</span>
                  <span className="text-3xl font-medium text-[#0f1111]">
                    ₹{product.price.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  M.R.P.:{' '}
                  <span className="line-through">
                    ₹{Math.floor(product.price * 1.3).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Product Details */}
              <div className="space-y-3 py-4 border-y">
                <div className="flex">
                  <span className="w-28 text-sm text-gray-500">Color</span>
                  <span className="text-sm font-medium capitalize">
                    {product.color || 'N/A'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 text-sm text-gray-500">Year</span>
                  <span className="text-sm font-medium">{product.year}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-sm text-gray-500">Product ID</span>
                  <span className="text-sm font-mono text-gray-600">
                    {product.id}
                  </span>
                </div>
              </div>

              {/* Blockchain Verification */}
              <div className="mt-4 p-4 bg-[#f0fdf4] rounded-lg border border-[#bbf7d0]">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck
                    className={`w-5 h-5 ${
                      isAuthentic ? 'text-[#067D62]' : 'text-yellow-500'
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      isAuthentic ? 'text-[#067D62]' : 'text-yellow-600'
                    }`}
                  >
                    {isAuthentic
                      ? 'Blockchain Verified Authentic'
                      : 'Verification Pending'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  This product's authenticity is verified using blockchain
                  technology. Confidence:{' '}
                  {(product.pred_proba * 100).toFixed(1)}%
                </p>
              </div>

              {/* Features */}
              <div className="mt-6 space-y-3">
                <h3 className="font-medium text-[#0f1111]">About this item</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#067D62] mt-0.5 flex-shrink-0" />
                    Blockchain verified for 100% authenticity
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#067D62] mt-0.5 flex-shrink-0" />
                    QR code enabled real-time tracking
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#067D62] mt-0.5 flex-shrink-0" />
                    Complete supply chain transparency
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buy Box */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-4 sticky top-24">
              <div className="text-2xl font-medium text-[#0f1111] mb-2">
                ₹{product.price.toLocaleString()}
              </div>

              {/* Delivery */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-[#067D62]" />
                  <span>
                    FREE delivery <strong>Tomorrow</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>Deliver to India</span>
                </div>
              </div>

              {/* Stock */}
              <p className="text-lg text-[#067D62] font-medium mb-4">
                In Stock
              </p>

              {/* Quantity */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm">Qty:</span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-[#f0f2f2] hover:bg-[#e3e6e6] cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-medium py-2 px-4 rounded-full transition-colors">
                  Add to Cart
                </button>
                <button className="w-full bg-[#ffa41c] hover:bg-[#fa8900] text-[#0f1111] font-medium py-2 px-4 rounded-full transition-colors">
                  Buy Now
                </button>
              </div>

              {/* Secure Transaction */}
              <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure transaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>10 days return policy</span>
                </div>
              </div>

              {/* QR Code */}
              {product.qr_file && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    Product QR Code
                  </h4>
                  <div className="bg-white p-2 rounded border inline-block">
                    <img
                      src={api.getImageUrl(product.qr_file)}
                      alt="QR Code"
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Scan to track on mobile
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 bg-white rounded-lg">
          {/* Tab Headers */}
          <div className="flex border-b">
            {[
              { id: 'description', label: 'Description' },
              { id: 'blockchain', label: 'Blockchain Info' },
              { id: 'tracking', label: 'Supply Chain' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setSelectedTab(
                    tab.id as 'description' | 'blockchain' | 'tracking'
                  )
                }
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-[#ff9900] text-[#c7511f]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {selectedTab === 'description' && (
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Product Description
                </h3>
                <p className="text-gray-600">
                  This is a high-quality garment with ID {product.id}. It
                  features {product.color} color and was manufactured in{' '}
                  {product.year}. All our products are verified using blockchain
                  technology to ensure authenticity.
                </p>
              </div>
            )}

            {selectedTab === 'blockchain' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">
                  Blockchain Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Meta Hash
                    </span>
                    <code className="text-xs text-gray-600 break-all font-mono">
                      {product.meta_hash}
                    </code>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      PID Hash
                    </span>
                    <code className="text-xs text-gray-600 break-all font-mono">
                      {product.pid_hash}
                    </code>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Short Hash
                    </span>
                    <code className="text-xs text-gray-600 break-all font-mono">
                      {product.short_hash}
                    </code>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Confidence Score
                    </span>
                    <code className="text-lg font-bold text-[#067D62]">
                      {(product.pred_proba * 100).toFixed(1)}%
                    </code>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'tracking' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#ff9900]" />
                    Supply Chain Tracking
                  </h3>
                  <button
                    onClick={() => {
                      if (isEditing) {
                        handleSaveTracking()
                      } else {
                        setIsEditing(true)
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isEditing
                        ? 'bg-[#067D62] text-white hover:bg-[#055a47]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isEditing ? 'Save Changes' : 'Edit Tracking'}
                  </button>
                </div>

                {/* Timeline */}
                <div className="relative pl-8">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                  <div className="space-y-6">
                    {trackingHistory.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-5 w-4 h-4 rounded-full border-2 border-white shadow ${
                            step.completed ? 'bg-[#067D62]' : 'bg-gray-300'
                          }`}
                        ></div>

                        {isEditing ? (
                          <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Status
                                </label>
                                <input
                                  type="text"
                                  value={step.status}
                                  onChange={(e) =>
                                    updateTrackingStep(
                                      idx,
                                      'status',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border rounded-md text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Date
                                </label>
                                <input
                                  type="text"
                                  value={step.date}
                                  onChange={(e) =>
                                    updateTrackingStep(
                                      idx,
                                      'date',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border rounded-md text-sm"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Location
                                </label>
                                <input
                                  type="text"
                                  value={step.loc}
                                  onChange={(e) =>
                                    updateTrackingStep(
                                      idx,
                                      'loc',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border rounded-md text-sm"
                                />
                              </div>
                              <div className="flex items-end justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={step.completed}
                                    onChange={(e) =>
                                      updateTrackingStep(
                                        idx,
                                        'completed',
                                        e.target.checked
                                      )
                                    }
                                    className="rounded text-[#ff9900]"
                                  />
                                  <span className="text-sm">Completed</span>
                                </label>
                                <button
                                  onClick={() => removeTrackingStep(idx)}
                                  className="text-red-500 text-xs hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white p-4 rounded-lg border">
                            <h4
                              className={`font-medium ${
                                step.completed
                                  ? 'text-gray-900'
                                  : 'text-gray-400'
                              }`}
                            >
                              {step.status}
                            </h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {step.loc}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {step.date}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {isEditing && (
                      <button
                        onClick={addTrackingStep}
                        className="text-[#007185] text-sm hover:text-[#c7511f] font-medium"
                      >
                        + Add Step
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products Section */}
        <SimilarProducts
          productName={product.name}
          currentProductId={product.id}
        />
      </main>

      <Footer />
    </div>
  )
}
