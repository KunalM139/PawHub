const fs = require('fs');
const path = require('path');

const content = `"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Package, Clock, Truck, CheckCircle2, XCircle, Star, X, Filter, AlertCircle, Calendar } from "lucide-react";
import { ReviewModal } from "./review-modal";

export type OrderRecord = {
  _id: string;
  productId: {
    _id: string;
    title: string;
    images: string[];
    priceInr: number;
  };
  buyerId: {
    name: string;
    email: string;
    phone: string;
  };
  sellerId: {
    name: string;
    email: string;
    phone: string;
    upiId?: string;
    upiQrCode?: string;
  };
  quantity: number;
  totalPriceInr: number;
  shippingAddress: any;
  contactPhone: string;
  status: "pending_approval" | "approved" | "rejected" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "cod" | "upi_on_delivery";
  paymentStatus: "pending" | "completed";
  trackingLink?: string;
  rejectionReason?: string;
  estimatedDeliveryDate?: string;
  approvedAt?: string;
  createdAt: string;
};

const statusConfig = {
  pending_approval: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Pending Approval" },
  approved: { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "Approved" },
  shipped: { icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", label: "Shipped" },
  delivered: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: "Cancelled" },
  rejected: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Rejected" },
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Pending" },
  processing: { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "Processing" },
};

function getStatusConfig(status: string) {
  return (statusConfig as any)[status] || statusConfig.pending_approval;
}

export function OrderList({ viewAs }: { viewAs: "buyer" | "seller" }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [reviewModalData, setReviewModalData] = useState<{ productId: string, title: string } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const [trackingLink, setTrackingLink] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    const response = await fetch(\`/api/orders?viewAs=\${viewAs}\`);
    const data = await response.json().catch(() => null);

    if (response.ok && data?.orders) {
      setOrders(data.orders);
    }
    setIsLoading(false);
  }

  async function updateOrder(orderId: string, updates: Partial<OrderRecord>) {
    setUpdatingId(orderId);
    const response = await fetch(\`/api/orders/\${orderId}\`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const data = await response.json();
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(data.order);
      }
      toast.success("Order updated successfully!");
    } else {
      const data = await response.json();
      toast.error(data.message || "Failed to update order");
    }
    setUpdatingId(null);
  }

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];
    if (filterStatus !== "all") {
      result = result.filter(o => o.status === filterStatus);
    }
    if (filterYear !== "all") {
      result = result.filter(o => new Date(o.createdAt).getFullYear().toString() === filterYear);
    }
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return result;
  }, [orders, filterStatus, filterYear, sortBy]);

  const canBuyerCancel = (order: OrderRecord) => {
    if (order.status === "pending_approval" || order.status === "pending") return true;
    if (order.status === "approved" && order.approvedAt) {
      const hours = (Date.now() - new Date(order.approvedAt).getTime()) / (1000 * 60 * 60);
      return hours <= 48;
    }
    return false;
  };

  if (isLoading) {
    return <p className="text-center text-[var(--color-on-surface-variant)] py-12">Loading orders...</p>;
  }

  return (
    <div className="space-y-8 font-outfit text-[var(--color-on-surface)]">
      {/* Filter Bar */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--color-surface-container-low)] rounded-full text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]/30 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="px-5 py-2.5 bg-[var(--color-surface-container-lowest)] rounded-full border border-[var(--color-outline-variant)]/30 hover:border-[var(--color-outline-variant)]/60 hover:bg-[var(--color-surface-container-low)] transition-all duration-300 shadow-sm text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] appearance-none outline-none focus:border-[var(--color-primary)]/50"
          >
            <option value="all">All Orders</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)} 
            className="px-5 py-2.5 bg-[var(--color-surface-container-lowest)] rounded-full border border-[var(--color-outline-variant)]/30 hover:border-[var(--color-outline-variant)]/60 hover:bg-[var(--color-surface-container-low)] transition-all duration-300 shadow-sm text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] appearance-none outline-none focus:border-[var(--color-primary)]/50"
          >
            <option value="all">Any Year</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
        <div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="px-5 py-2.5 bg-[var(--color-surface-container-lowest)] rounded-full border border-[var(--color-outline-variant)]/30 hover:border-[var(--color-outline-variant)]/60 hover:bg-[var(--color-surface-container-low)] transition-all duration-300 shadow-sm text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] appearance-none outline-none focus:border-[var(--color-primary)]/50"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </section>

      {/* Content Area / Empty State */}
      {filteredAndSortedOrders.length === 0 ? (
        <section className="w-full bg-[var(--color-surface-container-lowest)] rounded-[1rem] shadow-sm border border-[var(--color-outline-variant)]/30 min-h-[500px] flex items-center justify-center py-20 transition-all duration-500 hover:shadow-md card-shadow">
          <div className="flex flex-col items-center justify-center text-center max-w-md px-6">
            <div className="w-24 h-24 bg-[var(--color-primary)]/5 rounded-2xl flex items-center justify-center mb-6 transition-transform hover:scale-105 duration-300">
              <span className="material-symbols-outlined text-5xl text-[var(--color-primary)]/60" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
            </div>
            <h2 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-3">No orders found.</h2>
            <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)] mb-8 leading-relaxed">
              It looks like you don't have any orders matching the current filters. Adjust your filters or check back later.
            </p>
            <button 
              onClick={() => { setFilterStatus('all'); setFilterYear('all'); setSortBy('newest'); }}
              className="px-6 py-2.5 rounded-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface)] text-[14px] leading-[1.2] tracking-[0.05em] font-semibold hover:bg-[var(--color-surface-container-highest)] hover:border-[var(--color-outline-variant)]/60 hover:-translate-y-0.5 transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        </section>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedOrders.map((order) => {
            return (
              <div 
                key={order._id} 
                onClick={() => {
                  setSelectedOrder(order);
                  setTrackingLink(order.trackingLink || "");
                  setRejectionReason(order.rejectionReason || "");
                  setEstimatedDeliveryDate(order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : "");
                }}
                className="group cursor-pointer bg-[var(--color-surface-container-lowest)] rounded-2xl border border-[var(--color-outline-variant)]/30 overflow-hidden card-shadow hover:shadow-lg hover:border-[var(--color-primary)]/40 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-[4/3] w-full bg-[var(--color-surface-container)] relative overflow-hidden">
                  <img src={order.productId.images[0] || "https://placehold.co/400x300"} alt={order.productId.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-[var(--color-on-surface)] text-[16px] leading-[1.6] line-clamp-2 mb-3 group-hover:text-[var(--color-primary)] transition-colors">{order.productId.title}</h3>
                  <div className="mt-auto pt-4 border-t border-[var(--color-outline-variant)]/20 flex items-center justify-between">
                    {order.status === "delivered" ? (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-md">
                        Delivered
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] px-2.5 py-1 rounded-md bg-[var(--color-surface-container)]">
                        {getStatusConfig(order.status).label}
                      </p>
                    )}
                    <p className="text-[16px] font-bold text-[var(--color-primary)] ml-auto">₹{order.totalPriceInr.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex sm:p-6 bg-[var(--color-scrim)]/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[var(--color-surface-container-lowest)] w-full h-full sm:rounded-3xl sm:max-w-5xl mx-auto overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col border border-[var(--color-outline-variant)]/20">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:px-8 sm:py-5 border-b border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] shadow-sm shrink-0">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedOrder(null)} className="p-2 -ml-2 bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] rounded-full transition-colors sm:hidden">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)] mb-0.5">Order Details</p>
                  <h2 className="text-[20px] sm:text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)]">#{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="hidden sm:flex p-2.5 bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] rounded-full transition-colors">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[var(--color-surface)]">
              <div className="max-w-4xl mx-auto space-y-8">
              {/* Product Info Card */}
              <div className="bg-[var(--color-surface-container-lowest)] rounded-3xl p-6 card-shadow border border-[var(--color-outline-variant)]/30 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary-container)]/20 rounded-bl-full -z-10 opacity-50" />
                <img src={selectedOrder.productId.images[0] || "https://placehold.co/400x300"} alt={selectedOrder.productId.title} className="w-full md:w-48 aspect-square rounded-2xl object-cover border border-[var(--color-outline-variant)]/20 shadow-sm shrink-0" />
                <div className="flex-1 min-w-0 w-full">
                  <h3 className="font-semibold text-[var(--color-on-surface)] text-[24px] leading-[1.3] mb-6">{selectedOrder.productId.title}</h3>
                  
                  <div className="grid grid-cols-3 gap-4 p-4 bg-[var(--color-surface-container-low)] rounded-2xl border border-[var(--color-outline-variant)]/20 mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1">Quantity</p>
                      <p className="font-bold text-[var(--color-on-surface)] text-[18px]">{selectedOrder.quantity}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1">Price</p>
                      <p className="font-bold text-[var(--color-on-surface)] text-[18px]">₹{selectedOrder.productId.priceInr.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1">Total</p>
                      <p className="font-bold text-[var(--color-primary)] text-[18px]">₹{selectedOrder.totalPriceInr.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const config = getStatusConfig(selectedOrder.status);
                      return (
                        <span className={\`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest \${config.bg} \${config.border} \${config.color}\`}>
                          Order: {config.label}
                        </span>
                      );
                    })()}
                    <span className="px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] text-[10px] font-bold uppercase tracking-widest">
                      Pay: {selectedOrder.paymentMethod === "cod" ? "COD" : "UPI"}
                    </span>
                    <span className={\`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest \${(selectedOrder.paymentStatus || "pending") === "completed" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}\`}>
                      Payment: {selectedOrder.paymentStatus || "pending"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.status === "rejected" && selectedOrder.rejectionReason && (
                <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex gap-4 text-red-800 shadow-sm">
                  <span className="material-symbols-outlined text-[24px] text-red-600 shrink-0">error</span>
                  <div>
                    <h4 className="font-bold text-[14px]">Order Rejected</h4>
                    <p className="text-[14px] mt-1 opacity-90">{selectedOrder.rejectionReason}</p>
                  </div>
                </div>
              )}

              {selectedOrder.estimatedDeliveryDate && (
                <div className="p-5 rounded-2xl bg-[var(--color-primary-container)]/10 border border-[var(--color-primary)]/20 flex gap-4 text-[var(--color-primary)] shadow-sm">
                  <div className="bg-[var(--color-surface-container-lowest)] p-2.5 rounded-xl shadow-sm border border-[var(--color-primary)]/10">
                    <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[14px] tracking-wide">Estimated Delivery Date</h4>
                    <p className="text-[18px] font-bold mt-0.5 text-[var(--color-on-surface)]">{new Date(selectedOrder.estimatedDeliveryDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              )}

              {/* Grid Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-[1rem] bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 shadow-sm relative overflow-hidden card-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-surface-container-low)] rounded-bl-full -z-10" />
                  <p className="text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-widest mb-4">
                    {viewAs === "seller" ? "Buyer Information" : "Seller Information"}
                  </p>
                  <p className="font-semibold text-[var(--color-on-surface)] text-[20px] mb-1">
                    {viewAs === "seller" ? selectedOrder.buyerId.name : selectedOrder.sellerId.name}
                  </p>
                  <p className="text-[14px] font-semibold text-[var(--color-on-surface-variant)] mb-0.5">{selectedOrder.contactPhone}</p>
                  <p className="text-[14px] font-semibold text-[var(--color-on-surface-variant)]">{viewAs === "seller" ? selectedOrder.buyerId.email : selectedOrder.sellerId.email}</p>
                </div>
                
                <div className="p-6 rounded-[1rem] bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 shadow-sm relative overflow-hidden card-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-surface-container-low)] rounded-bl-full -z-10" />
                  <p className="text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-widest mb-4">Shipping Address</p>
                  <div className="text-[14px] font-semibold text-[var(--color-on-surface)] leading-relaxed whitespace-pre-wrap">
                    {typeof selectedOrder.shippingAddress === 'string' ? (
                      selectedOrder.shippingAddress
                    ) : (
                      <>
                        <span className="font-bold block text-[16px] mb-2">{selectedOrder.shippingAddress?.fullName}</span>
                        {selectedOrder.shippingAddress?.building}, {selectedOrder.shippingAddress?.area}
                        {selectedOrder.shippingAddress?.landmark && <><br />Landmark: {selectedOrder.shippingAddress.landmark}</>}
                        <br />{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - <span className="text-[var(--color-primary)]">{selectedOrder.shippingAddress?.pincode}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* UPI Section for Buyer */}
              {viewAs === "buyer" && selectedOrder.paymentMethod === "upi_on_delivery" && ["approved", "shipped", "delivered"].includes(selectedOrder.status) && (
                <div className="p-6 rounded-3xl border border-[var(--color-primary)]/20 bg-[var(--color-primary-container)]/10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {selectedOrder.sellerId.upiQrCode ? (
                    <img src={selectedOrder.sellerId.upiQrCode} alt="Seller UPI QR" className="size-32 rounded-xl object-cover bg-white p-2 shadow-sm border border-[var(--color-outline-variant)]/30" />
                  ) : (
                    <div className="size-32 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center border border-[var(--color-outline-variant)]/30">
                      <p className="text-[var(--color-outline)] text-[12px] font-bold text-center px-2">No QR<br/>Available</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-[var(--color-primary)] text-[16px] mb-2">Pay via UPI on Delivery</h4>
                    <p className="text-[14px] text-[var(--color-on-surface-variant)] mb-4">Scan the QR code or use the UPI ID below to pay the seller directly when your product is delivered.</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-container-lowest)] rounded-lg border border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface)] font-bold font-mono text-[14px] shadow-sm">
                      {selectedOrder.sellerId.upiId || "UPI ID not provided by seller"}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tracking Link Display for Buyer */}
              {viewAs === "buyer" && selectedOrder.trackingLink && (
                <div className="p-6 rounded-[1rem] border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] shadow-sm flex items-center justify-between flex-wrap gap-4 card-shadow">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest mb-1">Tracking Info</p>
                    <p className="text-[16px] font-bold text-[var(--color-on-surface)]">Track your package online</p>
                  </div>
                  <a href={selectedOrder.trackingLink} target="_blank" rel="noopener noreferrer" className="btn-gradient px-6 py-3 text-[var(--color-on-primary)] font-semibold rounded-full shadow-md hover:shadow-lg transition-all hover-scale">
                    Track Package
                  </a>
                </div>
              )}

              {/* Actions Section */}
              <div className="space-y-4 pt-8">
                {/* Buyer Review Option */}
                {viewAs === "buyer" && selectedOrder.status === "delivered" && (
                  <button
                    onClick={() => setReviewModalData({ productId: selectedOrder.productId._id, title: selectedOrder.productId.title })}
                    className="w-full px-8 py-4 text-[16px] font-semibold text-[var(--color-on-primary)] btn-gradient rounded-full transition-all flex items-center justify-center gap-3 hover-scale shadow-md"
                  >
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    Write a Review / Upload Photos
                  </button>
                )}

                {/* Buyer Cancel Option */}
                {viewAs === "buyer" && canBuyerCancel(selectedOrder) && (
                  <button
                    disabled={updatingId === selectedOrder._id}
                    onClick={() => updateOrder(selectedOrder._id, { status: "cancelled" })}
                    className="w-full sm:w-auto px-8 py-3.5 text-[14px] font-bold text-red-600 bg-[var(--color-surface-container-lowest)] border border-red-200 hover:bg-red-50 rounded-full transition-colors shadow-sm disabled:opacity-50"
                  >
                    {updatingId === selectedOrder._id ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}

                {/* Seller Controls */}
                {viewAs === "seller" && (
                  <div className="p-6 rounded-[1rem] bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30 space-y-6">
                    {selectedOrder.status === "pending_approval" && (
                      <div className="space-y-4">
                        <h4 className="text-[16px] font-bold text-[var(--color-on-surface)]">Review Order</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider">Estimated Delivery Date</label>
                            <input type="date" value={estimatedDeliveryDate} onChange={e => setEstimatedDeliveryDate(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-[var(--color-outline-variant)]/30 outline-none text-[14px] bg-[var(--color-surface-container-lowest)] focus:border-[var(--color-primary)]/50" />
                            <button 
                              disabled={updatingId === selectedOrder._id || !estimatedDeliveryDate}
                              onClick={() => updateOrder(selectedOrder._id, { status: "approved", estimatedDeliveryDate })}
                              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm disabled:opacity-50 transition-colors"
                            >
                              Approve Order
                            </button>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider">Rejection Reason</label>
                            <input type="text" placeholder="Reason for rejection..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-[var(--color-outline-variant)]/30 outline-none text-[14px] bg-[var(--color-surface-container-lowest)] focus:border-[var(--color-primary)]/50" />
                            <button 
                              disabled={updatingId === selectedOrder._id || !rejectionReason}
                              onClick={() => updateOrder(selectedOrder._id, { status: "rejected", rejectionReason })}
                              className="w-full h-11 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl shadow-sm disabled:opacity-50 transition-colors"
                            >
                              Reject Order
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedOrder.status === "approved" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider">Courier Tracking Link (Optional)</label>
                        <div className="flex gap-2">
                          <input type="url" placeholder="https://track..." value={trackingLink} onChange={e => setTrackingLink(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-[var(--color-outline-variant)]/30 outline-none text-[14px] bg-[var(--color-surface-container-lowest)] focus:border-[var(--color-primary)]/50" />
                          <button onClick={() => updateOrder(selectedOrder._id, { trackingLink })} className="px-6 bg-[var(--color-on-surface)] text-[var(--color-surface)] font-bold rounded-xl hover:opacity-90 transition-opacity">Save</button>
                        </div>
                        <button 
                          disabled={updatingId === selectedOrder._id}
                          onClick={() => updateOrder(selectedOrder._id, { status: "shipped", trackingLink })}
                          className="w-full h-12 btn-gradient text-[var(--color-on-primary)] font-bold rounded-xl mt-4 shadow-md transition-all hover-scale"
                        >
                          Mark as Shipped
                        </button>
                      </div>
                    )}

                    {selectedOrder.status === "shipped" && (
                      <button 
                        disabled={updatingId === selectedOrder._id}
                        onClick={() => updateOrder(selectedOrder._id, { status: "delivered" })}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    )}

                    {["approved", "shipped", "delivered"].includes(selectedOrder.status) && selectedOrder.paymentStatus !== "completed" && (
                      <div className="pt-4 border-t border-[var(--color-outline-variant)]/30">
                        <button 
                          disabled={updatingId === selectedOrder._id}
                          onClick={() => updateOrder(selectedOrder._id, { paymentStatus: "completed" })}
                          className="w-full h-12 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl transition-colors"
                        >
                          Mark Payment as Received
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReviewModal
        isOpen={!!reviewModalData}
        onClose={() => setReviewModalData(null)}
        productId={reviewModalData?.productId || ""}
        productTitle={reviewModalData?.title || ""}
      />
    </div>
  );
}
`;

fs.writeFileSync(path.resolve('src/components/shop/order-list.tsx'), content, 'utf8');
console.log('Fixed order-list.tsx successfully');
