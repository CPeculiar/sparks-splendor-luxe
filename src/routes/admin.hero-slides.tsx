import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Edit, GripVertical } from "lucide-react";
import { MediaSelector } from "@/components/MediaSelector";

export const Route = createFileRoute("/admin/hero-slides")({ component: AdminHeroSlides });

interface HeroSlide {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  link?: string;
  sort_order?: number;
  is_active?: boolean;
}

function AdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([
    { id: "1", title: "Summer Collection", description: "Discover our latest", url: "", link: "/shop?category=all", sort_order: 0, is_active: true },
  ]);
  const [editing, setEditing] = useState<HeroSlide | null>(null);

  function addSlide() {
    setEditing({ 
      title: "", 
      description: "", 
      url: "", 
      link: "/shop", 
      sort_order: slides.length,
      is_active: true 
    });
  }

  function saveSlide(slide: HeroSlide) {
    if (slide.id) {
      setSlides(slides.map(s => s.id === slide.id ? slide : s));
    } else {
      setSlides([...slides, { ...slide, id: String(Date.now()) }]);
    }
    setEditing(null);
  }

  function deleteSlide(id: string | undefined) {
    if (id && confirm("Delete this slide?")) {
      setSlides(slides.filter(s => s.id !== id));
    }
  }

  function moveSlide(id: string, direction: "up" | "down") {
    const idx = slides.findIndex(s => s.id === id);
    if (direction === "up" && idx > 0) {
      const newSlides = [...slides];
      [newSlides[idx], newSlides[idx - 1]] = [newSlides[idx - 1], newSlides[idx]];
      newSlides.forEach((s, i) => s.sort_order = i);
      setSlides(newSlides);
    } else if (direction === "down" && idx < slides.length - 1) {
      const newSlides = [...slides];
      [newSlides[idx], newSlides[idx + 1]] = [newSlides[idx + 1], newSlides[idx]];
      newSlides.forEach((s, i) => s.sort_order = i);
      setSlides(newSlides);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-eyebrow">Content</p>
          <h1 className="font-display text-3xl mt-1">Hero Slides</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage hero carousel images and videos for the website</p>
        </div>
        <button
          onClick={addSlide}
          className="inline-flex items-center gap-2 bg-gold text-onyx px-4 py-2 text-xs font-medium uppercase hover:bg-gold/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Slide
        </button>
      </header>

      {slides.length === 0 ? (
        <div className="bg-background border border-border p-12 text-center">
          <p className="text-muted-foreground">No slides yet. Add your first hero slide!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide) => (
            <div key={slide.id} className="bg-background border border-border p-4 flex items-center gap-4 hover:border-gold transition-colors">
              {/* Drag handle */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveSlide(slide.id!, "up")}
                  className="p-1 hover:text-gold disabled:opacity-30"
                  disabled={slides.indexOf(slide) === 0}
                >
                  ▲
                </button>
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => moveSlide(slide.id!, "down")}
                  className="p-1 hover:text-gold disabled:opacity-30"
                  disabled={slides.indexOf(slide) === slides.length - 1}
                >
                  ▼
                </button>
              </div>

              {/* Thumbnail */}
              {slide.url && (
                <div className="w-24 h-24 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{slide.title}</p>
                <p className="text-sm text-muted-foreground truncate">{slide.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{slide.link}</p>
                <div className="mt-2">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded ${slide.is_active ? "bg-green-100/20 text-green-700" : "bg-gray-100/20 text-gray-500"}`}>
                    {slide.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(slide)}
                  className="p-2 hover:text-gold transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteSlide(slide.id)}
                  className="p-2 hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-onyx/60" onClick={() => setEditing(null)} />
          <div className="relative bg-background w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl">{editing.id ? "Edit Slide" : "Add Slide"}</h2>

            <div className="space-y-4">
              {/* Image selector */}
              <MediaSelector 
                label="Hero Image or Video" 
                onSelect={(url) => setEditing({ ...editing, url })}
                value={editing.url}
              />

              {/* Title */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Title</label>
                <input
                  type="text"
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="inp"
                  placeholder="Slide title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Description</label>
                <textarea
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="inp"
                  placeholder="Slide description (optional)"
                  rows={3}
                />
              </div>

              {/* Link */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Link (URL or path)</label>
                <input
                  type="text"
                  value={editing.link || ""}
                  onChange={(e) => setEditing({ ...editing, link: e.target.value })}
                  className="inp"
                  placeholder="/shop?category=all"
                />
              </div>

              {/* Active checkbox */}
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

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2 border border-border hover:border-gold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => saveSlide(editing)}
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

