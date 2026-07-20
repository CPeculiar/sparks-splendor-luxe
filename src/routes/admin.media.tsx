import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchMedia, uploadMedia, addMediaUrl } from "@/lib/admin";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";

export const Route = createFileRoute("/admin/media")({ component: AdminMedia });

function AdminMedia() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true); setError(null);
    try { setItems(await fetchMedia()); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function handleFileInput(f: File | null) {
    if (!f) return;
    try {
      await uploadMedia(f);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed"); }
  }

  async function handleCloudinaryUrl(url: string) {
    try {
      await addMediaUrl({ url });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-eyebrow">Media</p>
        <h1 className="font-display text-3xl mt-1">Media Library</h1>
      </header>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <div className="w-72">
          <p className="text-xs text-muted-foreground mb-2">Upload file (stores in backend uploads)</p>
          <input type="file" onChange={(e) => void handleFileInput(e.target.files?.[0] || null)} />
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Or upload to Cloudinary and add URL</p>
            <CloudinaryUpload onUpload={(url) => void handleCloudinaryUrl(url)} />
          </div>
        </div>

        <div className="flex-1 bg-background border border-border p-4">
          <div className="grid grid-cols-4 gap-3">
            {!loading && !items.length && <p className="text-sm text-muted-foreground">No media yet.</p>}
            {items.map((m) => (
              <div key={m.id} className="border border-border p-2">
                <img src={m.url} alt={m.alt_text || ''} className="h-28 w-full object-cover" />
                <p className="text-xs mt-2 truncate">{m.file_name || m.url}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
