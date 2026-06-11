export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export function isCloudinaryUrl(url: string | undefined | null): boolean {
  return typeof url === "string" && /res\.cloudinary\.com/.test(url);
}

export function getCloudinaryUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (isCloudinaryUrl(url)) {
    if (url.includes("/upload/f_auto") || url.includes("/upload/q_auto")) return url;
    const [prefix, suffix] = url.split("/upload/");
    if (!suffix) return url;
    return `${prefix}/upload/f_auto,q_auto/${suffix}`;
  }

  if (!url.startsWith("/")) return url;
  if (!CLOUDINARY_CLOUD_NAME) return url;

  const isVideo = /\.(mp4|webm|mov)$/i.test(url);
  const type = isVideo ? "video" : "image";
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${type}/upload/f_auto,q_auto${url}`;
}

export function getCloudinaryUploadUrl(file: File): string {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
}
