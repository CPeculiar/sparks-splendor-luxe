import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/faq")({ component: AdminFAQ });

interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
  is_active?: boolean;
}

function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [
    "Shipping & Delivery",
    "Returns & Refunds",
    "Payment",
    "Orders",
    "Products",
    "Account",
    "Other"
  ];

  useEffect(() => {
    // TODO: Fetch FAQs from backend
    setLoading(false);
  }, []);

  async function saveFAQ(item: FAQItem) {
    try {
      // TODO: Send to backend
      if (item.id) {
        setFaqs(faqs.map(f => f.id === item.id ? item : f));
      } else {
        setFaqs([...faqs, { ...item, id: String(Date.now()) }]);
      }
      setEditing(null);
    } catch (e) {
      alert("Failed to save FAQ");
    }
  }

  async function deleteFAQ(id: string) {
    if (confirm("Delete this FAQ?")) {
      setFaqs(faqs.filter(f => f.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-eyebrow">Information</p>
          <h1 className="font-display text-3xl mt-1">FAQ</h1>
        </div>
        <button
          onClick={() => setEditing({ question: "", answer: "", category: "General", sort_order: 0, is_active: true })}
          className="inline-flex items-center gap-2 bg-gold text-onyx px-4 py-2 text-xs font-medium uppercase hover:bg-gold/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add FAQ
        </button>
      </header>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : faqs.length === 0 ? (
        <div className="bg-background border border-border p-12 text-center">
          <p className="text-muted-foreground">No FAQs yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-background border border-border rounded overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id || "")}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex-1 text-left">
                  <p className="font-medium">{faq.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">{faq.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === faq.id ? "rotate-180" : ""}`} />
                </div>
              </button>
              
              {expandedId === faq.id && (
                <div className="border-t border-border p-4 bg-secondary/5 space-y-4">
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditing(faq)}
                      className="px-3 py-1 bg-secondary text-xs rounded hover:bg-gold/20 transition-colors flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => deleteFAQ(faq.id!)}
                      className="px-3 py-1 bg-secondary text-xs rounded hover:bg-destructive/20 hover:text-destructive transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-onyx/60" onClick={() => setEditing(null)} />
          <div className="relative bg-background w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl">{editing.id ? "Edit FAQ" : "Add FAQ"}</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Category</label>
                <select
                  value={editing.category || ""}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="inp"
                >
                  <option>Select category...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Question</label>
                <input
                  type="text"
                  value={editing.question}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                  className="inp"
                  placeholder="FAQ question"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Answer</label>
                <textarea
                  value={editing.answer}
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                  className="inp"
                  placeholder="FAQ answer"
                  rows={6}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.is_active !== false}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Active (show on website)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2 border border-border hover:border-gold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => saveFAQ(editing)}
                className="flex-1 py-2 bg-gold text-onyx text-sm font-medium hover:bg-gold/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
