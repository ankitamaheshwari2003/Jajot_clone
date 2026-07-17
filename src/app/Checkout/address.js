"use client";

import { useEffect, useState } from "react";
import { getLoggedInCid, getLoggedInCustomerInfo } from "../apis/customer/customer";

const emptyForm = {
  fullName: "",
  mobile: "",
  pincode: "",
  houseNumber: "",
  area: "",
  locality: "",
  city: "",
  state: "",
  landmark: ""
};

export default function AddressForm({ onSave, saving }) {
  const [form, setForm] = useState(emptyForm);




  useEffect(() => {
    const cid = getLoggedInCid();
    if (!cid) return;

    const info = getLoggedInCustomerInfo();
    if (!info) return;

    setForm((prev) => ({
      ...prev,
      fullName: info.fullName || prev.fullName,
      mobile: info.mobile || prev.mobile,
      pincode: info.pincode || prev.pincode,
      houseNumber: info.houseNumber || prev.houseNumber,
      area: info.area || prev.area,
      locality: info.locality || prev.locality,
      city: info.city || prev.city,
      state: info.state || prev.state,
      landmark: info.landmark || prev.landmark
    }));
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

        <input
          type="text"
          name="pincode"
          value={form.pincode}
          onChange={handleChange}
          placeholder="Pin Code*"
          required
          className="w-full h-12 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
        

        <div>
          <input
            type="text"
            name="houseNumber"
            value={form.houseNumber}
            onChange={handleChange}
            placeholder="House Number/Tower/Block*"
            required
            className="w-full h-12 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
          
          <p className="text-[11px] text-[#FF9900] mt-1">
            *House Number will allow a doorstep delivery
          </p>
        </div>

        <div>
          <input
            type="text"
            name="area"
            value={form.area}
            onChange={handleChange}
            placeholder="Address (locality, building, street)*"
            required
            className="w-full h-12 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
          
          <p className="text-[11px] text-[#FF9900] mt-1">
            *Please update society/apartment details
          </p>
        </div>

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
