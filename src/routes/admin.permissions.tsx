import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Check } from "lucide-react";
import { call } from "@/lib/auth";

export const Route = createFileRoute("/admin/permissions")({ component: AdminPermissions });

interface Permission {
  id?: string;
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  is_active?: boolean;
}

function AdminPermissions() {
  const [groups, setGroups] = useState<Permission[]>([]);
  const [availablePerms, setAvailablePerms] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Permission | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [perms, avail] = await Promise.all([
        call<{ data: Permission[] }>("GET", "/api/permissions"),
        call<{ data: Record<string, string[]> }>("GET", "/api/permissions/available"),
      ]);
      setGroups(perms.data || []);
      setAvailablePerms(avail.data || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function saveGroup(group: Permission) {
    try {
      if (group.id) {
        const r = await call<{ data: Permission }>("PUT", `/api/permissions/${group.id}`, group);
        setGroups(groups.map(g => g.id === group.id ? r.data : g));
      } else {
        const r = await call<{ data: Permission }>("POST", "/api/permissions", group);
        setGroups([...groups, r.data]);
      }
      setEditing(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save");
    }
  }

  async function deleteGroup(id: string | undefined) {
    if (!id || !confirm("Delete this permission group?")) return;
    try {
      await call("DELETE", `/api/permissions/${id}`);
      setGroups(groups.filter(g => g.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-eyebrow">Access Control</p>
          <h1 className="font-display text-3xl mt-1">Permission Groups</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage permission groups for admin roles</p>
        </div>
        <button
          onClick={() => setEditing({ name: "", description: "", permissions: {}, is_active: true })}
          className="inline-flex items-center gap-2 bg-gold text-onyx px-4 py-2 text-xs font-medium uppercase hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" /> New Group
        </button>
      </header>

      {error && <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">{error}</div>}

      {groups.length === 0 ? (
        <div className="bg-background border border-border p-12 text-center">
          <p className="text-muted-foreground">No permission groups yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="bg-background border border-border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{group.name}</p>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(group)}
                    className="p-2 hover:text-gold transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteGroup(group.id)}
                    className="p-2 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Permissions summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(group.permissions || {}).map(([resource, actions]) => (
                  <div key={resource} className="text-xs bg-secondary/20 p-2 rounded">
                    <p className="font-semibold capitalize">{resource}</p>
                    <p className="text-muted-foreground">{(Array.isArray(actions) ? actions : []).join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-onyx/60" onClick={() => setEditing(null)} />
          <div className="relative bg-background w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-display text-2xl mb-6">{editing.id ? "Edit Group" : "New Group"}</h2>

            <div className="space-y-6">
              {/* Name and description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Group Name *</label>
                  <input
                    type="text"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="inp w-full"
                    placeholder="e.g., Content Manager"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Description</label>
                  <input
                    type="text"
                    value={editing.description || ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    className="inp w-full"
                    placeholder="What is this group for?"
                  />
                </div>
              </div>

              {/* Permissions checkboxes */}
              <div>
                <p className="text-sm font-semibold mb-3">Permissions</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(availablePerms).map(([resource, actions]) => (
                    <div key={resource} className="border border-border p-3 rounded space-y-2">
                      <p className="font-semibold capitalize text-sm">{resource}</p>
                      {actions.map((action) => (
                        <label key={`${resource}-${action}`} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              (editing.permissions?.[resource] || []).includes(action)
                            }
                            onChange={(e) => {
                              const current = editing.permissions?.[resource] || [];
                              let updated: string[];
                              if (e.target.checked) {
                                updated = [...current, action];
                              } else {
                                updated = current.filter(a => a !== action);
                              }
                              setEditing({
                                ...editing,
                                permissions: {
                                  ...editing.permissions,
                                  [resource]: updated,
                                },
                              });
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm capitalize">{action}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.is_active !== false}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-border mt-6">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2 border border-border hover:border-gold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => saveGroup(editing)}
                className="flex-1 py-2 bg-gold text-onyx text-sm font-medium hover:bg-gold/90 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" /> Save Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
