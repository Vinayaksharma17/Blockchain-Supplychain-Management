import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Menu,
  MapPin,
  ChevronDown,
  Package,
  Shield,
  QrCode,
} from 'lucide-react'

interface HeaderProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearch?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  searchValue = '',
  onSearchChange,
  onSearch,
}) => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)

  const categories = [
    { name: 'All Products', icon: Package },
    { name: 'Authentic', icon: Shield },
    { name: 'Track Product', icon: QrCode },
  ]

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch()
    }
  }

  return (
    <>
      {/* Main Header */}
      <header className="bg-[#131921] sticky top-0 z-50">
        {/* Top Bar */}
        <div className="flex items-center px-4 py-2 gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-1 p-2 border border-transparent hover:border-white rounded"
          >
            <Package className="w-8 h-8 text-[#ff9900]" />
            <div className="text-white">
              <span className="font-bold text-xl">Garment</span>
              <span className="text-[#ff9900] text-xl font-bold">SCM</span>
            </div>
          </Link>

          {/* Deliver To */}
          <div className="hidden md:flex items-center gap-1 p-2 border border-transparent hover:border-white rounded cursor-pointer text-white">
            <MapPin className="w-5 h-5 text-white" />
            <div className="text-xs">
              <span className="text-gray-300">Deliver to</span>
              <p className="font-bold text-sm">India</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex max-w-3xl">
            <div className="relative hidden md:block">
              <button
                className="h-full px-3 bg-gray-100 hover:bg-gray-200 rounded-l-md flex items-center gap-1 text-sm text-gray-700 border-r border-gray-300"
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              >
                All
                <ChevronDown className="w-4 h-4" />
              </button>
              {showCategoryMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg py-2 min-w-[200px] z-50">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setShowCategoryMenu(false)}
                    >
                      <cat.icon className="w-4 h-4 text-gray-500" />
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Search by product ID or name..."
              className="flex-1 px-4 py-2 text-sm outline-none md:rounded-none rounded-l-md"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="bg-[#febd69] hover:bg-[#f3a847] px-4 rounded-r-md transition-colors"
              onClick={onSearch}
            >
              <Search className="w-5 h-5 text-[#131921]" />
            </button>
          </div>

          {/* Right Side Icons */}
          {/* <div className="hidden lg:flex items-center gap-2">
            <div className="p-2 border border-transparent hover:border-white rounded cursor-pointer text-white">
              <div className="text-xs text-gray-300">Hello, Sign in</div>
              <div className="font-bold text-sm flex items-center gap-1">
                Account & Lists
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            <Link
              to="/"
              className="p-2 border border-transparent hover:border-white rounded cursor-pointer text-white"
            >
              <div className="text-xs text-gray-300">Returns</div>
              <div className="font-bold text-sm">& Orders</div>
            </Link>

            <div className="p-2 border border-transparent hover:border-white rounded cursor-pointer text-white flex items-end gap-1">
              <div className="relative">
                <ShoppingCart className="w-8 h-8" />
                <span className="absolute -top-1 -right-1 bg-[#ff9900] text-[#131921] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </div>
              <span className="font-bold text-sm">Cart</span>
            </div>
          </div> */}

          {/* Mobile Menu */}
          <button className="lg:hidden p-2 text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Nav Bar */}
        <nav className="bg-[#232f3e] px-4 py-2 flex items-center gap-4 overflow-x-auto text-white text-sm">
          {/* <button className="flex items-center gap-1 hover:text-[#ff9900] whitespace-nowrap font-bold">
            <Menu className="w-5 h-5" />
            All
          </button> */}
          {/* <Link to="/" className="hover:text-[#ff9900] whitespace-nowrap">
            Today's Deals
          </Link> */}
          {/* <Link to="/" className="hover:text-[#ff9900] whitespace-nowrap">
            Customer Service
          </Link> */}
          {/* <Link to="/" className="hover:text-[#ff9900] whitespace-nowrap">
            New Arrivals
          </Link> */}
          {/* <Link to="/" className="hover:text-[#ff9900] whitespace-nowrap">
            Authentic Products
          </Link>
          <Link to="/" className="hover:text-[#ff9900] whitespace-nowrap">
            Track Order
          </Link>
          <Link
            to="/"
            className="hover:text-[#ff9900] whitespace-nowrap text-[#ff9900] font-bold"
          >
            Blockchain Verified
          </Link> */}
        </nav>
      </header>
    </>
  )
}
