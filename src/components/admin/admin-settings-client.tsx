"use client";

import { useState } from "react";

type SettingsData = {
  _id: string;
  isMaintenanceMode: boolean;
  announcementBanner: { isActive: boolean; text: string };
  allowedPetCategories: string[];
  allowedProductCategories: string[];
  featureToggles: { listingsEnabled: boolean; productsEnabled: boolean; verificationsEnabled: boolean };
};

export function AdminSettingsClient({ initialSettings }: { initialSettings: SettingsData }) {
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [isUpdating, setIsUpdating] = useState(false);

  async function saveSettings(updates: Partial<SettingsData>) {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const { settings: newSettings } = await res.json();
        setSettings(newSettings);
        alert("Settings saved successfully.");
      } else {
        alert("Failed to save settings.");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-3xl border border-[var(--color-outline-variant)]/30 card-shadow">
        <h2 className="text-xl font-bold mb-6">Global Toggles</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[var(--color-outline-variant)]/30">
            <div>
              <p className="font-bold">Maintenance Mode</p>
              <p className="text-sm text-[var(--color-on-surface-variant)]">Disable all user access except for admins.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.isMaintenanceMode} disabled={isUpdating} onChange={(e) => saveSettings({ isMaintenanceMode: e.target.checked })} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[var(--color-outline-variant)]/30">
            <div>
              <p className="font-bold">Allow New Pet Listings</p>
              <p className="text-sm text-[var(--color-on-surface-variant)]">Toggle whether users can create new pet listings.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.featureToggles?.listingsEnabled} disabled={isUpdating} onChange={(e) => saveSettings({ featureToggles: { ...settings.featureToggles, listingsEnabled: e.target.checked } })} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[var(--color-outline-variant)]/30">
            <div>
              <p className="font-bold">Allow Store Products</p>
              <p className="text-sm text-[var(--color-on-surface-variant)]">Toggle whether verified sellers can list products.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.featureToggles?.productsEnabled} disabled={isUpdating} onChange={(e) => saveSettings({ featureToggles: { ...settings.featureToggles, productsEnabled: e.target.checked } })} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-bold">Allow Seller Verifications</p>
              <p className="text-sm text-[var(--color-on-surface-variant)]">Accept new commercial seller applications.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.featureToggles?.verificationsEnabled} disabled={isUpdating} onChange={(e) => saveSettings({ featureToggles: { ...settings.featureToggles, verificationsEnabled: e.target.checked } })} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[var(--color-outline-variant)]/30 card-shadow">
        <h2 className="text-xl font-bold mb-6">Announcement Banner</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input type="checkbox" id="bannerActive" checked={settings.announcementBanner?.isActive} disabled={isUpdating} onChange={(e) => saveSettings({ announcementBanner: { ...settings.announcementBanner, isActive: e.target.checked } })} />
            <label htmlFor="bannerActive" className="font-medium text-sm">Show Announcement Banner</label>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Banner Text</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                value={settings.announcementBanner?.text || ""}
                onChange={(e) => setSettings({ ...settings, announcementBanner: { ...settings.announcementBanner, text: e.target.value } })}
              />
              <button 
                disabled={isUpdating}
                onClick={() => saveSettings({ announcementBanner: settings.announcementBanner })}
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
