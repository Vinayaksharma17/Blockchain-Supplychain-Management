import React, { useState } from 'react'
import type { Product } from '../api'
import { api } from '../api'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ImageOff } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false)
  const imageUrl = api.getProductImage(product)

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <ImageOff className="w-12 h-12 mb-2" />
            <span className="text-xs">No Image</span>
          </div>
        )}
        {/* Status Badge Overlay */}
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            product.predicted_status === 'Authentic'
              ? 'bg-green-100/90 text-green-800'
              : 'bg-yellow-100/90 text-yellow-800'
          }`}
        >
          {product.predicted_status}
        </div>
        {/* Price Badge Overlay */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold bg-white/90 text-green-600 backdrop-blur-sm">
          ₹{product.price}
        </div>
      </div>

      <div className="p-5">
        <h3
          className="font-bold text-gray-900 text-lg mb-1 truncate"
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4">ID: {product.id}</p>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
          <div className="bg-gray-50 p-2 rounded">
            <span className="block text-xs text-gray-400">Color</span>
            {product.color}
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="block text-xs text-gray-400">Year</span>
            {product.year}
          </div>
        </div>

        <Link
          to={`/product/${product.id}`}
          className="block w-full text-center bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  )
}
