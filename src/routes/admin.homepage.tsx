import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Save, GripVertical, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { call as adminCall } from "@/lib/admin-settings";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
import { getAuthToken } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const Route = createFileRoute("/admin/homepage")({ component: AdminHomepage });

// ─── Types ────────────────────────────────────────────────────────────────────
interface HeroSlide {
  id?: string;
  type: "video" | "image";
  src: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href_category?: string;
  sort_order: number;
  is_active: boolean;
}

interface CollectionCard {
  id?: string;
  key: string;
  label: string;
  tagline: string;
  image: string;
  sort_order: number;
  is_active: boolean;
}

interface SiteSettings {
  announcement_bar: string;
  promo_title: string;
  promo_subtitle: string;
  promo_cta: string;
  promo_image: string;
  marquee_items: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
function AdminHomepage() {
  const [tab, setTab] = useState<"hero" | "collections" | "settings">("hero");
  const [slides, setSlides]         = useState<HeroSlide[]>([]);
  const [collections, setCollections] = useState<CollectionCard[]>([]);
  const [settings, setSettings]     = useState<SiteSettings>({
    announcement_bar: " Bespoke fittings by appointment",
    promo_title: "Bespoke. Beyond Compare.",
    promo_subtitle: "Reserve a private consultation with our master tailors and receive 15% on your first commissioned piece.",
    promo_cta: "Book an Appointment",
    promo_image: "/gallery-compressed/prom_suits/Prom_classic_Ric_Hassani_black_velvet_3.jpg",
    marquee_items: "Bespoke Tailoring,Hand Embroidery,Italian Fabrics,Worldwide Shipping,Atelier Lagos",
  });
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [editSlide, setEditSlide]   = useState<HeroSlide | null>(null);
  const [editCard, setEditCard]     = useState<CollectionCard | null>(null);

  useEffect(() => { void loadAll(); }, []);

  async function loadAll() {
    try {
      // Load hero slides from the real endpoint
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/hero-slides/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        if (d?.data?.length) {
          setSlides(
            d.data.map((s: any) => ({
              id: s.id,
              type: s.type || (s.image_url?.match(/\.(mp4|webm|mov)/i) ? "video" : "image"),
              src: s.src || s.image_url || "",
              eyebrow: s.eyebrow || "",
              title: s.title || "",
              subtitle: s.subtitle || "",
              cta: s.cta || s.cta_text || "Shop Now",
              href_category: s.href_category || s.cta_link || "",
              sort_order: s.sort_order ?? 0,
              is_active: s.is_active ?? true,
            }))
          );
        }
      }

      // Load collections + settings via admin-settings helper
      const [c, st] = await Promise.all([
        adminCall<CollectionCard[]>("GET", "/api/admin/homepage/collections"),
        adminCall<SiteSettings>("GET", "/api/admin/homepage/settings"),
      ]);
      if (c?.length) setCollections(c);
      if (st) setSettings(st);
    } catch {
      // silently use defaults
    }
  }

  async function saveSlides() {
    setSaving(true); setError(null);
    try {
      const token = getAuthToken();
      // Delete all existing slides then re-insert in new order
      for (let idx = 0; idx < slides.length; idx++) {
        const slide = slides[idx];
        // Use current array index as sort_order so reordering persists correctly
        const payload = {
          title: slide.title,
          subtitle: slide.subtitle,
          image_url: slide.src,
          cta_text: slide.cta,
          cta_link: slide.href_category,
          sort_order: idx,
          is_active: slide.is_active,
          eyebrow: slide.eyebrow,
          type: slide.type,
          src: slide.src,
          href_category: slide.href_category,
        };
        if (slide.id) {
          await fetch(`${API_BASE}/api/hero-slides/${slide.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          });
        } else {
          await fetch(`${API_BASE}/api/hero-slides`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          });
        }
      }
      flash();
      await loadAll();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  async function saveCollections() {
    setSaving(true); setError(null);
    try {
      await adminCall("POST", "/api/admin/homepage/collections", { collections });
      flash();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  async function saveSettings() {
    setSaving(true); setError(null);
    try {
      await adminCall("POST", "/api/admin/homepage/settings", settings);
      flash();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

  const TABS = [
    { key: "hero",        label: "Hero Slides" },
    { key: "collections", label: "Our Collections" },
    { key: "settings",    label: "Site Settings" },
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-eyebrow">CMS</p>
          <h1 className="font-display text-3xl md:text-4xl mt-1">Homepage Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Changes save instantly and reflect on the customer site.</p>
        </div>
        {saved && <span className="text-emerald-600 text-sm font-medium">✓ Saved successfully</span>}
      </header>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3">{error}</p>}

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "px-5 py-3 text-xs tracking-[0.2em] uppercase font-medium border-b-2 -mb-px transition-colors",
              tab === t.key ? "border-gold text-gold-deep" : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Hero Slides ── */}
      {tab === "hero" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Drag to reorder. Changes apply immediately on save.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setEditSlide({ type: "image", src: "", eyebrow: "", title: "", subtitle: "", cta: "Shop Now", sort_order: slides.length, is_active: true })}
                className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-gold"
              >
                <Plus className="h-3.5 w-3.5" /> Add Slide
              </button>
              <button onClick={saveSlides} disabled={saving} className="inline-flex items-center gap-2 bg-onyx text-cream px-5 py-2 text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-onyx transition-colors disabled:opacity-50">
                <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save Slides"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {slides.length === 0 && (
              <div className="bg-background border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
                No slides yet. Add your first hero slide above.
              </div>
            )}
            {slides.map((s, idx) => (
              <div key={idx} className="bg-background border border-border flex items-center gap-4 p-4">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                {s.src && <img src={s.src} alt="" className="h-14 w-20 object-cover bg-muted shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{s.title || "(untitled)"}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.eyebrow} · {s.type}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setSlides((prev) => prev.map((x, i) => i === idx ? { ...x, is_active: !x.is_active } : x))} className="p-1.5 hover:text-gold">
                    {s.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => idx > 0 && setSlides((prev) => { const a = [...prev]; [a[idx-1], a[idx]] = [a[idx], a[idx-1]]; return a; })} className="p-1.5 hover:text-gold disabled:opacity-30" disabled={idx === 0}>
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => idx < slides.length - 1 && setSlides((prev) => { const a = [...prev]; [a[idx], a[idx+1]] = [a[idx+1], a[idx]]; return a; })} className="p-1.5 hover:text-gold disabled:opacity-30" disabled={idx === slides.length - 1}>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button onClick={() => setEditSlide({ ...s })} className="p-1.5 hover:text-gold text-xs uppercase tracking-wider border border-border px-3 py-1">Edit</button>
                  <button onClick={() => {
                    if (!confirm(`Delete "${s.title || 'this slide'}"?`)) return;
                    if (s.id) {
                      const token = getAuthToken();
                      fetch(`${API_BASE}/api/hero-slides/${s.id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      }).then(() => loadAll());
                    } else {
                      setSlides((prev) => prev.filter((_, i) => i !== idx));
                    }
                  }} className="p-1.5 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Slide editor modal */}
          {editSlide && (
            <SlideModal
              slide={editSlide}
              onClose={() => setEditSlide(null)}
              onSave={(s) => {
                setSlides((prev) => {
                  const idx = prev.findIndex((x) => x === editSlide);
                  if (idx >= 0) { const a = [...prev]; a[idx] = s; return a; }
                  return [...prev, s];
                });
                setEditSlide(null);
              }}
            />
          )}
        </div>
      )}

      {/* ── Collections ── */}
      {tab === "collections" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Control which collection cards appear on the homepage.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setEditCard({ key: "", label: "", tagline: "", image: "", sort_order: collections.length, is_active: true })}
                className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-gold"
              >
                <Plus className="h-3.5 w-3.5" /> Add Card
              </button>
              <button onClick={saveCollections} disabled={saving} className="inline-flex items-center gap-2 bg-onyx text-cream px-5 py-2 text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-onyx transition-colors disabled:opacity-50">
                <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save Collections"}
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {collections.length === 0 && (
              <div className="col-span-4 bg-background border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
                No collection cards yet. Add your first card above.
              </div>
            )}
            {collections.map((c, idx) => (
              <div key={idx} className={["border border-border bg-background overflow-hidden", !c.is_active ? "opacity-50" : ""].join(" ")}>
                {c.image
                  ? <img src={c.image} alt={c.label} className="h-36 w-full object-cover object-top" />
                  : <div className="h-36 bg-muted flex items-center justify-center text-muted-foreground text-xs">No image</div>
                }
                <div className="p-3">
                  <p className="font-medium text-sm">{c.label || "(untitled)"}</p>
                  <p className="text-xs text-muted-foreground">{c.tagline}</p>
                  <p className="text-xs text-gold mt-1">/{c.key}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setEditCard({ ...c })} className="flex-1 border border-border py-1.5 text-xs uppercase tracking-wider hover:border-gold">Edit</button>
                    <button onClick={() => setCollections((prev) => prev.map((x, i) => i === idx ? { ...x, is_active: !x.is_active } : x))} className="p-1.5 hover:text-gold border border-border">
                      {c.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => setCollections((prev) => prev.filter((_, i) => i !== idx))} className="p-1.5 hover:text-destructive border border-border"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {editCard && (
            <CollectionModal
              card={editCard}
              onClose={() => setEditCard(null)}
              onSave={(c) => {
                setCollections((prev) => {
                  const idx = prev.findIndex((x) => x === editCard);
                  if (idx >= 0) { const a = [...prev]; a[idx] = c; return a; }
                  return [...prev, c];
                });
                setEditCard(null);
              }}
            />
          )}
        </div>
      )}

      {/* ── Site Settings ── */}
      {tab === "settings" && (
        <div className="space-y-6 max-w-2xl">
          <Field label="Announcement Bar Text">
            <input
              value={settings.announcement_bar}
              onChange={(e) => setSettings((s) => ({ ...s, announcement_bar: e.target.value }))}
              className="inp"
              placeholder="Complimentary worldwide shipping…"
            />
          </Field>

          <Field label="Marquee Items (comma-separated)">
            <input
              value={settings.marquee_items}
              onChange={(e) => setSettings((s) => ({ ...s, marquee_items: e.target.value }))}
              className="inp"
              placeholder="Bespoke Tailoring, Hand Embroidery, …"
            />
          </Field>

          <div className="border-t border-border pt-6">
            <p className="text-eyebrow mb-4">Promo Banner Section</p>
            <div className="space-y-3">
              <Field label="Promo Title">
                <input value={settings.promo_title} onChange={(e) => setSettings((s) => ({ ...s, promo_title: e.target.value }))} className="inp" />
              </Field>
              <Field label="Promo Subtitle">
                <textarea value={settings.promo_subtitle} onChange={(e) => setSettings((s) => ({ ...s, promo_subtitle: e.target.value }))} rows={2} className="inp" />
              </Field>
              <Field label="Promo CTA Button Text">
                <input value={settings.promo_cta} onChange={(e) => setSettings((s) => ({ ...s, promo_cta: e.target.value }))} className="inp" />
              </Field>
              <CloudinaryUpload
                label="Upload Promo Background Image"
                accept="image/*"
                onUpload={(url) => setSettings((s) => ({ ...s, promo_image: url }))}
              />
              <Field label="Promo Background Image URL">
                <input value={settings.promo_image} onChange={(e) => setSettings((s) => ({ ...s, promo_image: e.target.value }))} className="inp" placeholder="/gallery-compressed/prom_suits/Prom_classic_Ric_Hassani_black_velvet_3.jpg" />
              </Field>
              {settings.promo_image && (
                <img src={settings.promo_image} alt="Promo preview" className="h-32 w-full object-cover object-top border border-border" />
              )}
            </div>
          </div>

          <button onClick={saveSettings} disabled={saving} className="inline-flex items-center gap-2 bg-onyx text-cream px-8 py-3 text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-onyx transition-colors disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      )}

      <style>{`.inp{width:100%;padding:.6rem .75rem;border:1px solid var(--border);background:var(--background);font-size:.875rem;outline:none}.inp:focus{border-color:var(--gold)}`}</style>
    </div>
  );
}

// ─── Slide Modal ──────────────────────────────────────────────────────────────
function SlideModal({ slide, onClose, onSave }: { slide: HeroSlide; onClose: () => void; onSave: (s: HeroSlide) => void }) {
  const [s, setS] = useState<HeroSlide>({ ...slide });
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-onyx/60" />
      <aside className="ml-auto relative h-full w-full sm:w-[520px] bg-background overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl">Hero Slide</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm uppercase tracking-wider">Close</button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Type">
            <select value={s.type} onChange={(e) => setS((x) => ({ ...x, type: e.target.value as "image" | "video" }))} className="inp">
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </Field>
          <CloudinaryUpload
            label={`Upload ${s.type}`}
            accept={s.type === "video" ? "video/*" : "image/*"}
            onUpload={(url) => setS((x) => ({ ...x, src: url }))}
          />
          <Field label="Source URL">
            <input value={s.src} onChange={(e) => setS((x) => ({ ...x, src: e.target.value }))} className="inp" placeholder="/gallery-compressed/safari_suits/safari-cover-image-main.jpg" />
          </Field>
          {s.src && s.type === "image" && <img src={s.src} alt="" className="h-32 w-full object-cover object-top border border-border" />}
          <Field label="Eyebrow (small text above title)">
            <input value={s.eyebrow} onChange={(e) => setS((x) => ({ ...x, eyebrow: e.target.value }))} className="inp" placeholder="Autumn / Winter Collection" />
          </Field>
          <Field label="Title">
            <input value={s.title} onChange={(e) => setS((x) => ({ ...x, title: e.target.value }))} className="inp" placeholder="The Art of Bespoke" />
          </Field>
          <Field label="Subtitle">
            <textarea value={s.subtitle} onChange={(e) => setS((x) => ({ ...x, subtitle: e.target.value }))} rows={2} className="inp" />
          </Field>
          <Field label="CTA Button Text">
            <input value={s.cta} onChange={(e) => setS((x) => ({ ...x, cta: e.target.value }))} className="inp" placeholder="Discover the Collection" />
          </Field>
          <Field label="Link to Category (e.g. suits, natives, ladies)">
            <input value={s.href_category || ""} onChange={(e) => setS((x) => ({ ...x, href_category: e.target.value }))} className="inp" placeholder="suits" />
          </Field>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={s.is_active} onChange={(e) => setS((x) => ({ ...x, is_active: e.target.checked }))} />
            Active (visible on site)
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-border py-3 text-xs uppercase tracking-[0.2em] hover:border-gold">Cancel</button>
            <button onClick={() => onSave(s)} className="flex-1 bg-onyx text-cream py-3 text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-onyx transition-colors">Save Slide</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─── Collection Card Modal ────────────────────────────────────────────────────
function CollectionModal({ card, onClose, onSave }: { card: CollectionCard; onClose: () => void; onSave: (c: CollectionCard) => void }) {
  const [c, setC] = useState<CollectionCard>({ ...card });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-onyx/60" />
      <div className="relative bg-background w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl">Collection Card</h2>
        <Field label="Category Key (e.g. suits, natives, ladies)">
          <input value={c.key} onChange={(e) => setC((x) => ({ ...x, key: e.target.value }))} className="inp" placeholder="safari" />
        </Field>
        <Field label="Display Label">
          <input value={c.label} onChange={(e) => setC((x) => ({ ...x, label: e.target.value }))} className="inp" placeholder="Safari Suits" />
        </Field>
        <Field label="Tagline">
          <input value={c.tagline} onChange={(e) => setC((x) => ({ ...x, tagline: e.target.value }))} className="inp" placeholder="Expedition Tailoring" />
        </Field>
        <CloudinaryUpload label="Upload Image" accept="image/*" onUpload={(url) => setC((x) => ({ ...x, image: url }))} />
        <Field label="Image URL">
          <input value={c.image} onChange={(e) => setC((x) => ({ ...x, image: e.target.value }))} className="inp" placeholder="/gallery-compressed/safari_suits/Safari_The_Monarch_Fit_MintGreen_1.jpg" />
        </Field>
        {c.image && <img src={c.image} alt="" className="h-28 w-full object-cover object-top border border-border" />}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 border border-border py-3 text-xs uppercase tracking-[0.2em] hover:border-gold">Cancel</button>
          <button onClick={() => onSave(c)} className="flex-1 bg-onyx text-cream py-3 text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-onyx transition-colors">Save Card</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}
