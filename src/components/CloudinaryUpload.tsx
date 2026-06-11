import { useState } from "react";
import { UploadCloud, CheckCircle2, X } from "lucide-react";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/lib/cloudinary";

interface CloudinaryUploadProps {
  folder?: string;
  accept?: string;
  label?: string;
  onUpload: (url: string) => void;
}

export function CloudinaryUpload({
  folder = "sparks-splendor/uploads",
  accept = "image/*,video/*",
  label = "Upload to Cloudinary",
  onUpload,
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      setError("Cloudinary is not configured in the frontend environment.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      form.append("folder", folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: "POST",
        body: form,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Cloudinary upload failed");
      }

      const url = data.secure_url;
      setUploadedUrl(url);
      onUpload(url);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 items-center">
        <label className="inline-flex items-center gap-2 cursor-pointer bg-secondary/30 border border-border px-4 py-3 text-xs uppercase tracking-[0.25em] hover:border-gold hover:text-gold transition-colors">
          <UploadCloud className="h-4 w-4" />
          <span>{uploading ? "Uploading…" : "Choose file"}</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
        </label>
        {uploadedUrl && (
          <span className="inline-flex items-center gap-2 text-xs text-emerald-500">
            <CheckCircle2 className="h-4 w-4" /> Uploaded
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
