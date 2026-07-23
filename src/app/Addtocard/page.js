"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userLogin } from "../apis/userlogin/userlogin";
import { userRegister } from "../apis/userregister/userregister";
import {
  buildCartUpdatePayload,
  deleteCartItem,
  getCartProductId,
  getCartItems,
  getCartVariantId,
  syncDeviceCartToCustomer,
  updateCartItem } from
"../apis/cart/cart";
import { getLoggedInCid, saveCustomerSession } from "../apis/customer/customer";
import { syncDeviceWishlistToCustomer } from "../apis/wishlist/wishlist";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import {
  Heart,
  Minus,
  Plus,
  Trash2,
  ChevronRight,
  Star,
  ShieldCheck,
  Truck,
  Tag,
  User,
  X } from
"lucide-react";

export default function CartPage() {
  const router = useRouter();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const hasGoogleClientId =
  googleClientId && googleClientId !== "your_google_client_id_here";
  const [cartItems, setCartItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [loading, setLoading] = useState(true);


  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });


  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
    status: "active",
    role: "customer",
    companyname: "",
    category: "",
    city: "",
    state: "",
    pincode: ""
  });


  const fetchCart = async (cid = getLoggedInCid()) => {
    try {
      setLoading(true);
      const res = await getCartItems({ cid });
      const items = res.data?.data || res.data || [];
      const list = Array.isArray(items) ? items : [];
      setCartItems(list);
      setSelectedItemIds(list.map((item) => item._id).filter(Boolean));
    } catch (error) {
      console.log("fetchCart error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchCart();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const recommendedProducts = [
  {
    id: 1,
    title: "Apple AirPods Pro 2nd Gen",
    image:
    "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1000",
    price: "₹19,999",
    oldPrice: "₹24,999"
  },
  {
    id: 2,
    title: "Samsung Galaxy Watch 6",
    image:
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1000",
    price: "₹29,999",
    oldPrice: "₹35,999"
  },
  {
    id: 3,
    title: "Sony Bluetooth Speaker",
    image:
    "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=1000",
    price: "₹8,999",
    oldPrice: "₹11,999"
  },
  {
    id: 4,
    title: "Apple MacBook Air M3",
    image:
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000",
    price: "₹1,09,999",
    oldPrice: "₹1,24,999"
  },
  {
    id: 5,
    title: "Premium Wireless Mouse",
    image:
    "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1000",
    price: "₹2,999",
    oldPrice: "₹4,999"
  }];


  const getTitle = (item) => item.pid?.productName || item.pid?.itemName || "Untitled Product";

  const getImage = (item) =>
  item.variantId?.images?.[0] || item.pid?.images?.[0] || "https://via.placeholder.com/150";

  const getPrice = (item) => item.variantId?.offer?.salePrice || item.variantId?.offer?.sellingPrice || 0;

  const getMrp = (item) => item.variantId?.offer?.mrp || 0;

  const getQty = (item) => item.qty || 1;

  const removeItemFromLocalCart = (item) => {
    if (typeof window === "undefined") return;

    const targetProductId = getCartProductId(item);
    const targetVariantId = getCartVariantId(item);
    const savedItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

    if (!Array.isArray(savedItems)) return;

    const nextItems = savedItems.filter((savedItem) => {
      const sameStoredId =
      item._id && savedItem._id === item._id ||
      item.id && savedItem.id === item.id;
      const savedProductId = getCartProductId(savedItem);
      const savedVariantId = getCartVariantId(savedItem);
      const sameProduct =
      targetProductId &&
      savedProductId &&
      String(savedProductId) === String(targetProductId);
      const sameVariant =
      !targetVariantId ||
      !savedVariantId ||
      String(savedVariantId) === String(targetVariantId);

      return !(sameStoredId || sameProduct && sameVariant);
    });

    localStorage.setItem("cartItems", JSON.stringify(nextItems));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const syncCartQty = async (item, nextQty) => {
    if (!item?._id) return;

    try {
      await updateCartItem(item._id, buildCartUpdatePayload(item, getLoggedInCid(), nextQty));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Failed to update cart qty", error);
    }
  };

  const increaseQty = (item) => {
    const nextQty = getQty(item) + 1;
    setCartItems((prev) =>
    prev.map((i) =>
    i._id === item._id ? { ...i, qty: nextQty } : i
    )
    );
    syncCartQty(item, nextQty);
  };

  const decreaseQty = (item) => {
    const currentQty = getQty(item);
    if (currentQty <= 1) return;
    const nextQty = currentQty - 1;

    setCartItems((prev) =>
    prev.map((i) =>
    i._id === item._id ? { ...i, qty: nextQty } : i
    )
    );
    syncCartQty(item, nextQty);
  };

  const removeItem = async (item) => {
    if (!item?._id) return;

    setCartItems((prev) => prev.filter((i) => i._id !== item._id));
    setSelectedItemIds((prev) => prev.filter((id) => id !== item._id));
    removeItemFromLocalCart(item);

    try {
      await deleteCartItem(item._id);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Failed to remove cart item", error);
      fetchCart();
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItemIds((prev) =>
    prev.includes(itemId) ?
    prev.filter((id) => id !== itemId) :
    [...prev, itemId]
    );
  };

  const addRecommendedToCart = (product) => {
    console.log("Add to cart clicked:", product);
  };

  const isUserLoggedIn = () => {
    if (typeof window === "undefined") return false;

    return Boolean(
      localStorage.getItem("userToken") || localStorage.getItem("user")
    );
  };



  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };



  const isNotRegisteredError = (message = "") => {
    const msg = message.toLowerCase();
    return (
      msg.includes("not found") ||
      msg.includes("not registered") ||
      msg.includes("does not exist") ||
      msg.includes("no user") ||
      msg.includes("invalid email"));

  };

  const handleLocalLogin = async (e) => {
    e.preventDefault();

    try {
      setLoginLoading(true);
      const res = await userLogin(loginForm);

      const cid = saveCustomerSession(res.data);
      localStorage.setItem("checkoutUser", JSON.stringify(res.data));
      await Promise.all([
      syncDeviceCartToCustomer(cid),
      syncDeviceWishlistToCustomer(cid)]
      );
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));
      await fetchCart(cid);

      setLoginForm({ email: "", password: "" });
      setLoginModalOpen(false);
      toast.success("Login successful. You can proceed to checkout now.");
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";


      if (isNotRegisteredError(message)) {
        setRegisterForm((prev) => ({
          ...prev,
          email: loginForm.email,
          password: loginForm.password
        }));
        setLoginModalOpen(false);
        setRegisterModalOpen(true);
      } else {
        toast.error(message);
      }
    } finally {
      setLoginLoading(false);
    }
  };



  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value
    });
  };

  const handleLocalRegister = async (e) => {
    e.preventDefault();

    try {
      setRegisterLoading(true);
      const res = await userRegister(registerForm);

      const cid = saveCustomerSession(res.data);
      localStorage.setItem("checkoutUser", JSON.stringify(res.data));
      await Promise.all([
      syncDeviceCartToCustomer(cid),
      syncDeviceWishlistToCustomer(cid)]
      );
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));
      await fetchCart(cid);

      setRegisterModalOpen(false);
      toast.success("Registration successful. You can proceed to checkout now.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setRegisterLoading(false);
    }
  };





  const handleGoogleLoginSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      setLoginForm((prev) => ({
        ...prev,
        email: decoded.email || prev.email
      }));
    } catch (err) {
      console.error("Google decode error (login):", err);
    }
  };



  const handleGoogleRegisterSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      setRegisterForm((prev) => ({
        ...prev,
        name: decoded.name || prev.name,
        email: decoded.email || prev.email
      }));
    } catch (err) {
      console.error("Google decode error (register):", err);
    }
  };



  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Please add at least one product to cart before checkout.");
      return;
    }

    if (selectedCartItems.length === 0) {
      toast.error("Please select at least one product before checkout.");
      return;
    }

    if (!isUserLoggedIn()) {
      setLoginModalOpen(true);
      return;
    }

    const checkoutData = {
      items: selectedCartItems,
      subtotal,
      total,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    router.push("/Checkout");
  };

  const selectedCartItems = cartItems.filter((item) =>
  selectedItemIds.includes(item._id)
  );

  const subtotal = selectedCartItems.reduce(
    (acc, item) => acc + getPrice(item) * getQty(item),
    0
  );

  const total = subtotal;
  const canProceedToCheckout = cartItems.length > 0 && selectedCartItems.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading cart...</p>
      </div>);

  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-6 px-3 md:px-5">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_340px] gap-5">
        {}
        <div className="space-y-4">
          {}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Shopping Cart
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedCartItems.length} of {cartItems.length} Items selected
                </p>
              </div>

              <button
                onClick={() => router.push("/")}
                className="hidden md:block text-sm text-blue-600 font-medium">
                
                Continue Shopping
              </button>
            </div>
          </div>

          {}
          {cartItems.length === 0 ?
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-gray-700 font-semibold">Your cart is empty</p>
              <button
              onClick={() => router.push("/")}
              className="mt-4 px-5 h-10 rounded-xl bg-black text-white text-sm font-semibold">
              
                Continue Shopping
              </button>
            </div> :

          cartItems.map((item) => {
            const title = getTitle(item);
            const image = getImage(item);
            const price = getPrice(item);
            const mrp = getMrp(item);
            const quantity = getQty(item);
            const lineTotal = price * quantity;
            const isSelected = selectedItemIds.includes(item._id);

            return (
              <div
                key={item._id}
                className={`rounded-2xl border bg-white p-4 transition hover:shadow-md ${
                isSelected ? "border-gray-200" : "border-gray-200 opacity-70"}`
                }>
                
                  <div className="flex gap-4">
                    <label className="mt-10 flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center">
                      <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItemSelection(item._id)}
                      aria-label={`Select ${title}`}
                      className="h-5 w-5 cursor-pointer accent-black" />
                    
                    </label>

                    {}
                    <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover" />
                    
                    </div>

                    {}
                    <div className="flex-1">
                      {}
                      <h2 className="text-[15px] font-semibold text-gray-900 line-clamp-2">
                        {title}
                      </h2>

                      {}
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) =>
                      <Star
                        key={star}
                        size={12}
                        className="fill-yellow-400 text-yellow-400" />

                      )}

                        <span className="text-[11px] text-gray-500 ml-1">
                          4.5
                        </span>
                      </div>

                      {}
                      <p className="text-[12px] text-green-600 font-medium mt-2">
                        FREE Delivery Tomorrow
                      </p>

                      {}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xl font-bold text-gray-900">
                          ₹{price.toLocaleString()}
                        </span>

                        {mrp > price &&
                      <span className="text-sm line-through text-gray-400">
                            ₹{mrp.toLocaleString()}
                          </span>
                      }
                      </div>

                      <p className="mt-1 text-xs font-medium text-gray-600">
                        {isSelected ? "Item total" : "Not included"}: Rs.
                        {lineTotal.toLocaleString()} ({quantity} x Rs.
                        {price.toLocaleString()})
                      </p>

                      {}
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                        {}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                          onClick={() => decreaseQty(item)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-100">
                          
                            <Minus size={14} />
                          </button>

                          <span className="w-10 text-center text-sm font-medium">
                            {quantity}
                          </span>

                          <button
                          onClick={() => increaseQty(item)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-100">
                          
                            <Plus size={14} />
                          </button>
                        </div>

                        {}
                        <div className="flex items-center gap-2">
                          <button className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition">
                            Save
                          </button>

                          <button
                          onClick={() => removeItem(item)}
                          className="h-9 px-4 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition flex items-center gap-2">
                          
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>);

          })
          }

          {}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            {}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  You may also like
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Products related to your cart
                </p>
              </div>

              <button className="hidden md:flex items-center gap-1 text-sm font-medium text-blue-600">
                View All
                <ChevronRight size={15} />
              </button>
            </div>

            {}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recommendedProducts.map((product) =>
              <div
                key={product.id}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all">
                
                  {}
                  <div className="relative bg-[#f7f7f7] h-40 overflow-hidden">
                    {}
                    <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] px-2 py-1 rounded-md font-semibold">
                      20% OFF
                    </span>

                    {}
                    <button className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Heart size={14} />
                    </button>

                    <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  
                  </div>

                  {}
                  <div className="p-3">
                    {}
                    <div className="flex items-center gap-[2px] mb-1">
                      {[1, 2, 3, 4, 5].map((star) =>
                    <Star
                      key={star}
                      size={11}
                      className="fill-yellow-400 text-yellow-400" />

                    )}

                      <span className="text-[11px] text-gray-500 ml-1">
                        4.5
                      </span>
                    </div>

                    {}
                    <h3 className="text-[13px] font-medium text-gray-800 line-clamp-2 min-h-[38px]">
                      {product.title}
                    </h3>

                    {}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[16px] font-bold text-gray-900">
                        {product.price}
                      </span>

                      <span className="text-[11px] text-gray-400 line-through">
                        {product.oldPrice}
                      </span>
                    </div>

                    {}
                    <p className="text-[11px] text-green-600 font-medium mt-1">
                      FREE Delivery Tomorrow
                    </p>

                    {}
                    <button
                    onClick={() => addRecommendedToCart(product)}
                    className="w-full h-9 mt-3 rounded-xl bg-[#111827] hover:bg-black text-white text-[13px] font-medium transition">
                    
                      Add to Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="space-y-4">
          {}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={18} className="text-orange-500" />

              <h2 className="font-semibold text-gray-900">Apply Coupon</h2>
            </div>

            <div className="flex gap-2">
              <label htmlFor="coupon-code" className="sr-only">
                Coupon code
              </label>
              <input
                id="coupon-code"
                type="text"
                placeholder="Coupon code"
                className="flex-1 h-11 border border-gray-200 rounded-xl px-4 outline-none focus:ring-2 focus:ring-black text-sm" />
              

              <button className="px-5 rounded-xl bg-black text-white text-sm font-medium">
                Apply
              </button>
            </div>
          </div>

          {}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-34">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Order Summary
            </h2>

            <p className="mb-4 text-xs font-medium text-gray-500">
              {selectedCartItems.length} selected item
              {selectedCartItems.length === 1 ? "" : "s"} included in total
            </p>

            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>

                <span className="text-green-600 font-medium">FREE</span>
              </div>

              {}
              <div className="bg-green-50 rounded-xl p-3">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-green-700 font-medium">
                    Free Shipping
                  </span>

                  <span className="text-green-700 font-medium">80%</span>
                </div>

                <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
                  <div className="w-4/5 h-full bg-green-500 rounded-full"></div>
                </div>

                <p className="text-xs text-green-700 mt-2">
                  You unlocked FREE delivery 🎉
                </p>
              </div>

              {}
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>

                <span className="text-2xl font-bold text-gray-900">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>

            {}
            <button
              onClick={handleCheckout}
              disabled={!canProceedToCheckout}
              className={`w-full h-12 rounded-xl font-semibold mt-6 transition ${
              canProceedToCheckout ?
              "bg-black hover:bg-gray-900 text-white" :
              "cursor-not-allowed bg-gray-200 text-gray-500"}`
              }>
              
              Proceed to Checkout
            </button>

            {}
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <ShieldCheck size={16} />
                Secure Payments
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck size={16} />
                Fast Delivery
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      {loginModalOpen &&
      <div
        role="button"
        tabIndex={0}
        className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
        onClick={() => setLoginModalOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setLoginModalOpen(false);
        }}>
        
          <div
          className="w-full max-w-[430px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          
            <div className="bg-[#1e2a3a] px-6 py-5 flex items-start justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">
                  Login Required
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Please log in before checkout.
                </p>
              </div>

              <button
              type="button"
              onClick={() => setLoginModalOpen(false)}
              className="text-gray-300 hover:text-white transition">
              
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLocalLogin} className="px-6 py-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="Enter email"
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                  required />
                
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Enter password"
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                  required />
                
                </div>
              </div>

              {}
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-400">OR</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <div className="flex justify-center">
                  {hasGoogleClientId ?
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => console.log("Google Login Failed")} /> :


                <p className="text-xs text-red-500">
                      Add Google client id in root .env.local
                    </p>
                }
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                New here?{" "}
                <button
                type="button"
                onClick={() => {
                  setRegisterForm((prev) => ({
                    ...prev,
                    email: loginForm.email,
                    password: loginForm.password
                  }));
                  setLoginModalOpen(false);
                  setRegisterModalOpen(true);
                }}
                className="text-[#F5A623] font-semibold hover:underline">
                
                  Create an account
                </button>
              </p>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button
                type="button"
                onClick={() => setLoginModalOpen(false)}
                className="px-5 h-11 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition">
                
                  Cancel
                </button>

                <button
                type="submit"
                disabled={loginLoading}
                className="px-5 h-11 rounded-lg bg-[#F5A623] hover:bg-[#e09610] text-white text-sm font-semibold flex items-center gap-2 transition disabled:opacity-60">
                
                  <User size={16} />
                  {loginLoading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      {}
      {registerModalOpen &&
      <div
        role="button"
        tabIndex={0}
        className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
        onClick={() => setRegisterModalOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setRegisterModalOpen(false);
        }}>
        
          <div
          className="w-full max-w-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}>
          
            <div className="bg-[#1e2a3a] px-6 py-5 flex items-start justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">
                  Create Account
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Looks like you don&apos;t have an account yet. Please register to continue.
                </p>
              </div>

              <button
              type="button"
              onClick={() => setRegisterModalOpen(false)}
              className="text-gray-300 hover:text-white transition">
              
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLocalRegister} className="px-6 py-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  placeholder="Enter full name"
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                  required />
                
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder="Enter email"
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                  required />
                
                </div>

                <div>
                  <label htmlFor="register-number" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                  id="register-number"
                  type="text"
                  name="number"
                  value={registerForm.number}
                  onChange={handleRegisterChange}
                  placeholder="Enter mobile number"
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                  required />
                
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                  id="register-password"
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="Enter password"
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                  required />
                
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="register-city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                    id="register-city"
                    type="text"
                    name="city"
                    value={registerForm.city}
                    onChange={handleRegisterChange}
                    placeholder="City"
                    className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]" />
                  
                  </div>

                  <div>
                    <label htmlFor="register-state" className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                    id="register-state"
                    type="text"
                    name="state"
                    value={registerForm.state}
                    onChange={handleRegisterChange}
                    placeholder="State"
                    className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]" />
                  
                  </div>
                </div>

                <div>
                  <label htmlFor="register-pincode" className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                  id="register-pincode"
                  type="text"
                  name="pincode"
                  value={registerForm.pincode}
                  onChange={handleRegisterChange}
                  placeholder="Pincode"
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]" />
                
                </div>
              </div>

              {}
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-400">OR</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <div className="flex justify-center">
                  {hasGoogleClientId ?
                <GoogleLogin
                  onSuccess={handleGoogleRegisterSuccess}
                  onError={() => console.log("Google Login Failed")} /> :


                <p className="text-xs text-red-500">
                      Add Google client id in root .env.local
                    </p>
                }
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Already have an account?{" "}
                <button
                type="button"
                onClick={() => {
                  setLoginForm((prev) => ({
                    ...prev,
                    email: registerForm.email,
                    password: registerForm.password
                  }));
                  setRegisterModalOpen(false);
                  setLoginModalOpen(true);
                }}
                className="text-[#F5A623] font-semibold hover:underline">
                
                  Login instead
                </button>
              </p>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button
                type="button"
                onClick={() => setRegisterModalOpen(false)}
                className="px-5 h-11 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition">
                
                  Cancel
                </button>

                <button
                type="submit"
                disabled={registerLoading}
                className="px-5 h-11 rounded-lg bg-[#F5A623] hover:bg-[#e09610] text-white text-sm font-semibold flex items-center gap-2 transition disabled:opacity-60">
                
                  <User size={16} />
                  {registerLoading ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>);

}
