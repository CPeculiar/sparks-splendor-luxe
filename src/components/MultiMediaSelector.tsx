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
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    setLoading(true);
    try {
      const data = await fetchMedia({ limit: 500, offset: 0 });
      setMedia(data || []);
    } catch (e) {
      console.error("Failed to load media:", e);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelection(url: string, e: React.MouseEvent, index: number) {
    // Prevent default to avoid text selection
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd+Click: Toggle single item
      setSelected(prev => {
        const newSet = new Set(prev);
        if (newSet.has(url)) {
          newSet.delete(url);
        } else if (newSet.size < maxSelection) {
          newSet.add(url);
        }
        return newSet;
      });
      setLastSelectedIndex(index);
    } else if (e.shiftKey && lastSelectedIndex !== null) {
      // Shift+Click: Select range
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      
      setSelected(prev => {
        const newSet = new Set(prev);
        for (let i = start; i <= end; i++) {
          const item = filtered[i];
          if (item && newSet.size < maxSelection) {
            newSet.add(item.url);
          }
        }
        return newSet;
      });
    } else {
      // Regular click: Toggle single item
      setSelected(prev => {
        const newSet = new Set(prev);
        if (newSet.has(url)) {
          newSet.delete(url);
        } else if (newSet.size < maxSelection) {
          newSet.add(url);
        }
        return newSet;
      });
      setLastSelectedIndex(index);
    }
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
      <div className="relative bg-background w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className="flex-shrink-0 border-b border-border p-6 space-y-4 bg-background">
          <div className="flex items-center justify-between">
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
                autoFocus
              />
            </div>
          </div>

          {/* Tips */}
          <p className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded">
            💡 Ctrl+Click to select individual items, Shift+Click to select a range
          </p>
        </div>

        {/* Scrollable Media Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading media...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {media.length === 0 ? "No media in library" : "No matching media"}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((item, index) => {
                const isSelected = selected.has(item.url);
                return (
                  <button
                    key={item.id}
                    onClick={(e) => toggleSelection(item.url, e, index)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleSelection(item.url, e as any, index);
                    }}
                    disabled={selected.size >= maxSelection && !isSelected}
                    className={`relative group rounded overflow-hidden border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected ? "border-gold" : "border-border hover:border-gold"
                    }`}
                    title={`${isSelected ? 'Deselect' : 'Select'} - Ctrl+Click for single, Shift+Click for range`}
                  >
                    <div className="aspect-square bg-muted">
                      <img 
                        src={item.url} 
                        alt={item.alt_text || item.file_name || "Media"} 
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-gold/20 flex items-center justify-center pointer-events-none">
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
        </div>

        {/* Fixed Footer with Actions */}
        <div className="flex-shrink-0 border-t border-border bg-background p-6 flex gap-2 justify-end">
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
      </div>
    </div>
  );
}
