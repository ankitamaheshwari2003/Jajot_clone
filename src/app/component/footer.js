"use client";

import Link from "next/link";

import {
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones } from
"lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube } from
"react-icons/fa";

export default function EcommerceFooter() {
  return (
    <footer className="bg-[#131921] text-white mt-20 border-t border-white/10">
      {}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
            {
              icon: Truck,
              title: "Free Delivery",
              desc: "Free shipping all over India"
            },
            {
              icon: ShieldCheck,
              title: "Secure Payment",
              desc: "100% secure payment"
            },
            {
              icon: CreditCard,
              title: "Easy Returns",
              desc: "10 days return policy"
            },
            {
              icon: Headphones,
              title: "24/7 Support",
              desc: "Dedicated support"
            }].
            map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-2xl p-5 flex items-start gap-4">
                  
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-orange-400" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-400 mt-1 leading-6">
                      {item.desc}
                    </p>
                  </div>
                </div>);

            })}
          </div>
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-xl font-bold">
                J
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Jajot Store
                </h2>

                <p className="text-sm text-gray-400">
                  Premium Shopping Experience
                </p>
              </div>
            </div>

            <p className="text-gray-400 mt-6 text-sm leading-7 max-w-md">
              Discover the best fashion, electronics, lifestyle,
              accessories, and trending products at unbeatable
              prices with fast delivery and secure shopping.
            </p>

            {}
            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <MapPin className="w-5 h-5 text-orange-400" />
                Merta, Rajasthan, India
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Phone className="w-5 h-5 text-orange-400" />
                +91 98765 43210
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Mail className="w-5 h-5 text-orange-400" />
                support@jajotstore.com
              </div>
            </div>

            {}
            <div className="flex items-center gap-4 mt-8">
              {[
              FaFacebookF,
              FaInstagram,
              FaTwitter,
              FaYoutube].
              map((Icon) =>
              <button
                key={Icon.displayName || Icon.name}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-orange-500 hover:scale-110 transition-all duration-300 flex items-center justify-center">
                
                  <Icon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {}
          <div>
            <h3 className="text-lg font-semibold mb-6">
              Quick Links
            </h3>

            <ul className="space-y-4">
              {[
              "Home",
              "Shop",
              "Categories",
              "Deals",
              "New Arrivals",
              "Contact"].
              map((item) =>
              <li key={item}>
                  <Link
                  href="/"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-all duration-300">
                  
                    <ChevronRight className="w-4 h-4" />
                    {item}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {}
          <div>
            <h3 className="text-lg font-semibold mb-6">
              Customer Service
            </h3>

            <ul className="space-y-4">
              {[
              "My Account",
              "Track Order",
              "Wishlist",
              "Returns",
              "Shipping Policy",
              "Privacy Policy"].
              map((item) =>
              <li key={item}>
                  <Link
                  href="/"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-all duration-300">
                  
                    <ChevronRight className="w-4 h-4" />
                    {item}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {}
          <div>
            <h3 className="text-lg font-semibold mb-6">
              Newsletter
            </h3>

            <p className="text-sm text-gray-400 leading-6 mb-5">
              Subscribe to get updates on new arrivals,
              discounts and special offers.
            </p>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 text-sm outline-none focus:border-orange-500" />
              

              <button className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 transition-all duration-300 font-semibold">
                Subscribe Now
              </button>
            </div>

          </div>
        </div>
      </div>

      {}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 text-center md:text-left">
            © 2026 Jajot Store. All Rights Reserved.
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link
              href="/"
              className="hover:text-orange-400 transition-all">
              
              Terms
            </Link>

            <Link
              href="/"
              className="hover:text-orange-400 transition-all">
              
              Privacy
            </Link>

            <Link
              href="/"
              className="hover:text-orange-400 transition-all">
              
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>);

}