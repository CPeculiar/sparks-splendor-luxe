import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useCategories } from "@/lib/db-products";
import { getAuthToken, ensureTokenValid } from "@/lib/auth";

export const Route = createFileRoute("/admin/sub-categories")({
  component: AdminSubCategories,
});

interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  category_name?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function authHeaders() {
  await ensureTokenValid();
  return { Authorization: `Bearer ${getAuthToken()}` };
}

function AdminSubCategories() {
  const [list, setList] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Partial<SubCategory> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { categories } = useCategories();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/sub-categories`, {
        headers: await authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setList(data.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function save(sc: Partial<SubCategory>) {
    setError(null);
    setSaving(true);
    try {
      if (!sc.category_id || !sc.name) {
        setSaving(false);
        return setError("Category and name are required");
      }
      const url = sc.id ? `${API_BASE}/api/sub-categories/${sc.id}` : `${API_BASE}/api/sub-categories`;
      const method = sc.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...await authHeaders() },
        body: JSON.stringify({
          category_id: sc.category_id,
          name: sc.name,
          description: sc.description,
          sort_order: typeof sc.sort_order === "number" ? sc.sort_order : 0,
          is_active: sc.is_active !== undefined ? sc.is_active : true,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(sc: SubCategory) {
    if (!confirm(`Delete "${sc.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/sub-categories/${sc.id}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Sub-Categories</h1>
        <button
          onClick={() => setEditing({ category_id: "", name: "", description: "", sort_order: 0, is_active: true })}
          className="bg-gold text-onyx px-4 py-2 rounded flex items-center gap-2 hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" /> Add Sub-Category
        </button>
      </header>

      {error && <div className="bg-red-100 text-red-800 p-3 rounded">{error}</div>}

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-4">
          {list.length === 0 ? (
            <p className="text-muted-foreground">No sub-categories yet</p>
          ) : (
            <div className="bg-background border border-border rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-left">
                  <tr>
                    {["Name", "Category", "Slug", "Order", "Active", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((sc) => (
                    <tr key={sc.id} className="border-t border-border hover:bg-secondary/20">
                      <td className="px-4 py-2 font-medium">{sc.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{sc.category_name}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{sc.slug}</td>
                      <td className="px-4 py-2 text-center">{sc.sort_order}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={sc.is_active ? "text-emerald-600 text-xs font-medium" : "text-muted-foreground text-xs"}>
                          {sc.is_active ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setEditing(sc)} className="p-1 hover:text-gold"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => void remove(sc)} className="p-1 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditing(null)}>
          <div className="bg-white text-gray-900 border border-gray-200 p-6 rounded max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{editing.id ? "Edit" : "New"} Sub-Category</h2>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-900"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={editing.category_id || ""}
                  onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-yellow-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={editing.name || ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-yellow-500"
                  placeholder="e.g., Safari"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 h-20 resize-none focus:outline-none focus:border-yellow-500"
                  placeholder="Sub-category description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editing.sort_order || 0}
                    onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.is_active || false}
                      onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                      className="w-4 h-4 accent-yellow-500"
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setEditing(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button onClick={() => void save(editing)} disabled={saving} className="px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded hover:bg-yellow-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
