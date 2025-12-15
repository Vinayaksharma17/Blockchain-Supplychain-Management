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
    // If path is absolute or external, return as is
    if (path.startsWith('http')) return path
    // Remove 'backend/data/' prefix if present to match static mount
    const cleanPath = path.replace('backend/data/', '')
    // Backend mounts DATA_DIR at /static
    // e.g., "images/10017413.jpg" → "http://localhost:8000/static/images/10017413.jpg"
    return `${API_BASE_URL}/static/${cleanPath}`
  },

  /**
   * Get the best available image for a product.
   * Expects images stored in backend/data/images/{product_id}.jpg
   * Falls back to showing no image if image_file is not set.
   */
  getProductImage: (product: Product) => {
    // If product has an image_file set, use it
    if (product.image_file) {
      return api.getImageUrl(product.image_file)
    }
    // No image available
    return undefined
  },

  /**
   * Get similar products based on search query (product name keywords).
   * Excludes the current product from results.
   */
  getSimilarProducts: async (
    productName: string,
    currentProductId: string,
    limit: number = 6
  ): Promise<Product[]> => {
    // Extract meaningful keywords from product name (first 2-3 words)
    const keywords = productName
      .split(/\s+/)
      .filter((word) => word.length > 2) // Filter out short words
      .slice(0, 2) // Take first 2 keywords
      .join(' ')

    if (!keywords) return []

    try {
      const response = await api.getProducts(1, limit + 1, keywords)
      // Filter out the current product and limit results
      return response.data
        .filter((p) => p.id !== currentProductId)
        .slice(0, limit)
    } catch (error) {
      console.error('Failed to fetch similar products', error)
      return []
    }
  },
}
