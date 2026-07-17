"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import PageSkeleton from "../component/PageSkeleton";
import { getCategories } from "../apis/category/category";
import {
  getWishlistByCidOrDevice,
  deleteWishlistItem,
  updateWishlistItem } from
"../apis/wishlist/wishlist";
import { getLoggedInCid } from "../apis/customer/customer";

const getApiList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.wishlist)) return payload.wishlist;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.wishlist)) return payload.data.wishlist;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.data?.categories)) return payload.data.categories;
  return [];
};

const getWishlistProductId = (item) => {
  const product =
  item?.pid ||
  item?.productId ||
  item?.product_id ||
  item?.product ||
  item?.id;

  return typeof product === "object" ? product?._id || null : product || null;
};

const getWishlistVariantId = (item) => {
  const variant = item?.variantId || item?.variant_id || item?.variant;
  return typeof variant === "object" ? variant?._id || null : variant || null;
};

const getWishlistVendorId = (item) => {
  const vendor =
  item?.vendorId ||
  item?.venderid ||
  item?.vendor_id ||
  item?.vendor || (
  item?.pid && typeof item.pid === "object" ? item.pid.vendorId : null) || (
  item?.variantId && typeof item.variantId === "object" ?
  item.variantId.vendorId :
  null);

  return typeof vendor === "object" ? vendor?._id || null : vendor || null;
};

const getProduct = (item) => {
  if (item?.pid && typeof item.pid === "object") return item.pid;
  if (item?.productId && typeof item.productId === "object") return item.productId;
  if (item?.product && typeof item.product === "object") return item.product;
  return null;
};

const getWishlistKey = (item, index) => {
  return (
    item?._id ||
    item?.wishlistId ||
    item?.wishlist_id ||
    item?.id ||
    `${getWishlistProductId(item) || "product"}-${
    getWishlistVariantId(item) || "variant"}-${
    index}`);

};

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistReady, setWishlistReady] = useState(false);
  const [categoryNamesById, setCategoryNamesById] = useState({});

  const fetchWishlist = async () => {
    try {
      setWishlistReady(false);

      const res = await getWishlistByCidOrDevice({
        cid: getLoggedInCid()
      });

      const items = getApiList(res?.data);

      const uniqueItems = items.filter((item, index, arr) => {
        const key = getWishlistKey(item, index);
        return arr.findIndex((x, i) => getWishlistKey(x, i) === key) === index;
      });

      setWishlistItems(uniqueItems);
    } catch (error) {
      if (error?.response?.status === 404) {
        setWishlistItems([]);
      } else {
        console.error("Failed to load wishlist", error);
        setWishlistItems([]);
      }
    } finally {
      setWishlistReady(true);
    }
  };

  useEffect(() => {
    fetchWishlist();

    const refreshWishlist = () => fetchWishlist();

    window.addEventListener("wishlistUpdated", refreshWishlist);
    window.addEventListener("customerUpdated", refreshWishlist);
    window.addEventListener("storage", refreshWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", refreshWishlist);
      window.removeEventListener("customerUpdated", refreshWishlist);
      window.removeEventListener("storage", refreshWishlist);
    };
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategories();

        const namesById = getApiList(res?.data).reduce((map, category) => {
          if (typeof category === "string") return map;

          const id = category?._id || category?.id;
          const name = category?.name || category?.category || category?.title;

          if (id && name) map[id] = name;

          return map;
        }, {});

        setCategoryNamesById(namesById);
      } catch (error) {
        console.error("Failed to load wishlist categories", error);
      }
    };

    loadCategories();
  }, []);

  const removeFromWishlist = async (id) => {
    if (!id) return;

    const removedItem = wishlistItems.find(
      (item) => String(item._id || item.id) === String(id)
    );

    const removedProductId = getWishlistProductId(removedItem);

    setWishlistItems((prev) =>
    prev.filter((item) => String(item._id || item.id) !== String(id))
    );

    try {
      await deleteWishlistItem(id);

      try {
        const savedItems = JSON.parse(
          localStorage.getItem("wishlistItems") || "[]"
        );

        let nextItems = [];

        if (Array.isArray(savedItems)) {
          nextItems = savedItems;

          if (removedProductId) {
            nextItems = savedItems.filter(
              (item) =>
                String(getWishlistProductId(item)) !== String(removedProductId)
            );
          }
        }

        localStorage.setItem("wishlistItems", JSON.stringify(nextItems));
      } catch {
        localStorage.setItem("wishlistItems", JSON.stringify([]));
      }

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Failed to remove wishlist item", error);
      fetchWishlist();
    }
  };

  const changeQty = async (item, delta) => {
    if (!item?._id) return;

    const currentQty = Number(item?.qty || item?.quantity || 1);
    const nextQty = Math.max(1, currentQty + delta);

    if (nextQty === currentQty) return;

    setWishlistItems((prev) =>
    prev.map((w) =>
    w._id === item._id ?
    {
      ...w,
      qty: nextQty,
      quantity: nextQty
    } :
    w
    )
    );

    try {
      await updateWishlistItem(item._id, {
        ...item,
        qty: nextQty,
        quantity: nextQty,
        cid: item?.cid || getLoggedInCid(),
        pid: getWishlistProductId(item),
        variantId: getWishlistVariantId(item),
        vendorId: getWishlistVendorId(item)
      });

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Failed to update wishlist qty", error);
      fetchWishlist();
    }
  };

  const getName = (item) => {
    const product = getProduct(item);

    return (
      item?.product_name ||
      item?.productName ||
      product?.productName ||
      product?.itemName ||
      product?.name ||
      product?.title ||
      "Untitled Product");

  };

  const getImage = (item) => {
    const product = getProduct(item);

    return (
      item?.variantId?.images?.[0] ||
      item?.variantId?.image ||
      item?.image ||
      item?.image_url ||
      product?.images?.[0] ||
      product?.image ||
      product?.image_url ||
      "https://via.placeholder.com/300");

  };

  const getPrice = (item) => {
    const product = getProduct(item);

    return (
      item?.variantId?.offer?.salePrice ||
      item?.variantId?.offer?.sellingPrice ||
      item?.variantId?.sellingPrice ||
      item?.variantId?.price ||
      item?.unit_price ||
      item?.price ||
      product?.offer?.salePrice ||
      product?.offer?.sellingPrice ||
      product?.sellingPrice ||
      product?.price ||
      0);

  };

  const getCategoryName = (item) => {
    const product = getProduct(item);

    const category =
    product?.categoryId ||
    product?.category ||
    item?.categoryId ||
    item?.category;

    const categoryId = typeof category === "object" ? category?._id : category;
    const categoryName =
    typeof category === "object" ? category?.name || category?.title : null;

    return (
      categoryName ||
      categoryNamesById[categoryId] ||
      product?.categoryName ||
      item?.categoryName ||
      "Product");

  };

  const getProductLink = (item) => {
    const product = getProduct(item);
    const productId = product?._id || getWishlistProductId(item);

    return productId ? `/ProductDetailpage/${productId}` : "#";
  };

  if (!wishlistReady) {
    return <PageSkeleton type="grid" />;
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
              <Heart className="h-5 w-5 text-[#FF9900]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
              <p className="text-sm text-gray-500">
                {wishlistItems.length} saved product
                {wishlistItems.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        {wishlistItems.length === 0 ?
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <p className="text-gray-700 font-semibold">
              Your wishlist is empty
            </p>

            <Link
            href="/shop"
            className="mt-4 inline-flex h-10 px-5 rounded-xl bg-black text-white text-sm font-semibold items-center justify-center">
            
              Continue Shopping
            </Link>
          </div> :

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {wishlistItems.map((item, index) => {
            const itemId = item?._id || item?.id;
            const key = getWishlistKey(item, index);

            return (
              <div
                key={key}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition">
                
                  <Link href={getProductLink(item)} className="block">
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      <img
                      src={getImage(item)}
                      alt={getName(item)}
                      className="w-full h-full object-cover" />
                    

                      <span className="absolute top-2 left-2 text-[10px] px-2 py-1 bg-black text-white rounded-full">
                        {getCategoryName(item)}
                      </span>
                    </div>
                  </Link>

                  <div className="p-3">
                    <h2 className="text-sm font-semibold line-clamp-2 min-h-[40px]">
                      {getName(item)}
                    </h2>

                    <p className="font-bold mt-2">
                      Rs. {Number(getPrice(item)).toLocaleString("en-IN")}
                    </p>

                    <div className="mt-2 flex items-center gap-2 w-fit rounded-lg border border-gray-200 px-2 py-1">
                      <button
                      type="button"
                      onClick={() => changeQty(item, -1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black"
                      aria-label="Decrease quantity">
                      
                        -
                      </button>

                      <span className="text-xs font-semibold w-5 text-center">
                        {item?.qty || item?.quantity || 1}
                      </span>

                      <button
                      type="button"
                      onClick={() => changeQty(item, 1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black"
                      aria-label="Increase quantity">
                      
                        +
                      </button>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Link
                      href={getProductLink(item)}
                      className="flex-1 h-9 rounded-xl bg-black text-white text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition">
                      
                        <ShoppingCart size={14} />
                        View
                      </Link>

                      <button
                      type="button"
                      onClick={() => removeFromWishlist(itemId)}
                      className="w-10 h-9 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center transition"
                      aria-label="Remove from wishlist">
                      
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>);

          })}
          </div>
        }
      </div>
    </main>);

}
