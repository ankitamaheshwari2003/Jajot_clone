"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const bestSellers = [
{
  id: 1,
  title: "Premium Running Shoes",
  price: "₹129",
  oldPrice: "₹169",
  rating: 4.9,
  image:
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
  tag: "Best Seller"
},
{
  id: 2,
  title: "Wireless Headphones",
  price: "₹89",
  oldPrice: "₹120",
  rating: 4.8,
  image:
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
  tag: "Trending"
},
{
  id: 3,
  title: "Luxury Smart Watch",
  price: "₹199",
  oldPrice: "₹249",
  rating: 4.9,
  image:
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
  tag: "Hot Deal"
},
{
  id: 4,
  title: "Modern Sunglasses",
  price: "₹59",
  oldPrice: "₹89",
  rating: 4.7,
  image:
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop",
  tag: "Popular"
}];




const cardMoods = [
"from-[#FF6B4A] to-[#C7391F]",
"from-[#1F8A8A] to-[#0E4D4D]",
"from-[#8A2C4E] to-[#3E0F22]",
"from-[#F5A623] to-[#B96A00]"];


export default function BestSellersSection() {
  return (
    <section className="w-full bg-[#f8f8f8] py-20 overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-3 sm:px-6 lg:px-10">
        {}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-14">
          <div>
            <p className="text-sm uppercase tracking-[5px] text-red-500 font-semibold mb-3">
              Top Products
            </p>

            <h2 className="text-4xl md:text-5xl font-extrabold text-black leading-tight">
              Best Sellers
            </h2>
          </div>

          <p className="text-gray-500 max-w-xl text-sm md:text-base leading-relaxed">
            Explore our most loved and highest-rated products picked by
            thousands of customers worldwide.
          </p>
        </div>

        {}
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {bestSellers.map((product, index) =>
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            className="group cursor-pointer">
            
              {}
              <div className="relative h-[300px] overflow-hidden rounded-[26px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.22)] transition-all duration-500">
                {}
                <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 639px) 50vw, (max-width: 1279px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700" />
              

                {}
                <div
                className={`absolute inset-0 bg-gradient-to-b ${cardMoods[index % cardMoods.length]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
                {}
                <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                {}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 shadow-sm">
                  <Star size={12} className="fill-orange-500 text-orange-500" />
                  <span className="text-xs font-semibold text-gray-800">
                    {product.rating}
                  </span>
                </div>

                {}
                <div className="absolute inset-x-0 bottom-0 px-4 pb-5 pt-1">
                  <p className="text-[11px] uppercase tracking-[2px] font-semibold text-white/70">
                    {product.tag}
                  </p>
                  <h3 className="mt-1 text-[16px] font-bold text-white truncate">
                    {product.title}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-white">
                      {product.price}
                    </span>
                    <span className="text-xs text-white/50 line-through">
                      {product.oldPrice}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}
