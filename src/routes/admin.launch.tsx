import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import {
  fetchAllLaunches, createLaunch, updateLaunch, deleteLaunch,
  type FeaturedLaunch,
} from "@/lib/featuredLaunch";

export const Route = createFileRoute("/admin/launch")({
  component: AdminLaunch,
});

function AdminLaunch() {
  const [list, setList] = useState<FeaturedLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<FeaturedLaunch> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setList(await fetchAllLaunches()); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function save(p: Partial<FeaturedLaunch>) {
    setError(null);
    try {
      if (p.id) await updateLaunch(p.id, p);
      else await createLaunch(p);
      setEditing(null);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await deleteLaunch(id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed"); }
  }

  async function toggleActive(item: FeaturedLaunch) {
    try { await updateLaunch(item.id, { is_active: !item.is_active }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-eyebrow">Homepage</p>
          <h1 className="font-display text-3xl md:text-4xl mt-1">Featured Launch</h1>
          <p className="text-sm text-muted-foreground mt-1">
            The capsule collection section on the homepage. Only the active entry is displayed.
          </p>
        </div>
        <button
          onClick={() => setEditing({
            title: "", eyebrow: "Capsule · Limited Edition",
            cta_label: "Explore the Code", lookbook_label: "View Lookbook",
            images: [], is_active: true,
          })}
          className="inline-flex items-center gap-2 bg-onyx text-cream px-5 py-3 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors"
        >
          <Plus className="h-4 w-4" /> New Launch
        </button>
      </header>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3">{error}</p>}

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              {["Hero", "Title", "Eyebrow", "Images", "Active", ""].map((h) => (
                <th key={h} className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {!loading && !list.length && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No launches yet. Create one above.</td></tr>
            )}
            {list.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-secondary/20">
                <td className="p-3">
                  {item.hero_image_url
                    ? <img src={item.hero_image_url} alt="" className="h-12 w-16 object-cover bg-muted" loading="lazy" />
                    : <div className="h-12 w-16 bg-muted flex items-center justify-center text-[10px] text-muted-foreground">Video</div>
                  }
                </td>
                <td className="p-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.subtitle || "—"}</p>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{item.eyebrow}</td>
                <td className="p-3 text-xs tabular-nums">
                  {Array.isArray(item.images) ? item.images.length : 0} images
                </td>
                <td className="p-3">
                  <button onClick={() => toggleActive(item)} className="flex items-center gap-1.5 text-xs">
                    {item.is_active
                      ? <><Eye className="h-3.5 w-3.5 text-emerald-600" /><span className="text-emerald-600">Live</span></>
                      : <><EyeOff className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Hidden</span></>
                    }
                  </button>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(item)} className="p-2 hover:text-gold-deep" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(item.id, item.title)} className="p-2 hover:text-destructive" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <LaunchForm initial={editing} onCancel={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}

function LaunchForm({
  initial, onCancel, onSave,
}: {
  initial: Partial<FeaturedLaunch>;
  onCancel: () => void;
  onSave: (p: Partial<FeaturedLaunch>) => void | Promise<void>;
}) {
  const [p, setP] = useState<Partial<FeaturedLaunch> & { _images: string }>({
    ...initial,
    _images: Array.isArray(initial.images) ? initial.images.join("\n") : "",
  });

  function set<K extends keyof typeof p>(k: K, v: any) {
    setP((c) => ({ ...c, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const images = p._images
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({ ...p, images });
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onCancel}>
      <div className="absolute inset-0 bg-onyx/60" />
      <aside
        className="ml-auto relative h-full w-full sm:w-[640px] bg-background overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl">{p.id ? "Edit Launch" : "New Launch"}</h2>
          <button onClick={onCancel} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Row label="Title *">
            <input
              value={p.title ?? ""}
              onChange={(e) => set("title", e.target.value)}
              required
              className="inp"
              placeholder="e.g. The Safari Code"
            />
          </Row>

          <Row label="Eyebrow (small text above title)">
            <input
              value={p.eyebrow ?? ""}
              onChange={(e) => set("eyebrow", e.target.value)}
              className="inp"
              placeholder="Capsule · Limited Edition"
            />
          </Row>

          <Row label="Subtitle (one-liner below title)">
            <input
              value={p.subtitle ?? ""}
              onChange={(e) => set("subtitle", e.target.value)}
              className="inp"
            />
          </Row>

          <Row label="Description (paragraph text)">
            <textarea
              value={p.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="inp"
            />
          </Row>

          <div className="border-t border-border pt-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Hero Media — use a video URL or an image URL (image overrides video)
            </p>
            <Row label="Hero Video URL (Cloudinary .mp4)">
              <input
                value={p.hero_video_url ?? ""}
                onChange={(e) => set("hero_video_url", e.target.value || null)}
                className="inp"
                placeholder="https://res.cloudinary.com/.../video.mp4"
              />
            </Row>
            <Row label="Hero Image URL (overrides video if set)">
              <input
                value={p.hero_image_url ?? ""}
                onChange={(e) => set("hero_image_url", e.target.value || null)}
                className="inp"
                placeholder="https://res.cloudinary.com/.../image.jpg"
              />
            </Row>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
              Gallery Images — one URL per line. First image = main look.
            </p>
            <p className="text-[11px] text-muted-foreground mb-3">
              Upload to Cloudinary first, then paste the URLs here.
            </p>
            <Row label="Image URLs">
              <textarea
                value={p._images}
                onChange={(e) => set("_images", e.target.value)}
                rows={8}
                className="inp font-mono text-xs"
                placeholder={"https://res.cloudinary.com/.../look-01.jpg\nhttps://res.cloudinary.com/.../look-02.jpg"}
              />
            </Row>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
            <Row label="CTA Button Label">
              <input
                value={p.cta_label ?? ""}
                onChange={(e) => set("cta_label", e.target.value)}
                className="inp"
                placeholder="Explore the Code"
              />
            </Row>
            <Row label="Lookbook Button Label">
              <input
                value={p.lookbook_label ?? ""}
                onChange={(e) => set("lookbook_label", e.target.value)}
                className="inp"
                placeholder="View Lookbook"
              />
            </Row>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={p.is_active ?? true}
              onChange={(e) => set("is_active", e.target.checked)}
            />
            Set as active (shows on homepage)
          </label>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-border py-3 text-xs tracking-[0.25em] uppercase hover:border-gold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-onyx text-cream py-3 text-xs tracking-[0.25em] uppercase hover:bg-gold hover:text-onyx transition-colors"
            >
              Save Launch
            </button>
          </div>
        </form>
        <style>{`.inp{width:100%;padding:.6rem .75rem;border:1px solid var(--border);background:var(--background);font-size:.875rem;outline:none}.inp:focus{border-color:var(--gold)}`}</style>
      </aside>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
