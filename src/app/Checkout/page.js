"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import AddressForm from "./address";
import CartItems from "../component/CartItems";
import OrderSummary from "../component/OrderSummary";
import { placeOrder } from "../apis/orders/orders";
import {
  deleteCartItem,
  getCartProductId,
  getCartVariantId,
  getCartVendorId } from
"../apis/cart/cart";

function getCheckoutItemPrice(item) {
  return Number(
    item?.price ??
    item?.variantId?.offer?.salePrice ??
    item?.variantId?.offer?.sellingPrice ??
    0
  );
}

function getCheckoutItemMrp(item) {
  return Number(item?.mrp ?? item?.variantId?.offer?.mrp ?? 0);
}

function normalizeCheckoutItem(item) {
  const qty = item?.qty || item?.quantity || 1;
  const price = getCheckoutItemPrice(item);
  const mrp = getCheckoutItemMrp(item);

  return {
    ...item,
    id: item?._id || item?.id || item?.cartId,
    name:
    item?.name ||
    item?.title ||
    item?.pid?.productName ||
    item?.pid?.itemName ||
    "Untitled Product",
    image:
    item?.image ||
    item?.variantId?.images?.[0] ||
    item?.pid?.images?.[0],
    qty,
    quantity: qty,
    price,
    originalPrice: mrp > price ? mrp : item?.originalPrice
  };
}

function getCheckoutItemVendorId(item) {
  return item?.resolvedVendorId || getCartVendorId(item) || "";
}

function toOrderItem(item) {
  const vendorId = getCheckoutItemVendorId(item);

  return {
    product_id: getCartProductId(item) || "",
    variant_id: getCartVariantId(item) || "",
    vendor_id: vendorId,
    product_name:
    item?.pid?.productName ||
    item?.pid?.itemName ||
    item?.name ||
    "Untitled Product",
    quantity: item?.qty || item?.quantity || 1,
    unit_price: getCheckoutItemPrice(item)
  };
}

function isValidObjectId(val) {
  return typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);
}

function getLoggedInUserId(cartItems) {
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (err) {
    console.warn("getLoggedInUserId: failed to parse user from localStorage:", err?.message);
    user = {};
  }

  const candidates = [
  cartItems?.[0]?.cid,
  user?._id,
  user?.id,
  user?.userId,
  localStorage.getItem("cid"),
  localStorage.getItem("userId")];


  return candidates.find(isValidObjectId) || "";
}

const steps = ["BAG", "ADDRESS", "PAYMENT"];

export default function CheckoutPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [cartReady, setCartReady] = useState(false);
  const [currentStep, setCurrentStep] = useState("BAG");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let checkoutData = {};
      let savedCartItems = [];

      try {
        checkoutData = JSON.parse(
          localStorage.getItem("checkoutData") || "{}"
        );
      } catch (err) {
        console.warn("Failed to parse checkoutData from localStorage:", err?.message);
        checkoutData = {};
      }

      try {
        savedCartItems = JSON.parse(
          localStorage.getItem("cartItems") || "[]"
        );
      } catch (err) {
        console.warn("Failed to parse cartItems from localStorage:", err?.message);
        savedCartItems = [];
      }

      const items = Array.isArray(checkoutData.items) ?
      checkoutData.items :
      savedCartItems;

      setCartItems(
        Array.isArray(items) ? items.map(normalizeCheckoutItem) : []
      );

      setCartReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const isLoggedIn =
    localStorage.getItem("userToken") || localStorage.getItem("user");

    if (!isLoggedIn) {
      router.replace("/Addtocard");
    }
  }, [router]);

  const canProceedFromBag = cartItems.length > 0;

  const handleProceedFromBag = () => {
    if (!canProceedFromBag) {
      toast.error("Your cart is empty. Please add an item before checkout.");
      router.replace("/Addtocard");
      return;
    }

    setCurrentStep("ADDRESS");
  };

  const handleSaveAddress = async (address) => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const userId = getLoggedInUserId(cartItems);

    if (!userId) {
      toast.error("Could not find a valid user id. Please log in again.");
      return;
    }

    let user = {};

    try {
      user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch (err) {
      console.warn("handleSaveAddress: failed to parse user from localStorage:", err?.message);
      user = {};
    }

    const [firstName, ...rest] = (address.fullName || "").trim().split(" ");
    const lastName = rest.join(" ");

    const orderItems = cartItems.map(toOrderItem);

    const missingVendor = orderItems.find((item) => !item.vendor_id);

    if (missingVendor) {
      console.warn("vendor_id missing for item:", missingVendor);
      toast.error(
        "Kuch products ke liye vendor information nahi mil paayi. Cart me wapas jaakar item remove/add karke dobara try karo."
      );
      return;
    }

    const rootVendorId = orderItems[0]?.vendor_id || "";

    const payload = {
      user_id: userId,
      vendor_id: rootVendorId,
      payment_method: "COD",

      items: orderItems,

      billing_address: {
        line1: address.houseNumber || "",
        line2: address.area || address.locality || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        country: "India"
      },

      shipping_address: {
        line1: address.houseNumber || "",
        line2: address.area || address.locality || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        country: "India"
      },

      customer_details: {
        first_name: firstName || "",
        last_name: lastName || "",
        phone: address.mobile || "",
        email: user?.email || ""
      }
    };

    try {
      setPlacingOrder(true);

      console.log("ORDER PAYLOAD:", JSON.stringify(payload, null, 2));

      await placeOrder(payload);

      const orderedCartIds = cartItems.
      map((item) => item?._id || item?.cartId || item?.id).
      filter(isValidObjectId);

      const deleteResults = await Promise.allSettled(
        orderedCartIds.map((id) => deleteCartItem(id))
      );

      deleteResults.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            "Failed to remove ordered cart item",
            orderedCartIds[index],
            result.reason?.response?.data ||
            result.reason?.message ||
            result.reason
          );
        }
      });

      localStorage.removeItem("checkoutData");
      localStorage.removeItem("cartItems");
      window.dispatchEvent(new Event("cartUpdated"));

      toast.success("Order placed successfully!");
      router.push("/");
    } catch (error) {
      console.log(
        "FULL ERROR RESPONSE:",
        JSON.stringify(error.response?.data, null, 2)
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to place order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!cartReady) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-4">
        <div className="max-w-6xl mx-auto rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          Loading checkout...
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {steps.map((step, index) =>
            <span key={step} className="flex items-center gap-4">
                <button
                type="button"
                onClick={() => {
                  if (step === "BAG") setCurrentStep("BAG");
                  if (step === "ADDRESS" && canProceedFromBag) {
                    setCurrentStep("ADDRESS");
                  }
                }}
                className={`text-xs font-bold tracking-widest ${
                currentStep === step ?
                "text-[#FF9900]" :
                "text-gray-400"}`
                }>
                
                  {step}
                </button>

                {index < steps.length - 1 &&
              <span className="text-gray-300">- - - - - -</span>
              }
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
            <ShieldCheck className="h-4 w-4" />
            100% SECURE
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-4 items-start">
          <div>
            {currentStep === "BAG" &&
            <>
                <CartItems items={cartItems} />

                <button
                type="button"
                onClick={handleProceedFromBag}
                disabled={!canProceedFromBag}
                className={`mt-4 w-full sm:w-auto px-8 h-12 rounded-md text-sm font-bold tracking-wide transition ${
                canProceedFromBag ?
                "bg-[#FF9900] hover:bg-[#e68a00] text-black" :
                "cursor-not-allowed bg-gray-200 text-gray-500"}`
                }>
                
                  PLACE ORDER
                </button>
              </>
            }

            {currentStep === "ADDRESS" &&
            <AddressForm
              onSave={handleSaveAddress}
              saving={placingOrder} />

            }
          </div>

          <div className="lg:sticky lg:top-44 self-start">
            <OrderSummary
              items={cartItems}
              onProceed={handleProceedFromBag}
              disabled={!canProceedFromBag} />
            
          </div>
        </div>
      </div>
    </div>);

}
