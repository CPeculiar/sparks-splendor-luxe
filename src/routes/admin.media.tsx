import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchMedia, uploadMedia, uploadMediaBatch, addMediaUrl, updateMedia, deleteMedia, syncMediaLibrary } from "@/lib/admin";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
import { Trash2, Edit, Copy, Check, Cloud, RefreshCw, X } from "lucide-react";

export const Route = createFileRoute("/admin/media")({ component: AdminMedia });

interface MediaItem {
  id: string;
  url: string;
  file_name?: string;
  alt_text?: string;
  category?: string;
  media_type?: string;
  cloudinary_public_id?: string | null;
  cloudinary_url?: string | null;
}

function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<MediaItem> | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Load and sync on mount
  useEffect(() => { 
    void loadAndSync(); 
  }, []);

  async function loadAndSync() {
    setLoading(true);
    setError(null);
    setSyncing(true);
    setSyncStatus(null);
    
    try {
      // Sync with Cloudinary first
      const syncResult = await syncMediaLibrary();
      setSyncStatus(`✅ ${syncResult.message}`);
      
      // Then load media library
      const data = await fetchMedia();
      setItems(data || []);
      
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sync failed";
      setSyncStatus(`❌ ${msg}`);
      setError(msg);
      
      // Still try to load media even if sync failed
      try {
        const data = await fetchMedia();
        setItems(data || []);
      } catch (loadErr) {
        setError((e instanceof Error ? e.message : "Failed to load media"));
      }
      
      setTimeout(() => setSyncStatus(null), 5000);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }

  async function load() {
    setLoading(true); 
    setError(null);
    try { 
      const data = await fetchMedia();
      setItems(data || []);
    } catch (e) { 
      setError(e instanceof Error ? e.message : "Failed to load media");
    } finally { 
      setLoading(false);
    }
  }

  async function handleFileInput(f: File | null) {
    if (!f) return;
    try {
      setError(null);
      await uploadMedia(f);
      await loadAndSync(); // Sync after upload
    } catch (e) { 
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }

  function handleMultipleFiles(files: FileList | null) {
    if (!files) return;
    setUploadingFiles(Array.from(files));
    setUploadProgress({});
  }

  function removeFileFromQueue(index: number) {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
    const fileName = uploadingFiles[index]?.name;
    if (fileName) {
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[fileName];
        return updated;
      });
    }
  }

  async function handleBatchUpload() {
    if (uploadingFiles.length === 0) return;
    
    try {
      setError(null);
      // Simulate progress
      uploadingFiles.forEach((_, i) => {
        setUploadProgress(prev => ({ ...prev, [uploadingFiles[i].name]: 0 }));
      });
      
      await uploadMediaBatch(uploadingFiles);
      
      // Mark as complete
      uploadingFiles.forEach(file => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      });
      
      setUploadingFiles([]);
      setUploadProgress({});
      await loadAndSync(); // Sync after batch upload
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch upload failed");
    }
  }

  async function handleCloudinaryUrl(url: string) {
    try {
      setError(null);
      await addMediaUrl({ url });
      await loadAndSync(); // Sync after adding URL
    } catch (e) { 
      setError(e instanceof Error ? e.message : "Failed to add URL");
    }
  }

  async function handleSave(item: Partial<MediaItem>) {
    if (!item.id) return;
    try {
      setError(null);
      await updateMedia(item.id, {
        file_name: item.file_name,
        alt_text: item.alt_text,
        category: item.category,
      });
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this media item?")) return;
    try {
      setError(null);
      await deleteMedia(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow">Media</p>
          <h1 className="font-display text-3xl mt-1">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Centralized media management - automatically synced with Cloudinary
            {syncing && <RefreshCw className="inline-block ml-2 h-4 w-4 animate-spin" />}
          </p>
        </div>
        <button
          onClick={() => void loadAndSync()}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Cloudinary'}
        </button>
      </header>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded">
          {error}
        </div>
      )}

      {syncStatus && (
        <div className={`${syncStatus.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-destructive/10 border-destructive/30 text-destructive'} border text-sm p-3 rounded`}>
          {syncStatus}
        </div>
      )}

      {/* Upload section */}
      <div className="bg-background border border-border p-6 space-y-4">
        <h3 className="font-medium text-sm">Add Media</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-muted-foreground mb-3">Upload from computer</label>
            <input 
              type="file" 
              accept="image/*,video/*"
              multiple
              onChange={(e) => void handleMultipleFiles(e.target.files)}
              className="inp"
            />
            <p className="text-xs text-muted-foreground mt-2">Select one or multiple files to upload at once</p>
          </div>
          <div>
            <CloudinaryUpload label="Upload via Cloudinary" onUpload={handleCloudinaryUrl} />
          </div>
        </div>

        {/* Files queue */}
        {uploadingFiles.length > 0 && (
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Files to upload ({uploadingFiles.length})</h4>
              <button
                onClick={() => {
                  setUploadingFiles([]);
                  setUploadProgress({});
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {uploadingFiles.map((file, i) => (
                <div key={`${file.name}-${i}`} className="flex items-center gap-3 p-2 bg-secondary/30 rounded text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadProgress[file.name] !== undefined && (
                      <div className="w-16 h-1 bg-border rounded overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all" 
                          style={{ width: `${uploadProgress[file.name]}%` }} 
                        />
                      </div>
                    )}
                    <button
                      onClick={() => removeFileFromQueue(i)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove from queue"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => void handleBatchUpload()}
              disabled={uploadingFiles.length === 0}
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Upload {uploadingFiles.length} file{uploadingFiles.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>

      {/* Media grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading media library...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No media items yet. Upload your first image!</div>
      ) : (
        <div className="bg-background border border-border rounded overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-collapse">
            {items.map((item) => (
              <div key={item.id} className="border-r border-b border-border/50 p-3 space-y-2 hover:bg-secondary/20 transition-colors relative">
                {/* Cloudinary badge */}
                {item.cloudinary_public_id && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-500/20 border border-blue-500/50 text-blue-500 text-[9px] px-2 py-1 rounded">
                    <Cloud className="h-3 w-3" />
                    <span>Cloudinary</span>
                  </div>
                )}

                {/* Thumbnail */}
                <div className="h-24 bg-muted overflow-hidden rounded">
                  {item.url && (
                    <img 
                      src={item.url} 
                      alt={item.alt_text || item.file_name || 'Media'} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* File info */}
                <div className="space-y-1 text-xs">
                  <p className="font-medium truncate" title={item.file_name}>{item.file_name || 'Untitled'}</p>
                  {item.alt_text && <p className="text-muted-foreground truncate">{item.alt_text}</p>}
                  {item.category && <p className="text-muted-foreground text-[10px]">📁 {item.category}</p>}
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="flex-1 px-2 py-1 bg-secondary text-xs rounded hover:bg-gold/20 transition-colors flex items-center justify-center gap-1"
                    title="Copy URL to clipboard"
                  >
                    {copiedUrl === item.url ? (
                      <>
                        <Check className="h-3 w-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setEditing({ ...item })}
                    className="px-2 py-1 bg-secondary text-xs rounded hover:bg-gold/20 transition-colors"
                    title="Edit details"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-2 py-1 bg-secondary text-xs rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                    title="Delete from library {item.cloudinary_public_id ? 'and Cloudinary' : ''}"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-onyx/60" onClick={() => setEditing(null)} />
          <div className="relative bg-background w-full max-w-md p-6 space-y-4">
            <h2 className="font-display text-2xl">Edit Media</h2>
            
            {/* Preview */}
            <div className="h-32 bg-muted rounded overflow-hidden">
              {editing.url && (
                <img src={editing.url} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>

            {/* Form */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">File Name</label>
                <input
                  type="text"
                  value={editing.file_name || ''}
                  onChange={(e) => setEditing({ ...editing, file_name: e.target.value })}
                  className="inp"
                  placeholder="Optional name"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Alt Text</label>
                <textarea
                  value={editing.alt_text || ''}
                  onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })}
                  className="inp"
                  placeholder="Image description for accessibility"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Category</label>
                <input
                  type="text"
                  value={editing.category || ''}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="inp"
                  placeholder="e.g., hero-slides, banners, products"
                />
              </div>
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
                onClick={() => handleSave(editing)}
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

