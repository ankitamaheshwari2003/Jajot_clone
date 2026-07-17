"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const categories = [
{
  id: 1,
  title: "Sneakers",
  items: "120+ Products",
  image:
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1400&auto=format&fit=crop",
  className: "xl:col-span-2 xl:row-span-2"
},

{
  id: 2,
  title: "Watches",
  items: "80+ Products",
  image:
  "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1400&auto=format&fit=crop"
},

{
  id: 3,
  title: "Headphones",
  items: "60+ Products",
  image:
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1400&auto=format&fit=crop"
},

{
  id: 4,
  title: "Fashion",
  items: "200+ Products",
  image:
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1400&auto=format&fit=crop",
  className: "xl:col-span-2"
}];




const bottomCategories = [
{
  id: 5,
  title: "Gaming",
  items: "95+ Products",
  image:
  "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1400&auto=format&fit=crop",
  special: true
},

{
  id: 6,
  title: "Perfumes",
  items: "40+ Products",
  image:
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1400&auto=format&fit=crop"
},


{
  id: 7,
  title: "Luxury Collection",
  items: "500+ Premium Products",
  image:
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1400&auto=format&fit=crop"
}];


function CategoryCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.05
      }}
      viewport={{ once: true }}
      className={`group relative overflow-hidden rounded-[28px] bg-white border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] cursor-pointer ${item.className || ""}`}>
      

      {}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-all duration-700" />
        
      </div>

      {}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xl">

        <span className="text-[10px] uppercase tracking-[2px] font-semibold text-[#111]">
          Trending
        </span>
      </div>

      {}
      <div className="absolute bottom-0 left-0 w-full p-5">

        <div className="flex items-end justify-between gap-3">

          <div>
            <p className="text-white/70 text-xs font-medium">
              {item.items}
            </p>

            <h3 className="mt-1 text-2xl font-extrabold tracking-[-1px] text-white">
              {item.title}
            </h3>
          </div>

          {}
          <div className="w-11 h-11 rounded-xl bg-white text-[#111] flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-lg">

            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>

      {}
      <div className="absolute -bottom-16 -right-16 w-[140px] h-[140px] rounded-full bg-orange-500/20 blur-[70px] opacity-0 group-hover:opacity-100 transition-all duration-500" />
    </motion.div>);

}

export default function ShopByCategory() {
  return (
    <section className="w-full py-8 bg-[#f5f5f5]">
      <div className="max-w-[1450px] mx-auto px-3 sm:px-6 lg:px-10">

        {}
        <div className="flex items-end justify-between mb-6">

          <div>
            <span className="text-[11px] uppercase tracking-[3px] font-semibold text-orange-500">
              Categories
            </span>

            <h2 className="mt-2 text-2xl md:text-4xl font-extrabold tracking-[-2px] text-[#111]">
              Shop By Category
            </h2>
          </div>

          <button className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#111] hover:text-orange-500 transition-all">
            View All

            <ArrowUpRight size={17} />
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 auto-rows-[260px] gap-4">
          {categories.map((item, index) =>
          <CategoryCard key={item.id} item={item} index={index} />
          )}
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[260px] gap-4 mt-4">
          {bottomCategories.map((item, index) =>
          <CategoryCard
            key={item.id}
            item={item}
            index={categories.length + index} />

          )}
        </div>
      </div>
    </section>);

}
