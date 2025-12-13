import React from 'react'
import { Package, Shield, Truck, CreditCard } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#232f3e] text-white mt-auto">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-[#37475a] hover:bg-[#485769] py-3 text-sm transition-colors"
      >
        Back to top
      </button>

      {/* Features Bar */}
      <div className="bg-[#131921] py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-3">
            <Truck className="w-10 h-10 text-[#ff9900]" />
            <div>
              <p className="font-bold">Free Delivery</p>
              <p className="text-xs text-gray-400">On orders over ₹499</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-[#ff9900]" />
            <div>
              <p className="font-bold">Blockchain Verified</p>
              <p className="text-xs text-gray-400">100% Authentic</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="w-10 h-10 text-[#ff9900]" />
            <div>
              <p className="font-bold">Secure Payment</p>
              <p className="text-xs text-gray-400">Multiple options</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="w-10 h-10 text-[#ff9900]" />
            <div>
              <p className="font-bold">QR Tracking</p>
              <p className="text-xs text-gray-400">Real-time updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold mb-4">Get to Know Us</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                Press Releases
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                Blockchain Tech
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Connect with Us</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                Facebook
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                Twitter
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                Instagram
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Make Money with Us</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                Sell on Garment SCM
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                Become a Vendor
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                Advertise Products
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Let Us Help You</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                Your Account
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                Returns Centre
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                100% Authentic Guarantee
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#ff9900] hover:underline">
                Help
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 py-6 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Package className="w-5 h-5 text-[#ff9900]" />
          <span className="font-bold text-white">
            Garment<span className="text-[#ff9900]">SCM</span>
          </span>
        </div>
        <p>© 2025 Garment SCM. Powered by Blockchain Technology.</p>
      </div>
    </footer>
  )
}
