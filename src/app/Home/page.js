"use client";

import { useEffect, useState } from "react";
import BestSellersSection from "./BestSellersSection";
import Herosection from "./Herosection";
import OfferBannerSlider from "./Offerbannerslider";
import ProductGridSection from "./Productgrid";
import ProductSlider from "./ProductSlider";
import ShopByCategory from "./ShopByCategoryCards";
import TrendingProductsSection from "./TrendingProductSlider";

const API_BASE = "https://amazon-multi-vendor-3.onrender.com";
const FALLBACK_LIMIT = 12; // cart empty hone par max itne hi product lene hain
const PRIMARY_COUNT = 8; // pehle slider mein max itne products
const SECONDARY_COUNT = 4; // doosre slider mein max itne products

// Raw API product ko slider ke card-friendly shape mein convert karta hai
function getCategoryKey(p) {
  return typeof p.categoryId === "object" && p.categoryId !== null
    ? p.categoryId._id || p.categoryId.name || "uncategorized"
    : p.categoryId || "uncategorized";
}

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
    categoryKey: getCategoryKey(p),
    image
  };
}

export default function HomePage() {
  // Pehla slider: "Trending Collection"
  const [primaryProducts, setPrimaryProducts] = useState([]);
  // Dusra slider: cart categories ke hi baaki products (unique, overlap nahi)
  const [secondaryProducts, setSecondaryProducts] = useState([]);
  const [loadingSliders, setLoadingSliders] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCartBasedProducts() {
      const divid =
        typeof window !== "undefined" ? localStorage.getItem("deviceId") : null;

      setLoadingSliders(true);
      try {
        let hasCartData = false;
        let recJson = null;

        if (divid) {
          const recRes = await fetch(
            `${API_BASE}/api/cart/device/${divid}/recommendations`
          );
          recJson = await recRes.json();

          hasCartData =
            recJson?.success &&
            Array.isArray(recJson.data) &&
            recJson.data.length > 0 &&
            (recJson.cartCategories > 0 || recJson.cartSubcategories > 0);
        }

        let list = [];
        let cartHadItems = hasCartData;
        if (hasCartData) {
          // Cart mein items hain -> recommendations already cart ki
          // categories/subcategories ke hisaab se filtered aati hain
          list = recJson.data.map(normalizeProduct);
        } else {
          // Cart empty -> general products fallback
          const prodRes = await fetch(`${API_BASE}/api/products`);
          const prodJson = await prodRes.json();
          const raw = Array.isArray(prodJson?.data) ? prodJson.data : [];
          list = raw.slice(0, FALLBACK_LIMIT).map(normalizeProduct);
        }

        if (!cancelled) {
          if (cartHadItems) {
            // Category ke hisaab se group karo — jo category sabse
            // zyada products deti hai wo primary slider, baaki sab
            // categories ke products secondary slider mein
            const groups = {};
            list.forEach((p) => {
              if (!groups[p.categoryKey]) groups[p.categoryKey] = [];
              groups[p.categoryKey].push(p);
            });

            const sortedGroups = Object.values(groups).sort(
              (a, b) => b.length - a.length
            );
            const primaryGroup = sortedGroups[0] || [];
            const otherCategoryProducts = sortedGroups.slice(1).flat();

            setPrimaryProducts(primaryGroup.slice(0, PRIMARY_COUNT));
            setSecondaryProducts(otherCategoryProducts.slice(0, SECONDARY_COUNT));
          } else {
            // Cart empty -> fallback list, koi category-split nahi
            setPrimaryProducts(list.slice(0, PRIMARY_COUNT));
            setSecondaryProducts([]);
          }
        }
      } catch (err) {
        console.error("Failed to load homepage cart-based products:", err);
        if (!cancelled) {
          setPrimaryProducts([]);
          setSecondaryProducts([]);
        }
      } finally {
        if (!cancelled) setLoadingSliders(false);
      }
    }

    loadCartBasedProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <Herosection />
      <OfferBannerSlider />
      <ProductGridSection />

      <ProductSlider
        title="Trending Collection"
        products={primaryProducts}
        loading={loadingSliders} />


      {secondaryProducts.length > 0 &&
      <ProductSlider
        title="More From Your Cart's Categories"
        products={secondaryProducts}
        loading={loadingSliders} />
      }

      <TrendingProductsSection />

      <ShopByCategory />
      <BestSellersSection />
    </div>);

}