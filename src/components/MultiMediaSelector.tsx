import { useState, useEffect } from "react";
import { fetchMedia } from "@/lib/admin";
import { Search, X, Upload, Check } from "lucide-react";

interface MultiMediaSelectorProps {
  onSelect: (urls: string[]) => void;
  onClose: () => void;
  label?: string;
  selectedValues?: string[];
  maxSelection?: number;
}

export function MultiMediaSelector({ 
  onSelect, 
  onClose, 
  label = "Select Media", 
  selectedValues = [],
  maxSelection = 50 
}: MultiMediaSelectorProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedValues));

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    setLoading(true);
    try {
      console.log("Loading media for multi-selector...");
      const data = await fetchMedia({ limit: 500, offset: 0 });
      console.log("Media loaded:", data?.length || 0, "items");
      setMedia(data || []);
    } catch (e) {
      console.error("Failed to load media:", e);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelection(url: string) {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else if (newSet.size < maxSelection) {
        newSet.add(url);
      }
      return newSet;
    });
  }

  function handleConfirm() {
    onSelect(Array.from(selected));
    onClose();
  }

  const filtered = media.filter(m => 
    m.file_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.alt_text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-onyx/60" onClick={(e) => { e.stopPropagation(); onClose(); }} />
      <div className="relative bg-background w-full max-w-4xl max-h-[80vh] p-6 space-y-4 overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl">{label}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {selected.size} selected {maxSelection > 0 ? `of ${maxSelection}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
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
        </div>

        {/* Media grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading media...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {media.length === 0 ? "No media in library" : "No matching media"}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((item) => {
              const isSelected = selected.has(item.url);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleSelection(item.url)}
                  disabled={selected.size >= maxSelection && !isSelected}
                  className={`relative group rounded overflow-hidden border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSelected ? "border-gold" : "border-border hover:border-gold"
                  }`}
                >
                  <div className="aspect-square bg-muted">
                    <img 
                      src={item.url} 
                      alt={item.alt_text || item.file_name || "Media"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                      <div className="bg-gold text-onyx p-1.5 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded hover:bg-secondary/30 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-onyx hover:bg-gold hover:text-onyx text-cream rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="h-4 w-4" /> Add ({selected.size})
          </button>
        </div>

        {/* Note */}
        <p className="text-xs text-muted-foreground pt-2">
          💡 Tip: Go to the Media Library to upload new images, and they'll be available everywhere on the site
        </p>
      </div>
    </div>
  );
}
