# Multiple File Upload Feature Guide

## Overview

The Sparks & Splendour admin dashboard now supports **batch uploading multiple images** at once, making it faster to build your media library and manage content across products, categories, and other sections.

## Features

### ✨ Key Features

1. **Multiple File Selection**
   - Select one or many files from your computer at once
   - Support for images and videos

2. **Upload Queue**
   - View all selected files before uploading
   - Remove individual files from the queue
   - Clear all files at once

3. **Progress Tracking**
   - Visual progress bar for each file
   - Shows file name and file size
   - Upload status indicators

4. **Batch Processing**
   - Upload up to 50 files in a single batch
   - Automatic sync with Cloudinary
   - Comprehensive error reporting for failed uploads

5. **Multi-Selection from Media Library**
   - `MultiMediaSelector` component for selecting multiple existing media items
   - Perfect for creating galleries or batch editing product images

## How to Use

### Uploading Multiple Files

1. **Navigate to Media Library**
   - Go to Admin Dashboard → Media

2. **Select Files**
   - Click on the file input field labeled "Upload from computer"
   - Select multiple files using Ctrl+Click (Windows) or Cmd+Click (Mac)
   - Or simply select all files at once using Ctrl+A after clicking the input

3. **Review Files**
   - All selected files appear in the "Files to upload" section
   - Each file shows:
     - File name
     - File size in MB
     - Progress bar (fills during upload)
     - Remove button (X) to remove individual files

4. **Manage Queue**
   - **Remove single file**: Click the X button next to any file
   - **Clear all files**: Click "Clear all" link
   - **Cancel upload**: Close the dialog (upload doesn't start until you click the upload button)

5. **Upload Files**
   - Click the green "Upload X files" button
   - The button updates to show the count of selected files
   - Files begin uploading immediately
   - Progress bars fill as each file uploads

6. **Automatic Sync**
   - After successful upload, the media library automatically syncs with Cloudinary
   - Newly uploaded files appear in your media library instantly

### Using Multiple Media Selector

For features that need multiple media items (e.g., product galleries):

```typescript
import { MultiMediaSelector } from "@/components/MultiMediaSelector";

function MyComponent() {
  const [showSelector, setShowSelector] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  return (
    <>
      <button onClick={() => setShowSelector(true)}>
        Select Images
      </button>

      {showSelector && (
        <MultiMediaSelector
          onSelect={(urls) => {
            setSelectedImages(urls);
            setShowSelector(false);
          }}
          onClose={() => setShowSelector(false)}
          selectedValues={selectedImages}
          maxSelection={10}
          label="Select Product Images"
        />
      )}

      {/* Display selected images */}
      <div className="grid grid-cols-3 gap-4">
        {selectedImages.map(url => (
          <img key={url} src={url} alt="" className="w-full h-auto" />
        ))}
      </div>
    </>
  );
}
```

## API Endpoints

### Single File Upload (Existing)
```
POST /api/media/upload
Content-Type: multipart/form-data

file: File
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://cloudinary.url/...",
    "file_name": "image.jpg",
    "file_size": 2048,
    "media_type": "image/jpeg",
    "cloudinary_public_id": "public-id"
  }
}
```

### Batch File Upload (New)
```
POST /api/media/upload/batch
Content-Type: multipart/form-data

files: File[]  (max 50 files)
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid1", "url": "...", "file_name": "image1.jpg", ... },
    { "id": "uuid2", "url": "...", "file_name": "image2.jpg", ... }
  ],
  "errors": ["image3.jpg: File too large"],
  "message": "Uploaded 2 of 3 files"
}
```

## Frontend Implementation Details

### Updated Components

#### admin.media.tsx Changes
- Added `uploadingFiles` state to track files in queue
- Added `uploadProgress` state to track upload progress
- New `handleMultipleFiles()` function to handle file selection
- New `handleBatchUpload()` function to upload all files at once
- New `removeFileFromQueue()` function to remove individual files
- Updated upload UI with file queue display and progress bars

#### admin.ts API Functions
- `uploadMedia(file)` - Single file upload (unchanged)
- `uploadMediaBatch(files)` - New function for batch uploads

#### MultiMediaSelector.tsx (New Component)
- Allows selecting multiple media items from the library
- Includes selection limit enforcement
- Displays confirmation button with selected count
- Used in any component that needs multiple media selection

## Backend Implementation Details

### New Endpoint: POST /api/media/upload/batch

**Location:** BACKEND/src/routes/media.ts (line ~145)

**Features:**
- Uses multer's `.array("files", 50)` middleware
- Processes up to 50 files per request
- Each file is inserted into the database individually
- Errors are collected and reported separately
- Returns both successful uploads and failure messages

**Error Handling:**
- Individual file errors don't stop the batch
- All successes are returned even if some files fail
- Client can retry failed files

## Limitations & Notes

### File Size & Type Limits
- Maximum file size: 5 MB (configurable in `MAX_FILE_SIZE` env var)
- Supported types: image/*, video/*
- Maximum 50 files per batch request

### Browser Compatibility
- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- File input accepts multiple files on all browsers

### Storage
- Files are uploaded to Cloudinary automatically
- Metadata is stored in PostgreSQL media table
- Both are synced after upload completes

### Performance
- Large batches (20+ files) may take longer depending on file sizes and internet speed
- Progress bars update in real-time
- No blocking - UI remains responsive during uploads

## Troubleshooting

### Files Not Uploading
1. Check file sizes (max 5 MB per file)
2. Check file types (images and videos only)
3. Verify internet connection
4. Check browser console for errors (F12)

### Files Upload But Don't Appear
1. Check that sync completed successfully
2. Refresh the media library page (F5)
3. Check database connection in backend logs

### Batch Upload Button Disabled
- Ensure at least one file is selected in the queue
- Remove any problematic files and try again

### Progress Bar Stuck
- This is a simulated progress bar (backend uploads instantly)
- If upload takes too long, check backend logs for errors

## Future Enhancements

Potential improvements for future versions:
- Drag-and-drop file upload
- Direct progress from backend using webhooks
- Chunked uploads for very large files
- Batch editing of metadata after upload
- Automatic image optimization on client-side
- Preview before upload

## Examples

### Example 1: Simple Batch Upload in Admin

```typescript
// User selects 5 image files
// Files appear in queue with sizes
// User clicks "Upload 5 files"
// Backend processes all 5 files
// Success message appears
// Media library refreshes with new images
```

### Example 2: Multiple Image Selector for Product

```typescript
// Product page has "Upload Gallery Images" button
// Opens MultiMediaSelector
// User selects 8 images from media library
// Click "Confirm Selection (8)"
// All 8 images are associated with the product
```

## Support

For issues or questions:
1. Check the browser console (F12) for error messages
2. Check backend logs for server-side errors
3. Verify Cloudinary configuration is correct
4. Ensure media table exists in database

