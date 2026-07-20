import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchFaqs, createFaq, updateFaq, deleteFaqClient } from "@/lib/admin";

export const Route = createFileRoute("/admin/faqs")({ component: AdminFaqs });

export default function AdminFaqs() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [q, setQ] = useState('');
  const [a, setA] = useState('');

  useEffect(() => { void load(); }, []);
  async function load() { setLoading(true); try { setList(await fetchFaqs()); } catch (e) { console.error(e); } finally { setLoading(false); } }

  async function save() {
    if (!q || !a) return alert('Question and answer required');
    try {
      if (editing) await updateFaq(editing.id, { question: q, answer: a, is_active: true });
      else await createFaq({ question: q, answer: a, is_active: true });
      setQ(''); setA(''); setEditing(null); await load();
    } catch (e) { alert('Failed'); }
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <p className="text-eyebrow">Support</p>
        <h1 className="font-display text-3xl mt-1">FAQs</h1>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <input placeholder="Question" value={q} onChange={(e) => setQ(e.target.value)} className="inp" />
          <textarea placeholder="Answer" value={a} onChange={(e) => setA(e.target.value)} className="inp h-36" />
          <div className="flex gap-2"><button onClick={() => void save()} className="bg-onyx text-cream px-4 py-2">Save</button></div>
        </div>

        <div className="bg-background border border-border p-3">
          <h3 className="text-sm mb-2">Existing FAQs</h3>
          <div className="text-xs space-y-2 max-h-80 overflow-y-auto">
            {list.map(f => (
              <div key={f.id} className="border-b border-border pb-2">
                <div className="flex justify-between items-start"><div>
                  <div className="font-medium">{f.question}</div>
                  <div className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <button onClick={() => { setEditing(f); setQ(f.question); setA(f.answer); }} className="text-xs">Edit</button>
                  <button onClick={async () => { if (!confirm('Delete?')) return; await deleteFaqClient(f.id); await load(); }} className="ml-2 text-xs text-destructive">Delete</button>
                </div>
                </div>
                <div className="text-xs mt-2 text-muted-foreground">{f.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
