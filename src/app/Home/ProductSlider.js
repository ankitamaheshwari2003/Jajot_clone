"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { BASE_URL } from "../apis/baseurl/baseurl";

const FALLBACK_LIMIT = 12;
const MIN_DISPLAY_CARDS = 6;
const PLACEHOLDER_TEXTS = [
  "Explore More",
  "Fresh Arrivals Soon",
  "Just For You",
  "New Products Loading"
];

// Converts a raw backend product into the card shape used by the slider.
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
    image,
    isDummy: false
  };
}

// Pads short product lists with placeholder cards so the slider layout stays filled.
function padWithDummyCards(list) {
  if (list.length >= MIN_DISPLAY_CARDS || list.length === 0) return list;

  const padded = [...list];
  let dummyIndex = 0;
  while (padded.length < MIN_DISPLAY_CARDS) {
    padded.push({
      id: `dummy-${dummyIndex}`,
      isDummy: true,
      placeholderText: PLACEHOLDER_TEXTS[dummyIndex % PLACEHOLDER_TEXTS.length]
    });
    dummyIndex += 1;
  }
  return padded;
}

export default function ProductSlider({
  title = "Trending Collection",
  products: externalProducts,
  loading: externalLoading
}) {
  const sliderRef = useRef(null);
  const router = useRouter();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Uses parent-provided products when the slider is rendered with external data.
  const usingExternalData = externalProducts !== undefined;
  const [products, setProducts] = useState(externalProducts ?? []);
  const [loading, setLoading] = useState(
    usingExternalData ? !!externalLoading : true
  );

  const cardWidth = 220;

  const updateArrows = () => {
    const el = sliderRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  // Syncs slider state when parent-provided products or loading status changes.
  useEffect(() => {
    if (!usingExternalData) return;
    queueMicrotask(() => {
      setProducts(externalProducts);
      setLoading(!!externalLoading);
    });
  }, [usingExternalData, externalProducts, externalLoading]);

  // Loads standalone slider products from cart recommendations or the general product API.
  useEffect(() => {
    if (usingExternalData) return;

    let cancelled = false;

    async function loadProducts() {
      const divid =
        typeof window !== "undefined" ? localStorage.getItem("deviceId") : null;

      setLoading(true);
      try {
        if (!divid) {
          // Falls back to general products when no device id exists.
          const prodRes = await fetch(`${BASE_URL}/products`);
          const prodJson = await prodRes.json();
          const list = Array.isArray(prodJson?.data) ? prodJson.data : [];

          if (!cancelled) {
            setProducts(list.slice(0, FALLBACK_LIMIT).map(normalizeProduct));
          }
          return;
        }

        const recRes = await fetch(
          `${BASE_URL}/cart/device/${divid}/recommendations`
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

        // Falls back to general products when recommendations are empty.
        const prodRes = await fetch(`${BASE_URL}/products`);
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
  }, [usingExternalData]);

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

  // Navigates to the selected product detail page.
  const goToProduct = (product) => {
    router.push(`/ProductDetailpage/${product.id}`);
  };

  if (!loading && products.length === 0) {
    return null;
  }

  const displayProducts = padWithDummyCards(products);

  return (
    <section className="mx-auto my-8 max-w-[1450px] rounded-3xl bg-[#FDEDE0] px-3 py-7 sm:my-12 sm:px-6 sm:py-9 lg:px-10">
      {}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
       <h2 className="mt-2 text-[28px] lg:text-[42px] leading-none font-extrabold text-black">
          {title}
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

         
        </div>
      </div>

      {}
      <div
        ref={sliderRef}
        className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2">
        
        {displayProducts.map((product) =>
        product.isDummy ? (
          // Renders a placeholder card when there are not enough real products.
          <div
            key={product.id}
            className="flex-shrink-0 w-[42%] sm:w-[170px] snap-start">
            
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white border border-dashed border-orange-200 flex items-center justify-center">
              <span
                className="coming-soon-radiant text-[12px] font-extrabold uppercase tracking-wider text-center px-3 leading-snug"
                style={{
                  color: "#f97316",
                  textShadow:
                    "0 0 4px rgba(249,115,22,0.9), 0 0 10px rgba(249,115,22,0.7), 0 0 18px rgba(249,115,22,0.5), 0 0 28px rgba(249,115,22,0.35)"
                }}>
                {product.placeholderText}
              </span>
            </div>

            <div className="mt-3 h-[10px] w-1/2 rounded bg-white/60" />
            <div className="mt-1.5 h-[10px] w-2/3 rounded bg-white/60" />
          </div>
        ) : (
        <button
          key={product.id}
          onClick={() => goToProduct(product)}
          className="text-left group flex-shrink-0 w-[42%] sm:w-[170px] snap-start cursor-pointer">
          
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
        )
        )}
      </div>

      <style>{`
        .coming-soon-radiant {
          animation: radiant-pulse 1.6s ease-in-out infinite;
        }
        @keyframes radiant-pulse {
          0%, 100% {
            opacity: 0.75;
            text-shadow: 0 0 4px rgba(249,115,22,0.7), 0 0 10px rgba(249,115,22,0.5), 0 0 16px rgba(249,115,22,0.35);
          }
          50% {
            opacity: 1;
            text-shadow: 0 0 8px rgba(249,115,22,1), 0 0 18px rgba(249,115,22,0.85), 0 0 32px rgba(249,115,22,0.6), 0 0 46px rgba(249,115,22,0.4);
          }
        }
      `}</style>
    </section>);

}
