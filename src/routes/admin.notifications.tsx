import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchNotifications, createNotification, markNotificationRead, deleteNotification, archiveNotification, fetchUnreadCount } from "@/lib/admin";

export const Route = createFileRoute("/admin/notifications")({ component: AdminNotifications });

export default function AdminNotifications() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => { void load(); void loadCount(); }, []);

  async function load() { setLoading(true); try { setList(await fetchNotifications()); } catch (e) { console.error(e); } finally { setLoading(false); } }
  async function loadCount() { try { setCount(await fetchUnreadCount()); } catch {} }

  async function send() {
    if (!title) return alert('Title required');
    try { await createNotification({ title, body }); setTitle(''); setBody(''); await load(); await loadCount(); }
    catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <p className="text-eyebrow">Communications</p>
        <h1 className="font-display text-3xl mt-1">Notifications</h1>
        {count !== null && <p className="text-xs text-muted-foreground mt-1">Unread: {count}</p>}
      </header>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="inp mb-2" />
          <textarea placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} className="inp h-24 mb-2" />
          <div className="flex gap-2"><button onClick={() => void send()} className="bg-onyx text-cream px-4 py-2">Send</button></div>
        </div>

        <div className="bg-background border border-border p-3">
          <h3 className="text-sm mb-2">Recent</h3>
          <div className="text-xs space-y-2 max-h-80 overflow-y-auto">
            {list.map(n => (
              <div key={n.id} className="border-b border-border pb-2">
                <div className="flex justify-between items-start"><div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <button onClick={async () => { await markNotificationRead(n.id); await load(); await loadCount(); }} className="text-xs">Mark read</button>
                  <button onClick={async () => { if (!confirm('Archive?')) return; await archiveNotification(n.id); await load(); }} className="ml-2 text-xs">Archive</button>
                  <button onClick={async () => { if (!confirm('Delete?')) return; await deleteNotification(n.id); await load(); await loadCount(); }} className="ml-2 text-xs text-destructive">Delete</button>
                </div>
                </div>
                <div className="text-xs mt-2 text-muted-foreground">{n.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
