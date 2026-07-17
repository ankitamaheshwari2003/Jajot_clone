"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const products = [
{
  id: 1,
  title: "Premium Headphones",
  category: "Audio",
  price: "₹2,499",
  oldPrice: "₹3,999",
  rating: 4.9,
  image:
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 2,
  title: "Luxury Smart Watch",
  category: "Wearables",
  price: "₹4,999",
  oldPrice: "₹6,999",
  rating: 4.8,
  image:
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 3,
  title: "Gaming Mouse",
  category: "Gaming",
  price: "₹1,299",
  oldPrice: "₹2,199",
  rating: 4.7,
  image:
  "https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 4,
  title: "Laptop Stand",
  category: "Accessories",
  price: "₹999",
  oldPrice: "₹1,499",
  rating: 4.6,
  image:
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 5,
  title: "Bluetooth Speaker",
  category: "Speaker",
  price: "₹3,499",
  oldPrice: "₹4,499",
  rating: 5.0,
  image:
  "https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 6,
  title: "Wireless Keyboard",
  category: "Accessories",
  price: "₹2,199",
  oldPrice: "₹3,099",
  rating: 4.5,
  image:
  "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 7,
  title: "DSLR Camera",
  category: "Photography",
  price: "₹52,999",
  oldPrice: "₹59,999",
  rating: 4.9,
  image:
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 8,
  title: "VR Headset",
  category: "Gaming",
  price: "₹12,499",
  oldPrice: "₹15,999",
  rating: 4.8,
  image:
  "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 9,
  title: "Premium Headphones",
  category: "Audio",
  price: "₹2,499",
  oldPrice: "₹3,999",
  rating: 4.9,
  image:
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 10,
  title: "Luxury Smart Watch",
  category: "Wearables",
  price: "₹4,999",
  oldPrice: "₹6,999",
  rating: 4.8,
  image:
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 11,
  title: "Gaming Mouse",
  category: "Gaming",
  price: "₹1,299",
  oldPrice: "₹2,199",
  rating: 4.7,
  image:
  "https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 12,
  title: "Laptop Stand",
  category: "Accessories",
  price: "₹999",
  oldPrice: "₹1,499",
  rating: 4.6,
  image:
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 13,
  title: "Bluetooth Speaker",
  category: "Speaker",
  price: "₹3,499",
  oldPrice: "₹4,499",
  rating: 5.0,
  image:
  "https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 14,
  title: "Wireless Keyboard",
  category: "Accessories",
  price: "₹2,199",
  oldPrice: "₹3,099",
  rating: 4.5,
  image:
  "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 15,
  title: "DSLR Camera",
  category: "Photography",
  price: "₹52,999",
  oldPrice: "₹59,999",
  rating: 4.9,
  image:
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop"
},
{
  id: 16,
  title: "VR Headset",
  category: "Gaming",
  price: "₹12,499",
  oldPrice: "₹15,999",
  rating: 4.8,
  image:
  "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1200&auto=format&fit=crop"
}];


export default function ProductSlider() {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const cardWidth = 220;

  const updateArrows = () => {
    const el = sliderRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    updateArrows();
    const el = sliderRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth"
    });
  };

  return (
    <section className="mx-auto my-8 max-w-[1450px] rounded-3xl bg-[#FDEDE0] px-3 py-7 sm:my-12 sm:px-6 sm:py-9 lg:px-10">
      {}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
       <h2 className="mt-2 text-[28px] lg:text-[42px] leading-none font-extrabold text-black">
          Trending Collection
        </h2>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="hidden sm:flex w-9 h-9 rounded-full bg-white border border-orange-200 items-center justify-center hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
            
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="hidden sm:flex w-9 h-9 rounded-full bg-white border border-orange-200 items-center justify-center hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
            
            <ChevronRight size={16} />
          </button>

          <button
            aria-label="See all"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FF7A1A] text-white flex items-center justify-center hover:bg-[#e86c0f] transition-colors duration-200 active:scale-95">
            
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {}
      <div
        ref={sliderRef}
        className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2">
        
        {products.map((product) =>
        <button
          key={product.id}
          className="text-left group flex-shrink-0 w-[42%] sm:w-[170px] snap-start">
          
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white">
              <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 639px) 42vw, 170px"
              className="object-cover group-hover:scale-105 transition-transform duration-300" />
            
            </div>

            <p className="mt-3 text-sm text-[#8a6a55] truncate">
              {product.category}
            </p>
            <p className="mt-0.5 text-sm font-bold text-[#3d2a1e] truncate">
              {product.title}
            </p>
          </button>
        )}
      </div>
    </section>);

}
