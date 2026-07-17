"use client";

import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  ArrowRight } from
"lucide-react";

import { motion } from "framer-motion";

const products = [
{
  id: 1,
  title: "iPhone 17 Pro Max",
  image:
  "https://api.thechennaimobiles.com/1758050128214.png",
  price: "₹1,59,999",
  oldPrice: "₹1,79,999",
  rating: "4.9",
  badge: "Best Seller"
},

{
  id: 2,
  title: "iPhone 17 Pro",
  image:
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLfrAzhgZrl4GbSU0kWScq0IaizlJzuTnmIA&s",
  price: "₹1,39,999",
  oldPrice: "₹1,49,999",
  rating: "4.8",
  badge: "New"
},

{
  id: 3,
  title: "iPhone 17 Air",
  image:
  "https://cf-img-a-in.tosshub.com/sites/visualstory/wp/2024/12/GeMXI_GWMAAfoGHITG-1734513959372.jpg?size=*:900",
  price: "₹1,09,999",
  oldPrice: "₹1,24,999",
  rating: "4.7",
  badge: "Trending"
},

{
  id: 4,
  title: "iPhone 17",
  image:
  "https://inventstore.in/wp-content/uploads/2025/09/lavendar-scaled.webp",
  price: "₹89,999",
  oldPrice: "₹99,999",
  rating: "4.8",
  badge: "Hot"
}];


export default function RelatedProducts() {
  return (
    <section className="py-10 sm:py-12 bg-[#f6f6f7] overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8">
        {}

        <div className="flex items-center justify-between mb-7 sm:mb-9">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-2">
              Apple Collection
            </p>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-black">
              iPhone 17 Series
            </h2>
          </div>

          <button className="hidden md:flex items-center gap-2 text-sm font-semibold text-black transition-all">
            View All
            <ArrowRight size={16} />
          </button>
        </div>

        {}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product, index) =>
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.45,
              delay: index * 0.08
            }}
            className="group relative overflow-hidden rounded-[28px] bg-white border border-gray-200 transition-all duration-300">
            
              {}

              <div className="absolute top-4 left-4 z-20">
                <span className="px-3 py-1 rounded-full bg-black text-white text-[11px] font-bold">
                  {product.badge}
                </span>
              </div>

              {}

              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:translate-x-4 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300">
                <button className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-black hover:text-white transition-all">
                  <Heart size={15} />
                </button>

                <button className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-black hover:text-white transition-all">
                  <Eye size={15} />
                </button>
              </div>

              {}

              <div className="relative bg-[#f8f8f8] overflow-hidden h-[260px] sm:h-[280px] flex items-center justify-center">
                <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-contain sm:object-cover" />
              
              </div>

              {}

              <div className="p-4 sm:p-5">
                {}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star
                    size={14}
                    fill="currentColor"
                    className="text-yellow-500" />
                  

                    <span className="text-sm font-semibold text-gray-700">
                      {product.rating}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-green-600">
                    In Stock
                  </span>
                </div>

                {}

                <h3 className="text-[18px] sm:text-[19px] font-bold text-black leading-tight">
                  {product.title}
                </h3>

                {}

                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <span className="text-[30px] sm:text-[28px] font-black tracking-tight text-black">
                    {product.price}
                  </span>

                  <span className="text-sm text-gray-400 line-through">
                    {product.oldPrice}
                  </span>
                </div>

                {}

                <p className="text-sm text-gray-500 mt-3 leading-6">
                  Titanium finish with ultra cameras and next-gen Apple
                  performance.
                </p>

                {}

                <div className="flex gap-2 mt-5">
                  <button className="flex-1 h-12 rounded-2xl bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all">
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>

                  <button className="w-12 h-12 rounded-2xl border border-gray-200 bg-white flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all">
                    <Heart size={17} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {}

        <button className="md:hidden mt-6 w-full h-12 rounded-2xl border border-gray-200 bg-white font-semibold flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all">
          View All Products
          <ArrowRight size={16} />
        </button>
      </div>
    </section>);

}
