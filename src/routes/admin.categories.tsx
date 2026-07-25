import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { fetchCategories, createCategory, updateCategory, deleteCategory, type AdminCategory } from "@/lib/admin";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

function AdminCategories() {
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<(Partial<AdminCategory> & { id?: string; name?: string; description?: string | undefined; image_url?: string | undefined }) | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true); setError(null);
    try { setCats(await fetchCategories()); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    setError(null);
    try {
      if (editing.id) {
        await updateCategory(editing.id, {
          name: editing.name,
          description: editing.description ?? undefined,
          image_url: editing.image_url ?? undefined,
          is_active: editing.is_active,
        });
      } else {
        await createCategory({
          name: editing.name || "",
          description: editing.description ?? undefined,
          image_url: editing.image_url ?? undefined,
        });
      }
      setEditing(null); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    try { await deleteCategory(id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-eyebrow">Catalog</p>
          <h1 className="font-display text-3xl mt-1">Categories</h1>
        </div>
        <button onClick={() => setEditing({ name: "", is_active: true })} className="inline-flex items-center gap-2 bg-onyx text-cream px-4 py-2 text-xs uppercase transition-all hover:bg-gold hover:text-onyx active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting}>
          <Plus className={`h-4 w-4 ${submitting ? 'animate-spin' : ''}`} /> {submitting ? 'Creating...' : 'New Category'}
        </button>
      </header>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              { ["Image", "Name", "Slug", "Active", "Actions"].map(h => <th key={h} className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{h}</th>) }
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && !cats.length && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No categories yet.</td></tr>}
            {cats.map(c => (
              <tr key={c.id} className="border-t border-border hover:bg-secondary/20">
                <td className="p-3 w-28">
                  {c.image_url ? <img src={c.image_url} alt={c.name} className="h-12 w-20 object-cover" /> : <div className="h-12 w-20 bg-muted" />}
                </td>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-xs text-muted-foreground">{c.slug}</td>
                <td className="p-3 text-xs">
                  <span className={`inline-block px-2 py-1 rounded text-[10px] font-semibold tracking-[0.1em] uppercase ${c.is_active ? 'bg-green-100/20 text-green-700' : 'bg-gray-100/20 text-gray-500'}`}>
                    {c.is_active ? '✓ Active' : '✗ Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing({ ...c, description: c.description ?? undefined, image_url: c.image_url ?? undefined })} className="p-2 hover:text-gold"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !submitting && setEditing(null)}>
          <div className="absolute inset-0 bg-onyx/60" />
          <form onSubmit={handleCreateOrUpdate} className="relative bg-background w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl mb-4">{editing.id ? "Edit Category" : "New Category"}</h2>
            <input required className="inp mb-4" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Category Name" disabled={submitting} />
            <textarea className="inp mb-4" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Description (optional)" disabled={submitting} />
            <div className="mb-4">
              <CloudinaryUpload label="Upload image" onUpload={(url) => setEditing({ ...editing, image_url: url })} />
            </div>
            {editing.id && (
              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} disabled={submitting} className="w-4 h-4 cursor-pointer" />
                <span className="text-sm">Active (show on frontend)</span>
              </label>
            )}
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 border border-border py-3 hover:bg-secondary transition-colors disabled:opacity-50" disabled={submitting}>Cancel</button>
              <button type="submit" className="flex-1 bg-onyx text-cream py-3 hover:bg-gold hover:text-onyx transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting}>{submitting ? 'Saving...' : 'Save Category'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
