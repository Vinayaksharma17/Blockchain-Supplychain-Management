import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import type { Product } from '../api'
import {
  Activity,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Truck,
  AlertCircle,
  ShieldCheck,
  Palette,
  Calendar,
  Hash,
  ImageOff,
  ChevronRight,
  ExternalLink,
  Shield,
} from 'lucide-react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export const TrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const result = await api.getProduct(id)
        setProduct(result)
      } catch (err) {
        console.error('Failed to fetch product', err)
        setError('Unable to load tracking information.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#eaeded]">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff9900]"></div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#eaeded]">
        <Header />
        <div className="flex-1 flex flex-col justify-center items-center p-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Tracking Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'The requested product could not be found.'}
          </p>
          <Link
            to="/"
            className="text-[#007185] hover:text-[#c7511f] hover:underline"
          >
            Return to Home
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  // Use tracking history from product or mock if empty (for demo purposes)
  const trackingSteps =
    product.tracking_history && product.tracking_history.length > 0
      ? product.tracking_history
      : [{ status: 'No Tracking Info', date: '-', loc: '-', completed: false }]

  // Extract product type from name (first word or category hint)
  const getProductType = (name: string): string => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('shirt')) return 'Shirt'
    if (lowerName.includes('t-shirt') || lowerName.includes('tshirt'))
      return 'T-Shirt'
    if (lowerName.includes('kurta')) return 'Kurta'
    if (lowerName.includes('saree') || lowerName.includes('sari'))
      return 'Saree'
    if (lowerName.includes('jeans')) return 'Jeans'
    if (lowerName.includes('trouser') || lowerName.includes('pant'))
      return 'Trousers'
    if (lowerName.includes('dress')) return 'Dress'
    if (lowerName.includes('jacket')) return 'Jacket'
    if (lowerName.includes('sweater')) return 'Sweater'
    if (lowerName.includes('bag') || lowerName.includes('trolley')) return 'Bag'
    if (lowerName.includes('watch')) return 'Watch'
    if (lowerName.includes('shoe') || lowerName.includes('sneaker'))
      return 'Footwear'
    return 'Garment'
  }

  // Extract brand from name (usually first word)
  const getBrand = (name: string): string => {
    const words = name.split(' ')
    return words[0] || 'Unknown'
  }

  const productType = getProductType(product.name)
  const brand = getBrand(product.name)
  const imageUrl = api.getProductImage(product)
  const isAuthentic = product.predicted_status === 'Authentic'

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
            <Link
              to={`/product/${product.id}`}
              className="hover:text-[#c7511f]"
            >
              Product
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-700">Track Order</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0f1111] flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#ff9900]" />
            Track Your Order
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time tracking powered by Blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Product Card */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Product Image */}
              <div className="relative aspect-square bg-[#f7f7f7]">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageOff className="w-16 h-16" />
                  </div>
                )}
                {/* Authenticity Badge */}
                <div
                  className={`absolute top-3 right-3 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                    isAuthentic
                      ? 'bg-[#067D62] text-white'
                      : 'bg-yellow-500 text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {product.predicted_status}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h2 className="font-medium text-[#0f1111] mb-3 line-clamp-2">
                  {product.name}
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Package className="w-4 h-4" /> Type
                    </span>
                    <span className="font-medium">{productType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Brand</span>
                    <span className="font-medium">{brand}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Palette className="w-4 h-4" /> Color
                    </span>
                    <span className="font-medium capitalize">
                      {product.color}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Year
                    </span>
                    <span className="font-medium">{product.year}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Hash className="w-4 h-4" /> ID
                    </span>
                    <span className="font-mono text-xs text-[#007185]">
                      {product.id}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/product/${product.id}`}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-medium py-2 px-4 rounded-full transition-colors text-sm"
                >
                  View Product
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* QR Code Card */}
            {/* {product.qr_file && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-medium text-[#0f1111] mb-3 flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#ff9900]" />
                  Scan QR Code
                </h3>
                <div className="flex justify-center">
                  <div className="bg-white p-2 border rounded-lg">
                    <img
                      src={api.getImageUrl(product.qr_file)}
                      alt="QR Code"
                      className="w-32 h-32"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Scan for mobile tracking
                </p>
              </div>
            )} */}
          </div>

          {/* Right Column - Tracking Timeline */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tracking Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0f1111] mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#ff9900]" />
                Shipment Journey
              </h3>

              {/* Timeline */}
              <div className="relative pl-2">
                <div className="absolute left-6 top-2 bottom-4 w-0.5 bg-gray-200"></div>

                <div className="space-y-6">
                  {trackingSteps.map(
                    (
                      step: {
                        status: string
                        date: string
                        loc: string
                        completed: boolean
                      },
                      idx: number
                    ) => {
                      let Icon = Activity
                      const statusLower = step.status.toLowerCase()
                      if (statusLower.includes('manufacture')) Icon = Package
                      else if (
                        statusLower.includes('quality') ||
                        statusLower.includes('check')
                      )
                        Icon = CheckCircle
                      else if (
                        statusLower.includes('transit') ||
                        statusLower.includes('ship') ||
                        statusLower.includes('dispatch')
                      )
                        Icon = Truck
                      else if (
                        statusLower.includes('deliver') ||
                        statusLower.includes('arrived') ||
                        statusLower.includes('received')
                      )
                        Icon = MapPin
                      else if (
                        statusLower.includes('warehouse') ||
                        statusLower.includes('hub')
                      )
                        Icon = Package

                      const isLast = idx === trackingSteps.length - 1
                      const isCurrentStep =
                        !step.completed &&
                        (idx === 0 || trackingSteps[idx - 1]?.completed)

                      return (
                        <div
                          key={idx}
                          className="relative flex items-start group"
                        >
                          <div
                            className={`absolute left-0 p-2 rounded-full border-2 z-10 transition-all ${
                              step.completed
                                ? 'bg-[#067D62] border-[#067D62] text-white'
                                : isCurrentStep
                                ? 'bg-[#fff4e5] border-[#ff9900] text-[#ff9900] animate-pulse'
                                : 'bg-white border-gray-200 text-gray-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="ml-14 pt-1 flex-1">
                            <div
                              className={`p-4 rounded-lg ${
                                step.completed
                                  ? 'bg-[#f0fdf4] border border-[#bbf7d0]'
                                  : isCurrentStep
                                  ? 'bg-[#fff4e5] border border-[#ffd814]'
                                  : 'bg-gray-50 border border-gray-100'
                              }`}
                            >
                              <h4
                                className={`font-semibold text-sm ${
                                  step.completed
                                    ? 'text-[#067D62]'
                                    : isCurrentStep
                                    ? 'text-[#b77a00]'
                                    : 'text-gray-400'
                                }`}
                              >
                                {step.status}
                                {isCurrentStep && !isLast && (
                                  <span className="ml-2 text-xs font-normal bg-[#ff9900] text-white px-2 py-0.5 rounded-full">
                                    In Progress
                                  </span>
                                )}
                              </h4>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
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
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Blockchain Verification Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0f1111] mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#ff9900]" />
                Blockchain Verification
              </h3>

              <div
                className={`p-4 rounded-lg mb-4 ${
                  isAuthentic
                    ? 'bg-[#f0fdf4] border border-[#bbf7d0]'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck
                    className={`w-5 h-5 ${
                      isAuthentic ? 'text-[#067D62]' : 'text-yellow-600'
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      isAuthentic ? 'text-[#067D62]' : 'text-yellow-700'
                    }`}
                  >
                    {isAuthentic
                      ? 'Verified Authentic'
                      : 'Verification Pending'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Confidence Score:{' '}
                  <strong>{(product.pred_proba * 100).toFixed(1)}%</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Meta Hash
                  </span>
                  <code className="text-xs text-gray-600 break-all font-mono">
                    {product.meta_hash}
                  </code>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Product Hash
                  </span>
                  <code className="text-xs text-gray-600 break-all font-mono">
                    {product.pid_hash}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
