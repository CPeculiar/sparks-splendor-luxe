import { useState } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/lib/cloudinary";

const MAX_WIDTH        = 1400;          // px — enough for any product or hero image
const QUALITY          = 0.82;          // 0–1, jpeg quality — visually lossless at this level
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface CloudinaryUploadProps {
  folder?: string;
  accept?: string;
  label?: string;
  onUpload: (url: string) => void;
}

// Compress an image File in the browser using Canvas — no libraries needed.
// Videos are returned as-is (canvas can't compress video).
function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // Skip compression for non-image files (e.g. videos)
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate new dimensions — never upscale
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Compression failed")); return; }
          // Keep original filename but force .jpg extension
          const name = file.name.replace(/\.[^.]+$/, ".jpg");
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image"));
    };

    img.src = objectUrl;
  });
}

export function CloudinaryUpload({
  folder = "sparks-splendor/uploads",
  accept = "image/*,video/*",
  label = "Upload to Cloudinary",
  onUpload,
}: CloudinaryUploadProps) {
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [sizeInfo, setSizeInfo]       = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setSizeInfo(null);
    setUploadedUrl(null);

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      setError("Cloudinary is not configured in the frontend environment.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);
    try {
      const originalSizeMB = (file.size / 1024 / 1024).toFixed(1);

      // Auto-compress images before upload — videos skip this step
      const fileToUpload = await compressImage(file);
      const compressedSizeMB = (fileToUpload.size / 1024 / 1024).toFixed(1);

      // Show size info only when compression actually reduced the size
      if (file.type.startsWith("image/") && fileToUpload.size < file.size) {
        setSizeInfo(`Compressed: ${originalSizeMB}MB → ${compressedSizeMB}MB`);
      }

      const form = new FormData();
      form.append("file", fileToUpload);
      form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      form.append("folder", folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: "POST", body: form },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Cloudinary upload failed");

      setUploadedUrl(data.secure_url);
      onUpload(data.secure_url);
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
          <span>{uploading ? "Compressing & uploading…" : "Choose file"}</span>
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
      {sizeInfo && <p className="text-xs text-muted-foreground">{sizeInfo}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
