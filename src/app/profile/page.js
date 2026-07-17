"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
  Wallet,
  Gift,
  Edit2,
  Plus,
  Trash2,
  Lock,
  Check,
  X } from
"lucide-react";

const ORANGE = "#FF9900";

const getCustomerFromStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw =
    localStorage.getItem("checkoutUser") ||
    localStorage.getItem("customer") ||
    localStorage.getItem("customerData") ||
    localStorage.getItem("user");

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    return (
      parsed?.data?.customer ||
      parsed?.data?.user ||
      parsed?.customer ||
      parsed?.user ||
      parsed?.data ||
      parsed);

  } catch {
    return null;
  }
};

const getAddressesFromStorage = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("customerAddresses");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveAddressesToStorage = (addresses) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("customerAddresses", JSON.stringify(addresses));
  window.dispatchEvent(new Event("customerUpdated"));
};

const CUSTOMER_STORAGE_KEYS = ["checkoutUser", "customer", "customerData", "user"];

const updateCustomerInStorage = (updates) => {
  if (typeof window === "undefined") return false;

  for (const key of CUSTOMER_STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const target =
      parsed?.data?.customer ||
      parsed?.data?.user ||
      parsed?.customer ||
      parsed?.user ||
      parsed?.data ||
      parsed;

      Object.assign(target, updates);
      localStorage.setItem(key, JSON.stringify(parsed));
      window.dispatchEvent(new Event("customerUpdated"));
      return true;
    } catch {
      continue;
    }
  }

  return false;
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";

  return parts.
  slice(0, 2).
  map((part) => part[0]).
  join("").
  toUpperCase();
};

const emptyAddressForm = {
  name: "",
  mobile: "",
  pincode: "",
  addressLine: "",
  landmark: "",
  city: "",
  state: "",
  type: "Home"
};

const NAV_SECTIONS = [
{
  heading: "Account Settings",
  items: [
  { key: "profile", label: "Profile Information", icon: User },
  { key: "addresses", label: "Manage Addresses", icon: MapPin }]

},
{
  heading: "Payments",
  items: [
  { key: "payments", label: "Saved UPI / Cards", icon: Wallet },
  { key: "giftcards", label: "Gift Cards", icon: Gift }]

}];


export default function ProfilePage() {
  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAddressForm);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ email: "", mobile: "", city: "" });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    const syncCustomer = () => {
      setCustomer(getCustomerFromStorage());
      setAddresses(getAddressesFromStorage());
    };

    syncCustomer();

    window.addEventListener("customerUpdated", syncCustomer);
    window.addEventListener("storage", syncCustomer);

    return () => {
      window.removeEventListener("customerUpdated", syncCustomer);
      window.removeEventListener("storage", syncCustomer);
    };
  }, []);

  useEffect(() => {
    if (!customer) return;
    setProfileForm({
      email: customer?.email || customer?.emailId || "",
      mobile: customer?.number || customer?.phone || customer?.mobile || "",
      city: customer?.city || ""
    });
  }, [customer]);

  const details = useMemo(
    () => [
    {
      label: "Email",
      value: customer?.email || customer?.emailId || "Not added",
      icon: Mail
    },
    {
      label: "Mobile",
      value: customer?.number || customer?.phone || customer?.mobile || "Not added",
      icon: Phone
    },
    {
      label: "City",
      value: customer?.city || "Not added",
      icon: MapPin
    },
    {
      label: "Account Status",
      value: customer?.status || "Active",
      icon: ShieldCheck
    }],

    [customer]
  );

  const openNewAddressForm = () => {
    setForm(emptyAddressForm);
    setEditingId(null);
    setShowAddressForm(true);
  };

  const openEditAddressForm = (address) => {
    setForm(address);
    setEditingId(address.id);
    setShowAddressForm(true);
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setEditingId(null);
    setForm(emptyAddressForm);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();

    if (!form.name || !form.mobile || !form.pincode || !form.addressLine || !form.city || !form.state) {
      return;
    }

    let updated;
    if (editingId) {
      updated = addresses.map((a) => a.id === editingId ? { ...form, id: editingId } : a);
    } else {
      updated = [...addresses, { ...form, id: Date.now() }];
    }

    setAddresses(updated);
    saveAddressesToStorage(updated);
    closeAddressForm();
  };

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    saveAddressesToStorage(updated);
  };

  const openProfileEdit = () => {
    setProfileForm({
      email: customer?.email || customer?.emailId || "",
      mobile: customer?.number || customer?.phone || customer?.mobile || "",
      city: customer?.city || ""
    });
    setIsEditingProfile(true);
  };

  const handleProfileFormChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (showPasswordForm) {
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setPasswordMessage({ type: "error", text: "Fill in all password fields." });
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setPasswordMessage({ type: "error", text: "New password must be at least 6 characters." });
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordMessage({ type: "error", text: "New password and confirm password do not match." });
        return;
      }



    }

    updateCustomerInStorage({
      email: profileForm.email,
      number: profileForm.mobile,
      city: profileForm.city
    });

    setCustomer(getCustomerFromStorage());
    setIsEditingProfile(false);
    setShowPasswordForm(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordMessage(null);
  };

  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    setShowPasswordForm(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordMessage(null);
  };

  const handlePasswordFormChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordMessage(null);
  };

  if (!customer) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-4 py-14">
        <section className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FF9900]/10 text-[#FF9900]">
            <User size={30} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
            Please login to view your profile details.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#FF9900] px-6 text-sm font-bold text-black transition hover:bg-[#e08a00]">
            
            Go to Home
          </Link>
        </section>
      </main>);

  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-8">
      <section className="mx-auto max-w-6xl">
        {}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#FF9900] text-2xl font-black text-black">
                {getInitials(customer?.name || customer?.fullName)}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#FF9900]">
                  My Profile
                </p>
                <h1 className="mt-1 text-2xl font-black text-gray-900">
                  {customer?.name || customer?.fullName || "Customer"}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Customer ID: {customer?._id || customer?.id || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/orders"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-800 transition hover:border-[#FF9900] hover:text-[#FF9900]">
                
                <Package size={16} />
                Orders
              </Link>
              <Link
                href="/Addtocard"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800">
                
                <ShoppingBag size={16} />
                Cart
              </Link>
            </div>
          </div>
        </div>

        {}
        <div className="mt-5 grid gap-5 md:grid-cols-[260px_1fr]">
          {}
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF9900]/10 text-sm font-black text-[#FF9900]">
                {getInitials(customer?.name || customer?.fullName)}
              </div>
              <div>
                <p className="text-xs text-gray-500">Hello,</p>
                <p className="text-sm font-bold text-gray-900">
                  {customer?.name || customer?.fullName || "Customer"}
                </p>
              </div>
            </div>

            <Link
              href="/orders"
              className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#FF9900]/5 hover:text-[#FF9900]">
              
              <span className="flex items-center gap-3">
                <Package size={17} />
                My Orders
              </span>
              <span className="text-gray-400">›</span>
            </Link>

            {NAV_SECTIONS.map((section) =>
            <div key={section.heading} className="border-t border-gray-100 py-2">
                <p className="px-4 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  {section.heading}
                </p>
                {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold transition ${
                    isActive ?
                    "border-l-4 border-[#FF9900] bg-[#FF9900]/10 text-[#FF9900]" :
                    "border-l-4 border-transparent text-gray-700 hover:bg-[#FF9900]/5 hover:text-[#FF9900]"}`
                    }>
                    
                      <Icon size={16} />
                      {item.label}
                    </button>);

              })}
              </div>
            )}
          </aside>

          {}
          <div>
            {activeTab === "profile" &&
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-black text-gray-900">Personal Information</h2>
                  {!isEditingProfile &&
                <button
                  onClick={openProfileEdit}
                  className="flex items-center gap-1 text-sm font-semibold text-[#FF9900] hover:underline">
                  
                      <Edit2 size={14} />
                      Edit
                    </button>
                }
                </div>

                {isEditingProfile ?
              <form onSubmit={handleSaveProfile} className="rounded-xl border border-[#FF9900]/30 bg-[#FF9900]/5 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="profile-email" className="mb-1 block text-xs font-semibold text-gray-600">
                          Email
                        </label>
                        <input
                      id="profile-email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => handleProfileFormChange("email", e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                    
                      </div>

                      <div>
                        <label htmlFor="profile-mobile" className="mb-1 block text-xs font-semibold text-gray-600">
                          Mobile
                        </label>
                        <input
                      id="profile-mobile"
                      type="tel"
                      value={profileForm.mobile}
                      onChange={(e) => handleProfileFormChange("mobile", e.target.value)}
                      placeholder="10-digit mobile number"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                    
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="profile-city" className="mb-1 block text-xs font-semibold text-gray-600">
                          City
                        </label>
                        <input
                      id="profile-city"
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => handleProfileFormChange("city", e.target.value)}
                      placeholder="City"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                    
                      </div>
                    </div>

                    {}
                    <div className="mt-5 border-t border-[#FF9900]/20 pt-4">
                      {!showPasswordForm ?
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(true)}
                    className="flex items-center gap-2 text-sm font-semibold text-[#FF9900] hover:underline">
                    
                          <Lock size={14} />
                          Change Password
                        </button> :

                  <div>
                          <div className="mb-3 flex items-center justify-between">
                            <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
                              <Lock size={14} className="text-[#FF9900]" />
                              Change Password
                            </p>
                            <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                          setPasswordMessage(null);
                        }}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-700">
                        
                              Remove
                            </button>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                              <label htmlFor="current-password" className="mb-1 block text-xs font-semibold text-gray-600">
                                Current Password
                              </label>
                              <input
                          id="current-password"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => handlePasswordFormChange("currentPassword", e.target.value)}
                          placeholder="Enter current password"
                          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                        
                            </div>

                            <div>
                              <label htmlFor="new-password" className="mb-1 block text-xs font-semibold text-gray-600">
                                New Password
                              </label>
                              <input
                          id="new-password"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => handlePasswordFormChange("newPassword", e.target.value)}
                          placeholder="At least 6 characters"
                          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                        
                            </div>

                            <div>
                              <label htmlFor="confirm-password" className="mb-1 block text-xs font-semibold text-gray-600">
                                Confirm New Password
                              </label>
                              <input
                          id="confirm-password"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordFormChange("confirmPassword", e.target.value)}
                          placeholder="Re-enter new password"
                          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                        
                            </div>
                          </div>

                          {passwordMessage &&
                    <p
                      className={`mt-3 flex items-center gap-1 text-sm font-semibold ${
                      passwordMessage.type === "success" ? "text-green-600" : "text-red-600"}`
                      }>
                      
                              {passwordMessage.type === "success" ?
                      <Check size={14} /> :

                      <X size={14} />
                      }
                              {passwordMessage.text}
                            </p>
                    }
                        </div>
                  }
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                    type="submit"
                    className="h-11 rounded-xl bg-[#FF9900] px-6 text-sm font-bold text-black transition hover:bg-[#e08a00]">
                    
                        Save Changes
                      </button>
                      <button
                    type="button"
                    onClick={handleCancelProfileEdit}
                    className="h-11 rounded-xl border border-gray-300 px-6 text-sm font-semibold text-gray-700 transition hover:border-gray-400">
                    
                        Cancel
                      </button>
                    </div>
                  </form> :

              <div className="grid gap-4 sm:grid-cols-2">
                    {details.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-xl border border-gray-200 bg-[#fafafa] p-4">
                      
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF9900]/10 text-[#FF9900]">
                              <Icon size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {item.label}
                              </p>
                              <p className="mt-1 text-base font-bold text-gray-900">
                                {item.value}
                              </p>
                            </div>
                          </div>
                        </div>);

                })}
                  </div>
              }
              </div>
            }

            {activeTab === "addresses" &&
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-black text-gray-900">Manage Addresses</h2>
                  {!showAddressForm &&
                <button
                  onClick={openNewAddressForm}
                  className="flex items-center gap-2 rounded-xl bg-[#FF9900] px-4 py-2 text-sm font-bold text-black transition hover:bg-[#e08a00]">
                  
                      <Plus size={16} />
                      Add New Address
                    </button>
                }
                </div>

                {showAddressForm &&
              <form onSubmit={handleSaveAddress} className="rounded-xl border border-[#FF9900]/30 bg-[#FF9900]/5 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <label htmlFor="address-name" className="mb-1 block text-xs font-semibold text-gray-600">
                          Full Name
                        </label>
                        <input
                      id="address-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="Full name"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                    
                      </div>

                      <div>
                        <label htmlFor="address-mobile" className="mb-1 block text-xs font-semibold text-gray-600">
                          Mobile Number
                        </label>
                        <input
                      id="address-mobile"
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => handleFormChange("mobile", e.target.value)}
                      placeholder="10-digit mobile number"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                    
                      </div>

                      <div>
                        <label htmlFor="address-pincode" className="mb-1 block text-xs font-semibold text-gray-600">
                          Pincode
                        </label>
                        <input
                      id="address-pincode"
                      type="text"
                      value={form.pincode}
                      onChange={(e) => handleFormChange("pincode", e.target.value)}
                      placeholder="6-digit pincode"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                    
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="address-line" className="mb-1 block text-xs font-semibold text-gray-600">
                          Address (House No, Building, Street, Area)
                        </label>
                        <textarea
                      id="address-line"
                      value={form.addressLine}
                      onChange={(e) => handleFormChange("addressLine", e.target.value)}
                      placeholder="Flat / House no., building, street, area"
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                    
                      </div>

                      <div>
                        <label htmlFor="address-landmark" className="mb-1 block text-xs font-semibold text-gray-600">
                          Landmark (Optional)
                        </label>
                        <input
                      id="address-landmark"
                      type="text"
                      value={form.landmark}
                      onChange={(e) => handleFormChange("landmark", e.target.value)}
                      placeholder="Nearby landmark"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                    
                      </div>

                      <div>
                        <label htmlFor="address-city" className="mb-1 block text-xs font-semibold text-gray-600">
                          City / District / Town
                        </label>
                        <input
                      id="address-city"
                      type="text"
                      value={form.city}
                      onChange={(e) => handleFormChange("city", e.target.value)}
                      placeholder="City"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                    
                      </div>

                      <div>
                        <label htmlFor="address-state" className="mb-1 block text-xs font-semibold text-gray-600">
                          State
                        </label>
                        <input
                      id="address-state"
                      type="text"
                      value={form.state}
                      onChange={(e) => handleFormChange("state", e.target.value)}
                      placeholder="State"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/30" />
                    
                      </div>

                      <div>
                        <p className="mb-1 block text-xs font-semibold text-gray-600">
                          Address Type
                        </p>
                        <div className="flex gap-2">
                          {["Home", "Work"].map((t) =>
                      <button
                        type="button"
                        key={t}
                        onClick={() => handleFormChange("type", t)}
                        className={`h-11 flex-1 rounded-lg border text-sm font-semibold transition ${
                        form.type === t ?
                        "border-[#FF9900] bg-[#FF9900] text-black" :
                        "border-gray-300 bg-white text-gray-700 hover:border-[#FF9900]"}`
                        }>
                        
                              {t}
                            </button>
                      )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                    type="submit"
                    className="h-11 rounded-xl bg-[#FF9900] px-6 text-sm font-bold text-black transition hover:bg-[#e08a00]">
                    
                        Save Address
                      </button>
                      <button
                    type="button"
                    onClick={closeAddressForm}
                    className="h-11 rounded-xl border border-gray-300 px-6 text-sm font-semibold text-gray-700 transition hover:border-gray-400">
                    
                        Cancel
                      </button>
                    </div>
                  </form>
              }

                {!showAddressForm && addresses.length === 0 &&
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
                    <MapPin className="mx-auto mb-3 text-[#FF9900]" size={28} />
                    <p className="text-sm font-semibold text-gray-700">No saved addresses yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Add an address to make checkout faster next time.
                    </p>
                  </div>
              }

                {!showAddressForm && addresses.length > 0 &&
              <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) =>
                <div
                  key={address.id}
                  className="rounded-xl border border-gray-200 p-4">
                  
                        <div className="mb-2 flex items-center justify-between">
                          <span className="inline-flex items-center rounded-full bg-[#FF9900]/10 px-2.5 py-1 text-xs font-bold text-[#FF9900]">
                            {address.type}
                          </span>
                          <div className="flex gap-2">
                            <button
                        onClick={() => openEditAddressForm(address)}
                        className="text-gray-500 transition hover:text-[#FF9900]"
                        aria-label="Edit address">
                        
                              <Edit2 size={15} />
                            </button>
                            <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-gray-500 transition hover:text-red-600"
                        aria-label="Delete address">
                        
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{address.name}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          {address.addressLine}
                          {address.landmark ? `, near ${address.landmark}` : ""}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-gray-800">
                          Mobile: {address.mobile}
                        </p>
                      </div>
                )}
                  </div>
              }
              </div>
            }

            {activeTab === "payments" &&
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <Wallet className="mx-auto mb-3 text-[#FF9900]" size={28} />
                <p className="text-sm font-semibold text-gray-700">No saved UPI or cards</p>
                <p className="mt-1 text-sm text-gray-500">Coming soon.</p>
              </div>
            }

            {activeTab === "giftcards" &&
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <Gift className="mx-auto mb-3 text-[#FF9900]" size={28} />
                <p className="text-sm font-semibold text-gray-700">No gift cards</p>
                <p className="mt-1 text-sm text-gray-500">Coming soon.</p>
              </div>
            }
          </div>
        </div>
      </section>
    </main>);

}
