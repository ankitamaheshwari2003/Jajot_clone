"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  CircleDot,
  RotateCcw,
  X } from
"lucide-react";
import { getLoggedInCid } from "../apis/customer/customer";
import { getUserOrders, returnOrder } from "../apis/orders/orders";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700"
};

const statusIcons = {
  pending: Clock,
  confirmed: CircleDot,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle
};

const progressSteps = ["pending", "confirmed", "shipped", "delivered"];


const RETURN_REASONS = [
"Product damaged / defective",
"Wrong item received",
"Size or fit issue",
"Not as described",
"Changed my mind",
"Other"];


const getApiOrders = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.orders)) return payload.data.orders;
  return [];
};


const getId = (val) => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  if (typeof val === "object") return val._id || val.id || undefined;
  return val;
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const [returnModal, setReturnModal] = useState({
    open: false,
    order: null,
    item: null
  });
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [returnedItemIds, setReturnedItemIds] = useState(new Set());

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      const userId = getLoggedInCid();

      if (!userId) {
        if (!active) return;
        setError("Please login to view your orders.");
        setLoading(false);
        return;
      }

      try {
        const res = await getUserOrders(userId);
        if (!active) return;
        setOrders(getApiOrders(res.data));
      } catch (err) {
        console.log("Orders fetch error:", err);
        if (!active) return;
        setError("Failed to load orders.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, []);

  const openReturnModal = (order, item) => {
    setReturnModal({ open: true, order, item });
    setReason("");
    setOtherReason("");
    setNotes("");
    setSubmitMsg("");
    setSubmitStatus("");
  };

  const closeReturnModal = () => {
    if (submitting) return;
    setReturnModal({ open: false, order: null, item: null });
    setReason("");
    setOtherReason("");
    setNotes("");
    setSubmitMsg("");
    setSubmitStatus("");
  };

  const handleSubmitReturn = async () => {
    if (!reason) {
      setSubmitStatus("error");
      setSubmitMsg("Please select a reason.");
      return;
    }
    if (reason === "Other" && !otherReason.trim()) {
      setSubmitStatus("error");
      setSubmitMsg("Please enter a reason.");
      return;
    }

    const { order, item } = returnModal;
    if (!order || !item) return;

    const userId = getLoggedInCid();

    const productId = getId(item.product_id);
    const variantId = getId(item.product_variant_id);
    const vendorId = getId(item.vendor_id) || getId(order.vendorId);

    const payload = {
      orderId: getId(order._id),
      orderItemId: getId(item._id),
      productId,
      variantId,
      customerId: userId,
      vendorId,
      quantity: item.quantity || 1,
      reason: reason === "Other" ? otherReason.trim() : reason,
      ...(notes.trim() ? { notes: notes.trim() } : {})
    };

    console.log("Return order payload:", payload);

    setSubmitting(true);
    setSubmitMsg("");
    setSubmitStatus("");

    try {
      await returnOrder(payload);
      setSubmitStatus("success");
      setSubmitMsg("Return request submitted successfully!");
      setReturnedItemIds((prev) => {
        const next = new Set(prev);
        next.add(item._id);
        return next;
      });
      setTimeout(() => {
        closeReturnModal();
      }, 1400);
    } catch (err) {
      console.log("Return order error:", err);
      const backendMsg =
      err?.response?.data?.message || err?.response?.data?.error;
      setSubmitStatus("error");
      setSubmitMsg(
        backendMsg || "Failed to submit return request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#FF9900]" />
        <p className="mt-4 text-sm text-gray-500">Loading your orders...</p>
      </div>);

  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Package size={28} className="text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">{error}</p>
      </div>);

  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Package size={28} className="text-gray-400" />
        </div>
        <p className="text-gray-700 font-semibold">No orders yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Once you place an order, it&apos;ll show up here.
        </p>
        <Link
          href="/shop"
          className="inline-block mt-5 px-6 py-2.5 bg-[#FF9900] text-black rounded-xl font-semibold text-sm hover:bg-[#e08a00] transition">
          
          Start shopping
        </Link>
      </div>);

  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 sm:mb-5 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
              <Package className="h-5 w-5 text-[#FF9900]" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">My Orders</h1>
              <p className="text-sm text-gray-500">
                {orders.length} order{orders.length !== 1 ? "s" : ""} placed
              </p>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
          <div className="space-y-5">
            {orders.map((order, index) => {
                const StatusIcon = statusIcons[order.status] || CircleDot;
                const currentStepIndex = progressSteps.indexOf(order.status);
                const isCancelled = order.status === "cancelled";

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.05, ease: "easeOut" }}
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                    
              <div className="flex flex-col gap-3 bg-gray-50 px-4 py-4 border-b border-gray-100 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">
                      Order
                    </p>
                    <p className="break-all text-sm font-semibold text-gray-800">
                      {order.order_number || order._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">
                      Placed on
                    </p>
                    <p className="text-sm text-gray-700">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <span
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                        statusColors[order.status] || "bg-gray-100 text-gray-600"}`
                        }>
                        
                  <StatusIcon size={13} />
                  {order.status || "pending"}
                </span>
              </div>

              {}
              {!isCancelled && currentStepIndex >= 0 &&
                    <div className="flex items-center px-5 pt-4 pb-1">
                  {progressSteps.map((step, stepIndex) => {
                        const isDone = stepIndex <= currentStepIndex;
                        const isLast = stepIndex === progressSteps.length - 1;

                        return (
                          <div key={step} className="flex flex-1 items-center last:flex-initial">
                        <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              isDone ?
                              "bg-[#FF9900] text-black" :
                              "bg-gray-100 text-gray-400"}`
                              }>
                              
                          {isDone ? <CheckCircle2 size={13} /> : stepIndex + 1}
                        </div>
                        {!isLast &&
                            <div
                              className={`h-[2px] flex-1 mx-1.5 rounded-full ${
                              stepIndex < currentStepIndex ? "bg-[#FF9900]" : "bg-gray-100"}`
                              } />

                            }
                      </div>);

                      })}
                </div>
                    }
              {!isCancelled && currentStepIndex >= 0 &&
                    <div className="flex justify-between px-5 pb-3 text-[10px] text-gray-400 capitalize">
                  {progressSteps.map((step) =>
                      <span key={step}>{step}</span>
                      )}
                </div>
                    }

              <div className="px-5 py-4 divide-y divide-gray-50">
                {order.items?.map((item) =>
                      <div
                        key={item._id || `${item.product_name}-${item.variant_id}`}
                        className="flex flex-col gap-3 text-sm py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                        
                    <div className="flex min-w-0 items-center gap-3 sm:flex-1">
                    {item.image ?
                        <img
                          src={item.image}
                          alt={item.product_name || "Product"}
                          className="h-12 w-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }} /> :


                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-gray-300" />
                      </div>
                        }

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {item.product_name || "Product"}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Qty: {item.quantity || 1}
                      </p>
                    </div>
                    </div>

                    <div className="flex w-full items-center justify-between gap-3 pl-[60px] sm:w-auto sm:justify-end sm:pl-0">
                      <p className="font-semibold text-gray-800 whitespace-nowrap">
                        Rs. {item.total || item.unit_price || 0}
                      </p>

                    {}
                    {returnedItemIds.has(item._id) ?
                        <span className="flex items-center gap-1 whitespace-nowrap rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={13} />
                        Return Requested
                      </span> :

                        <button
                          type="button"
                          onClick={() => openReturnModal(order, item)}
                          className="flex items-center gap-1 whitespace-nowrap rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#FF9900] hover:text-[#FF9900] transition">
                          
                        <RotateCcw size={13} />
                        Return
                      </button>
                        }
                    </div>
                  </div>
                      )}
              </div>

              <div className="flex flex-col gap-2 px-4 py-3.5 border-t border-gray-100 bg-gray-50/50 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  {order.payment_method || "COD"} · {order.payment_status || "pending"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-base">
                    Rs. {order.total || 0}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
                </motion.div>);

              })}
          </div>
        </div>

        <aside className="sticky top-24 hidden h-fit self-start lg:block">
          <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
            <div className="bg-[#131921] px-5 py-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#FF9900]">
                Shop Again
              </p>
              <h2 className="mt-2 text-xl font-bold leading-tight">
                More finds are waiting for you
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/75">
                &quot;A good order makes today easier. A great next find makes tomorrow better.&quot;
              </p>
            </div>

            <div className="px-5 py-5">
              <div className="rounded-xl bg-orange-50 px-4 py-4">
                <p className="text-sm font-semibold text-gray-900">
                  Pick something that feels useful, thoughtful, and worth opening.
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-600">
                  Browse fresh products, save favourites, and keep your next delivery simple.
                </p>
              </div>

              <Link
                  href="/shop"
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#FF9900] text-sm font-bold text-black transition hover:bg-[#e08a00]">
                  
                Continue Shopping
              </Link>
            </div>
          </div>
        </aside>
      </div>
      </div>

      {}
      <AnimatePresence>
        {returnModal.open &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4"
          onClick={closeReturnModal}>
          
            <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[calc(100dvh-24px)] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl">
            
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <h3 className="text-base font-bold text-gray-900">Return Item</h3>
                <button
                type="button"
                onClick={closeReturnModal}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                
                  <X size={18} />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                {returnModal.item &&
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                    {returnModal.item.image ?
                <img
                  src={returnModal.item.image}
                  alt={returnModal.item.product_name || "Product"}
                  className="h-10 w-10 rounded-lg object-cover bg-gray-100" /> :


                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package size={14} className="text-gray-300" />
                      </div>
                }
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {returnModal.item.product_name || "Product"}
                    </p>
                  </div>
              }

                {}
                <div>
                  <label htmlFor="return-reason" className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Reason for return
                  </label>
                  <select
                  id="return-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-[#FF9900] focus:outline-none">
                  
                    <option value="">Select a reason</option>
                    {RETURN_REASONS.map((r) =>
                  <option key={r} value={r}>
                        {r}
                      </option>
                  )}
                  </select>
                </div>

                {}
                {reason === "Other" &&
              <div>
                    <label htmlFor="return-other-reason" className="mb-1.5 block text-xs font-semibold text-gray-600">
                      Please specify
                    </label>
                    <textarea
                  id="return-other-reason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  rows={2}
                  placeholder="Please describe your reason..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-[#FF9900] focus:outline-none resize-none" />
                
                  </div>
              }

                {}
                <div>
                  <label htmlFor="return-notes" className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Additional notes (optional)
                  </label>
                  <textarea
                  id="return-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any additional details (optional)..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-[#FF9900] focus:outline-none resize-none" />
                
                </div>

                {submitMsg &&
              <p
                className={`text-xs font-medium ${
                submitStatus === "success" ? "text-green-600" : "text-red-600"}`
                }>
                
                    {submitMsg}
                  </p>
              }
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
                <button
                type="button"
                onClick={closeReturnModal}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 sm:flex-1">
                
                  Cancel
                </button>
                <button
                type="button"
                onClick={handleSubmitReturn}
                disabled={submitting}
                className="w-full rounded-xl bg-[#FF9900] py-2.5 text-sm font-bold text-black hover:bg-[#e08a00] transition disabled:opacity-60 sm:flex-1">
                
                  {submitting ? "Submitting..." : "Submit Return"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </main>);

}
