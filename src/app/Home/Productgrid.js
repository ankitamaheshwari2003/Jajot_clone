"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  Sparkles,
  Star } from
"lucide-react";

import { getCategories } from "../apis/category/category";
import { fetchFilteredProducts } from "../apis/products/products";


function extractCategoryList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.categories)) return payload.categories;
  return [];
}

function normalizeCategory(category) {
  if (!category) return null;
  return {
    id: category?._id || category?.id,
    name: category?.name || "Category",
    slug: category?.slug || "",
    description: category?.description || ""
  };
}

const STYLE_PRESETS = [
{ badge: "Trending", subtitle: "Handpicked for you", button: "Shop Now", bg: "bg-[#f4f7ff]" },
{ badge: "Popular", subtitle: "Customer favorites", button: "Explore", bg: "bg-[#fff6ef]" },
{ badge: "Hot Deals", subtitle: "Best value picks", button: "View Deals", bg: "bg-[#f4fff8]" },
{ badge: "New Arrival", subtitle: "Fresh additions", button: "Discover", bg: "bg-[#fff4fb]" }];


const VISIBLE_CATEGORY_COUNT = 4;
const PRODUCTS_PER_CATEGORY = 4;

function pickRandomCategories(categories, count) {
  const shuffled = [...categories].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function PremiumCategorySections() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSections() {
      try {
        const response = await getCategories();
        const categories = extractCategoryList(response?.data)
          .filter((category) => !category?.isDeleted && category?.status !== "inactive")
          .map(normalizeCategory)
          .filter((category) => category?.id);

        const randomCategories = pickRandomCategories(
          categories,
          VISIBLE_CATEGORY_COUNT
        );

        const builtSections = await Promise.all(
          randomCategories.map(async (category, index) => {
            const preset = STYLE_PRESETS[index % STYLE_PRESETS.length];

            let products = [];
            try {
              products = await fetchFilteredProducts({
                categoryId: category.id
              });
            } catch (error) {
              console.warn(
                "Products fetch failed for category:",
                category.name,
                error?.message
              );
            }

            const items = products.slice(0, PRODUCTS_PER_CATEGORY).map(
              (product, productIndex) => ({
                id: product.id || `${category.id}-${productIndex}`,
                name: product.name,
                image: product.image,
                price: `₹${Number(product.price || 0).toLocaleString("en-IN")}`
              })
            );

            return {
              id: category.id,
              badge: preset.badge,
              title: category.name,
              subtitle: category.description || preset.subtitle,
              button: preset.button,
              bg: preset.bg,
              href: category.slug ?
              `/shop?category=${category.slug}` :
              `/shop?categoryId=${category.id}`,
              items
            };
          })
        );

        if (isMounted) {
          setSections(builtSections.filter((section) => section.items.length > 0));
        }
      } catch (error) {
        console.warn("Categories fetch failed:", error?.message);
        if (isMounted) setSections([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSections();

    return () => {
      isMounted = false;
    };
  }, []);

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

          {isLoading &&
          Array.from({ length: VISIBLE_CATEGORY_COUNT }).map((_, index) =>
          <div
            key={`skeleton-${index}`}
            className="rounded-[28px] p-3.5 border border-black/5 bg-white/60 animate-pulse h-[340px]" />

          )}

          {!isLoading && sections.map((section) =>
          <div
            key={section.id}
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
                key={item.id}
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
              href={section.href}
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