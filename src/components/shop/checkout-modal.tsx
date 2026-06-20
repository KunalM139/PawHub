"use client";

import { useState, useEffect, FormEvent } from "react";
import type { ProductRecord } from "./product-management";
import { X, CheckCircle2, Plus } from "lucide-react";

type CheckoutModalProps = {
  product: ProductRecord;
  onClose: () => void;
  onSuccess: () => void;
};

export function CheckoutModal({ product, onClose, onSuccess }: CheckoutModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    tag: "Home",
    fullName: "",
    contactPhone: "",
    building: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  
  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    const res = await fetch("/api/user/addresses");
    const data = await res.json().catch(() => null);
    if (res.ok && data?.addresses) {
      setAddresses(data.addresses);
      if (data.addresses.length > 0) {
        setSelectedAddress(data.addresses[0]);
      } else {
        setShowNewAddress(true);
      }
    }
  }

  async function handleAddAddress(e: React.MouseEvent) {
    e.preventDefault();
    const res = await fetch("/api/user/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress)
    });
    if (res.ok) {
      const data = await res.json();
      setShowNewAddress(false);
      setAddresses(data.addresses);
      setSelectedAddress(data.addresses[data.addresses.length - 1]);
      setIsChangingAddress(false);
    }
  }
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalPrice = product.priceInr * quantity;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!selectedAddress) {
      setError("Please select a delivery address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        productId: product._id,
        quantity,
        shippingAddress: selectedAddress,
        contactPhone: selectedAddress.contactPhone,
        paymentMethod,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to place order.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    }

    setIsSubmitting(false);
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-6">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h3>
          <p className="text-slate-600 mb-6">
            Your order for {quantity}x {product.title} has been confirmed. The seller will process it shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-xl font-bold text-slate-900">Checkout</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 transition-colors">
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
            <img src={product.images[0]} alt={product.title} className="size-16 rounded-lg object-cover" />
            <div>
              <p className="font-bold text-slate-900 line-clamp-1">{product.title}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">₹{product.priceInr.toLocaleString()} each</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-1">
            <label className="block text-sm font-semibold text-slate-700">
              Quantity
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {Array.from({ length: Math.min(10, product.stockQuantity) }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Delivery Address</h4>
            
            {selectedAddress && !isChangingAddress && !showNewAddress ? (
              <div className="flex items-start justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{selectedAddress.tag}</span>
                    <h3 className="font-bold text-slate-900">{selectedAddress.fullName || "Unnamed"}</h3>
                  </div>
                  {selectedAddress.building ? (
                    <>
                      <p className="text-slate-600 text-sm leading-relaxed mb-1">
                        {selectedAddress.building}, {selectedAddress.area}
                        {selectedAddress.landmark && `, ${selectedAddress.landmark}`}
                        <br />
                        {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                      </p>
                      <p className="text-sm font-semibold text-slate-700">Phone: {selectedAddress.contactPhone}</p>
                    </>
                  ) : (
                    <p className="text-slate-600 text-sm leading-relaxed mb-1 whitespace-pre-wrap">{selectedAddress.address}</p>
                  )}
                </div>
                <button type="button" onClick={() => setIsChangingAddress(true)} className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-full transition-colors shrink-0 shadow-sm">
                  Change
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-200">
                {addresses.length > 0 && !showNewAddress && (
                  <div className="grid gap-3 sm:grid-cols-2 mb-4">
                    {addresses.map((addr) => (
                      <div 
                        key={addr._id}
                        onClick={() => {
                          setSelectedAddress(addr);
                          setIsChangingAddress(false);
                        }}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedAddress?._id === addr._id ? "border-indigo-600 bg-indigo-50" : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{addr.tag}</span>
                          {selectedAddress?._id === addr._id && <div className="size-3 rounded-full bg-indigo-600 border-2 border-indigo-200" />}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mb-0.5 truncate">{addr.fullName || "Unnamed"}</h4>
                        <p className="text-xs text-slate-700 line-clamp-2 leading-tight">
                          {addr.building ? `${addr.building}, ${addr.city} - ${addr.pincode}` : addr.address}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                {!showNewAddress ? (
                  <button type="button" onClick={() => setShowNewAddress(true)} className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                    <Plus className="size-4" /> Add New Address
                  </button>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex gap-2">
                      {["Home", "Work", "Other"].map(tag => (
                        <button type="button" key={tag} onClick={() => setNewAddress({...newAddress, tag})} className={`px-3 py-1 text-xs font-bold rounded-full ${newAddress.tag === tag ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                          {tag}
                        </button>
                      ))}
                    </div>
                    <input required type="text" placeholder="Full Name" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                    <input required type="text" placeholder="10-digit mobile number" value={newAddress.contactPhone} onChange={e => setNewAddress({...newAddress, contactPhone: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input required type="text" placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                      <input required type="text" placeholder="Flat, House no., Building" value={newAddress.building} onChange={e => setNewAddress({...newAddress, building: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <input required type="text" placeholder="Area, Street, Sector" value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                    <input type="text" placeholder="Landmark (Optional)" value={newAddress.landmark} onChange={e => setNewAddress({...newAddress, landmark: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input required type="text" placeholder="Town/City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                      <input required type="text" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      {addresses.length > 0 && <button type="button" onClick={() => setShowNewAddress(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>}
                      <button type="button" onClick={handleAddAddress} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save & Select</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            Payment Method
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="upi_on_delivery">UPI on Delivery</option>
            </select>
          </label>

          <div className="flex items-center justify-between rounded-xl bg-indigo-50 p-4 border border-indigo-100">
            <span className="font-bold text-indigo-900">Total Price</span>
            <span className="text-xl font-extrabold text-indigo-700">₹{totalPrice.toLocaleString()}</span>
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
