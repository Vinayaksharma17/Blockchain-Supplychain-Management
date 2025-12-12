import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { Product } from '../api'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

interface SimilarProductsProps {
  productName: string
  currentProductId: string
}

interface ProductCardMiniProps {
  product: Product
}

const ProductCardMini: React.FC<ProductCardMiniProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false)
  const imageUrl = api.getProductImage(product, 300)

  return (
    <Link
      to={`/product/${product.id}`}
      className="flex-shrink-0 w-44 bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff className="w-8 h-8" />
          </div>
        )}
        {/* Status Badge */}
        <div
          className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium ${
            product.predicted_status === 'Authentic'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {product.predicted_status}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h4
          className="text-sm font-medium text-gray-900 truncate mb-1"
          title={product.name}
        >
          {product.name}
        </h4>
        <p className="text-xs text-gray-500 mb-2">{product.color}</p>
        <p className="text-sm font-bold text-green-600">₹{product.price}</p>
      </div>
    </Link>
  )
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({
  productName,
  currentProductId,
}) => {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true)
      const products = await api.getSimilarProducts(
        productName,
        currentProductId,
        8
      )
      setSimilarProducts(products)
      setLoading(false)
    }
    fetchSimilar()
  }, [productName, currentProductId])

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    )
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll)
      }
      window.removeEventListener('resize', checkScroll)
    }
  }, [similarProducts])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 200
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  // Don't render if no similar products
  if (!loading && similarProducts.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Similar Products</h3>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="relative group">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all opacity-0 group-hover:opacity-100 -translate-x-1/2"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Products Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {similarProducts.map((product) => (
              <ProductCardMini key={product.id} product={product} />
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all opacity-0 group-hover:opacity-100 translate-x-1/2"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
