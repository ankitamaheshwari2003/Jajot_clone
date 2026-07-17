"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Award,
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck } from
"lucide-react";

import CartSidebar from "./CartSidebar";
import {
  fetchProductById,
  getProductImage,
  getProductMrp,
  getProductPrice,
  isValidProductImageUrl } from
"../apis/products/products";
import {
  createCartItem,
  getApiCartList,
  getCartDeviceId,
  getCartProductId,
  getCartVariantId,
  getCartVendorId,
  getDeviceCartItems,
  updateCartItem } from
"../apis/cart/cart";
import { getLoggedInCid } from "../apis/customer/customer";
import {
  createWishlistItem,
  deleteWishlistItem,
  getWishlistByCidOrDevice } from
"../apis/wishlist/wishlist";
import { ProductDetailSkeleton } from "../component/PageSkeleton";

const fieldLabel = {
  sku: "SKU",
  brand: "Brand"
};

function uniqueValues(items, key) {
  return [...new Set(items.map((item) => item?.[key]).filter(Boolean))];
}

function getDisplayValue(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "object") {
    return value.name || value.value || value.productDescription || "";
  }

  return String(value);
}




function getOptionValues(product, names) {
  const option = product?.attributesMeta?.find((attribute) => {
    const attrName = String(attribute?.name || "").toLowerCase();
    return names.some((name) => attrName.includes(name));
  });

  return Array.isArray(option?.values) ? option.values.filter(Boolean) : [];
}

function getTextDescription(item) {
  const description = item?.description;

  if (typeof description === "string") return description;
  if (typeof description?.productDescription === "string") {
    return description.productDescription;
  }

  return "";
}

function getBulletPoints(item) {
  const bulletPoints = item?.description?.bulletPoints;
  return Array.isArray(bulletPoints) ?
  bulletPoints.filter((point) => typeof point === "string" && point.trim()) :
  [];
}






function mergeAttributes(baseAttributes, variantAttributes) {
  const base = Array.isArray(baseAttributes) ? baseAttributes : [];
  const variant = Array.isArray(variantAttributes) ? variantAttributes : [];

  const merged = base.map((attr) => ({ ...attr }));

  variant.forEach((variantAttr) => {
    const attrName = String(variantAttr?.name || "").toLowerCase();
    const existingIndex = merged.findIndex(
      (attr) => String(attr?.name || "").toLowerCase() === attrName
    );

    if (existingIndex >= 0) {
      merged[existingIndex] = { ...merged[existingIndex], ...variantAttr };
    } else {
      merged.push({ ...variantAttr });
    }
  });

  return merged;
}

export default function productDetailsPage({
  initialProduct = null,
  initialProductId = ""
}) {
  const params = useParams();
  const router = useRouter();
  const routeId = params?.id || initialProductId;

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedImage, setSelectedImage] = useState("");
  const [brokenImageUrls, setBrokenImageUrls] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartPreviewItems, setCartPreviewItems] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [storageReady, setStorageReady] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      if (!routeId) {
        setProduct(null);
        setError("Product not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiProduct = await fetchProductById(routeId);
        if (!active) return;
        setProduct(apiProduct);
        setError(apiProduct ? "" : "Product not found.");
      } catch (err) {
        if (!active) return;
        if (initialProduct) {
          setProduct(initialProduct);
          setError("");
        } else {
          setProduct(null);
          setError("Product detail could not load. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (
    initialProduct &&
    initialProduct.id === routeId &&
    initialProduct.variants?.length > 0)
    {
      return;
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [initialProduct, routeId]);

  const variants = useMemo(() => product?.variants || [], [product]);
  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      variants.find((variant) => variant._id === selectedVariantId) ||
      variants[0] ||
      product.defaultVariant ||
      null);

  }, [product, selectedVariantId, variants]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const rawImages = [
    getProductImage(product, selectedVariant),
    ...(selectedVariant?.images || []),
    product.thumbnailImage,
    ...(product.images || [])].
    filter(Boolean);

    const resolved = rawImages.filter(isValidProductImageUrl);

    return [...new Set(resolved)].filter(
      (image) => image && !brokenImageUrls.includes(image)
    );
  }, [brokenImageUrls, product, selectedVariant]);
  const activeImage = galleryImages.includes(selectedImage) ?
  selectedImage :
  galleryImages[0] || "";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedCartItems = JSON.parse(
        localStorage.getItem("cartItems") || "[]"
      );

      setCartItems(Array.isArray(savedCartItems) ? savedCartItems : []);
      setStorageReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;

    const loadWishlistFromBackend = async () => {
      const cid = getLoggedInCid();


      if (!cid) {
        if (active) setWishlistItems([]);
        return;
      }

      try {
        const res = await getWishlistByCidOrDevice({ cid });

        const items = Array.isArray(res?.data?.data) ?
        res.data.data :
        Array.isArray(res?.data) ?
        res.data :
        [];

        if (active) {
          setWishlistItems(items);
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          console.warn("Wishlist skipped: user is not authorized.");
        } else {
          console.error(
            "Wishlist load failed:",
            err?.response?.data?.message || err.message
          );
        }

        if (active) {
          setWishlistItems([]);
        }
      }
    };

    loadWishlistFromBackend();
    window.addEventListener("wishlistUpdated", loadWishlistFromBackend);

    return () => {
      active = false;
      window.removeEventListener("wishlistUpdated", loadWishlistFromBackend);
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cartItems, storageReady]);

  const price = getProductPrice(product, selectedVariant);
  const mrp = getProductMrp(product, selectedVariant);
  const hasPrice = price > 0;
  const discount =
  mrp > price && price > 0 ? Math.round((mrp - price) / mrp * 100) : 0;
  const stock =
  selectedVariant?.stock ??
  product?.stock ??
  product?.inventory?.stock ??
  product?.quantity ??
  null;
  const isOutOfStock = stock === 0;
  const canPurchase = hasPrice && !isOutOfStock;
  const maxQuantity = selectedVariant?.maxQuantity || product?.maxQuantity;
  const stockLimit = typeof stock === "number" && stock > 0 ? stock : null;
  const effectiveMaxQuantity =
  maxQuantity && stockLimit ? Math.min(maxQuantity, stockLimit) : maxQuantity || stockLimit;
  const safeQuantity = effectiveMaxQuantity ?
  Math.min(quantity, effectiveMaxQuantity) :
  quantity;
  const colors =
  uniqueValues(variants, "color").length > 0 ?
  uniqueValues(variants, "color") :
  getOptionValues(product, ["color", "colour"]);
  const selectedColor =
  selectedVariant?.color || selectedOptions.color || colors[0] || "";
  const availableSizes = uniqueValues(
    selectedColor ?
    variants.filter((variant) => variant.color === selectedColor) :
    variants,
    "size"
  );
  const sizes =
  availableSizes.length > 0 ?
  availableSizes :
  getOptionValues(product, ["storage", "size"]);
  const selectedSize = selectedVariant?.size || selectedOptions.size || sizes[0] || "";
  const selectedDescription =
  getTextDescription(selectedVariant) || product?.description || "";
  const selectedBulletPoints =
  getBulletPoints(selectedVariant).length > 0 ?
  getBulletPoints(selectedVariant) :
  product?.bulletPoints || [];


  const displaySku = selectedVariant?.sku || product?.sku || "";




  const displayName =
  selectedVariant?.name ||
  selectedVariant?.variantName ||
  selectedVariant?.title ||
  selectedVariant?.productName ||
  product?.name ||
  "";


  const displayCondition = selectedVariant?.itemCondition || product?.itemCondition || "";


  const displayHandlingTime =
  selectedVariant?.handlingTime ?? product?.handlingTime ?? null;




  const displayAttributes = useMemo(
    () => mergeAttributes(product?.attributes, selectedVariant?.attributes),
    [product, selectedVariant]
  );

  const liked = product ?
  wishlistItems.some((item) => {
    const itemProductId =
    item.pid && typeof item.pid === "object" ? item.pid._id : item.pid;
    return itemProductId === product.id;
  }) :
  false;

  const chooseVariant = (matcher) => {
    const nextVariant = variants.find(matcher);
    if (nextVariant) {
      setSelectedVariantId(nextVariant._id);
      setQuantity(1);
    }
  };

  const chooseOption = (name, value) => {
    setSelectedOptions((current) => ({
      ...current,
      [name]: value
    }));
    setQuantity(1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => {
      if (prev <= 1) return 1;
      return prev - 1;
    });
  };

  const increaseQuantity = () => {
    setQuantity((prev) => {
      if (effectiveMaxQuantity && prev >= effectiveMaxQuantity) {
        return effectiveMaxQuantity;
      }

      return prev + 1;
    });
  };

  const handleAddToCart = async (openCart = true) => {
    if (!product || !canPurchase || addingToCart) return false;

    const variantKey =
    selectedVariant?._id ||
    `${selectedColor || "default"}-${selectedSize || "default"}`;
    const cartId = `${product.id}-${variantKey}`;
    const deviceId = getCartDeviceId();
    const cartProduct = {
      id: cartId,
      productId: product.id,
      variantId: selectedVariant?._id,
      deviceId,
      title: displayName,
      name: displayName,
      image: activeImage,
      storage: selectedSize || product.sku || "",
      size: selectedSize || "",
      color: selectedColor || "",
      quantity: safeQuantity,
      qty: safeQuantity,
      price,
      mrp,
      sku: displaySku,
      attributes: product.attributes || [],
      variant: selectedVariant || selectedOptions,
      delivery: "Tomorrow"
    };

    setAddingToCart(true);

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === cartId);

      if (existing) {
        return prev.map((item) =>
        item.id === cartId ?
        {
          ...item,
          quantity: (item.quantity || 1) + safeQuantity,
          qty: (item.qty || item.quantity || 1) + safeQuantity
        } :
        item
        );
      }

      return [...prev, cartProduct];
    });

    try {
      let deviceCartItems = [];

      try {
        const deviceCartRes = await getDeviceCartItems();
        deviceCartItems = getApiCartList(deviceCartRes.data);
      } catch (deviceCartError) {
        console.warn(
          "Device cart fetch failed before add",
          deviceCartError.response?.data?.message || deviceCartError.message
        );
      }

      const existingApiItem = [...deviceCartItems].reverse().find((item) => {
        const itemProductId = getCartProductId(item);
        const itemVariantId = getCartVariantId(item);
        const sameProduct = String(itemProductId) === String(product.id);
        const sameVariant =
        !selectedVariant?._id ||
        !itemVariantId ||
        String(itemVariantId) === String(selectedVariant._id);

        return sameProduct && sameVariant;
      });

      const resolvedVendorId =
      getCartVendorId(existingApiItem) || product.vendorId || product.venderid || null;

      if (existingApiItem?._id) {
        const nextQty =
        (existingApiItem.qty || existingApiItem.quantity || 1) + safeQuantity;

        await updateCartItem(existingApiItem._id, {
          cid: getLoggedInCid(),
          pid: product.id,
          divid: existingApiItem.divid || existingApiItem.deviceId || deviceId,
          qty: nextQty,
          variantId: selectedVariant?._id || getCartVariantId(existingApiItem),
          offerDiscount: discount || product.discount || 0,
          vendorId: resolvedVendorId
        });

        setCartPreviewItems([{ ...existingApiItem, qty: nextQty, quantity: nextQty }]);
        if (openCart) setCartOpen(true);
      } else {
        await createCartItem({
          cid: getLoggedInCid(),
          pid: product.id,
          divid: deviceId,
          vendorId: resolvedVendorId,
          qty: safeQuantity,
          variantId: selectedVariant?._id || null,
          offerDiscount: discount || product.discount || 0
        });

        try {
          const refreshedCartRes = await getDeviceCartItems();
          const refreshedCartItems = getApiCartList(refreshedCartRes.data);
          const addedApiItem = [...refreshedCartItems].reverse().find((item) => {
            const itemProductId = getCartProductId(item);
            const itemVariantId = getCartVariantId(item);
            const sameProduct = String(itemProductId) === String(product.id);
            const sameVariant =
            !selectedVariant?._id ||
            !itemVariantId ||
            String(itemVariantId) === String(selectedVariant._id);

            return sameProduct && sameVariant;
          });

          setCartPreviewItems([addedApiItem || cartProduct]);
        } catch (deviceCartError) {
          console.error(
            "Device cart fetch failed",
            deviceCartError.response?.data?.message || deviceCartError.message
          );
          setCartPreviewItems([cartProduct]);
        }

        if (openCart) setCartOpen(true);
      }

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(
        new CustomEvent("shopToast", {
          detail: {
            title: "Added to cart",
            message: "Your product is ready in the cart."
          }
        })
      );
      return true;
    } catch (err) {
      setCartPreviewItems([cartProduct]);
      console.error(
        "Cart API failed",
        err.response?.data?.message || err.message
      );
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart(false);
    if (added) router.push("/Addtocard");
  };

  const handleToggleWishlist = async () => {
    if (!product || togglingWishlist) return;

    const cid = getLoggedInCid();


    if (!cid) {
      window.dispatchEvent(
        new CustomEvent("shopToast", {
          detail: {
            title: "Login required",
            message: "Please login to use the wishlist."
          }
        })
      );

      return;
    }

    const existingItem = wishlistItems.find((item) => {
      const itemProductId =
      item.pid && typeof item.pid === "object" ? item.pid._id : item.pid;

      return String(itemProductId) === String(product.id);
    });

    const deviceId = getCartDeviceId();

    setTogglingWishlist(true);

    try {
      if (existingItem) {
        setWishlistItems((prev) =>
        prev.filter((item) => item._id !== existingItem._id)
        );

        await deleteWishlistItem(existingItem._id);

        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        const res = await createWishlistItem({
          cid,
          pid: product.id,
          divid: deviceId,
          qty: 1,
          variantId: selectedVariant?._id || null,
          vendorId: product.vendorId || product.venderid || null,
          productData: {
            ...product,
            _id: product._id || product.id,
            name:
            product.name ||
            product.productName ||
            product.itemName,
            price,
            image: activeImage,
            category: product.category,
            categoryId: product.categoryId || product.category
          }
        });

        const created = res?.data?.data || res?.data;

        if (created) {
          setWishlistItems((prev) => [...prev, created]);
        }

        window.dispatchEvent(new Event("wishlistUpdated"));

        window.dispatchEvent(
          new CustomEvent("shopToast", {
            detail: {
              title: "Added to wishlist",
              message: "Saved for later in your wishlist."
            }
          })
        );
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent("shopToast", {
            detail: {
              title: "Login expired",
              message: "Please login again."
            }
          })
        );
      } else {
        console.error(
          "Wishlist API failed:",
          err?.response?.data?.message || err.message
        );
      }


    } finally {
      setTogglingWishlist(false);
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <main className="min-h-[70vh] bg-white px-4 py-10">
        <div className="mx-auto max-w-[1300px] text-center text-sm text-red-600">
          {error || "Product not found."}
        </div>
      </main>);

  }

  const footerBadges = [
  { icon: RotateCcw, label: "7 Days Replacement" },
  { icon: Truck, label: "Amazon Delivered" },
  { icon: ShieldCheck, label: "Secure Transaction" },
  ...(product.brand ? [{ icon: Award, label: "Top Brand" }] : [])];


  return (
    <>
      <main className="min-h-screen bg-white pb-28 lg:pb-10">
        <div className="mx-auto max-w-[1550px] px-3 py-4 sm:px-4 lg:py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[52px_minmax(420px,4fr)_minmax(360px,4fr)_minmax(280px,3fr)] lg:gap-3 xl:gap-4">
            <div className="order-1 lg:contents">
              <div className="order-2 h-fit lg:sticky lg:top-[11.5rem] lg:order-1">
                <div className="hidden flex-col gap-2 lg:flex">
                  {galleryImages.map((img) =>
                  <button
                    key={img}
                    onClick={() => setSelectedImage(img)}
                    className={`h-12 w-12 overflow-hidden rounded border bg-white transition ${
                    activeImage === img ?
                    "border-[#E47911] ring-1 ring-[#E47911]" :
                    "border-gray-300 hover:border-[#E47911]"}`
                    }>
                    
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  )}
                </div>
              </div>

              <div className="order-1 h-fit lg:sticky lg:top-[11.5rem] lg:order-2">
                <div className="relative bg-white">
                  <div className="flex w-full items-start justify-start overflow-hidden">
                    {activeImage ?
                    <img
                      src={activeImage}
                      alt={displayName}
                      onError={() =>
                      setBrokenImageUrls((current) =>
                      current.includes(activeImage) ?
                      current :
                      [...current, activeImage]
                      )
                      }
                      className="block h-auto max-h-[620px] w-full max-w-[560px] object-contain object-left-top" /> :


                    <div className="flex min-h-[360px] w-full max-w-[560px] items-center justify-center rounded bg-gray-50 text-sm text-gray-400">
                        No image available
                      </div>
                    }
                  </div>

                  <div className="px-1 pb-2 lg:hidden">
                    <div className="flex gap-2 overflow-x-auto">
                      {galleryImages.map((img) =>
                      <button
                        key={img}
                        onClick={() => setSelectedImage(img)}
                        className={`h-14 w-14 min-w-[56px] overflow-hidden rounded border bg-white ${
                        activeImage === img ?
                        "border-[#E47911] ring-1 ring-[#E47911]" :
                        "border-gray-300"}`
                        }>
                        
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-3 lg:pl-4 xl:pl-6">
              <p className="text-sm font-medium text-[#007185] hover:text-[#C7511F] hover:underline">
                {product.brand ? `Visit the ${product.brand} Store` : displaySku}
              </p>

              {

              }
              <h1 className="mt-1 text-[20px] font-semibold leading-7 text-[#0F1111] sm:text-[24px] sm:leading-8">
                {displayName}
              </h1>

              {displaySku &&
              <p className="mt-1 text-sm text-[#565959]">SKU: {displaySku}</p>
              }

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-0.5 text-[#FFA41C]">
                  {[1, 2, 3, 4, 5].map((item) =>
                  <Star key={item} size={14} fill="currentColor" />
                  )}
                </div>
                <span className="text-sm text-[#007185] hover:underline">4.5 ratings</span>
              </div>

              <hr className="my-4 border-gray-200" />

              <div className="border-b border-gray-200 pb-5">
                <div className="flex flex-wrap items-baseline gap-2">
                  {discount > 0 &&
                  <span className="text-lg font-medium text-[#CC0C39]">
                      -{discount}%
                    </span>
                  }
                  <span className="text-[28px] font-medium text-[#0F1111]">
                    {hasPrice ? `Rs.${price.toLocaleString()}` : "Price unavailable"}
                  </span>
                </div>

                {hasPrice && mrp > price &&
                <p className="mt-1 text-sm text-[#565959]">
                    M.R.P:{" "}
                    <span className="line-through">Rs.{mrp.toLocaleString()}</span>
                  </p>
                }

                {hasPrice &&
                <p className="mt-1 text-sm text-[#565959]">
                    Inclusive of all taxes
                  </p>
                }
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 py-5 sm:grid-cols-4">
                {footerBadges.map(({ icon: Icon, label }) =>
                <div key={label} className="flex flex-col items-center text-center">
                    <Icon size={20} className="text-[#565959]" />
                    <span className="mt-1 text-[11px] leading-tight text-[#565959]">
                      {label}
                    </span>
                  </div>
                )}
              </div>

              {}
              {colors.length > 0 &&
              <div className="border-b border-gray-200 py-5">
                  <h3 className="mb-3 text-sm font-semibold text-[#0F1111]">
                    Colour:
                    <span className="ml-1 font-normal text-[#565959]">
                      {selectedColor}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) =>
                  <button
                    key={color}
                    onClick={() =>
                    variants.length > 0 ?
                    chooseVariant((variant) => variant.color === color) :
                    chooseOption("color", color)
                    }
                    className={`relative rounded-md border px-4 py-2 text-sm font-medium transition ${
                    selectedColor === color ?
                    "border-2 border-[#E47911] bg-[#FFF8F0]" :
                    "border-gray-300 hover:border-[#E47911]"}`
                    }>
                    
                        {color}
                        {selectedColor === color &&
                    <Check
                      size={14}
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-[#E47911] p-0.5 text-white" />

                    }
                      </button>
                  )}
                  </div>
                </div>
              }

              {}
              {sizes.length > 0 &&
              <div className="border-b border-gray-200 py-5">
                  <h3 className="mb-3 text-sm font-semibold text-[#0F1111]">
                    {availableSizes.length > 0 ? "Size:" : "Storage:"}
                    <span className="ml-1 font-normal text-[#565959]">
                      {selectedSize}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) =>
                  <button
                    key={size}
                    onClick={() =>
                    variants.length > 0 ?
                    chooseVariant(
                      (variant) =>
                      variant.size === size && (
                      !selectedVariant?.color ||
                      variant.color === selectedVariant.color)
                    ) :
                    chooseOption("size", size)
                    }
                    className={`min-w-[56px] rounded-md border px-3 py-2 text-sm font-medium transition ${
                    selectedSize === size ?
                    "border-2 border-[#E47911] bg-[#FFF8F0]" :
                    "border-gray-300 hover:border-[#E47911]"}`
                    }>
                    
                        {size}
                      </button>
                  )}
                  </div>
                </div>
              }

              {}
              {variants.length > 0 &&
              <div className="border-b border-gray-200 py-5">
                  <h3 className="mb-3 text-base font-semibold text-[#0F1111]">
                    All variants
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {variants.map((variant) =>
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariantId(variant._id)}
                    className={`min-w-[150px] max-w-[170px] flex-shrink-0 rounded-md border p-3 text-left text-sm transition ${
                    selectedVariant?._id === variant._id ?
                    "border-[#E47911] bg-[#FFF8F0]" :
                    "border-gray-200 hover:border-[#E47911]"}`
                    }>
                    
                        <p className="font-medium text-[#0F1111]">
                          {variant.color || "Default"} {variant.size || ""}
                        </p>
                        <p className="text-[#0F1111]">
                          Price: Rs.{Number(variant.sellingPrice || 0).toLocaleString()}
                        </p>
                        {variant.mrp &&
                    <p className="text-[#565959] line-through">
                            MRP: Rs.{Number(variant.mrp).toLocaleString()}
                          </p>
                    }
                        <p className="text-[#565959]">Stock: {variant.stock ?? 0}</p>
                      </button>
                  )}
                  </div>
                </div>
              }

              <div className="border-b border-gray-200 py-5">
                <h3 className="mb-3 text-base font-semibold text-[#0F1111]">
                  Product information
                </h3>

                <div className="space-y-2 text-sm">
                  {displayAttributes.map((attribute) =>
                  <div
                    key={attribute._id || attribute.code || attribute.name}
                    className="grid grid-cols-[140px_1fr] gap-3 border-b border-gray-100 py-1.5">
                    
                      <span className="text-[#565959]">{attribute.name}</span>
                      <span className="text-[#0F1111]">
                        {getDisplayValue(attribute.value)}
                      </span>
                    </div>
                  )}

                  {Object.entries(fieldLabel).map(([key, label]) => {
                    const value = key === "sku" ? displaySku : product[key];

                    return value ?
                    <div
                      key={key}
                      className="grid grid-cols-[140px_1fr] gap-3 border-b border-gray-100 py-1.5">
                      
                        <span className="text-[#565959]">{label}</span>
                        <span className="text-[#0F1111]">
                          {getDisplayValue(value)}
                        </span>
                      </div> :
                    null;
                  })}

                  {displayCondition &&
                  <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-gray-100 py-1.5">
                      <span className="text-[#565959]">Condition</span>
                      <span className="text-[#0F1111]">{displayCondition}</span>
                    </div>
                  }
                </div>

                {(selectedDescription || selectedBulletPoints.length > 0) &&
                <div className="mt-5">
                    <h4 className="mb-2 text-sm font-semibold text-[#0F1111]">
                      About this item
                    </h4>
                    {selectedDescription &&
                  <p className="text-sm leading-6 text-[#0F1111]">
                        {selectedDescription}
                      </p>
                  }
                    {selectedBulletPoints.length > 0 &&
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[#0F1111]">
                        {selectedBulletPoints.map((point) =>
                    <li key={point}>{point}</li>
                    )}
                      </ul>
                  }
                  </div>
                }
              </div>
            </div>

            <div className="order-4 h-fit lg:sticky lg:top-[11.5rem]">
              <div className="rounded-lg border border-gray-300 p-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  {discount > 0 &&
                  <span className="text-base font-medium text-[#CC0C39]">
                      -{discount}%
                    </span>
                  }
                  <span className="text-[26px] font-medium text-[#0F1111]">
                    {hasPrice ? `Rs.${price.toLocaleString()}` : "Price unavailable"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#0F1111]">
                  <span className="font-medium text-[#007600]">FREE delivery</span>{" "}
                  Tomorrow
                </p>

                {displayHandlingTime != null &&
                <p className="mt-1 text-sm text-[#565959]">
                    Dispatched in {displayHandlingTime}{" "}
                    {Number(displayHandlingTime) === 1 ? "day" : "days"}
                  </p>
                }

                <p
                  className={`mt-4 text-lg font-medium ${
                  stock == null ?
                  "text-[#565959]" :
                  stock > 0 ?
                  "text-[#007600]" :
                  "text-red-600"}`
                  }>
                  
                  {stock == null ?
                  "Availability not listed" :
                  stock > 0 ?
                  "In Stock" :
                  "Out of Stock"}
                </p>

                <div className="mt-4">
                  <p className="mb-1.5 text-sm text-[#0F1111]">Quantity</p>
                  <div className="flex h-9 w-fit items-center justify-between rounded border border-gray-300 bg-[#F0F2F2] px-3">
                    <button onClick={decreaseQuantity}>
                      <Minus size={14} />
                    </button>
                    <span className="px-4 text-sm font-medium">{safeQuantity}</span>
                    <button onClick={increaseQuantity}>
                      <Plus size={14} />
                    </button>
                  </div>
                  {effectiveMaxQuantity ?
                  <p className="mt-1.5 text-xs text-[#565959]">
                      (Only {effectiveMaxQuantity} per customer)
                    </p> :
                  null}
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handleAddToCart()}
                    disabled={!canPurchase || addingToCart}
                    className="h-10 w-full rounded-full bg-[#FFD814] text-sm font-medium text-[#0F1111] transition hover:bg-[#F7CA00] disabled:cursor-not-allowed disabled:opacity-60">
                    
                    {addingToCart ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!canPurchase || addingToCart}
                    className="h-10 w-full rounded-full bg-[#FFA41C] text-sm font-medium text-[#0F1111] transition hover:bg-[#FA8900] disabled:cursor-not-allowed disabled:opacity-60">
                    
                    {addingToCart ? "Adding..." : "Buy Now"}
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    disabled={togglingWishlist}
                    className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-full border text-sm font-medium transition disabled:opacity-60 ${
                    liked ?
                    "border-[#E47911] bg-[#FFF8F0] text-[#E47911]" :
                    "border-gray-300 text-[#0F1111] hover:bg-gray-50"}`
                    }>
                    
                    <Heart size={14} fill={liked ? "currentColor" : "none"} />
                    {togglingWishlist ?
                    "Please wait..." :
                    liked ?
                    "Added to Wish List" :
                    "Add to Wish List"}
                  </button>
                </div>

                <hr className="my-4 border-gray-200" />

                <div className="space-y-2 text-sm">
                  <p className="text-[#565959]">
                    Delivered by{" "}
                    <span className="text-[#0F1111]">Amazon</span>
                  </p>
                  {product.brand &&
                  <p className="text-[#565959]">
                      Sold by <span className="text-[#007185]">{product.brand}</span>
                    </p>
                  }
                  <p className="text-[#565959]">
                    Payment{" "}
                    <span className="text-[#007185]">Secure transaction</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 z-50 flex w-full gap-3 border-t border-gray-200 bg-white p-3 backdrop-blur-md lg:hidden">
          <button
            onClick={() => handleAddToCart()}
            disabled={!canPurchase || addingToCart}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-black text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60">
            
            <ShoppingCart size={16} />
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!canPurchase || addingToCart}
            className="h-12 flex-1 rounded-xl bg-[#FF9900] text-sm font-medium text-black transition hover:bg-[#e68a00] disabled:opacity-60">
            
            {addingToCart ? "Adding..." : "Buy Now"}
          </button>
        </div>
      </main>

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartPreviewItems} />
      
    </>);

}
