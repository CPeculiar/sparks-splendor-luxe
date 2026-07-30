import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { getSettings, updateSetting, getAuthToken } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  base_fee_ngn: number;
  base_fee_usd: number;
  free_threshold_ngn: number;
  free_threshold_usd: number;
  per_item_surcharge_ngn: number;
  per_item_surcharge_usd: number;
  is_active: boolean;
  sort_order: number;
}

const EMPTY_ZONE = {
  name: "",
  countries: [] as string[],
  base_fee_ngn: 0,
  base_fee_usd: 0,
  free_threshold_ngn: 0,
  free_threshold_usd: 0,
  per_item_surcharge_ngn: 0,
  per_item_surcharge_usd: 0,
  is_active: true,
  sort_order: 0,
};

function authH(): Record<string, string> {
  const t = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (t) headers["Authorization"] = `Bearer ${t}`;
  return headers;
}

async function fetchZonesAdmin(): Promise<ShippingZone[]> {
  const res = await fetch(`${API_BASE}/api/shipping/zones/all`, { headers: authH() });
  const d = await res.json();
  return d.data || [];
}

async function saveZoneApi(zone: Partial<ShippingZone> & { id?: string }): Promise<ShippingZone> {
  const isNew = !zone.id;
  const res = await fetch(
    isNew ? `${API_BASE}/api/shipping/zones` : `${API_BASE}/api/shipping/zones/${zone.id}`,
    { method: isNew ? "POST" : "PUT", headers: authH(), body: JSON.stringify(zone) }
  );
  const d = await res.json();
  if (!res.ok) throw new Error(d.error || "Failed to save zone");
  return d.data;
}

async function deleteZoneApi(id: string) {
  await fetch(`${API_BASE}/api/shipping/zones/${id}`, { method: "DELETE", headers: authH() });
}

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [editingZone, setEditingZone] = useState<(Partial<ShippingZone> & { id?: string }) | null>(null);
  const [zoneError, setZoneError] = useState<string | null>(null);
  const [savingZone, setSavingZone] = useState(false);

  useEffect(() => {
    loadSettings();
    fetchZonesAdmin()
      .then(setZones)
      .catch(() => {})
      .finally(() => setZonesLoading(false));
  }, []);

  async function handleSaveZone() {
    if (!editingZone) return;
    setSavingZone(true);
    setZoneError(null);
    try {
      const saved = await saveZoneApi(editingZone);
      setZones((prev) =>
        editingZone.id ? prev.map((z) => (z.id === saved.id ? saved : z)) : [...prev, saved]
      );
      setEditingZone(null);
    } catch (e) {
      setZoneError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingZone(false);
    }
  }

  async function handleDeleteZone(id: string) {
    if (!confirm("Delete this shipping zone?")) return;
    await deleteZoneApi(id);
    setZones((prev) => prev.filter((z) => z.id !== id));
  }

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data.data || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const promises = Object.entries(settings).map(([key, value]) => updateSetting(key, value));
      await Promise.all(promises);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const updateField = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-96">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-eyebrow">Configuration</p>
          <h1 className="font-display text-3xl mt-1">General Settings</h1>
        </div>
        {saved && <span className="text-emerald-600 text-sm font-medium">✓ Saved</span>}
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <section className="border border-border p-6 rounded-lg space-y-4">
          <h3 className="font-semibold">Store Information</h3>
          <div>
            <label className="text-eyebrow block mb-2">Store Name</label>
            <input
              type="text"
              value={settings.store_name || ""}
              onChange={(e) => updateField("store_name", e.target.value)}
              placeholder="Sparks & Splendour"
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="text-eyebrow block mb-2">Store Email</label>
            <input
              type="email"
              value={settings.store_email || ""}
              onChange={(e) => updateField("store_email", e.target.value)}
              placeholder="support@example.com"
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="text-eyebrow block mb-2">Store Phone.</label>
            <input
              type="tel"
              value={settings.store_phone || ""}
              onChange={(e) => updateField("store_phone", e.target.value)}
              placeholder="+234 800 000 0000"
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="text-eyebrow block mb-2">Store Address</label>
            <textarea
              value={settings.store_address || ""}
              onChange={(e) => updateField("store_address", e.target.value)}
              placeholder="123 Business St, City, Country"
              rows={3}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
        </section>

        {/* Payment Settings */}
        <section className="border border-border p-6 rounded-lg space-y-4">
          <h3 className="font-semibold">Payment Settings</h3>
          <div>
            <label className="text-eyebrow block mb-2">Currency</label>
            <select
              value={settings.currency || "NGN"}
              onChange={(e) => updateField("currency", e.target.value)}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-gold"
            >
              <option value="NGN">NGN (Nigerian Naira)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
          </div>
          <div>
            <label className="text-eyebrow block mb-2">Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={settings.tax_rate || 0}
              onChange={(e) => updateField("tax_rate", parseFloat(e.target.value))}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="text-eyebrow block mb-2">Default Shipping Fee</label>
            <input
              type="number"
              step="0.01"
              value={settings.default_shipping_fee || 0}
              onChange={(e) => updateField("default_shipping_fee", parseFloat(e.target.value))}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
        </section>

        {/* SEO Settings */}
        <section className="border border-border p-6 rounded-lg space-y-4 lg:col-span-2">
          <h3 className="font-semibold">SEO Settings</h3>
          <div>
            <label className="text-eyebrow block mb-2">Site Title</label>
            <input
              type="text"
              value={settings.site_title || ""}
              onChange={(e) => updateField("site_title", e.target.value)}
              placeholder="Sparks & Splendour - Luxury Bespoke Fashion"
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="text-eyebrow block mb-2">Site Description</label>
            <textarea
              value={settings.site_description || ""}
              onChange={(e) => updateField("site_description", e.target.value)}
              placeholder="Discover handcrafted luxury bespoke fashion..."
              rows={3}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
        </section>

        {/* Shipping Zones */}
        <section className="border border-border p-6 rounded-lg space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Shipping Zones</h3>
            <button
              onClick={() => setEditingZone({ ...EMPTY_ZONE })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-onyx text-cream text-xs tracking-wider uppercase hover:bg-gold hover:text-onyx transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Zone
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Each zone maps countries to a shipping fee. First matching zone wins. A zone with no countries is the catch-all fallback.</p>

          {zoneError && <p className="text-xs text-destructive">{zoneError}</p>}

          {editingZone && (
            <div className="border border-gold/40 bg-secondary/30 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider">{editingZone.id ? "Edit Zone" : "New Zone"}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-eyebrow block mb-1">Zone Name</label>
                  <input value={editingZone.name || ""} onChange={(e) => setEditingZone((z) => ({ ...z!, name: e.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold" placeholder="e.g. West Africa" />
                </div>
                <div>
                  <label className="text-eyebrow block mb-1">Sort Order</label>
                  <input type="number" value={editingZone.sort_order ?? 0} onChange={(e) => setEditingZone((z) => ({ ...z!, sort_order: Number(e.target.value) }))} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>
              <div>
                <label className="text-eyebrow block mb-1">Countries (comma-separated — leave empty for catch-all)</label>
                <input
                  value={(editingZone.countries || []).join(", ")}
                  onChange={(e) => setEditingZone((z) => ({ ...z!, countries: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold"
                  placeholder="Nigeria, Ghana, Senegal"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-eyebrow block mb-1">Base Fee ₦ (NGN)</label>
                  <input type="number" step="0.01" value={editingZone.base_fee_ngn ?? 0} onChange={(e) => setEditingZone((z) => ({ ...z!, base_fee_ngn: Number(e.target.value) }))} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-eyebrow block mb-1">Base Fee $ (USD)</label>
                  <input type="number" step="0.01" value={editingZone.base_fee_usd ?? 0} onChange={(e) => setEditingZone((z) => ({ ...z!, base_fee_usd: Number(e.target.value) }))} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-eyebrow block mb-1">Free Shipping Threshold ₦ (0 = never free)</label>
                  <input type="number" step="0.01" value={editingZone.free_threshold_ngn ?? 0} onChange={(e) => setEditingZone((z) => ({ ...z!, free_threshold_ngn: Number(e.target.value) }))} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-eyebrow block mb-1">Free Shipping Threshold $ (0 = never free)</label>
                  <input type="number" step="0.01" value={editingZone.free_threshold_usd ?? 0} onChange={(e) => setEditingZone((z) => ({ ...z!, free_threshold_usd: Number(e.target.value) }))} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-eyebrow block mb-1">Per-Item Surcharge ₦ (0 = none)</label>
                  <input type="number" step="0.01" value={editingZone.per_item_surcharge_ngn ?? 0} onChange={(e) => setEditingZone((z) => ({ ...z!, per_item_surcharge_ngn: Number(e.target.value) }))} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                  <p className="text-[10px] text-muted-foreground mt-1">Added per item in cart (e.g. bulky/heavy items)</p>
                </div>
                <div>
                  <label className="text-eyebrow block mb-1">Per-Item Surcharge $ (0 = none)</label>
                  <input type="number" step="0.01" value={editingZone.per_item_surcharge_usd ?? 0} onChange={(e) => setEditingZone((z) => ({ ...z!, per_item_surcharge_usd: Number(e.target.value) }))} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                  <p className="text-[10px] text-muted-foreground mt-1">Added per item in cart (e.g. bulky/heavy items)</p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editingZone.is_active !== false} onChange={(e) => setEditingZone((z) => ({ ...z!, is_active: e.target.checked }))} className="w-4 h-4" />
                Active
              </label>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSaveZone} disabled={savingZone} className="flex items-center gap-1.5 px-4 py-2 bg-onyx text-cream text-xs uppercase tracking-wider hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60">
                  <Check className="h-3.5 w-3.5" /> {savingZone ? "Saving..." : "Save Zone"}
                </button>
                <button onClick={() => { setEditingZone(null); setZoneError(null); }} className="flex items-center gap-1.5 px-4 py-2 border border-border text-xs uppercase tracking-wider hover:bg-secondary transition-colors">
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            </div>
          )}

          {zonesLoading ? (
            <p className="text-sm text-muted-foreground">Loading zones...</p>
          ) : zones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shipping zones configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs tracking-[0.15em] uppercase text-muted-foreground">
                    <th className="pb-2 pr-4">Zone</th>
                    <th className="pb-2 pr-4">Countries</th>
                    <th className="pb-2 pr-4">Base ₦</th>
                    <th className="pb-2 pr-4">Base $</th>
                    <th className="pb-2 pr-4">+/item ₦</th>
                    <th className="pb-2 pr-4">+/item $</th>
                    <th className="pb-2 pr-4">Free ₦ from</th>
                    <th className="pb-2 pr-4">Free $ from</th>
                    <th className="pb-2 pr-4">Active</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {zones.map((z) => (
                    <tr key={z.id}>
                      <td className="py-2 pr-4 font-medium">{z.name}</td>
                      <td className="py-2 pr-4 text-muted-foreground text-xs max-w-[180px] truncate">{z.countries.length === 0 ? <span className="italic">Catch-all</span> : z.countries.join(", ")}</td>
                      <td className="py-2 pr-4 tabular-nums">₦{Number(z.base_fee_ngn).toLocaleString()}</td>
                      <td className="py-2 pr-4 tabular-nums">${Number(z.base_fee_usd).toLocaleString()}</td>
                      <td className="py-2 pr-4 tabular-nums">{Number(z.per_item_surcharge_ngn) > 0 ? `₦${Number(z.per_item_surcharge_ngn).toLocaleString()}` : "—"}</td>
                      <td className="py-2 pr-4 tabular-nums">{Number(z.per_item_surcharge_usd) > 0 ? `$${Number(z.per_item_surcharge_usd).toLocaleString()}` : "—"}</td>
                      <td className="py-2 pr-4 tabular-nums">{Number(z.free_threshold_ngn) > 0 ? `₦${Number(z.free_threshold_ngn).toLocaleString()}` : "—"}</td>
                      <td className="py-2 pr-4 tabular-nums">{Number(z.free_threshold_usd) > 0 ? `$${Number(z.free_threshold_usd).toLocaleString()}` : "—"}</td>
                      <td className="py-2 pr-4">{z.is_active ? <span className="text-emerald-600">Yes</span> : <span className="text-muted-foreground">No</span>}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button onClick={() => setEditingZone({ ...z })} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDeleteZone(z.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Notification Settings */}
        <section className="border border-border p-6 rounded-lg space-y-4 lg:col-span-2">
          <h3 className="font-semibold">Notification Settings</h3>
          <div>
            <label className="text-eyebrow block mb-2">Order Notification Email</label>
            <input
              type="email"
              value={settings.order_notification_email || ""}
              onChange={(e) => updateField("order_notification_email", e.target.value)}
              placeholder="admin@example.com"
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enable_order_notifications === "true" || settings.enable_order_notifications === true}
              onChange={(e) => updateField("enable_order_notifications", e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <span>Send order notifications</span>
          </label>
        </section>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-onyx text-cream rounded font-semibold uppercase text-xs tracking-wider hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
