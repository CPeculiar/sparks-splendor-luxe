/**
 * Compress all images in public/gallery before uploading to Cloudinary.
 * Outputs compressed images to public/gallery-compressed/
 *
 * Usage:
 *   npm install sharp --save-dev   (run once)
 *   node scripts/compress-images.mjs
 */

import sharp from "sharp";
import { readdirSync, mkdirSync, statSync } from "fs";
import { join, extname, basename, relative } from "path";

const INPUT_DIR = join(process.cwd(), "public", "gallery");
const OUTPUT_DIR = join(process.cwd(), "public", "gallery-compressed");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".PNG", ".JPEG", ".JPG"]);

// Settings — tweak if needed
const MAX_WIDTH = 1400;   // px — enough for any product card or hero image
const QUALITY = 80;       // 75–82 is the sweet spot: visually lossless, much smaller

function getAllImageFiles(dir, fileList = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllImageFiles(fullPath, fileList);
    } else if (IMAGE_EXTS.has(extname(entry.name))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function ensureDir(filePath) {
  const dir = filePath.substring(0, filePath.lastIndexOf("\\") || filePath.lastIndexOf("/"));
  mkdirSync(dir, { recursive: true });
}

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

async function compressImage(inputPath) {
  const relativePath = relative(INPUT_DIR, inputPath);
  const outputPath = join(OUTPUT_DIR, relativePath).replace(/\.(png|PNG)$/, ".jpg");

  ensureDir(outputPath);

  const beforeSize = statSync(inputPath).size;

  await sharp(inputPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true }) // never upscale
    .jpeg({ quality: QUALITY, mozjpeg: true })              // mozjpeg = better compression
    .toFile(outputPath);

  const afterSize = statSync(outputPath).size;
  const saved = (((beforeSize - afterSize) / beforeSize) * 100).toFixed(0);

  return { relativePath, beforeSize, afterSize, saved };
}

async function main() {
  console.log("🗜️  Compressing images...\n");

  const files = getAllImageFiles(INPUT_DIR);
  console.log(`Found ${files.length} images in public/gallery/\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    try {
      const { relativePath, beforeSize, afterSize, saved } = await compressImage(file);
      totalBefore += beforeSize;
      totalAfter += afterSize;
      console.log(`✅ ${relativePath}`);
      console.log(`   ${formatSize(beforeSize)} → ${formatSize(afterSize)} (${saved}% smaller)\n`);
    } catch (err) {
      console.log(`❌ ${relative(INPUT_DIR, file)}: ${err.message}\n`);
    }
  }

  console.log("========================================");
  console.log(`Total before : ${formatSize(totalBefore)}`);
  console.log(`Total after  : ${formatSize(totalAfter)}`);
  console.log(`Total saved  : ${formatSize(totalBefore - totalAfter)} (${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0)}%)`);
  console.log("\n✅ Compressed images saved to: public/gallery-compressed/");
  console.log("   Now update upload-to-cloudinary.mjs to point to gallery-compressed/ instead of gallery/");
}

main().catch(console.error);
