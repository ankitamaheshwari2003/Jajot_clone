"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Star,
  Heart,
  Eye,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Grid2X2 } from
"lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCategories } from "../apis/category/category";
import { fetchFilteredProducts } from "../apis/products/products";
import { getCategoryAttributes } from "../apis/filter/filter";
import { getCartDeviceId } from "../apis/cart/cart";
import { getLoggedInCid } from "../apis/customer/customer";
import {
  createWishlistItem,
  deleteWishlistItem,
  getWishlistByCidOrDevice } from
"../apis/wishlist/wishlist";
import { ProductGridSkeleton } from "../component/PageSkeleton";
import ShopFilters, { getSubCategoryName } from "./Attributefilter";
import { fetchBannerProducts, getProductsFromBannerDetail } from "../apis/banners/banners";

const PRODUCTS_PER_PAGE = 20;

const STAR_KEYS = ["star-1", "star-2", "star-3", "star-4", "star-5"];

const getApiList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.subcategories)) return payload.subcategories;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.categories)) return payload.data.categories;
  if (Array.isArray(payload?.data?.subcategories)) return payload.data.subcategories;
  return [];
};

const getWishlistList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.wishlist)) return payload.wishlist;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const getWishlistProductId = (item) =>
item?.pid && typeof item.pid === "object" ?
item.pid._id :
item?.pid || item?.productId || null;

const getLocalWishlistProductId = (item) =>
item?.id || getWishlistProductId(item);

const compareIds = (a, b) => a.localeCompare(b);

const haveSameWishlistProducts = (first = [], second = []) => {
  const firstIds = first.map((item) => String(getLocalWishlistProductId(item))).sort(compareIds);
  const secondIds = second.map((item) => String(getLocalWishlistProductId(item))).sort(compareIds);

  return (
    firstIds.length === secondIds.length &&
    firstIds.every((id, index) => id === secondIds[index]));

};

const DUMMY_IMAGE_MARKERS = [
  "dummyimage",
  "placeholder",
  "placehold.co",
  "no-image",
  "noimage",
  "default-product",
  "dummy-product"
];

const isUsableProductImage = (image) => {
  const src = String(image || "").trim();
  if (!src) return false;

  const lowerSrc = src.toLowerCase();
  return !DUMMY_IMAGE_MARKERS.some((marker) => lowerSrc.includes(marker));
};

const getProductImage = (item) => {
  const images = [
    item?.image,
    item?.thumbnail,
    ...(Array.isArray(item?.images) ? item.images : [])
  ];

  return images.find(isUsableProductImage) || "";
};

const normalizeProduct = (item) => {
  if (!item || typeof item !== "object") return item;

  const id = item.id ?? item._id ?? item.productId ?? null;

  return {
    ...item,
    id,
    rating: typeof item.rating === "number" ? item.rating : Number(item.rating) || 0,
    price: typeof item.price === "number" ? item.price : Number(item.price) || 0,
    image: getProductImage(item)
  };
};


const extractName = (value, namesById) => {
  if (!value) return "";
  if (typeof value === "object") {
    return value.name || value.category || value.title || "";
  }
  return namesById[value] || value;
};

const normalizeFilterKey = (value) =>
String(value || "").
trim().
toLowerCase().
replace(/\s+/g, "_");

const normalizeFilterValue = (value) =>
String(value || "").trim().toLowerCase();

const getProductAttributeValues = (product, code) => {
  const normalizedCode = normalizeFilterKey(code);
  const groups = [
  product?.attributes,
  ...(Array.isArray(product?.variants) ?
  product.variants.map((variant) => variant?.attributes) :
  [])];


  return groups.
  filter(Array.isArray).
  flatMap((attributes) =>
  attributes.
  filter((attribute) => {
    const attributeCode = normalizeFilterKey(attribute?.code || attribute?.name);
    return attributeCode === normalizedCode;
  }).
  map((attribute) => normalizeFilterValue(attribute?.value)).
  filter(Boolean)
  );
};

const matchesAttributeFilters = (product, attributes = {}) =>
Object.entries(attributes).every(([code, selected]) => {
  const selectedValues = (Array.isArray(selected) ? selected : [selected]).
  map(normalizeFilterValue).
  filter(Boolean);

  if (selectedValues.length === 0) return true;

  const productValues = getProductAttributeValues(product, code);
  if (productValues.length === 0) return false;

  return selectedValues.some((selectedValue) =>
  productValues.some(
    (productValue) =>
    productValue === selectedValue || productValue.includes(selectedValue)
  )
  );
});

// --- Subcategory helpers extracted out of the useEffect to reduce cognitive complexity (S3776) ---

const extractSubCategoryInfo = (attribute) => {
  const rawSubcategory =
  attribute?.subcategoryId ||
  attribute?.subcategory ||
  attribute?.subCategory ||
  attribute?.subtosubcategoryId;

  const id =
  typeof rawSubcategory === "object" ?
  rawSubcategory?._id || rawSubcategory?.id :
  rawSubcategory;

  const name =
  (typeof rawSubcategory === "object" ?
  getSubCategoryName(rawSubcategory) :
  "") ||
  attribute?.subcategoryName ||
  attribute?.subCategoryName ||
  attribute?.subtosubcategoryName ||
  "";

  return { id, name, categoryId: attribute?.categoryId };
};

const buildUniqueSubCategories = (attributes) => {
  const uniqueSubCategories = new Map();

  attributes.forEach((attribute) => {
    const { id, name, categoryId } = extractSubCategoryInfo(attribute);

    if (id && name && !uniqueSubCategories.has(id)) {
      uniqueSubCategories.set(id, { _id: id, id, name, categoryId });
    }
  });

  return Array.from(uniqueSubCategories.values());
};

const buildSubCategoryNamesById = (list) =>
list.reduce((map, subcategory) => {
  const id = subcategory?._id || subcategory?.id;
  const name = getSubCategoryName(subcategory);

  if (id && name) {
    map[id] = name;
  }

  return map;
}, {});

// --- Stock status helper: replaces triple-nested ternaries (S3358) ---
const getStockStatus = (stock) => {
  if (stock == null) {
    return {
      dotClass: "bg-zinc-400",
      textClass: "text-zinc-500",
      label: "Stock not listed"
    };
  }

  if (stock > 0) {
    return {
      dotClass: "bg-green-500",
      textClass: "text-green-700",
      label: `In stock (${stock})`
    };
  }

  return {
    dotClass: "bg-red-500",
    textClass: "text-red-600",
    label: "Out of stock"
  };
};


const buildProductApiFilters = ({
  activeCategoryId,
  subcategoryId,
  subtosubcategoryId,
  vendorId,
  minPrice,
  maxPrice,
  search,
  attributes
}) => {
  const apiFilters = {};

  if (activeCategoryId) apiFilters.categoryId = activeCategoryId;
  if (subcategoryId) apiFilters.subcategoryId = subcategoryId;
  if (subtosubcategoryId) apiFilters.subtosubcategoryId = subtosubcategoryId;
  if (vendorId) apiFilters.vendorId = vendorId;
  if (minPrice != null) apiFilters.minPrice = minPrice;
  if (maxPrice != null) apiFilters.maxPrice = maxPrice;
  if (search) apiFilters.search = search;
  if (attributes && Object.keys(attributes).length > 0) {
    apiFilters.attributes = attributes;
  }

  return apiFilters;
};

const fetchShopProducts = async ({
  bannerId,
  activeCategoryId,
  subcategoryId,
  subtosubcategoryId,
  vendorId,
  minPrice,
  maxPrice,
  search,
  attributes
}) => {
  if (bannerId) {
    const response = await fetchBannerProducts(bannerId);
    const bannerProducts = getProductsFromBannerDetail(response).map(normalizeProduct);

    return {
      products: bannerProducts,
      errorMessage:
        bannerProducts.length === 0
          ? response?.message || "No products available for this offer right now."
          : ""
    };
  }

  const apiFilters = buildProductApiFilters({
    activeCategoryId,
    subcategoryId,
    subtosubcategoryId,
    vendorId,
    minPrice,
    maxPrice,
    search,
    attributes
  });
  const apiProducts = await fetchFilteredProducts(apiFilters);

  return {
    products: apiProducts.length > 0 ? apiProducts : [],
    errorMessage:
      apiProducts.length > 0
        ? ""
        : "No products found from the server for this filter."
  };
};

export default function ShopPage() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "All";
  const subcategoryFromUrl = searchParams.get("subcategory") || "All";
  const searchFromUrl = searchParams.get("search") || "";
  const bannerIdFromUrl = searchParams.get("bannerId") || "";
  const vendorIdFromUrl = searchParams.get("vendorId") || "";

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [categories, setCategories] = useState(["All"]);
  const [categoryNamesById, setCategoryNamesById] = useState({});
  const [categoryIdsByName, setCategoryIdsByName] = useState({});
  const [subCategoryNamesById, setSubCategoryNamesById] = useState({});
  const [subCategories, setSubCategories] = useState([]);
  const [wishlistItems, setWishlistItems] = useState(() => {
    if (typeof window === "undefined") return [];

    const savedItems = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
    return Array.isArray(savedItems) ? savedItems : [];
  });

  const [filters, setFilters] = useState({
    category: "All",
    subcategory: "All",
    subcategoryId: "",
    subtosubcategoryId: "",
    price: "All",
    minPrice: undefined,
    maxPrice: undefined,
    rating: 0,
    attributes: {}
  });

  const [openFilter, setOpenFilter] = useState(false);
  const [view, setView] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      category: categoryFromUrl,
      subcategory: subcategoryFromUrl,
      subcategoryId: "",
      subtosubcategoryId: ""
    }));
  }, [categoryFromUrl, searchFromUrl, subcategoryFromUrl]);

  const getCategoryName = useCallback(
    (category) => extractName(category, categoryNamesById),
    [categoryNamesById]
  );

  const getSubCategoryDisplayName = useCallback(
    (subcategory) => extractName(subcategory, subCategoryNamesById),
    [subCategoryNamesById]
  );

  const selectedCategory = filters.category || "All";
  const activeCategoryId =
  selectedCategory !== "All" ?
  categoryIdsByName[selectedCategory.toLowerCase()] || null :
  null;

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError("");

        const result = await fetchShopProducts({
          bannerId: bannerIdFromUrl,
          activeCategoryId,
          subcategoryId: filters.subcategoryId,
          subtosubcategoryId: filters.subtosubcategoryId,
          vendorId: vendorIdFromUrl,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          search: searchFromUrl,
          attributes: filters.attributes
        });

        if (!active) return;

        setProducts(result.products);
        setProductsError(result.errorMessage);
      } catch (error) {
        if (!active) return;
        console.error("fetchFilteredProducts failed:", error);
        setProducts([]);
        setProductsError("Live products could not load.");
      } finally {
        if (active) setProductsLoading(false);
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [
    bannerIdFromUrl,
    activeCategoryId,
    filters.subcategoryId,
    filters.subtosubcategoryId,
    vendorIdFromUrl,
    filters.minPrice,
    filters.maxPrice,
    filters.attributes,
    searchFromUrl
  ]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategories();
        const rawCategories = getApiList(res?.data ?? res);

        const namesById = rawCategories.reduce((map, category) => {
          if (typeof category === "string") return map;

          const id = category?._id || category?.id;
          const name = category?.name || category?.category || category?.title;

          if (id && name) {
            map[id] = name;
          }

          return map;
        }, {});

        const idsByName = rawCategories.reduce((map, category) => {
          if (typeof category === "string") return map;

          const id = category?._id || category?.id;
          const name = category?.name || category?.category || category?.title;

          if (id && name) {
            map[name.toLowerCase()] = id;
          }

          return map;
        }, {});

        const apiCategories = rawCategories.
        map((category) =>
        typeof category === "string" ?
        category :
        category?.name || category?.category || category?.title
        ).
        filter(Boolean);

        setCategoryNamesById(namesById);
        setCategoryIdsByName(idsByName);
        setCategories(["All", ...new Set(apiCategories)]);
      } catch (error) {
        console.error("getCategories failed:", error);
        setCategories(["All"]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadSubCategories = async () => {
      if (!activeCategoryId) {
        setSubCategoryNamesById({});
        setSubCategories([]);
        return;
      }

      try {
        const attributes = await getCategoryAttributes(activeCategoryId);
        const list = buildUniqueSubCategories(attributes);
        const namesById = buildSubCategoryNamesById(list);

        setSubCategoryNamesById(namesById);
        setSubCategories(list);
      } catch (error) {
        console.error("getCategoryAttributes subcategories failed:", error);
        setSubCategoryNamesById({});
        setSubCategories([]);
      }
    };

    loadSubCategories();
  }, [activeCategoryId]);

  const visibleSubCategories = useMemo(() => {
    if (selectedCategory === "All") return [];

    return subCategories.filter((subcategory) => {
      const parent = subcategory?.categoryId || subcategory?.category || subcategory?.parentCategory;
      const parentId = typeof parent === "object" ? parent?._id || parent?.id : parent;
      const parentName =
      (typeof parent === "object" ? parent?.name || parent?.category || parent?.title : "") ||
      subcategory?.categoryName ||
      categoryNamesById[parentId];

      return (
        activeCategoryId && parentId === activeCategoryId ||
        parentName?.toLowerCase() === selectedCategory.toLowerCase());

    });
  }, [activeCategoryId, categoryNamesById, selectedCategory, subCategories]);


  const filtered = useMemo(() => {
    const searchTerm = searchFromUrl.trim().toLowerCase();

    return products.filter((p) => {
      const productCategory = getCategoryName(p.category);
      const productSubcategory = getSubCategoryDisplayName(p.subcategory);
      const cat =
      filters.category === "All" ||
      p.category === filters.category ||
      productCategory === filters.category;

      const subcat =
      filters.subcategory === "All" ||
      !p.subcategory ||
      p.subcategory === filters.subcategory ||
      productSubcategory === filters.subcategory;

      const search =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm) ||
      productCategory?.toLowerCase().includes(searchTerm);


      const price =
      (filters.minPrice == null || p.price >= filters.minPrice) && (
      filters.maxPrice == null || p.price <= filters.maxPrice);

      const rating = (p.rating ?? 0) >= filters.rating;
      const attributes = matchesAttributeFilters(p, filters.attributes);

      return cat && subcat && search && price && rating && attributes;
    });
  }, [filters, getCategoryName, getSubCategoryDisplayName, products, searchFromUrl]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (activePage - 1) * PRODUCTS_PER_PAGE;
    return filtered.slice(start, start + PRODUCTS_PER_PAGE);
  }, [activePage, filtered]);
  const pageStart = filtered.length === 0 ? 0 : (activePage - 1) * PRODUCTS_PER_PAGE + 1;
  const pageEnd = Math.min(activePage * PRODUCTS_PER_PAGE, filtered.length);
  const visiblePages = useMemo(() => {
    const start = Math.max(1, activePage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
  }, [activePage, totalPages]);

  useEffect(() => {
    document.body.style.overflow = openFilter ? "hidden" : "";
  }, [openFilter]);

  useEffect(() => {
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
    window.dispatchEvent(new Event("wishlistUpdated"));
  }, [wishlistItems]);

  useEffect(() => {
    const syncWishlistFromStorage = () => {
      const savedItems = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
      const nextItems = Array.isArray(savedItems) ? savedItems : [];

      setWishlistItems((prev) =>
      haveSameWishlistProducts(prev, nextItems) ? prev : nextItems
      );
    };

    window.addEventListener("wishlistUpdated", syncWishlistFromStorage);
    window.addEventListener("storage", syncWishlistFromStorage);

    return () => {
      window.removeEventListener("wishlistUpdated", syncWishlistFromStorage);
      window.removeEventListener("storage", syncWishlistFromStorage);
    };
  }, []);

  const toggleWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);

      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }

      return [
      ...prev,
      {
        id: product.id,
        name: product.name,
        category: getCategoryName(product.category),
        categoryId: product.category,
        price: product.price,
        rating: product.rating,
        image: product.image
      }];

    });
  };

  const syncWishlistWithBackend = async (product, shouldRemove) => {
    const createBackendWishlistItem = (deviceId) =>
    createWishlistItem({
      cid: getLoggedInCid(),
      pid: product.id,
      divid: deviceId,
      qty: 1,
      variantId: product.variantId || product.defaultVariant?._id || null,
      venderid: product.vendorId || product.venderid || null,
      offerDiscount: product.discount || 0
    });

    try {
      const deviceId = getCartDeviceId();
      const res = await getWishlistByCidOrDevice({
        cid: getLoggedInCid(),
        divid: deviceId
      });
      const backendItems = getWishlistList(res?.data);
      const existingItem = backendItems.find(
        (item) => String(getWishlistProductId(item)) === String(product.id)
      );

      if (shouldRemove) {
        if (existingItem?._id) {
          await deleteWishlistItem(existingItem._id);
          window.dispatchEvent(new Event("wishlistUpdated"));
        }
        return;
      }

      if (!existingItem) {
        await createBackendWishlistItem(deviceId);
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      if (!shouldRemove) {
        try {
          await createBackendWishlistItem(getCartDeviceId());
          window.dispatchEvent(new Event("wishlistUpdated"));
          return;
        } catch (createError) {
          console.error(
            "Wishlist API failed",
            createError?.response?.data?.message || createError.message
          );
          return;
        }
      }

      console.error(
        "Wishlist API failed",
        error?.response?.data?.message || error.message
      );
    }
  };

  const updateFilters = (updater) => {
    setCurrentPage(1);
    setFilters(updater);
  };

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const rememberProduct = (product) => {
    sessionStorage.setItem("selectedProduct", JSON.stringify(product));
  };

  return (
    <div className="bg-zinc-50 min-h-screen flex">

      {}
      <aside className="hidden lg:block w-[300px] p-4">
        <div className="sticky top-40 bg-white/70 backdrop-blur-xl border rounded-2xl p-4 shadow-sm">

          <h2 className="text-lg font-bold mb-4">Filters</h2>

          <ShopFilters
            categoryId={activeCategoryId}
            categories={categories}
            selectedCategory={selectedCategory}
            filters={filters}
            updateFilters={updateFilters}
            visibleSubCategories={visibleSubCategories} />
          
        </div>
      </aside>

      {}
      <div className="flex-1">

        {}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg">Shop</h1>
            <p className="text-xs text-zinc-500">
              {productsLoading ?
              "Loading products..." :
              `${pageStart}-${pageEnd} of ${filtered.length} products`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenFilter(true)}
              className="lg:hidden flex items-center gap-2 bg-black text-white px-3 py-2 rounded-xl text-xs">
              
              <SlidersHorizontal size={14} />
              Filter
            </button>

            <button onClick={() => setView("grid")}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setView("compact")}>
              <Grid2X2 size={18} />
            </button>
          </div>
        </div>

        {productsError &&
        <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {productsError}
          </div>
        }

        {}
        {productsLoading && <ProductGridSkeleton count={8} />}

        {!productsLoading && paginatedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500">
            <p className="text-sm">No products found.</p>
          </div>
        )}

        {!productsLoading && paginatedProducts.length > 0 && (
        <div
          className={`grid auto-rows-fr gap-5 p-4 ${
          view === "grid" ?
          "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" :
          "grid-cols-2 md:grid-cols-3"}`
          }>
          
            {paginatedProducts.map((p) => {
            const isWishlisted = wishlistItems.some(
              (item) => item.id === p.id
            );
            const hasDiscount = p.mrp > p.price;
            const discountPercent = hasDiscount ?
            Math.round((p.mrp - p.price) / p.mrp * 100) :
            0;
            const stockStatus = getStockStatus(p.stock);

            const handleWishlistClick = (event) => {
              event.preventDefault();
              event.stopPropagation();
              const isAlreadyLiked = wishlistItems.some(
                (item) => item.id === p.id
              );
              toggleWishlist(p);
              syncWishlistWithBackend(p, isAlreadyLiked);
            };

            return (
              <Link
                key={p.id}
                href={`/ProductDetailpage/${p.id}`}
                onClick={() => rememberProduct(p)}
                className="h-full">
                
                  <div className="group flex h-full min-h-[330px] flex-col overflow-hidden rounded-2xl border border-[#FF9900] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-8px_rgba(255,153,0,0.25)]">

                    {}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
                      {p.image ?
                    <>
                      <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gray-100 px-4 text-center text-xs font-semibold text-gray-400">
                        Image not available
                      </div>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }} />
                    </> :


                    <div className="flex h-full w-full items-center justify-center bg-gray-100 px-4 text-center text-xs font-semibold text-gray-400">
                          Image not available
                        </div>
                    }

                      {hasDiscount &&
                    <span className="absolute top-2 right-2 z-10 text-[10px] font-bold px-2 py-1 bg-[#CC0C39] text-white rounded-md shadow-sm">
                          {discountPercent}% OFF
                        </span>
                    }

                      <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-1 bg-black/80 backdrop-blur-sm text-white rounded-full">
                        {getCategoryName(p.category)}
                      </span>

                      <button
                      type="button"
                      onClick={handleWishlistClick}
                      className={`absolute right-2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-90 transition-all duration-300 hover:scale-110 ${
                      hasDiscount ? "top-11" : "top-2"}`
                      }
                      aria-label="Add to wishlist">
                      
                        <Heart
                        size={15}
                        className={
                        isWishlisted ?
                        "fill-[#FF9900] text-[#FF9900]" :
                        "text-gray-600 hover:text-[#FF9900]"
                        } />
                      
                      </button>

                      <button
                      type="button"
                      onClick={() => rememberProduct(p)}
                      className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-orange-100/95 backdrop-blur-sm border-t border-orange-200 px-2 py-2 flex items-center justify-center gap-1.5 hover:bg-orange-200/95">
                      
                        <Eye size={13} className="text-[#E68A00]" />
                        <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-[#E68A00]">
                          VIEW
                        </span>
                      </button>
                    </div>

                    {}
                    <div className="flex flex-1 flex-col p-2.5 bg-gradient-to-b from-orange-50/40 to-orange-50/70">
                      <h3 className="text-sm font-semibold leading-5 text-gray-900 line-clamp-2">
                        {p.name}
                      </h3>

                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center gap-0.5">
                          {STAR_KEYS.map((starKey, i) =>
                        <Star
                          key={starKey}
                          size={11}
                          className={
                          i < Math.floor(p.rating) ?
                          "fill-yellow-400 text-yellow-400" :
                          "text-zinc-200"
                          } />

                        )}
                        </div>
                        {p.rating > 0 &&
                      <span className="text-[11px] font-medium text-zinc-400">
                            {p.rating.toFixed(1)}
                          </span>
                      }
                      </div>

                      <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                        <p className="text-[16px] font-extrabold text-[#0F1111]">
                          Rs.{Number(p.price).toLocaleString()}
                        </p>
                        {hasDiscount &&
                      <p className="text-xs text-zinc-400 line-through">
                            Rs.{Number(p.mrp).toLocaleString()}
                          </p>
                      }
                      </div>

                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dotClass}`} />

                        <p className={`text-xs font-medium ${stockStatus.textClass}`}>
                          {stockStatus.label}
                        </p>
                      </div>
                    </div>

                    <div className="h-[3px] w-full bg-gradient-to-r from-[#FF9900] to-[#FFC266] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                  </div>
                </Link>);

          })}
          </div>
        )}

        {!productsLoading && totalPages > 1 &&
        <div className="mx-4 mb-8 mt-2 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:flex-row">
            <p className="text-sm font-medium text-zinc-600">
              Showing <span className="text-black">{pageStart}-{pageEnd}</span> of{" "}
              <span className="text-black">{filtered.length}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
              type="button"
              onClick={() => goToPage(activePage - 1)}
              disabled={activePage === 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-zinc-700 transition hover:border-[#FF9900] hover:text-[#FF9900] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page">
              
                <ChevronLeft size={18} />
              </button>

              {visiblePages[0] > 1 &&
            <>
                  <button
                type="button"
                onClick={() => goToPage(1)}
                className="h-10 min-w-10 rounded-full border border-gray-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:border-[#FF9900] hover:text-[#FF9900]">
                
                    1
                  </button>
                  <span className="px-1 text-sm font-semibold text-zinc-400">...</span>
                </>
            }

              {visiblePages.map((page) =>
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`h-10 min-w-10 rounded-full px-3 text-sm font-bold transition ${
              activePage === page ?
              "bg-[#FF9900] text-black shadow-md shadow-orange-200" :
              "border border-gray-200 bg-white text-zinc-700 hover:border-[#FF9900] hover:text-[#FF9900]"}`
              }>
              
                  {page}
                </button>
            )}

              {visiblePages[visiblePages.length - 1] < totalPages &&
            <>
                  <span className="px-1 text-sm font-semibold text-zinc-400">...</span>
                  <button
                type="button"
                onClick={() => goToPage(totalPages)}
                className="h-10 min-w-10 rounded-full border border-gray-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:border-[#FF9900] hover:text-[#FF9900]">
                
                    {totalPages}
                  </button>
                </>
            }

              <button
              type="button"
              onClick={() => goToPage(activePage + 1)}
              disabled={activePage === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-zinc-700 transition hover:border-[#FF9900] hover:text-[#FF9900] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page">
              
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        }

      </div>

      {}
      <AnimatePresence>
        {openFilter &&
        <>
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setOpenFilter(false)} />
          

            <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-4 h-[75vh] overflow-y-auto">
            
              <div className="flex justify-between mb-4">
                <h2 className="font-bold">Filters</h2>
                <X onClick={() => setOpenFilter(false)} />
              </div>

              <ShopFilters
              categoryId={activeCategoryId}
              categories={categories}
              selectedCategory={selectedCategory}
              filters={filters}
              updateFilters={updateFilters}
              visibleSubCategories={visibleSubCategories}
              showRating={false} />
            
            </motion.div>
          </>
        }

      </AnimatePresence>

    </div>);

}
