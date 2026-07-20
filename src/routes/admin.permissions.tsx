import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Plus, Trash2, Edit } from "lucide-react";
import { fetchPermissionGroup, fetchPermissionGroups, fetchUsers, assignUserPermissionGroup, unassignUserPermissionGroup, type AdminPermissionGroup, type AdminUser } from "@/lib/admin";

export const Route = createFileRoute("/admin/permissions")({ component: AdminPermissions });

function AdminPermissions() {
  const [groups, setGroups] = useState<AdminPermissionGroup[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AdminPermissionGroup | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true); setError(null);
    try {
      setGroups(await fetchPermissionGroups());
      setUsers((await fetchUsers()).data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectGroup(groupId: string) {
    if (!groupId) {
      setSelectedGroup(null);
      return;
    }
    try {
      const group = await fetchPermissionGroup(groupId);
      setSelectedGroup(group);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load group");
    }
  }

  async function handleAssign() {
    if (!selectedGroup || !selectedUserId) return;
    try {
      await assignUserPermissionGroup(selectedUserId, selectedGroup.id);
      setSelectedUserId("");
      await load();
      await handleSelectGroup(selectedGroup.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign");
    }
  }

  async function handleUnassign(groupId: string, userId: string) {
    try {
      await unassignUserPermissionGroup(userId, groupId);
      await load();
      if (selectedGroup?.id === groupId) await handleSelectGroup(groupId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove assignment");
    }
  }

  const members = useMemo(() => selectedGroup?.users ?? [], [selectedGroup]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-eyebrow">Admins</p>
          <h1 className="font-display text-3xl md:text-4xl mt-1">Roles & Permissions</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-gold" /> Super admin can assign roles and permission groups.
        </div>
      </header>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="bg-background border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Permission groups</h2>
              <span className="text-xs text-muted-foreground">{groups.length} groups</span>
            </div>
            <div className="space-y-3">
              {loading && <p className="text-xs text-muted-foreground">Loading groups…</p>}
              {!loading && !groups.length && <p className="text-xs text-muted-foreground">No permission groups created yet.</p>}
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  className={`w-full text-left p-3 border ${selectedGroup?.id === group.id ? "border-gold bg-gold/10" : "border-border bg-background"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.user_count} users</p>
                    </div>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedGroup && (
            <div className="bg-background border border-border p-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Selected group</p>
                  <h2 className="font-semibold">{selectedGroup.name}</h2>
                </div>
                <span className="text-xs text-muted-foreground">{selectedGroup.is_default ? "Default" : "Custom"}</span>
              </div>
              <pre className="rounded border border-border bg-secondary/10 p-3 text-[11px] overflow-x-auto">{JSON.stringify(selectedGroup.permissions || {}, null, 2)}</pre>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-background border border-border p-4">
            <h2 className="font-semibold mb-3">Assign user to group</h2>
            <div className="space-y-3">
              <select
                value={selectedGroup?.id ?? ""}
                onChange={(e) => void handleSelectGroup(e.target.value)}
                className="inp w-full"
              >
                <option value="">Select group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="inp w-full"
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.email}</option>
                ))}
              </select>
              <button type="button" onClick={handleAssign} className="w-full bg-onyx text-cream py-3 text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-onyx">Assign</button>
            </div>
          </div>

          {selectedGroup && (
            <div className="bg-background border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Group members</h2>
                <span className="text-xs text-muted-foreground">{members.length}</span>
              </div>
              {!members.length && <p className="text-xs text-muted-foreground">No users assigned yet.</p>}
              <div className="space-y-3">
                {members.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-3 rounded border border-border p-3">
                    <div>
                      <p className="font-medium text-sm">{user.first_name || "—"} {user.last_name || ""}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <button type="button" onClick={() => handleUnassign(selectedGroup.id, user.id)} className="text-xs text-destructive">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
