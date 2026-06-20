const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/(dashboard)/dashboard/addresses/page.tsx');

const newCode = `"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

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

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [newAddress, setNewAddress] = useState<any>({
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
  const [isEditing, setIsEditing] = useState<string | null>(null);

  function handleEdit(addr: SavedAddress) {
    if ((addr as any).address && !addr.building) {
      toast.error("Legacy addresses cannot be edited. Please add a new one.");
      return;
    }
    setNewAddress(addr);
    setIsEditing(addr._id);
    setShowForm(true);
  }

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    setIsLoading(true);
    const res = await fetch("/api/user/addresses");
    const data = await res.json().catch(() => null);
    if (res.ok && data?.addresses) {
      setAddresses(data.addresses);
    }
    setIsLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this address?")) return;
    const res = await fetch(\`/api/user/addresses?id=\${id}\`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Address deleted successfully");
      fetchAddresses();
    } else {
      toast.error("Failed to delete address");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const isUpdate = !!isEditing;
    const url = "/api/user/addresses";
    const method = isUpdate ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isUpdate ? { ...newAddress, _id: isEditing } : newAddress)
    });
    
    if (res.ok) {
      toast.success(isUpdate ? "Address updated successfully!" : "Address saved successfully!");
      setShowForm(false);
      setIsEditing(null);
      setNewAddress({
        tag: "Home", fullName: "", contactPhone: "", building: "", area: "", landmark: "", city: "", state: "", pincode: "",
      });
      fetchAddresses();
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to save address");
    }
  }

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case "Home": return "home";
      case "Work": return "work";
      case "Other": return "location_on";
      default: return "location_on";
    }
  };

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)]">
      <main className="max-w-[1000px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-[32px] leading-[1.2] font-semibold text-[var(--color-on-surface)] mb-2">Saved Addresses</h1>
            <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)]">Manage your delivery addresses for quick checkout</p>
          </div>
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)} 
              className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-full btn-gradient px-8 text-[15px] font-bold text-white shadow-md hover:shadow-lg hover-scale transition-all overflow-hidden shrink-0"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="material-symbols-outlined text-[20px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>add_location</span>
              <span className="relative z-10">Add New Address</span>
            </button>
          )}
        </header>

        {showForm && (
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 rounded-[1.5rem] card-shadow p-6 md:p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-outline-variant)]/30">
              <h2 className="text-[22px] font-bold text-[var(--color-on-surface)] flex items-center gap-3">
                <span className="material-symbols-outlined text-[var(--color-primary)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isEditing ? "edit_location" : "add_location_alt"}
                </span>
                {isEditing ? "Edit Address" : "Add New Address"}
              </h2>
              <button 
                type="button" 
                onClick={() => { setShowForm(false); setIsEditing(null); setNewAddress({tag: "Home", fullName: "", contactPhone: "", building: "", area: "", landmark: "", city: "", state: "", pincode: ""}); }} 
                className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)] transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-3">Address Type</label>
                <div className="flex flex-wrap gap-3">
                  {["Home", "Work", "Other"].map(tag => (
                    <button 
                      type="button" 
                      key={tag} 
                      onClick={() => setNewAddress({...newAddress, tag})} 
                      className={\`px-5 py-2.5 flex items-center gap-2 text-[14px] font-bold rounded-full border-2 transition-all \${newAddress.tag === tag ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "border-[var(--color-outline-variant)]/50 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]"}\`}
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{getTagIcon(tag)}</span>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block group">
                  <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Full Name</span>
                  <input required type="text" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                </label>
                <label className="block group">
                  <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Mobile Number</span>
                  <input required type="tel" value={newAddress.contactPhone} onChange={e => setNewAddress({...newAddress, contactPhone: e.target.value})} className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                </label>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block group">
                  <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Pincode</span>
                  <input required type="text" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                </label>
                <label className="block group">
                  <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Flat, House no., Building</span>
                  <input required type="text" value={newAddress.building} onChange={e => setNewAddress({...newAddress, building: e.target.value})} className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                </label>
              </div>

              <label className="block group">
                <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Area, Street, Sector</span>
                <input required type="text" value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" />
              </label>

              <label className="block group">
                <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Landmark (Optional)</span>
                <input type="text" value={newAddress.landmark} onChange={e => setNewAddress({...newAddress, landmark: e.target.value})} className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" />
              </label>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block group">
                  <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Town/City</span>
                  <input required type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                </label>
                <label className="block group">
                  <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">State</span>
                  <input required type="text" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                </label>
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--color-outline-variant)]/30">
                <button type="submit" className="inline-flex h-14 items-center justify-center gap-2 rounded-full btn-gradient px-10 text-[16px] font-bold text-white shadow-md transition-all hover:shadow-lg hover-scale">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
                  {isEditing ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2].map(i => <div key={i} className="h-56 bg-[var(--color-surface-container)]/50 animate-pulse rounded-[1.5rem]" />)}
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <section className="bg-[var(--color-surface-container-lowest)] rounded-[1.5rem] border border-[var(--color-outline-variant)]/30 card-shadow p-[32px] flex flex-col items-center justify-center min-h-[400px] py-20 text-center relative overflow-hidden transition-all duration-300 hover:shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[1.5rem]"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-primary-fixed)] to-[var(--color-secondary-fixed)] rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm border border-[var(--color-outline-variant)]/50 relative z-10">
              <span className="material-symbols-outlined text-[48px] text-[var(--color-primary)] drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
            </div>
            <h2 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-3 relative z-10">No addresses saved</h2>
            <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)] max-w-md mx-auto mb-8 relative z-10">
              Add a delivery address to speed up your checkout process when buying products or adopting pets.
            </p>
            <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-on-primary)] text-[15px] tracking-wide font-bold py-3.5 px-8 rounded-full shadow-md hover:shadow-lg hover-scale transition-all duration-300 relative z-10 overflow-hidden group/btn inline-flex items-center gap-2">
              <span className="absolute inset-0 w-full h-full bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></span>
              <span className="relative flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
                Add Address
              </span>
            </button>
          </section>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {addresses.map(addr => (
              <div key={addr._id} className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 p-6 md:p-8 rounded-[1.5rem] card-shadow relative group overflow-hidden transition-all duration-300 hover:border-[var(--color-primary)]/30 hover:shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[1.5rem]"></div>
                
                <div className="flex items-start justify-between mb-5 relative z-10">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[12px] font-black uppercase tracking-widest rounded-full border border-[var(--color-primary)]/20 shadow-sm">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{getTagIcon(addr.tag)}</span>
                    {addr.tag}
                  </span>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => handleEdit(addr)} 
                      className="size-10 inline-flex items-center justify-center text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30 rounded-full hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all shadow-sm"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(addr._id)} 
                      className="size-10 inline-flex items-center justify-center text-rose-500 bg-rose-50 border border-rose-100 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="space-y-1 mb-5">
                    <h3 className="font-extrabold text-[var(--color-on-surface)] text-[20px] tracking-tight">{addr.fullName || "Unnamed"}</h3>
                    <p className="text-[var(--color-primary)] font-semibold text-[15px] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      {addr.contactPhone || "No phone provided"}
                    </p>
                  </div>

                  <div className="text-[var(--color-on-surface-variant)] text-[15px] leading-relaxed p-4 bg-[var(--color-surface-container)]/30 rounded-2xl border border-[var(--color-outline-variant)]/20">
                    {addr.building ? (
                      <>
                        <p>{addr.building}</p>
                        <p>{addr.area}</p>
                        {addr.landmark && <p className="mt-1"><span className="font-semibold text-[var(--color-on-surface)]">Landmark:</span> {addr.landmark}</p>}
                        <p className="mt-1 font-semibold text-[var(--color-on-surface)]">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </>
                    ) : (
                      <p>{(addr as any).address}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
`;

fs.writeFileSync(filePath, newCode, 'utf8');
console.log('Successfully redesigned addresses page');
