"use client";

import Link from "next/link";
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  Sparkles,
  Star } from
"lucide-react";

const sections = [
{
  badge: "Trending",
  title: "Gaming Setup",
  subtitle: "Premium accessories collection",
  button: "Shop Now",
  bg: "bg-[#f4f7ff]",
  items: [
  {
    name: "Gaming Chair",
    image:
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1000&auto=format&fit=crop",
    price: "$299"
  },
  {
    name: "RGB Keyboard",
    image:
    "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000&auto=format&fit=crop",
    price: "$149"
  },
  {
    name: "Gaming Mouse",
    image:
    "https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1000&auto=format&fit=crop",
    price: "$89"
  },
  {
    name: "4K Monitor",
    image:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop",
    price: "$499"
  }]

},

{
  badge: "Luxury",
  title: "Modern Decor",
  subtitle: "Minimal premium interiors",
  button: "Explore",
  bg: "bg-[#fff6ef]",
  items: [
  {
    name: "Luxury Sofa",
    image:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1000&auto=format&fit=crop",
    price: "$799"
  },
  {
    name: "Designer Lamp",
    image:
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1000&auto=format&fit=crop",
    price: "$199"
  },
  {
    name: "Wood Table",
    image:
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1000&auto=format&fit=crop",
    price: "$259"
  },
  {
    name: "Modern Interior",
    image:
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop",
    price: "$399"
  }]

},

{
  badge: "Hot Deals",
  title: "Smart Home",
  subtitle: "Upgrade your home setup",
  button: "View Deals",
  bg: "bg-[#f4fff8]",
  items: [
  {
    name: "Air Conditioner",
    image:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop",
    price: "$599"
  },
  {
    name: "Microwave",
    image:
    "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=1000&auto=format&fit=crop",
    price: "$129"
  },
  {
    name: "Washing Machine",
    image:
    "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=1000&auto=format&fit=crop",
    price: "$349"
  },
  {
    name: "Refrigerator",
    image:
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1000&auto=format&fit=crop",
    price: "$899"
  }]

},

{
  badge: "New Arrival",
  title: "Fashion Wear",
  subtitle: "Trending styles collection",
  button: "Discover",
  bg: "bg-[#fff4fb]",
  items: [
  {
    name: "Luxury Watch",
    image:
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop",
    price: "$499"
  },
  {
    name: "Sneakers",
    image:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
    price: "$179"
  },
  {
    name: "Perfume",
    image:
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop",
    price: "$89"
  },
  {
    name: "Fashion Wear",
    image:
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop",
    price: "$129"
  }]

}];


const trendingProducts = [
{
  title: "Gaming Mouse",
  category: "Electronics",
  image:
  "https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1000&auto=format&fit=crop",
  price: "$89",
  bg: "bg-[#f4f7ff]"
},
{
  title: "Sneakers",
  category: "Fashion",
  image:
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
  price: "$179",
  bg: "bg-[#fff6ef]"
},
{
  title: "Luxury Lamp",
  category: "Decor",
  image:
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1000&auto=format&fit=crop",
  price: "$149",
  bg: "bg-[#f4fff8]"
},
{
  title: "Smart Watch",
  category: "Lifestyle",
  image:
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
  price: "$249",
  bg: "bg-[#fff4fb]"
}];


export default function PremiumCategorySections() {
  return (
    <div className="bg-[#eceff1] py-6 lg:py-8">

      <div className="max-w-[1450px] mx-auto px-3 sm:px-6 lg:px-10">

        {}
        <div className="flex items-end justify-between mb-5">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-500">
              Premium Collections
            </p>

            <h2 className="mt-2 text-[28px] lg:text-[42px] leading-none font-extrabold text-black">
              Discover Categories
            </h2>
          </div>
          <button className="hidden lg:flex items-center gap-2 h-10 px-4 rounded-xl bg-black text-white text-[12px] font-semibold hover:bg-orange-500 transition-all duration-300">
            View All
            <ArrowRight size={14} />
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {sections.map((section) =>
          <div
            key={section.title}
            className={`group relative overflow-hidden rounded-[28px] p-3.5 border border-black/5 ${section.bg}
              shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300`}>
            

              <div className="flex items-start justify-between mb-3">

                <div>
                  <span className="inline-flex items-center gap-1 bg-white text-black text-[8px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full">
                    <Sparkles size={8} />
                    {section.badge}
                  </span>

                  <h3 className="mt-2.5 text-[22px] leading-none font-extrabold text-black">
                    {section.title}
                  </h3>

                  <p className="mt-1 text-[11px] text-gray-500">
                    {section.subtitle}
                  </p>
                </div>

                <button className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Heart size={12} />
                </button>
              </div>

              {}
              <div className="grid grid-cols-2 gap-2.5">

                {section.items.map((item) =>
              <div
                key={item.name}
                className="group/item">
                
                    <div className="overflow-hidden rounded-[18px] bg-white border border-black/5">

                      {}
                      <div className="relative aspect-square overflow-hidden">

                        <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover/item:scale-105 transition-all duration-500" />
                    

                        <button className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                          <Heart size={10} />
                        </button>

                        <button className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center opacity-0 translate-y-2 group-hover/item:opacity-100 group-hover/item:translate-y-0 transition-all duration-300 hover:bg-orange-500">
                          <ShoppingBag size={11} />
                        </button>
                      </div>

                      {}
                      <div className="p-2">

                        <h4 className="text-[11px] font-semibold text-black line-clamp-1">
                          {item.name}
                        </h4>

                        <div className="flex items-center gap-[1px] mt-1">
                          {[1, 2, 3, 4, 5].map((i) =>
                      <Star
                        key={i}
                        size={7}
                        className="fill-orange-400 text-orange-400" />

                      )}
                        </div>

                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-[13px] font-extrabold text-black">
                            {item.price}
                          </span>

                          <span className="text-[8px] font-bold text-green-600">
                            Stock
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
              </div>

              {}
              <Link
              href="/shop"
              className="mt-3 h-9 rounded-[14px] bg-black text-white flex items-center justify-between px-3.5 text-[11px] font-bold hover:bg-orange-500 transition-all duration-300">
              
                {section.button}

                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>

        
      </div>
    </div>);

}