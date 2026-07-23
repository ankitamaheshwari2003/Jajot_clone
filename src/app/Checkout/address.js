"use client";

import { useEffect, useState } from "react";
import { getLoggedInCid } from "../apis/customer/customer";
import { getEndUserById } from "../apis/userlogin/userlogin";

const emptyForm = {
  fullName: "",
  email: "",
  mobile: "",
  pincode: "",
  locality: "",
  city: "",
  state: "",
  landmark: "",
  address: ""
};

export default function AddressForm({ onSave, saving }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const cid = getLoggedInCid();
    if (!cid) return;

    let isMounted = true;

    (async () => {
      try {
        const res = await getEndUserById(cid);
        const info = res?.data?.user || res?.user;

        if (!info || !isMounted) return;

        setForm((prev) => ({
          ...prev,
          fullName: info.name || prev.fullName,
          email: info.email || prev.email,
          mobile: info.number || prev.mobile,
          pincode: info.pincode || prev.pincode,
          city: info.city || prev.city,
          state: info.state || prev.state,
          address: info.address || prev.address
        }));
      } catch {
        // API fail ho toh form khali/manual rehne do
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-6">
      
      <div className="space-y-4 max-w-[440px]">
        {}
        <p className="text-xs font-bold tracking-wide text-gray-500">
          CONTACT DETAILS
        </p>

        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Name*"
          required
          className="w-full h-12 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
        

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email*"
          required
          className="w-full h-12 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
        

        <input
          type="tel"
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
          placeholder="Mobile No*"
          required
          pattern="[0-9]{10}"
          className="w-full h-12 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
        

        {}
        <p className="text-xs font-bold tracking-wide text-gray-500 pt-3">
          ADDRESS
        </p>

        <div>
          
          <textarea
            id="address-fulladdress"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="House No., Street, Locality, Landmark"
            rows={3}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] resize-none" />
        </div>

        <input
          type="text"
          name="pincode"
          value={form.pincode}
          onChange={handleChange}
          placeholder="Pin Code*"
          required
          className="w-full h-12 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
        

        <input
          type="text"
          name="locality"
          value={form.locality}
          onChange={handleChange}
          placeholder="Locality / Town*"
          required
          className="w-full h-12 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
        

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City / District*"
            required
            className="w-full h-12 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
          

          <input
            type="text"
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="State*"
            required
            className="w-full h-12 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
          
        </div>

        <input
          type="text"
          name="landmark"
          value={form.landmark}
          onChange={handleChange}
          placeholder="Landmark (optional)"
          className="w-full h-12 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
        

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-8 h-12 rounded-md bg-[#FF9900] hover:bg-[#e68a00] text-black text-sm font-bold tracking-wide transition disabled:opacity-60">
          
          {saving ? "PLACING ORDER..." : "DELIVER HERE & PLACE ORDER"}
        </button>
      </div>
    </form>);

}