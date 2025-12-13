import React, { useState } from 'react'
import type { Product } from '../api'
import { api } from '../api'
import { Link } from 'react-router-dom'
import { Star, Shield, ShieldCheck, Truck, Heart, ImageOff } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false)
  const imageUrl = api.getProductImage(product)
  const isAuthentic = product.predicted_status === 'Authentic'
  const rating = (product.pred_proba * 2 + 3).toFixed(1) // Mock rating 3-5
  const reviewCount = Math.floor((parseInt(product.id) || 100) % 5000) + 100

  return (
    <div className="bg-white rounded-lg overflow-hidden hover-lift group relative">
      {/* Wishlist Button */}
      <button className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100">
        <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
      </button>

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {isAuthentic && (
          <span className="bg-[#067D62] text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>
        )}
        {product.price > 1000 && (
          <span className="bg-[#cc0c39] text-white text-xs font-bold px-2 py-1 rounded">
            DEAL
          </span>
        )}
      </div>

      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block p-4 bg-[#f7f7f7]">
        <div className="aspect-square flex items-center justify-center">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <ImageOff className="w-12 h-12 mb-2" />
              <span className="text-xs">No Image</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm text-[#0f1111] hover:text-[#c7511f] line-clamp-2 mb-1 min-h-[40px]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(Number(rating))
                    ? 'text-[#ffa41c] fill-[#ffa41c]'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-[#007185] hover:text-[#c7511f] cursor-pointer">
            {reviewCount.toLocaleString()}
          </span>
        </div>

        {/* Price */}
        <div className="mb-2">
          <span className="text-2xl font-medium text-[#0f1111]">
            ₹{product.price.toLocaleString()}
          </span>
          {product.price > 500 && (
            <>
              <span className="text-sm text-gray-500 line-through ml-2">
                ₹{Math.floor(product.price * 1.3).toLocaleString()}
              </span>
              <span className="text-sm text-[#cc0c39] ml-2">(23% off)</span>
            </>
          )}
        </div>

        {/* Delivery Info */}
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
          <Truck className="w-4 h-4" />
          <span>
            FREE delivery <strong>Tomorrow</strong>
          </span>
        </div>

        {/* Color Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Color:</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium capitalize">
            {product.color || 'N/A'}
          </span>
        </div>

        {/* Blockchain Badge */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          <Shield
            className={`w-4 h-4 ${
              isAuthentic ? 'text-[#067D62]' : 'text-yellow-500'
            }`}
          />
          <span
            className={`text-xs font-medium ${
              isAuthentic ? 'text-[#067D62]' : 'text-yellow-600'
            }`}
          >
            {isAuthentic ? 'Blockchain Verified' : 'Verification Pending'}
          </span>
        </div>
      </div>
    </div>
  )
}
