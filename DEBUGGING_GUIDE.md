# Image Upload Debugging Guide

## 🔍 Complete Debugging Flow

I've added comprehensive logging throughout the entire image upload and display flow. Follow these steps to identify the issue:

---

## 📋 Step-by-Step Testing Process

### 1. Open Group Settings Page
1. Navigate to your group
2. Click "Settings" in sidebar
3. **Open Browser Console (F12)** → Console tab
4. **Clear console** (important!)

### 2. Check Initial State
Look for these logs when the page loads:

```javascript
📊 Group data loaded: {
  name: "Your Group Name",
  description: "...",
  icon: "some-uuid-or-null",          // ← Check this value
  thumbnail: "some-uuid-or-null",      // ← Check this value
  iconType: "string" or "object",      // ← Should be "string"
  thumbnailType: "string" or "object"  // ← Should be "string"
}

🖼️ Image URLs that will be used: {
  iconUrl: "https://ucarecdn.com/uuid/" or "default",
  thumbnailUrl: "https://ucarecdn.com/uuid/" or "default",
  iconRaw: "uuid" or null,
  thumbnailRaw: "uuid" or null
}

🎨 [GroupSettingsForm] Rendering with: {
  previewIcon: undefined,              // ← Should be undefined initially
  previewThumbnail: undefined,         // ← Should be undefined initially
  dbIcon: "uuid" or null,
  dbThumbnail: "uuid" or null,
  finalIconUrl: "https://ucarecdn.com/uuid/",
  finalThumbnailUrl: "https://ucarecdn.com/uuid/"
}

✅ Icon loaded successfully: https://ucarecdn.com/uuid/
```

**What to check:**
- ✅ Are `icon` and `thumbnail` showing UUIDs or `null`?
- ✅ Are URLs being constructed correctly?
- ✅ Do you see "Icon loaded successfully" or "Failed to load icon"?

---

### 3. Upload a New Icon
1. Click "Change Icon"
2. Select an image file
3. **Watch console** - should see preview appear on screen

```javascript
🎨 [GroupSettingsForm] Rendering with: {
  previewIcon: "blob:http://localhost:3000/abc123",  // ← Preview blob URL
  previewThumbnail: undefined,
  dbIcon: "old-uuid",
  dbThumbnail: "old-uuid",
  finalIconUrl: "blob:http://localhost:3000/abc123", // ← Using preview
  finalThumbnailUrl: "https://ucarecdn.com/old-uuid/"
}
```

---

### 4. Click "Save Changes"
**CRITICAL STEP:** Watch the console logs carefully in this exact order:

```javascript
// 1. Mutation starts
💾 Saving group settings: {
  icon: FileList { 0: File, length: 1 },  // ← File is present
  name: undefined,
  description: undefined,
  thumbnail: undefined
}

// 2. Upload to Uploadcare
📤 Uploading icon...

// 3. Uploadcare response
📦 Uploadcare icon response: {
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",  // ← This is the UUID
  "name": "your-image.jpg",
  "size": 123456,
  "isStored": true,
  "isImage": true,
  "cdnUrl": "https://ucarecdn.com/a1b2c3d4-e5f6-7890-abcd-ef1234567890/",
  ...
}

// 4. UUID being saved
🔑 Icon UUID to save: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

// 5. Server action
🔧 [Server] Updating group a1b2c3d4... - ICON: a1b2c3d4-e5f6-7890-abcd-ef1234567890

// 6. Database update
✅ [Server] Icon updated successfully
✅ [Server] Path revalidated: /group/a1b2c3d4/settings

// 7. Client receives response
✅ Icon update result: { status: 200 }

// 8. All updates complete
✅ All updates completed successfully

// 9. Refetch triggered
🔄 Refetching group data...

// 10. New data loaded
📊 Group data loaded: {
  name: "Your Group Name",
  icon: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",  // ← NEW UUID!
  thumbnail: "old-uuid",
  iconType: "string",
  thumbnailType: "string"
}

// 11. URLs constructed
🖼️ Image URLs that will be used: {
  iconUrl: "https://ucarecdn.com/a1b2c3d4-e5f6-7890-abcd-ef1234567890/",
  thumbnailUrl: "https://ucarecdn.com/old-uuid/",
  iconRaw: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  thumbnailRaw: "old-uuid"
}

// 12. Component re-renders
🎨 [GroupSettingsForm] Rendering with: {
  previewIcon: undefined,              // ← Cleared!
  previewThumbnail: undefined,         // ← Cleared!
  dbIcon: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",  // ← NEW UUID!
  dbThumbnail: "old-uuid",
  finalIconUrl: "https://ucarecdn.com/a1b2c3d4-e5f6-7890-abcd-ef1234567890/",
  finalThumbnailUrl: "https://ucarecdn.com/old-uuid/"
}

// 13. Image loads
✅ Icon loaded successfully: https://ucarecdn.com/a1b2c3d4-e5f6-7890-abcd-ef1234567890/
```

---

## 🐛 Troubleshooting Scenarios

### Scenario A: No logs appear after clicking "Save Changes"
**Problem:** Form submission not working

**Check:**
1. Are there any JavaScript errors in console?
2. Is the button disabled?
3. Is the form validation passing?

---

### Scenario B: Upload starts but fails
```javascript
📤 Uploading icon...
❌ Error saving group settings: Network error
```

**Possible Causes:**
1. Uploadcare API key missing/invalid
2. Network connectivity issues
3. File too large (max 2MB)
4. Wrong file type (must be PNG/JPG/JPEG)

**Check:**
```javascript
// Check environment variable
console.log(process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY)
```

---

### Scenario C: Upload succeeds but UUID is wrong
```javascript
📦 Uploadcare icon response: { ... }
🔑 Icon UUID to save: undefined
```

**Problem:** `uploaded.uuid` is undefined

**Fix:** Check the Uploadcare response structure. It might be `uploaded.file` or `uploaded.fileInfo.uuid`

---

### Scenario D: Database update fails
```javascript
🔧 [Server] Updating group... - ICON: a1b2c3d4...
❌ [Server] Error updating group settings: ...
```

**Possible Causes:**
1. Database connection issue
2. Invalid group ID
3. Prisma error

**Check server terminal/logs** for detailed error

---

### Scenario E: Data refetch doesn't show new UUID
```javascript
🔄 Refetching group data...
📊 Group data loaded: {
  icon: "old-uuid",  // ← Still showing old UUID!
  ...
}
```

**Possible Causes:**
1. Query cache not invalidating
2. Database update didn't actually save
3. Wrong query key

**Check database directly:**
```sql
SELECT icon, thumbnail FROM "Group" WHERE id = 'your-group-id';
```

---

### Scenario F: Image URL is constructed but image doesn't load
```javascript
🖼️ Image URLs that will be used: {
  iconUrl: "https://ucarecdn.com/a1b2c3d4.../"
}

🎨 [GroupSettingsForm] Rendering with: {
  finalIconUrl: "https://ucarecdn.com/a1b2c3d4.../"
}

❌ Failed to load icon: https://ucarecdn.com/a1b2c3d4.../
```

**Possible Causes:**
1. UUID is invalid/corrupted
2. Image was deleted from Uploadcare
3. Uploadcare CDN issue
4. Network/CORS issue

**Test the URL:**
1. Copy the URL from console
2. Paste in new browser tab
3. Should display the image

---

### Scenario G: Everything works but preview doesn't clear
```javascript
🔄 Refetching group data...
🎨 [GroupSettingsForm] Rendering with: {
  previewIcon: "blob:http://...",  // ← Still has blob URL!
  dbIcon: "new-uuid",
  finalIconUrl: "blob:http://..."  // ← Using preview instead of DB
}
```

**Problem:** `setPreviewIcon(undefined)` not being called

**Check:**
- Is `onSuccess` callback running?
- Look for `🔄 Refetching group data...` log
- If missing, mutation didn't succeed

---

## 🔑 Key Checkpoints

### ✅ Upload Phase
- [ ] File selected appears as `FileList` in form values
- [ ] Upload to Uploadcare starts: `📤 Uploading icon...`
- [ ] Uploadcare returns response with UUID: `📦 Uploadcare icon response`
- [ ] UUID is extracted: `🔑 Icon UUID to save: "uuid-here"`

### ✅ Save Phase
- [ ] Server receives UUID: `🔧 [Server] Updating group - ICON: uuid`
- [ ] Database updates successfully: `✅ [Server] Icon updated successfully`
- [ ] Path revalidated: `✅ [Server] Path revalidated`
- [ ] Response status is 200: `✅ Icon update result: { status: 200 }`

### ✅ Refetch Phase
- [ ] Refetch triggered: `🔄 Refetching group data...`
- [ ] Previews cleared in logs
- [ ] New data loaded with NEW UUID: `📊 Group data loaded: { icon: "new-uuid" }`
- [ ] URLs constructed with new UUID: `🖼️ Image URLs: { iconUrl: "https://ucarecdn.com/new-uuid/" }`

### ✅ Render Phase
- [ ] Component renders with new data: `🎨 [GroupSettingsForm] Rendering`
- [ ] Preview is undefined: `previewIcon: undefined`
- [ ] DB icon is new UUID: `dbIcon: "new-uuid"`
- [ ] Final URL uses new UUID: `finalIconUrl: "https://ucarecdn.com/new-uuid/"`
- [ ] Image loads successfully: `✅ Icon loaded successfully`

---

## 📞 Next Steps Based on Findings

**If you see:**
1. **Upload fails** → Check Uploadcare API key and network
2. **UUID is undefined** → Check Uploadcare response structure
3. **Database update fails** → Check server logs and database
4. **Refetch shows old UUID** → Check database directly
5. **URL constructed but image doesn't load** → Test URL in browser
6. **Preview doesn't clear** → Check `onSuccess` callback execution

---

## 🎯 Expected Success Flow

```
Select File → Preview Appears
    ↓
Click Save → Upload Starts
    ↓
Upload Complete → UUID Received
    ↓
Save to DB → Server Confirms
    ↓
Refetch Data → New UUID Loaded
    ↓
Clear Preview → Render with DB URL
    ↓
Image Loads → SUCCESS! ✅
```

---

**Last Updated:** 2025-01-23
**Status:** Debugging Enhanced with Comprehensive Logging
