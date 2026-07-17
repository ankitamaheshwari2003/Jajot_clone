"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Star } from "lucide-react";

const trendingProducts = [
{
  id: 1,
  title: "Nike Air Max",
  category: "Sneakers",
  price: "₹5,999",
  oldPrice: "₹8,999",
  image:
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 2,
  title: "Apple Watch Ultra",
  category: "Smart Watch",
  price: "₹79,999",
  oldPrice: "₹92,999",
  image:
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 3,
  title: "Gaming Headset",
  category: "Gaming",
  price: "₹2,499",
  oldPrice: "₹4,499",
  image:
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 4,
  title: "Sony Camera",
  category: "Photography",
  price: "₹54,999",
  oldPrice: "₹68,999",
  image:
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop"
}];




const cardMoods = [
"from-[#FF6B4A] to-[#C7391F]",
"from-[#4A5568] to-[#161A20]",
"from-[#F5A623] to-[#B96A00]",
"from-[#3A3F44] to-[#000000]"];


export default function TrendingProductsSection() {
  return (
    <section className="relative py-20 bg-[#faf7f2] overflow-hidden">
      {}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-orange-200/30 blur-[120px] rounded-full" />

      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-yellow-100/40 blur-[120px] rounded-full" />

      <div className="relative z-10 mx-auto w-full max-w-[1450px] px-3 sm:px-6 lg:px-10">
        {}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-orange-100 shadow-sm">
              <Flame size={15} className="text-orange-500" />

              <span className="text-xs tracking-[3px] text-orange-500 uppercase font-bold">
                Trending Products
              </span>
            </div>

            <h2 className="mt-2 text-[28px] lg:text-[42px] leading-none font-extrabold text-black">
              Explore Trending <br />
              Collections
            </h2>
          </div>

          <Link
            href="/shop"
            className="group flex items-center gap-2 text-gray-800 hover:text-orange-500 transition-all duration-300">
            
            <span className="text-sm font-semibold tracking-wide">
              View All Products
            </span>

            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-all duration-300" />
            
          </Link>
        </div>

        {}
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {trendingProducts.map((product, index) =>
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.1
            }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            className="group cursor-pointer">
            
              {}
              <div
              className={`relative h-[300px] overflow-hidden rounded-[26px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.22)] transition-all duration-500`}>
              
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
              
                <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                {}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 shadow-sm">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold text-gray-800">
                    {product.rating || "4.5"}
                  </span>
                </div>

                {}
                <div className="absolute inset-x-0 bottom-0 px-4 pb-5 pt-1">
                  <p className="text-[11px] uppercase tracking-[2px] font-semibold text-white/70">
                    {product.category}
                  </p>
                  <h3 className="mt-1 text-[16px] font-bold text-white truncate">
                    {product.title}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-[11px] uppercase tracking-wide text-white/60">
                      Just
                    </span>
                    <span className="text-lg font-extrabold text-white">
                      {product.price}
                    </span>
                    {product.oldPrice &&
                  <span className="text-xs text-white/50 line-through">
                        {product.oldPrice}
                      </span>
                  }
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}
