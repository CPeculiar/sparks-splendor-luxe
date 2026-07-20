import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchBanners, createBanner, deleteBanner, type AdminBanner } from "@/lib/admin";

export const Route = createFileRoute("/admin/banners")({ component: AdminBanners });

function AdminBanners() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<AdminBanner>>({ is_active: true, sort_order: 0, location: 'homepage' });

  useEffect(() => { void load(); }, []);
  async function load() { setLoading(true); try { setBanners(await fetchBanners()); } catch (e) { console.error(e); } finally { setLoading(false); } }

  async function save() {
    try { await createBanner(form as any); setForm({ is_active: true, sort_order: 0, location: 'homepage' }); void load(); }
    catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <p className="text-eyebrow">Content</p>
        <h1 className="font-display text-3xl mt-1">Banners</h1>
      </header>

      <div className="grid grid-cols-3 gap-3 max-w-3xl">
        <input placeholder="Title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="inp" />
        <input placeholder="Image URL" value={form.image_url || ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="inp" />
        <input placeholder="Link" value={form.link || ''} onChange={(e) => setForm({ ...form, link: e.target.value })} className="inp" />
        <input placeholder="Caption" value={form.caption || ''} onChange={(e) => setForm({ ...form, caption: e.target.value })} className="inp col-span-2" />
        <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="inp">
          <option value="homepage">Homepage</option>
          <option value="hero">Hero</option>
          <option value="sitewide">Sitewide</option>
        </select>
        <button onClick={() => void save()} className="bg-onyx text-cream px-4 py-2">Create</button>
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>{['Title','Location','Sort','Active','Actions'].map(h => <th key={h} className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && !banners.length && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No banners yet.</td></tr>}
            {banners.map(b => (
              <tr key={b.id} className="border-t border-border hover:bg-secondary/20">
                <td className="p-3">{b.title}</td>
                <td className="p-3">{b.location}</td>
                <td className="p-3">{b.sort_order}</td>
                <td className="p-3">{b.is_active ? 'Yes' : 'No'}</td>
                <td className="p-3 text-right"><button onClick={async () => { if (!confirm('Delete banner?')) return; await deleteBanner(b.id); void load(); }} className="text-destructive text-xs">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
