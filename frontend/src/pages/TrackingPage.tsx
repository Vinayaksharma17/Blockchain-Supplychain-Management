import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
} from 'lucide-react'

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
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-gray-100 p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Tracking Not Found
        </h2>
        <p className="text-gray-600">
          {error || 'The requested product could not be found.'}
        </p>
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
    // Common brand patterns - first word is usually the brand
    return words[0] || 'Unknown'
  }

  const productType = getProductType(product.name)
  const brand = getBrand(product.name)
  const imageUrl = api.getProductImage(product, 400)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Product Image Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="relative aspect-video bg-gray-100">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ImageOff className="w-16 h-16" />
              </div>
            )}
            {/* Authenticity Badge Overlay */}
            <div
              className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 backdrop-blur-sm ${
                product.predicted_status === 'Authentic'
                  ? 'bg-green-500/90 text-white'
                  : 'bg-yellow-500/90 text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {product.predicted_status}
            </div>
          </div>
        </div>

        {/* Product Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h1 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
            {product.name}
          </h1>

          {/* Product Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Package className="w-3.5 h-3.5" />
                <span className="text-xs font-medium uppercase">Type</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {productType}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <span className="text-xs">🏷️</span>
                <span className="text-xs font-medium uppercase">Brand</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">{brand}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Palette className="w-3.5 h-3.5" />
                <span className="text-xs font-medium uppercase">Color</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {product.color}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs font-medium uppercase">Year</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {product.year}
              </p>
            </div>
          </div>

          {/* Tracking ID */}
          <div className="bg-blue-50 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Hash className="w-3.5 h-3.5" />
              <span className="text-xs font-medium uppercase">Tracking ID</span>
            </div>
            <p className="text-sm font-mono font-semibold text-blue-800">
              {product.id}
            </p>
          </div>
        </div>

        {/* Blockchain Verification Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-blue-600" />
            Blockchain Verification
          </h3>
          <div className="space-y-2">
            <div className="bg-gray-50 p-2.5 rounded-lg">
              <span className="block text-[10px] font-medium text-gray-400 uppercase mb-0.5">
                Meta Hash
              </span>
              <code className="text-[11px] text-gray-600 break-all font-mono">
                {product.meta_hash}
              </code>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg">
              <span className="block text-[10px] font-medium text-gray-400 uppercase mb-0.5">
                Product Hash
              </span>
              <code className="text-[11px] text-gray-600 break-all font-mono">
                {product.pid_hash}
              </code>
            </div>
          </div>
        </div>

        {/* Shipment Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Shipment Journey
          </h3>

          <div className="relative pl-2">
            {/* Vertical Line */}
            <div className="absolute left-6 top-2 bottom-4 w-0.5 bg-gray-100"></div>

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
                  // Simple icon mapping based on status keywords
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
                    <div key={idx} className="relative flex items-start group">
                      <div
                        className={`absolute left-0 p-2 rounded-full border-2 z-10 transition-all ${
                          step.completed
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : isCurrentStep
                            ? 'bg-blue-100 border-blue-400 text-blue-600 animate-pulse'
                            : 'bg-white border-gray-200 text-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="ml-14 pt-1">
                        <h4
                          className={`font-semibold text-sm ${
                            step.completed
                              ? 'text-gray-900'
                              : isCurrentStep
                              ? 'text-blue-700'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.status}
                          {isCurrentStep && !isLast && (
                            <span className="ml-2 text-xs font-normal text-blue-500">
                              (In Progress)
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center mt-0.5 text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {step.loc}
                        </div>
                        <div className="flex items-center mt-0.5 text-xs text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.date}
                        </div>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Powered by Blockchain Supplychain Management
          </p>
        </div>
      </div>
    </div>
  )
}
