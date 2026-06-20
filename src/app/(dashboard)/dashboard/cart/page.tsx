"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

type CartItem = {
  productId: {
    _id: string;
    title: string;
    images: string[];
    priceInr: number;
    stockQuantity: number;
  };
  quantity: number;
};

type SavedAddress = {
  _id: string;
  tag: string;
  fullName: string;
  contactPhone: string;
  building: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: null as SavedAddress | null,
    contactPhone: "",
    paymentMethod: "cod",
  });
  
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

  const router = useRouter();

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  async function fetchCart() {
    const res = await fetch("/api/cart");
    const data = await res.json().catch(() => null);
    if (res.ok && data?.cart?.items) setItems(data.cart.items);
    setIsLoading(false);
  }

  async function fetchAddresses() {
    const res = await fetch("/api/user/addresses");
    const data = await res.json().catch(() => null);
    if (res.ok && data?.addresses) {
      setAddresses(data.addresses);
      if (data.addresses.length > 0 && !checkoutData.shippingAddress) {
        setCheckoutData(prev => ({ 
          ...prev, 
          shippingAddress: data.addresses[0],
          contactPhone: data.addresses[0].contactPhone
        }));
      }
    }
  }

  async function handleAddAddress(e: React.FormEvent) {
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
      const addedAddress = data.addresses[data.addresses.length - 1];
      setCheckoutData(prev => ({ ...prev, shippingAddress: addedAddress, contactPhone: addedAddress.contactPhone }));
      setIsChangingAddress(false);
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    if (res.ok) {
      window.dispatchEvent(new Event("cart-updated"));
      fetchCart();
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to update quantity");
    }
  }

  async function removeItem(productId: string) {
    const res = await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
    if (res.ok) {
      window.dispatchEvent(new Event("cart-updated"));
      fetchCart();
    }
  }

  async function saveForLater(productId: string) {
    const wishlistRes = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    
    if (wishlistRes.ok) {
      window.dispatchEvent(new Event("wishlist-updated"));
      await removeItem(productId);
      toast.success("Saved for later!");
    }
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!checkoutData.shippingAddress) return toast.error("Please select or add a delivery address.");

    setIsCheckingOut(true);
    await finalizeCheckout();
  }

  async function finalizeCheckout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutData),
    });

    if (res.ok) {
      window.dispatchEvent(new Event("cart-updated"));
      router.push("/dashboard/orders");
    } else {
      const data = await res.json();
      toast.error(data.message || "Checkout failed");
      setIsCheckingOut(false);
    }
  }

  const subtotal = items.reduce((acc, item) => acc + item.productId.priceInr * item.quantity, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 font-outfit home-theme">
        <div className="size-12 rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin" />
        <p className="text-[var(--color-on-surface-variant)] text-[16px] font-semibold animate-pulse">Loading checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center font-outfit home-theme text-[var(--color-on-surface)]">
        <div className="size-24 rounded-[2rem] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/10 flex items-center justify-center mb-8 shadow-sm border border-[var(--color-outline-variant)]/20">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-primary)]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
        </div>
        <h2 className="text-[28px] md:text-[32px] font-bold text-[var(--color-on-surface)] mb-3 tracking-tight">Your cart is empty</h2>
        <p className="text-[16px] text-[var(--color-on-surface-variant)] mb-10 max-w-sm leading-relaxed">Looks like you haven't added any pet products to your cart yet.</p>
        <Link href="/dashboard/shop" className="h-14 px-10 inline-flex items-center justify-center rounded-full btn-gradient text-[16px] font-bold text-white hover-scale shadow-md tracking-wide">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] max-w-[1280px] mx-auto space-y-8 pb-24 px-4 sm:px-0">
      <h1 className="text-[32px] md:text-[36px] font-extrabold text-[var(--color-on-surface)] tracking-tight leading-[1.2] mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Cart Items & Delivery Info */}
        <div className="space-y-8">
          
          {/* Address Selection */}
          <div className="bg-[var(--color-surface-container-lowest)] p-6 md:p-8 rounded-[2rem] border border-[var(--color-outline-variant)]/30 card-shadow relative overflow-hidden">
            <h2 className="text-[20px] font-extrabold text-[var(--color-on-surface)] mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--color-primary)]">location_on</span>
              Delivery Address
            </h2>
            
            {checkoutData.shippingAddress && !isChangingAddress ? (
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">{checkoutData.shippingAddress.tag}</span>
                    <h3 className="font-bold text-[18px] text-[var(--color-on-surface)]">{checkoutData.shippingAddress.fullName || "Unnamed"}</h3>
                  </div>
                  {checkoutData.shippingAddress.building ? (
                    <>
                      <p className="text-[var(--color-on-surface-variant)] text-[15px] leading-relaxed mb-2 max-w-md">
                        {checkoutData.shippingAddress.building}, {checkoutData.shippingAddress.area}
                        {checkoutData.shippingAddress.landmark && `, ${checkoutData.shippingAddress.landmark}`}
                        <br />
                        {checkoutData.shippingAddress.city}, {checkoutData.shippingAddress.state} - {checkoutData.shippingAddress.pincode}
                      </p>
                      <p className="text-[14px] font-semibold text-[var(--color-on-surface)]">Phone: {checkoutData.shippingAddress.contactPhone}</p>
                    </>
                  ) : (
                    <p className="text-[var(--color-on-surface-variant)] text-[15px] leading-relaxed mb-1 whitespace-pre-wrap">{(checkoutData.shippingAddress as any).address}</p>
                  )}
                </div>
                <button onClick={() => setIsChangingAddress(true)} className="px-6 py-2.5 bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] text-[14px] font-bold rounded-full transition-colors shrink-0 border border-[var(--color-outline-variant)]/30">
                  Change
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                {addresses.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    {addresses.map((addr) => (
                      <div 
                        key={addr._id}
                        onClick={() => {
                          setCheckoutData({ ...checkoutData, shippingAddress: addr, contactPhone: addr.contactPhone });
                          setIsChangingAddress(false);
                        }}
                        className={`p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 ${
                          checkoutData.shippingAddress?._id === addr._id ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm" : "border-[var(--color-outline-variant)]/30 hover:border-[var(--color-outline-variant)] bg-[var(--color-surface-container)]/30"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">{addr.tag}</span>
                          {checkoutData.shippingAddress?._id === addr._id && <div className="size-5 rounded-full bg-[var(--color-primary)] border-[5px] border-[var(--color-surface-container-lowest)] shadow-sm" />}
                        </div>
                        <h4 className="font-bold text-[16px] text-[var(--color-on-surface)] mb-1.5">{addr.fullName || "Unnamed"}</h4>
                        <p className="text-[13px] text-[var(--color-on-surface-variant)] line-clamp-2 leading-relaxed">
                          {addr.building ? `${addr.building}, ${addr.area}, ${addr.city} - ${addr.pincode}` : (addr as any).address}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                {!showNewAddress ? (
                  <button onClick={() => setShowNewAddress(true)} className="text-[15px] font-bold text-[var(--color-primary)] flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="material-symbols-outlined text-[20px]">add</span> Add New Address
                  </button>
                ) : (
                  <form onSubmit={handleAddAddress} className="bg-[var(--color-surface-container)]/30 p-6 rounded-[1.5rem] border border-[var(--color-outline-variant)]/30 space-y-4">
                    <div className="flex gap-3 mb-2">
                      {["Home", "Work", "Other"].map(tag => (
                        <button type="button" key={tag} onClick={() => setNewAddress({...newAddress, tag})} className={`px-4 py-1.5 text-[13px] font-bold rounded-full transition-colors ${newAddress.tag === tag ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] hover:bg-[var(--color-outline-variant)]/20"}`}>
                          {tag}
                        </button>
                      ))}
                    </div>
                    <input required type="text" placeholder="Full Name" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} className="w-full h-12 rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] px-4 text-[15px] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                    <input required type="text" placeholder="10-digit mobile number" value={newAddress.contactPhone} onChange={e => setNewAddress({...newAddress, contactPhone: e.target.value})} className="w-full h-12 rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] px-4 text-[15px] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input required type="text" placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full h-12 rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] px-4 text-[15px] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                      <input required type="text" placeholder="Flat, House no., Building, Company" value={newAddress.building} onChange={e => setNewAddress({...newAddress, building: e.target.value})} className="w-full h-12 rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] px-4 text-[15px] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                    </div>
                    <input required type="text" placeholder="Area, Street, Sector, Village" value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} className="w-full h-12 rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] px-4 text-[15px] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                    <input type="text" placeholder="Landmark (Optional)" value={newAddress.landmark} onChange={e => setNewAddress({...newAddress, landmark: e.target.value})} className="w-full h-12 rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] px-4 text-[15px] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input required type="text" placeholder="Town/City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full h-12 rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] px-4 text-[15px] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                      <input required type="text" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full h-12 rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] px-4 text-[15px] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => setShowNewAddress(false)} className="px-6 py-2.5 text-[14px] font-bold text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] rounded-full transition-colors">Cancel</button>
                      <button type="submit" className="px-6 py-2.5 text-[14px] font-bold btn-gradient text-white rounded-full hover-scale shadow-sm">Save Address</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="bg-transparent space-y-6">
            <h2 className="text-[20px] font-extrabold text-[var(--color-on-surface)] flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-500">shopping_cart</span>
              Review Items
            </h2>
            {items.map((item) => (
              <div key={item.productId._id} className="flex gap-5 p-5 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 rounded-[2rem] card-shadow">
                <img src={item.productId.images[0] || "https://placehold.co/100x100"} alt={item.productId.title} className="size-[100px] md:size-[120px] rounded-[1.5rem] object-cover bg-[var(--color-surface-container)] shrink-0 shadow-inner" />
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 mb-2">
                    <h3 className="font-bold text-[18px] leading-tight text-[var(--color-on-surface)] line-clamp-2">{item.productId.title}</h3>
                    <p className="font-black text-[20px] text-[var(--color-on-surface)] shrink-0">₹{item.productId.priceInr.toLocaleString()}</p>
                  </div>
                  
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-[var(--color-surface-container)] rounded-full p-1 border border-[var(--color-outline-variant)]/30">
                      <button onClick={() => updateQuantity(item.productId._id, item.quantity - 1)} disabled={item.quantity <= 1} className="size-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all text-[var(--color-on-surface)]">
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="font-bold text-[15px] text-[var(--color-on-surface)] w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId._id, item.quantity + 1)} disabled={item.quantity >= item.productId.stockQuantity} className="size-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all text-[var(--color-on-surface)]">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => saveForLater(item.productId._id)} className="px-4 py-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-full transition-colors flex items-center gap-2 font-bold text-[13px]" title="Save for Later">
                        <span className="material-symbols-outlined text-[18px]">favorite</span> Save
                      </button>
                      <button onClick={() => removeItem(item.productId._id)} className="size-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-full transition-colors" title="Remove">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Sidebar */}
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 rounded-[2rem] card-shadow p-6 md:p-8 h-fit sticky top-24">
          <h2 className="text-[20px] font-extrabold text-[var(--color-on-surface)] mb-6">Payment Summary</h2>
          
          <div className="space-y-4 mb-6 pb-6 border-b border-[var(--color-outline-variant)]/30">
            <div className="flex justify-between text-[15px] text-[var(--color-on-surface-variant)]">
              <span>Subtotal ({items.length} items)</span>
              <span className="font-medium text-[var(--color-on-surface)]">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[15px] text-[var(--color-on-surface-variant)]">
              <span>Delivery Fee</span>
              <span className="text-emerald-500 font-bold tracking-wide">FREE</span>
            </div>
            <div className="flex justify-between text-[15px] text-[var(--color-on-surface-variant)] pt-4 border-t border-[var(--color-outline-variant)]/30 border-dashed">
              <span>Est. Delivery</span>
              <span className="font-bold text-[var(--color-on-surface)]">
                {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <span className="font-bold text-[18px] text-[var(--color-on-surface)]">Total</span>
            <span className="text-[28px] font-black text-[var(--color-on-surface)] tracking-tight">₹{subtotal.toLocaleString()}</span>
          </div>

          <form onSubmit={handleCheckout} className="space-y-6">
            <div>
              <label className="block text-[14px] font-bold text-[var(--color-on-surface-variant)] mb-2">Payment Method</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-outline)] group-hover:text-[var(--color-primary)] transition-colors">credit_card</span>
                <select value={checkoutData.paymentMethod} onChange={(e) => setCheckoutData({ ...checkoutData, paymentMethod: e.target.value })} className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] pl-12 pr-4 text-[15px] font-medium text-[var(--color-on-surface)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] appearance-none cursor-pointer transition-all">
                  <option value="cod">Cash on Delivery</option>
                  <option value="upi_on_delivery">UPI on Delivery</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={isCheckingOut} className="w-full h-14 rounded-full btn-gradient text-[16px] font-bold tracking-wide text-white hover-scale shadow-lg disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
              {isCheckingOut ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
