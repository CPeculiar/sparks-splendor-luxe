import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getSettings, updateSetting } from "@/lib/auth";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

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
            <label className="text-eyebrow block mb-2">Store Phone</label>
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
