"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Store,
  ChevronDown,
  MessageCircle,
} from "lucide-react";

import { getCategories } from "../apis/category/category";
import { sendWhatsAppOtp } from "../apis/whatsapp/whatsapp";
import { userLogin } from "../apis/userlogin/userlogin";
import { userRegister } from "../apis/userregister/userregister";
import { saveCustomerSession } from "../apis/customer/customer";
import { syncDeviceCartToCustomer } from "../apis/cart/cart";
import { syncDeviceWishlistToCustomer } from "../apis/wishlist/wishlist";

// Keeps shared navbar defaults and helpers outside the component body.

const initialUserRegisterForm = {
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
  pincode: "",
};

const getStoredCustomer = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      localStorage.getItem("checkoutUser") ||
      localStorage.getItem("customer") ||
      localStorage.getItem("customerData") ||
      localStorage.getItem("user");

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    const cust =
      parsed?.data?.customer ||
      parsed?.data?.user ||
      parsed?.customer ||
      parsed?.user ||
      parsed?.data ||
      parsed;

    if (!cust?._id && !cust?.id) return null;

    return cust;
  } catch {
    return null;
  }
};

function extractCategoriesList(response) {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

function extractLoggedCustomer(payload) {
  return (
    payload?.data?.data?.customer ||
    payload?.data?.data?.user ||
    payload?.data?.customer ||
    payload?.data?.user ||
    payload?.data?.data ||
    payload?.data
  );
}

function findCategoryId(categories, name) {
  const match = categories.find(
    (cat) => cat.name?.toLowerCase() === String(name).toLowerCase()
  );
  return match?._id || null;
}

// Builds a shop URL that carries both category name and category id.
function buildCategoryHref(cat) {
  const params = new URLSearchParams();
  if (cat?._id) params.set("categoryId", cat._id);
  if (cat?.name) params.set("category", cat.name);
  return `/shop?${params.toString()}`;
}

function buildShopUrl(category, query, categories = []) {
  const params = new URLSearchParams();
  const trimmedQuery = query.trim();

  if (category !== "All") {
    params.set("category", category);

    // Adds categoryId so the shop page can call the filtered products API.
    const matchedId = findCategoryId(categories, category);
    if (matchedId) params.set("categoryId", matchedId);
  }

  if (trimmedQuery) params.set("search", trimmedQuery);

  const qs = params.toString();
  return `/shop${qs ? `?${qs}` : ""}`;
}

function isNotRegisteredError(message = "") {
  const msg = message.toLowerCase();

  return (
    msg.includes("not found") ||
    msg.includes("not registered") ||
    msg.includes("does not exist") ||
    msg.includes("no user") ||
    msg.includes("invalid email")
  );
}

function isInsideAnyRef(refs, target) {
  return refs.some((ref) => ref.current?.contains(target));
}

// Handles customer login, registration, Google auth, sync, and logout state.

function useCustomerAuth(router) {
  const [customer, setCustomer] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userRegisterOpen, setUserRegisterOpen] = useState(false);
  const [userForm, setUserForm] = useState({ email: "", password: "" });
  const [userRegisterForm, setUserRegisterForm] = useState(
    initialUserRegisterForm
  );
  const [userLoginLoading, setUserLoginLoading] = useState(false);
  const [userRegisterLoading, setUserRegisterLoading] = useState(false);

  useEffect(() => {
    const syncCustomer = () => setCustomer(getStoredCustomer());
    queueMicrotask(syncCustomer);

    window.addEventListener("customerUpdated", syncCustomer);
    window.addEventListener("storage", syncCustomer);

    return () => {
      window.removeEventListener("customerUpdated", syncCustomer);
      window.removeEventListener("storage", syncCustomer);
    };
  }, []);

  const syncCustomerData = async (cid) => {
    if (!cid) return;

    try {
      await Promise.allSettled([
        syncDeviceCartToCustomer(cid),
        syncDeviceWishlistToCustomer(cid),
      ]);

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (syncError) {
      console.warn("Cart/Wishlist sync failed:", syncError?.message);
    }
  };

  const applyLoggedInCustomer = async (res) => {
    const cid = saveCustomerSession(res.data);
    localStorage.setItem("checkoutUser", JSON.stringify(res.data));

    const loggedCustomer = extractLoggedCustomer(res);
    if (loggedCustomer) setCustomer(loggedCustomer);

    window.dispatchEvent(new Event("customerUpdated"));
    await syncCustomerData(cid);
  };

  const handleUserChange = (event) => {
    setUserForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleUserRegisterChange = (event) => {
    setUserRegisterForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const openUserRegister = () => {
    setUserRegisterForm((prev) => ({
      ...prev,
      email: userForm.email,
      password: userForm.password,
    }));

    setUserModalOpen(false);
    setUserRegisterOpen(true);
  };

  const openUserLogin = () => {
    setUserForm((prev) => ({
      ...prev,
      email: userRegisterForm.email,
      password: userRegisterForm.password,
    }));

    setUserRegisterOpen(false);
    setUserModalOpen(true);
  };

  const handleUserLogin = async (event) => {
    event.preventDefault();
    setUserLoginLoading(true);

    try {
      const res = await userLogin(userForm);
      await applyLoggedInCustomer(res);

      toast.success("User Login Successfully!");
      setUserForm({
        email: "",
        password: "",
      });

      setUserModalOpen(false);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed";

      if (isNotRegisteredError(message)) {
        openUserRegister();
      } else {
        toast.error(message);
      }
    } finally {
      setUserLoginLoading(false);
    }
  };

  const handleUserRegister = async (event) => {
    event.preventDefault();
    setUserRegisterLoading(true);

    try {
      const res = await userRegister(userRegisterForm);
      await applyLoggedInCustomer(res);

      toast.success("Registration successful. You are logged in now.");
      setUserRegisterForm(initialUserRegisterForm);
      setUserRegisterOpen(false);
    } catch (error) {
     toast.error("Registration failed");
    } finally {
      setUserRegisterLoading(false);
    }
  };

  const handleGoogleUserLoginSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      setUserForm((prev) => ({ ...prev, email: decoded.email || prev.email }));
    } catch (error) {
      console.error("Google decode error login:", error);
    }
  };

  const handleGoogleUserRegisterSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      setUserRegisterForm((prev) => ({
        ...prev,
        name: decoded.name || prev.name,
        email: decoded.email || prev.email,
      }));
    } catch (error) {
      console.error("Google decode error register:", error);
    }
  };

  const handleLogout = () => {
    ["checkoutUser", "customer", "customerData", "user", "token"].forEach(
      (key) => localStorage.removeItem(key)
    );

    setCustomer(null);

    window.dispatchEvent(new Event("customerUpdated"));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));

    router.push("/");
  };

  return {
    customer,
    userModalOpen,
    setUserModalOpen,
    userRegisterOpen,
    setUserRegisterOpen,
    userForm,
    userRegisterForm,
    userLoginLoading,
    userRegisterLoading,
    handleUserChange,
    handleUserRegisterChange,
    openUserRegister,
    openUserLogin,
    handleUserLogin,
    handleUserRegister,
    handleGoogleUserLoginSuccess,
    handleGoogleUserRegisterSuccess,
    handleLogout,
  };
}

// Renders small reusable navbar UI pieces.

function CategoryDropdownList({ categories, searchCategory, onSelect }) {
  return (
    <div className="absolute left-0 top-[calc(100%+8px)] w-52 max-h-72 overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-100 z-[9999] py-1.5">
      <button
        type="button"
        onClick={() => onSelect("All")}
        className={
          searchCategory === "All"
            ? "w-full text-left px-4 py-2.5 text-sm bg-[#FF9900]/10 text-[#FF9900] font-semibold"
            : "w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF9900]"
        }
      >
        All
      </button>

      {categories.map((cat) => (
        <button
          key={cat._id || cat.name}
          type="button"
          onClick={() => onSelect(cat.name)}
          className={
            searchCategory === cat.name
              ? "w-full text-left px-4 py-2.5 text-sm bg-[#FF9900]/10 text-[#FF9900] font-semibold"
              : "w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF9900]"
          }
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

function ProfileMenu({ customer, onLogout, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="font-bold text-gray-900 text-sm">
          Hello {customer.name || "there"}
        </p>

        {(customer.number || customer.phone) && (
          <p className="text-xs text-gray-500 mt-0.5">
            {customer.number || customer.phone}
          </p>
        )}
      </div>

      <div className="py-1">
        <Link
          href="/orders"
          onClick={onClose}
          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF9900]"
        >
          Orders
        </Link>

        <Link
          href="/Wishlist"
          onClick={onClose}
          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF9900]"
        >
          Wishlist
        </Link>

        <Link
          href="/profile"
          onClick={onClose}
          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF9900]"
        >
          Profile
        </Link>
      </div>

      <div className="border-t border-gray-100 py-1">
        <button
          type="button"
          onClick={onLogout}
          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

// Renders an accessible full-screen backdrop button for closing dialogs.
function ModalBackdrop({ onClose }) {
  return (
    <button
      type="button"
      aria-label="Close dialog"
      onClick={onClose}
      className="fixed inset-0 z-[99999] w-full h-full bg-black/50 cursor-default"
    />
  );
}

function LabeledInput({ id, label, type = "text", name, value, onChange, required, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
      />
    </div>
  );
}

function GoogleAuthSection({ hasGoogleClientId, onSuccess }) {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="flex justify-center">
        {hasGoogleClientId ? (
          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => console.log("Google Login Failed")}
          />
        ) : (
          <p className="text-xs text-red-500">
            Add Google client id in root .env.local
          </p>
        )}
      </div>
    </div>
  );
}

function LoginModal({ auth, hasGoogleClientId }) {
  return createPortal(
    <>
      <ModalBackdrop onClose={() => auth.setUserModalOpen(false)} />

      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl w-full max-w-[440px] shadow-2xl overflow-hidden pointer-events-auto">
          <div className="bg-[#1e2a3a] px-7 py-5 flex items-start justify-between">
            <div>
              <h2 className="text-white text-xl font-bold">User Login</h2>
              <p className="text-gray-400 text-sm mt-1">
                Login to your user account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => auth.setUserModalOpen(false)}
              className="text-gray-400 hover:text-white transition mt-1"
              aria-label="Close login form"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={auth.handleUserLogin} className="px-5 sm:px-7 py-6 sm:py-8">
            <div className="space-y-5">
              <LabeledInput
                id="login-email"
                label="Email"
                type="email"
                name="email"
                value={auth.userForm.email}
                onChange={auth.handleUserChange}
                placeholder="Enter email"
                required
              />

              <LabeledInput
                id="login-password"
                label="Password"
                type="password"
                name="password"
                value={auth.userForm.password}
                onChange={auth.handleUserChange}
                placeholder="Enter password"
                required
              />
            </div>

            <GoogleAuthSection
              hasGoogleClientId={hasGoogleClientId}
              onSuccess={auth.handleGoogleUserLoginSuccess}
            />

            <p className="text-xs text-gray-500 mt-4">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={auth.openUserRegister}
                className="text-[#F5A623] font-semibold hover:underline"
              >
                Register here
              </button>
            </p>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => auth.setUserModalOpen(false)}
                className="px-6 h-11 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={auth.userLoginLoading}
                className="px-6 h-11 rounded-lg bg-[#F5A623] hover:bg-[#e09610] text-white text-sm font-semibold flex items-center gap-2 transition disabled:opacity-60"
              >
                <User size={16} />
                {auth.userLoginLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}

function RegisterModal({ auth, hasGoogleClientId }) {
  const f = auth.userRegisterForm;

  return createPortal(
    <>
      <ModalBackdrop onClose={() => auth.setUserRegisterOpen(false)} />

      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl w-full max-w-[720px] max-h-[90vh] shadow-2xl overflow-hidden pointer-events-auto">
          <div className="bg-[#1e2a3a] px-7 py-5 flex items-start justify-between">
            <div>
              <h2 className="text-white text-xl font-bold">User Register</h2>
              <p className="text-gray-400 text-sm mt-1">
                Create your user account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => auth.setUserRegisterOpen(false)}
              className="text-gray-400 hover:text-white transition mt-1"
              aria-label="Close register form"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={auth.handleUserRegister}
            className="px-5 sm:px-7 py-6 sm:py-8 overflow-y-auto max-h-[calc(90vh-88px)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <LabeledInput id="register-name" label="Name" name="name" value={f.name} onChange={auth.handleUserRegisterChange} placeholder="Enter name" required />
              <LabeledInput id="register-email" label="Email" type="email" name="email" value={f.email} onChange={auth.handleUserRegisterChange} placeholder="Enter email" required />
              <LabeledInput id="register-number" label="Mobile Number" name="number" value={f.number} onChange={auth.handleUserRegisterChange} placeholder="Enter mobile number" required />
              <LabeledInput id="register-password" label="Password" type="password" name="password" value={f.password} onChange={auth.handleUserRegisterChange} placeholder="Enter password" required />

              <div className="sm:col-span-2">
                <label htmlFor="register-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="register-address"
                  name="address"
                  value={f.address}
                  onChange={auth.handleUserRegisterChange}
                  placeholder="Enter full address"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none"
                />
              </div>

              <LabeledInput id="register-city" label="City" name="city" value={f.city} onChange={auth.handleUserRegisterChange} placeholder="City" />
              <LabeledInput id="register-state" label="State" name="state" value={f.state} onChange={auth.handleUserRegisterChange} placeholder="State" />

              <div className="sm:col-span-2">
                <LabeledInput id="register-pincode" label="Pincode" name="pincode" value={f.pincode} onChange={auth.handleUserRegisterChange} placeholder="Pincode" />
              </div>
            </div>

            <GoogleAuthSection
              hasGoogleClientId={hasGoogleClientId}
              onSuccess={auth.handleGoogleUserRegisterSuccess}
            />

            <p className="text-xs text-gray-500 mt-4">
              Already have an account?{" "}
              <button
                type="button"
                onClick={auth.openUserLogin}
                className="text-[#F5A623] font-semibold hover:underline"
              >
                Login instead
              </button>
            </p>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={auth.openUserLogin}
                className="px-6 h-11 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
              >
                Login
              </button>

              <button
                type="submit"
                disabled={auth.userRegisterLoading}
                className="px-6 h-11 rounded-lg bg-[#F5A623] hover:bg-[#e09610] text-white text-sm font-semibold flex items-center gap-2 transition disabled:opacity-60"
              >
                <User size={16} />
                {auth.userRegisterLoading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}

// Renders the responsive site navbar and category navigation.

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const hasGoogleClientId =
    googleClientId && googleClientId !== "your_google_client_id_here";

  const auth = useCustomerAuth(router);

  const mobileProfileDropdownRef = useRef(null);
  const desktopProfileDropdownRef = useRef(null);
  const categoryPreviewTimeoutRef = useRef(null);
  const mobileSearchCategoryRef = useRef(null);
  const desktopSearchCategoryRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [allMenuOpen, setAllMenuOpen] = useState(false);

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  // Tracks the category currently previewed by hover or focus.
  const [previewCategoryId, setPreviewCategoryId] = useState(null);

  const [searchCategory, setSearchCategory] = useState("All");
  const [searchCategoryOpen, setSearchCategoryOpen] = useState(false);

  const [whatsappOtpLoading, setWhatsappOtpLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchCategoryWidth = Math.min(
    128,
    Math.max(74, searchCategory.length * 7 + 48)
  );

  const isActive = (path) => pathname === path;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    getCategories()
      .then((response) => setCategories(extractCategoriesList(response)))
      .catch((error) => {
        console.error("Category API error:", error);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !isInsideAnyRef(
          [mobileProfileDropdownRef, desktopProfileDropdownRef],
          event.target
        )
      ) {
        setProfileDropdownOpen(false);
      }

      if (
        !isInsideAnyRef(
          [mobileSearchCategoryRef, desktopSearchCategoryRef],
          event.target
        )
      ) {
        setSearchCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(categoryPreviewTimeoutRef.current);
    };
  }, []);

  const navigateToShop = (category, query) => {
    setActiveCategoryId(findCategoryId(categories, category));
    setPreviewCategoryId(null);
    router.push(buildShopUrl(category, query, categories));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigateToShop(searchCategory, searchQuery);
  };

  const handleSearchCategoryChange = (nextCategory) => {
    setSearchCategory(nextCategory);
    setSearchCategoryOpen(false);
    navigateToShop(nextCategory, searchQuery);
  };

  const openVendorModal = () => router.push("/vendor-register");

  const sendOtp = async () => {
    const number = auth.customer?.number || auth.customer?.phone;

    if (!number) {
     toast.error("Please login first.");
      auth.setUserModalOpen(true);
      return;
    }

    setWhatsappOtpLoading(true);

    try {
      await sendWhatsAppOtp({ number });
   toast.success("WhatsApp OTP sent successfully.");
    } catch (error) {
      console.error("WhatsApp OTP error:", error);
      toast.error("WhatsApp OTP send failed.");
    } finally {
      setWhatsappOtpLoading(false);
    }
  };

  const handleCategoryPreview = (categoryId) => {
    clearTimeout(categoryPreviewTimeoutRef.current);
    setPreviewCategoryId(categoryId);
  };

  const clearCategoryPreview = () => {
    categoryPreviewTimeoutRef.current = setTimeout(() => {
      setPreviewCategoryId(null);
    }, 200);
  };

  const toggleProfileOrLogin = () => {
    if (auth.customer) {
      setProfileDropdownOpen((prev) => !prev);
    } else {
      auth.setUserModalOpen(true);
    }
  };

  // Uses a lighter top bar style after the page is scrolled.
  const topBarClass = scrolled
    ? "border-t border-gray-100 overflow-x-hidden transition-colors duration-300 bg-white/30 backdrop-blur-lg"
    : "border-t border-gray-100 overflow-x-hidden transition-colors duration-300 bg-white/95 backdrop-blur-md";

  const homeLinkClass = isActive("/")
    ? "flex flex-col items-center justify-center gap-1 px-3 sm:px-4 py-1.5 shrink-0 text-[#FF9900]"
    : "flex flex-col items-center justify-center gap-1 px-3 sm:px-4 py-1.5 shrink-0 text-gray-800 hover:text-[#FF9900]";

  const homeLabelClass = isActive("/")
    ? "text-[11px] sm:text-xs whitespace-nowrap font-bold border-b-2 border-[#FF9900] pb-1"
    : "text-[11px] sm:text-xs whitespace-nowrap font-semibold";

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm ">
        <div className="bg-white">
          <div className="max-w-[1450px] mx-auto px-3 sm:px-6 lg:px-10">
            {/* ---------- MOBILE HEADER ---------- */}
            <div className="flex sm:hidden flex-col gap-2 py-2">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF9900]/10 text-[#FF9900] font-black text-base tracking-tight hover:bg-[#FF9900]/20 transition-colors"
                >
                  Jajot
                </Link>

                <div className="flex items-center gap-1.5">
                  <div className="relative" ref={mobileProfileDropdownRef}>
                    <button
                      type="button"
                      onClick={toggleProfileOrLogin}
                      className="flex items-center justify-center w-9 h-9 rounded-lg text-[#FF9900] bg-[#FF9900]/10 hover:bg-[#FF9900]/20"
                    >
                      <User size={18} />
                    </button>

                    {auth.customer && profileDropdownOpen && (
                      <ProfileMenu
                        customer={auth.customer}
                        onLogout={auth.handleLogout}
                        onClose={() => setProfileDropdownOpen(false)}
                      />
                    )}
                  </div>

                  <Link
                    href="/Addtocard"
                    className="relative flex items-center justify-center w-9 h-9 rounded-lg text-[#FF9900] bg-[#FF9900]/10 hover:bg-[#FF9900]/20"
                  >
                    <ShoppingBag size={18} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setAllMenuOpen(true)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-800 hover:border-[#FF9900] hover:text-[#FF9900]"
                  >
                    <Menu size={18} />
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="flex h-9 w-full overflow-visible rounded-lg border-2 border-[#FF9900] bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-[#FF9900]/20 box-border"
              >
                <div className="relative shrink-0 h-full" ref={mobileSearchCategoryRef}>
                  <button
                    type="button"
                    onClick={() => setSearchCategoryOpen((prev) => !prev)}
                    style={{ width: Math.min(90, searchCategoryWidth) + "px" }}
                    className="h-full flex items-center justify-between gap-1 border-r border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-l-[6px] pl-2 pr-1.5 text-[11px] font-semibold text-gray-800"
                  >
                    <span className="truncate">{searchCategory}</span>
                    <ChevronDown
                      size={12}
                      className={
                        searchCategoryOpen
                          ? "shrink-0 text-gray-600 transition-transform rotate-180"
                          : "shrink-0 text-gray-600 transition-transform"
                      }
                    />
                  </button>

                  {searchCategoryOpen && (
                    <CategoryDropdownList
                      categories={categories}
                      searchCategory={searchCategory}
                      onSelect={handleSearchCategoryChange}
                    />
                  )}
                </div>

                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search Products, Brands..."
                  aria-label="Search products"
                  className="min-w-0 flex-1 h-full bg-white px-2 text-[13px] font-medium text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-500"
                />

                <button
                  type="submit"
                  className="flex h-full w-9 shrink-0 items-center justify-center bg-white text-gray-600 hover:text-[#FF9900] rounded-r-[6px]"
                  aria-label="Search"
                >
                  <Search size={16} />
                </button>
              </form>
            </div>

            {/* ---------- DESKTOP HEADER ---------- */}
            <div className="hidden sm:flex min-h-[64px] items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#FF9900]/10 text-[#FF9900] font-black text-xl tracking-tight hover:bg-[#FF9900]/20 transition-colors"
              >
                Jajot
              </Link>

              <form
                onSubmit={handleSearchSubmit}
                className="flex h-11 w-full max-w-[560px] overflow-visible rounded-xl border-2 border-[#FF9900] bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-[#FF9900]/20 box-border"
              >
                <div className="relative shrink-0 h-full" ref={desktopSearchCategoryRef}>
                  <button
                    type="button"
                    onClick={() => setSearchCategoryOpen((prev) => !prev)}
                    style={{ width: searchCategoryWidth + "px" }}
                    className="h-full flex items-center justify-between gap-1 border-r border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-l-[10px] pl-3 pr-2 text-xs font-semibold text-gray-800 transition-colors"
                  >
                    <span className="truncate">{searchCategory}</span>
                    <ChevronDown
                      size={14}
                      className={
                        searchCategoryOpen
                          ? "shrink-0 text-gray-600 transition-transform rotate-180"
                          : "shrink-0 text-gray-600 transition-transform"
                      }
                    />
                  </button>

                  {searchCategoryOpen && (
                    <CategoryDropdownList
                      categories={categories}
                      searchCategory={searchCategory}
                      onSelect={handleSearchCategoryChange}
                    />
                  )}
                </div>

                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search for Products, Brands and More"
                  aria-label="Search products"
                  className="min-w-0 flex-1 h-full bg-white px-2 text-[15px] font-medium text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-500"
                />

                <button
                  type="submit"
                  className="flex h-full w-12 shrink-0 items-center justify-center bg-white text-gray-600 hover:text-[#FF9900] transition rounded-r-[10px]"
                  aria-label="Search"
                >
                  <Search size={21} />
                </button>
              </form>

              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative" ref={desktopProfileDropdownRef}>
                  <button
                    type="button"
                    onClick={toggleProfileOrLogin}
                    className="flex items-center gap-1.5 h-10 px-2 sm:px-3 rounded-lg text-sm font-semibold text-[#FF9900] bg-[#FF9900]/10 hover:bg-[#FF9900]/20 transition-colors"
                  >
                    <User size={20} />

                    <span className="hidden sm:inline">
                      {auth.customer
                        ? auth.customer.name?.split(" ")[0] || "Account"
                        : "Login"}
                    </span>

                    <ChevronDown
                      size={15}
                      className={
                        profileDropdownOpen
                          ? "transition-transform rotate-180"
                          : "transition-transform"
                      }
                    />
                  </button>

                  {auth.customer && profileDropdownOpen && (
                    <ProfileMenu
                      customer={auth.customer}
                      onLogout={auth.handleLogout}
                      onClose={() => setProfileDropdownOpen(false)}
                    />
                  )}
                </div>

                <div className="relative hidden md:block group">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm font-semibold text-[#FF9900] bg-[#FF9900]/10 hover:bg-[#FF9900]/20"
                  >
                    More
                    <ChevronDown
                      size={15}
                      className="group-hover:rotate-180 transition-transform"
                    />
                  </button>

                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
                    <div className="w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-1">
                      <button
                        type="button"
                        onClick={openVendorModal}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF9900]"
                      >
                        <Store size={16} /> Become a Vendor
                      </button>

                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={whatsappOtpLoading}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 disabled:opacity-60"
                      >
                        <MessageCircle size={16} />
                        {whatsappOtpLoading ? "Sending..." : "WhatsApp OTP"}
                      </button>
                    </div>
                  </div>
                </div>

                <Link
                  href="/Addtocard"
                  className="relative flex items-center gap-1.5 h-10 px-2 sm:px-3 rounded-lg text-[#FF9900] bg-[#FF9900]/10 hover:bg-[#FF9900]/20 font-semibold text-sm"
                >
                  <ShoppingBag size={21} />
                  <span className="hidden sm:inline">Cart</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- CATEGORY BAR ---------- */}
        <div className={topBarClass}>
          <div className="max-w-[1450px] mx-auto px-2 sm:px-6 lg:px-10 w-full">
            <div
              className="flex w-full min-w-0 min-h-[52px] md:min-h-[62px] items-center gap-1 overflow-x-auto scrollbar-hide"
              onMouseEnter={() => clearTimeout(categoryPreviewTimeoutRef.current)}
              onMouseLeave={clearCategoryPreview}
            >
              <button
                type="button"
                onClick={() => setAllMenuOpen(true)}
                className="flex flex-col items-center justify-center gap-1 px-3 sm:px-4 py-1.5 shrink-0 text-gray-800 hover:text-[#FF9900]"
              >
                <Menu size={20} className="sm:hidden" />
                <Menu size={22} className="hidden sm:block" />
                <span className="text-[11px] sm:text-xs font-semibold whitespace-nowrap">
                  All
                </span>
              </button>

              <Link
                href="/"
                onClick={() => {
                  setActiveCategoryId(null);
                  setPreviewCategoryId(null);
                  setSearchCategory("All");
                }}
                className={homeLinkClass}
              >
                <Store size={20} className="sm:hidden" />
                <Store size={22} className="hidden sm:block" />
                <span className={homeLabelClass}>Home</span>
              </Link>

              {categories.slice(0, 12).map((cat) => {
                const isHighlighted =
                  activeCategoryId === cat._id || previewCategoryId === cat._id;

                return (
                  <Link
                    key={cat._id}
                    href={buildCategoryHref(cat)}
                    onMouseEnter={() => handleCategoryPreview(cat._id)}
                    onFocus={() => handleCategoryPreview(cat._id)}
                    onClick={() => {
                      setActiveCategoryId(cat._id);
                      setPreviewCategoryId(cat._id);
                      setSearchCategory(cat.name);
                    }}
                    className={
                      isHighlighted
                        ? "flex flex-col items-center justify-center gap-1 px-3 sm:px-4 py-1.5 shrink-0 text-[#FF9900]"
                        : "flex flex-col items-center justify-center gap-1 px-3 sm:px-4 py-1.5 shrink-0 text-gray-800 hover:text-[#FF9900]"
                    }
                  >
                    <ShoppingBag size={20} className="sm:hidden" />
                    <ShoppingBag size={22} className="hidden sm:block" />

                    <span
                      className={
                        isHighlighted
                          ? "text-[11px] sm:text-xs whitespace-nowrap font-bold border-b-2 border-[#FF9900] pb-1"
                          : "text-[11px] sm:text-xs whitespace-nowrap font-semibold"
                      }
                    >
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* ---------- ALL CATEGORIES DRAWER ---------- */}
      {allMenuOpen && (
        <>
          <ModalBackdrop onClose={() => setAllMenuOpen(false)} />

          <div className="fixed inset-0 z-[100000] pointer-events-none">
            <div className="w-[290px] max-w-[85%] h-full bg-white shadow-2xl p-4 pointer-events-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-lg font-bold text-gray-900">All Categories</h2>

                <button
                  type="button"
                  onClick={() => setAllMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-900"
                  aria-label="Close categories menu"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="py-3">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={buildCategoryHref(cat)}
                    onClick={() => {
                      setActiveCategoryId(cat._id);
                      setSearchCategory(cat.name);
                      setAllMenuOpen(false);
                    }}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#FF9900]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {auth.userModalOpen && (
        <LoginModal auth={auth} hasGoogleClientId={hasGoogleClientId} />
      )}

      {auth.userRegisterOpen && (
        <RegisterModal auth={auth} hasGoogleClientId={hasGoogleClientId} />
      )}
    </>
  );
}