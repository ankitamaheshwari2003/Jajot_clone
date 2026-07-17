"use client";

import { useEffect, useState } from "react";
import { Star, ChevronLeft, Check } from "lucide-react";
import { getCategoryAttributes, priceRanges } from "../apis/filter/filter.js";


export const getSubCategoryName = (subcategory) =>
subcategory?.name || subcategory?.subcategory || subcategory?.title || "";

const getAttributeCode = (attribute) =>
String(attribute?.code || attribute?.name || "").
trim().
toLowerCase().
replace(/\s+/g, "_");


export default function ShopFilters({
  categoryId,
  categories,
  selectedCategory,
  filters,
  updateFilters,
  visibleSubCategories,
  showRating = true
}) {
  const [attributes, setAttributes] = useState([]);
  const [attrLoading, setAttrLoading] = useState(false);
  const [attrError, setAttrError] = useState(null);


  useEffect(() => {
    if (!categoryId) {
      setAttributes([]);
      return;
    }

    let cancelled = false;
    setAttrLoading(true);
    setAttrError(null);

    getCategoryAttributes(categoryId).
    then((data) => {
      if (!cancelled) setAttributes(data);
    }).
    catch((err) => {
      if (!cancelled) setAttrError(err.message);
    }).
    finally(() => {
      if (!cancelled) setAttrLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const selectedValues = (code) => {
    const value = filters.attributes?.[code];
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  };

  const toggleAttributeOption = (code, option) => {
    updateFilters((prev) => {
      const current = Array.isArray(prev.attributes?.[code]) ? prev.attributes[code] : [];
      const next = current.includes(option) ?
      current.filter((v) => v !== option) :
      [...current, option];

      const nextAttributes = { ...prev.attributes };

      if (next.length > 0) {
        nextAttributes[code] = next;
      } else {
        delete nextAttributes[code];
      }

      return {
        ...prev,
        attributes: nextAttributes
      };
    });
  };

  const setAttributeText = (code, value) => {
    updateFilters((prev) => ({
      ...prev,
      attributes: value.trim() ?
      { ...prev.attributes, [code]: value } :
      Object.fromEntries(
        Object.entries(prev.attributes || {}).filter(([key]) => key !== code)
      )
    }));
  };

  const selectPriceRange = (range) => {

    console.log("PRICE RANGE CLICKED", range);

    updateFilters((prev) => ({
      ...prev,
      price: range.label,
      minPrice: range.min,
      maxPrice: range.max
    }));
  };

  return (
    <div className="w-full max-w-[240px] text-[13px] text-zinc-800">
      {}
      <div className="pb-3">
        {selectedCategory === "All" ?
        <>
            <p className="mb-2 text-[15px] font-bold text-zinc-900">Category</p>
            <div className="flex flex-col">
              {categories.map((c) =>
            <button
              key={c}
              onClick={() =>
              updateFilters((p) => ({
                ...p,
                category: c,
                subcategory: "All",
                subcategoryId: ""
              }))
              }
              className="py-1 text-left text-[13px] text-blue-700 hover:text-orange-600 hover:underline">
              
                  {c}
                </button>
            )}
            </div>
          </> :

        <>
            <button
            onClick={() =>
            updateFilters((p) => ({
              ...p,
              category: "All",
              subcategory: "All",
              subcategoryId: ""
            }))
            }
            className="mb-2 flex items-center gap-0.5 text-[15px] font-bold text-zinc-900 hover:text-orange-600">
            
              <ChevronLeft size={16} className="shrink-0" />
              {selectedCategory}
            </button>

            {visibleSubCategories.length > 0 &&
          <div className="flex flex-col">
                {visibleSubCategories.map((subcategory) => {
              const name = getSubCategoryName(subcategory);
              const id = subcategory?._id || subcategory?.id || "";
              const active = filters.subcategory === name;

              return (
                <button
                  key={id || name}
                  onClick={() =>
                  updateFilters((p) => ({
                    ...p,
                    subcategory: name,
                    subcategoryId: id
                  }))
                  }
                  className={`py-1 text-left text-[13px] ${
                  active ?
                  "font-semibold text-zinc-900" :
                  "text-blue-700 hover:text-orange-600 hover:underline"}`
                  }>
                  
                      {name}
                    </button>);

            })}
              </div>
          }
          </>
        }
      </div>

     
      {attrLoading &&
      <div className="space-y-3 border-t border-zinc-200 pt-3 animate-pulse">
          <div className="h-3 w-16 rounded bg-zinc-200" />
          <div className="h-3 w-24 rounded bg-zinc-200" />
          <div className="h-3 w-20 rounded bg-zinc-200" />
        </div>
      }

      {attrError &&
      <p className="border-t border-zinc-200 pt-3 text-xs text-red-500">
          Could not load filters: {attrError}
        </p>
      }

      {!attrLoading &&
      attributes.map((attr) => {
        const code = getAttributeCode(attr);

        if (!code) return null;

        return (
          <div key={attr._id || code} className="border-t border-zinc-200 py-3">
            <p className="mb-2 text-[15px] font-bold text-zinc-900">{attr.name}</p>

            {(attr.type === "color" || attr.type === "dropdown") && attr.options?.length > 0 ?
            <div className="flex flex-col gap-2">
                {attr.options.map((option) => {
                const checked = selectedValues(code).includes(option);
                return (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 text-[13px] text-zinc-800">
                    
                      <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
                      checked ?
                      "border-zinc-900 bg-zinc-900" :
                      "border-zinc-400 bg-white"}`
                      }>
                      
                        {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                      </span>
                      <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAttributeOption(code, option)}
                      className="sr-only" />
                    
                      {attr.type === "color" &&
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-zinc-300"
                      style={{ backgroundColor: option }} />

                    }
                      <span className="capitalize">{option}</span>
                    </label>);

              })}
              </div> :

            <input
              type="text"
              value={filters.attributes?.[code] || ""}
              onChange={(e) => setAttributeText(code, e.target.value)}
              placeholder={`Search ${attr.name.toLowerCase()}`}
              className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-[13px] outline-none focus:border-zinc-900" />

            }
          </div>);

      })}

      {}
      <div className="border-t border-zinc-200 py-3">
        <p className="mb-2 text-[15px] font-bold text-zinc-900">Price</p>
        <div className="flex flex-col gap-2">
          {priceRanges.map((range) => {
            const checked = filters.price === range.label;
            return (
              <button
                type="button"
                key={range.label}
                onClick={() => selectPriceRange(range)}
                className="flex cursor-pointer items-center gap-2 text-left text-[13px] text-zinc-800">
                
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
                  checked ? "border-zinc-900 bg-zinc-900" : "border-zinc-400 bg-white"}`
                  }>
                  
                  {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                </span>
                {range.label}
              </button>);

          })}
        </div>
      </div>

      {}
      {showRating &&
      <div className="border-t border-zinc-200 py-3">
          <p className="mb-2 text-[15px] font-bold text-zinc-900">Customer Review</p>
          <div className="flex flex-col gap-2">
            {[4, 3, 2].map((r) => {
            const checked = filters.rating === r;
            return (
              <button
                type="button"
                key={r}
                onClick={() => updateFilters((p) => ({ ...p, rating: r }))}
                className="flex cursor-pointer items-center gap-2 text-left text-[13px] text-zinc-800">
                
                  <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
                  checked ? "border-zinc-900 bg-zinc-900" : "border-zinc-400 bg-white"}`
                  }>
                  
                    {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) =>
                  <Star
                    key={`${r}-star-${i + 1}`}
                    size={13}
                    className={i < r ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"} />

                  )}
                  </span>
                  <span>& Up</span>
                </button>);

          })}
          </div>
        </div>
      }
    </div>);

}
