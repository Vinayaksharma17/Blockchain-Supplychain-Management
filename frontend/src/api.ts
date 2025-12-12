import axios from 'axios'

// Dynamically determine backend URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface Product {
  id: string
  name: string
  color: string
  price: number
  year: number
  meta_hash: string
  pid_hash: string
  short_hash: string
  predicted_status: string
  pred_proba: number
  qr_file?: string
  tracking_url?: string
  image_file?: string
  tracking_history?: {
    status: string
    date: string
    loc: string
    completed: boolean
  }[]
}

export interface PaginatedResponse {
  data: Product[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export const api = {
  getProducts: async (
    page: number = 1,
    limit: number = 12,
    search: string = ''
  ) => {
    const response = await axios.get<PaginatedResponse>(
      `${API_BASE_URL}/api/products`,
      {
        params: { page, limit, search },
      }
    )
    return response.data
  },
  getProduct: async (id: string) => {
    const response = await axios.get<Product>(
      `${API_BASE_URL}/api/products/${id}`
    )
    return response.data
  },
  updateTracking: async (
    id: string,
    tracking_history: {
      status: string
      date: string
      loc: string
      completed: boolean
    }[]
  ) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/products/${id}/tracking`,
      {
        tracking_history,
      }
    )
    return response.data
  },
  getImageUrl: (path?: string) => {
    if (!path) return undefined
    // If path is absolute or external, return as is (though backend serves local files)
    if (path.startsWith('http')) return path
    // Remove 'backend/data/' prefix if present to match static mount
    const cleanPath = path
      .replace('backend/data/', '')
      .replace('uploads/', 'uploads/')
    // Actually, backend mounts DATA_DIR at /static
    // If path is "uploads/foo.jpg", url is /static/uploads/foo.jpg
    return `${API_BASE_URL}/static/${cleanPath}`
  },

  /**
   * Generate a placeholder image URL based on product attributes.
   * Uses picsum.photos for random product images or ui-avatars for color-based placeholders.
   * This eliminates the need to manually add images during development.
   */
  getPlaceholderImage: (
    product: { id: string; name: string; color: string },
    size: number = 400
  ) => {
    // Option 1: Use product ID as seed for consistent random images
    // This gives each product a unique but consistent placeholder
    const seed = parseInt(product.id) || product.id.charCodeAt(0)
    return `https://picsum.photos/seed/${seed}/${size}/${size}`
  },

  /**
   * Get the best available image for a product.
   * Falls back to placeholder if no image_file is set.
   */
  getProductImage: (product: Product, size: number = 400) => {
    // If product has an actual image, use it
    if (product.image_file) {
      const url = api.getImageUrl(product.image_file)
      if (url) return url
    }
    // Otherwise, generate a placeholder based on product ID
    return api.getPlaceholderImage(product, size)
  },
}
