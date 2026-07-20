/**
 * Bulk upload script — run once to migrate all local images to Cloudinary.
 * Usage: node scripts/upload-to-cloudinary.mjs
 *
 * It will print a mapping of old filename -> new Cloudinary URL.
 * Copy that output to update products.ts
 */

import { createReadStream, readdirSync } from "fs";
import { join, extname, basename } from "path";
import FormData from "form-data";
import fetch from "node-fetch";

const CLOUD_NAME = "dm6a3bf53";
const UPLOAD_PRESET = "oehrm2pj";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const VIDEO_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VIDEO_EXTS = new Set([".mp4", ".webm"]);

const GALLERY_DIR = join(process.cwd(), "public", "gallery");
const SAFARI_DIR = join(GALLERY_DIR, "safari-code");
const VIDEO_DIR = join(process.cwd(), "public", "video");

async function uploadFile(filePath, folder, isVideo = false) {
  const form = new FormData();
  form.append("file", createReadStream(filePath));
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", folder);

  const url = isVideo ? VIDEO_UPLOAD_URL : UPLOAD_URL;
  const res = await fetch(url, { method: "POST", body: form });
  const data = await res.json();

  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

async function uploadFolder(dirPath, cloudinaryFolder, label) {
  const files = readdirSync(dirPath);
  const results = {};

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const isImage = IMAGE_EXTS.has(ext);
    const isVideo = VIDEO_EXTS.has(ext);
    if (!isImage && !isVideo) continue;

    const filePath = join(dirPath, file);
    process.stdout.write(`Uploading ${label}/${file} ... `);
    try {
      const url = await uploadFile(filePath, cloudinaryFolder, isVideo);
      // Use optimized URL for images
      const finalUrl = isImage
        ? url.replace("/upload/", "/upload/f_auto,q_auto/")
        : url;
      results[file] = finalUrl;
      console.log("✅");
    } catch (err) {
      console.log(`❌ ${err.message}`);
    }
  }
  return results;
}

async function main() {
  console.log("🚀 Starting Cloudinary bulk upload...\n");

  const [gallery, safari, video] = await Promise.all([
    uploadFolder(GALLERY_DIR, "sparks-splendor/gallery", "gallery"),
    uploadFolder(SAFARI_DIR, "sparks-splendor/safari-code", "safari-code"),
    uploadFolder(VIDEO_DIR, "sparks-splendor/video", "video"),
  ]);

  console.log("\n\n========== CLOUDINARY URL MAP ==========\n");
  console.log("// gallery images");
  for (const [file, url] of Object.entries(gallery)) {
    console.log(`// ${file}: ${url}`);
  }
  console.log("\n// safari-code images");
  for (const [file, url] of Object.entries(safari)) {
    console.log(`// ${file}: ${url}`);
  }
  console.log("\n// video files");
  for (const [file, url] of Object.entries(video)) {
    console.log(`// ${file}: ${url}`);
  }

  console.log("\n========================================");
  console.log("✅ All done! Copy the URLs above into products.ts and your components.");
  console.log("   Replace the img() helper like this:\n");
  console.log(`   const CLOUD = "https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto";`);
  console.log(`   const img = (n: number) => \`\${CLOUD}/sparks-splendor/gallery/img-\${String(n).padStart(2, "0")}.jpg\`;`);
  console.log(`   const couple = (n: number) => \`\${CLOUD}/sparks-splendor/gallery/couple-\${String(n).padStart(2, "0")}.jpg\`;`);
}

main().catch(console.error);
