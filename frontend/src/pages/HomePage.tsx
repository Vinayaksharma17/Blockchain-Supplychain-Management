import React, { useEffect, useState } from 'react'
import { api } from '../api'
import type { PaginatedResponse } from '../api'
import { ProductCard } from '../components/ProductCard'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

export const HomePage: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('featured')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await api.getProducts(page, 16, debouncedSearch)
        setData(result)
      } catch (error) {
        console.error('Failed to fetch products', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page, debouncedSearch])

  const handleSearch = () => {
    setPage(1)
    setDebouncedSearch(search)
  }

  const filters = [
    { id: 'all', label: 'All Products', icon: Grid },
    { id: 'authentic', label: 'Verified Only', icon: ShieldCheck },
    { id: 'deals', label: "Today's Deals", icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#eaeded]">
      <Header
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        onSearch={handleSearch}
      />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-b from-[#232f3e] to-[#eaeded] h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-pattern.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white z-10">
            <h2 className="text-4xl font-bold mb-2">
              Blockchain Verified Garments
            </h2>
            <p className="text-xl text-gray-300 mb-4">
              100% Authentic Products with Supply Chain Transparency
            </p>
            <button className="bg-[#ff9900] hover:bg-[#fa8900] text-[#131921] font-bold px-6 py-3 rounded-lg transition-colors">
              Explore Now
            </button>
          </div>
        </div>
        {/* Decorative Cards */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:flex gap-4">
          <div className="bg-white rounded-lg shadow-xl p-4 w-[200px] transform rotate-3 hover:rotate-0 transition-transform">
            <div className="h-24 bg-gray-100 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="bg-white rounded-lg shadow-xl p-4 w-[200px] transform -rotate-3 hover:rotate-0 transition-transform">
            <div className="h-24 bg-gray-100 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Category Pills */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-[#131921] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <filter.icon className="w-4 h-4" />
              {filter.label}
            </button>
          ))}
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0f1111]">Results</h1>
            <p className="text-sm text-gray-600">
              Showing {data?.data.length || 0} of {data?.total || 0} products
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#ff9900] outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="rating">Avg. Customer Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data?.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {data?.data.length === 0 && (
              <div className="text-center py-20 bg-white rounded-lg">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, data.total_pages))].map((_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-[#131921] text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  {data.total_pages > 5 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <button
                        onClick={() => setPage(data.total_pages)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          page === data.total_pages
                            ? 'bg-[#131921] text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {data.total_pages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(data.total_pages, p + 1))
                  }
                  disabled={page === data.total_pages}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
