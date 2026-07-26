import { useState, useEffect } from "react";
import { fetchMedia } from "@/lib/admin";
import { Search, X, Upload, Check, Plus } from "lucide-react";

interface MediaSelectorProps {
  onSelect: (url: string) => void;
  accept?: string;
  label?: string;
  value?: string;
}

export function MediaSelector({ onSelect, label = "Select Media", value }: MediaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (open) { loadMedia(); setPending(value || null); }
  }, [open]);

  async function loadMedia() {
    setLoading(true);
    try {
      const data = await fetchMedia({ limit: 500, offset: 0 });
      setMedia(data || []);
    } catch { setMedia([]); }
    finally { setLoading(false); }
  }

  function handleAdd() {
    if (pending) onSelect(pending);
    setOpen(false);
  }

  const filtered = media.filter(m =>
    m.file_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.alt_text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{label}</label>

      <div className="flex gap-2 items-start">
        {value && (
          <div className="relative w-20 h-20 rounded border border-border overflow-hidden bg-muted">
            <img src={value} alt="Selected" className="w-full h-full object-cover" />
            <button
              onClick={() => onSelect("")}
              className="absolute top-1 right-1 bg-destructive text-white p-0.5 rounded hover:bg-destructive/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-secondary/30 border border-border px-4 py-3 text-xs uppercase tracking-[0.25em] hover:border-gold hover:text-gold transition-colors"
        >
          <Upload className="h-4 w-4" />
          Select from Media Library
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-onyx/60" onClick={(e) => e.stopPropagation()} />
          <div className="relative bg-background w-full max-w-4xl max-h-[80vh] p-6 space-y-4 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl">Media Library</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="inp pl-10"
              />
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading media...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {media.length === 0 ? "No media in library" : "No matching media"}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filtered.map((item) => {
                  const isSelected = pending === item.url;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPending(item.url)}
                      className={`relative group rounded overflow-hidden border-2 transition-all ${
                        isSelected ? "border-gold" : "border-border hover:border-gold"
                      }`}
                    >
                      <div className="aspect-square bg-muted">
                        <img src={item.url} alt={item.alt_text || item.file_name || "Media"} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                          <div className="bg-gold text-onyx p-1.5 rounded-full"><Check className="h-4 w-4" /></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 border border-border rounded hover:bg-secondary/30 transition-colors text-sm"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!pending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-onyx hover:bg-gold hover:text-onyx text-cream rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              💡 Tip: Go to the Media Library to upload new images, and they'll be available everywhere on the site
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
