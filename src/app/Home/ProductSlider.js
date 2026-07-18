"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const DEVICE_ID = "25b673c2-d50c-41e8-94aa-5f86053254cc";
const API_BASE = "https://amazon-multi-vendor-3.onrender.com";
const FALLBACK_LIMIT = 12; // cart empty hone par max itne hi product lene hain

// Raw API product ko slider ke card-friendly shape mein convert karta hai
function normalizeProduct(p) {
  const category =
    typeof p.categoryId === "object" && p.categoryId !== null
      ? p.categoryId.name
      : p.brandName || p.productType || "Product";

  const image =
    Array.isArray(p.images) && p.images.length > 0
      ? p.images[0]
      : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop";

  return {
    id: p._id,
    title: p.productName || p.itemName || "Product",
    category,
    image
  };
}

export default function ProductSlider() {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardWidth = 220;

  const updateArrows = () => {
    const el = sliderRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  // Cart mein item ho -> recommendations API se data
  // Cart empty ho -> /api/products se (max FALLBACK_LIMIT products)
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      try {
        const recRes = await fetch(
          `${API_BASE}/api/cart/device/${DEVICE_ID}/recommendations`
        );
        const recJson = await recRes.json();

        const hasCartData =
          recJson?.success &&
          Array.isArray(recJson.data) &&
          recJson.data.length > 0 &&
          (recJson.cartCategories > 0 || recJson.cartSubcategories > 0);

        if (hasCartData) {
          if (!cancelled) {
            setProducts(recJson.data.map(normalizeProduct));
          }
          return;
        }

        // Cart empty -> fallback to general products list
        const prodRes = await fetch(`${API_BASE}/api/products`);
        const prodJson = await prodRes.json();
        const list = Array.isArray(prodJson?.data) ? prodJson.data : [];

        if (!cancelled) {
          setProducts(list.slice(0, FALLBACK_LIMIT).map(normalizeProduct));
        }
      } catch (err) {
        console.error("Failed to load slider products:", err);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

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
  }, [products]);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth"
    });
  };

  if (!loading && products.length === 0) {
    return null;
  }

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
              <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop";
              }}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            
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