# Supabase Integration & Setup Guide for Oracle8

## ✅ What Was Fixed

Your `.env.local` file has been created with your Supabase credentials. The character gallery should now connect properly.

### Updated Features:
1. **Environment Variables**: Added `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **Error Handling**: Gallery now shows meaningful error messages instead of infinite loading
3. **Firebase Integration**: Better Firebase auth state detection with automatic waiting for auth initialization
4. **Error Visibility**: Console logs now include detailed debugging information
5. **UI Feedback**: Edit page and chat page now show error states when gallery fails to load

---

## 🚀 Initial Setup Instructions

### Step 1: Provision Supabase Database

You need to run the SQL provisioning script in your Supabase dashboard:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Copy & paste the entire contents of: `scripts/007_oracle8_supabase_provisioning.sql`
4. Click **Run**

This creates:
- `character_gallery` table (stores embed codes, URLs, media)
- `user_profiles` table (optional, for user data)
- `character_metadata` table (optional, for stats)
- `character-gallery` storage bucket (for future file uploads)
- RLS policies for data security

**Expected Output**: No errors, all tables created successfully.

### Step 2: Verify Connection

Test your Supabase connection:

```bash
cd c:\Users\Administrator\Desktop\Oracle8

# Install dependencies (if not already done)
npm install
# or
pnpm install

# Start dev server
npm run dev
# or
pnpm dev
```

1. Go to `http://localhost:3000`
2. **Log in with Firebase** (your existing login)
3. Navigate to **Characters** → Select a character → **Edit**
4. Scroll to **Character Gallery** section
5. Try adding a media URL:
   - `https://files.catbox.moe/abc123.mp4`
   - `https://youtube.com/watch?v=dQw4w9WgXcQ`
   - Or any direct image URL

**If it works**: Congratulations! 🎉

**If it shows an error**: Check the browser console (F12) → Console tab for detailed error messages.

---

## 🔍 Troubleshooting

### Issue: "Loading gallery..." spinner persists

**Check**:
1. **Browser Console** (F12 → Console tab):
   - Look for `[v0]` prefixed messages
   - Common errors:
     - `"Supabase environment variables not configured"` → `.env.local` not created properly
     - `"No Firebase user authenticated"` → Not logged in to Firebase
     - `"Error fetching gallery items:"` → Supabase connection failed

2. **Network Tab** (F12 → Network):
   - Look for requests to `faqsidhpiinibgwbqzow.supabase.co`
   - Should see `200 OK` responses

3. **Verify .env.local exists**:
   ```bash
   cat c:\Users\Administrator\Desktop\Oracle8\.env.local
   ```
   Should show:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://faqsidhpiinibgwbqzow.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_d_iAusL39hCVP5tZFDU0-A_MlKWty5Z
   ```

### Issue: "Error: Relation 'character_gallery' does not exist"

**Fix**: The SQL provisioning script wasn't run. Follow **Step 1** above.

### Issue: Adding items works, but they don't appear in gallery

**Check**:
1. Make sure you're viewing the gallery while **logged in as the same user**
2. Check Supabase dashboard → Table Editor → `character_gallery`
3. Verify your items have:
   - `user_id` matching your Firebase UID
   - `character_id` matching the character you're editing

### Issue: Firebase user not detected

**Fix**:
1. Make sure you're logged in to the app
2. Check browser console for Firebase errors
3. Try refreshing the page (`F5`)
4. Clear browser cache and cookies, log in again

---

## 📊 Database Structure

### character_gallery table
```sql
id (UUID)                -- Auto-generated ID
character_id (TEXT)      -- Links to character
user_id (TEXT)           -- Firebase UID
embed_code (TEXT)        -- URL or iframe HTML
media_type (TEXT)        -- 'image' | 'video' | 'embed'
created_at (TIMESTAMP)   -- Auto-set
updated_at (TIMESTAMP)   -- Auto-set
```

### Example queries to test in Supabase SQL Editor:

```sql
-- View all gallery items
SELECT * FROM character_gallery;

-- View items for a specific character
SELECT * FROM character_gallery 
WHERE character_id = 'your-character-id-here';

-- View items for a specific user
SELECT * FROM character_gallery 
WHERE user_id = 'your-firebase-uid-here';

-- Count total items
SELECT COUNT(*) as total_items FROM character_gallery;
```

---

## 🔐 Security Notes

### Current Setup (Development):
- RLS policies are **permissive** (allow all authenticated reads)
- Data ownership is enforced in **application code** (checks `user_id`)
- Firebase users are trusted (no JWT validation yet)

### For Production:
Implement proper Row Level Security (RLS) with Firebase JWT validation:

```sql
-- Create a function to validate Firebase JWT
CREATE OR REPLACE FUNCTION verify_firebase_user(firebase_uid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- In production, validate the Firebase JWT token here
  -- For now, we trust the user_id from the client
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to use validation
CREATE POLICY "enforce_user_ownership"
  ON public.character_gallery FOR SELECT
  USING (user_id = auth.uid());
```

---

## 🎬 API Reference

### Adding Gallery Items

**From Edit Page**:
```tsx
// Paste URL or embed code in the textarea
// Click "Add" button
// Items are automatically uploaded to Supabase
```

**From Code**:
```typescript
import { addGalleryItem, bulkAddGalleryItems } from '@/lib/supabase-gallery';

// Add single item
const item = await addGalleryItem(
  characterId,
  'https://example.com/image.jpg',
  'image'
);

// Bulk add items
const items = await bulkAddGalleryItems(characterId, [
  { embedCode: 'https://youtube.com/watch?v=...', mediaType: 'embed' },
  { embedCode: 'https://example.com/video.mp4', mediaType: 'video' },
]);
```

### Fetching Gallery Items

```typescript
import { getGalleryItems } from '@/lib/supabase-gallery';

const items = await getGalleryItems(characterId);
// Returns: GalleryItem[]
```

### Deleting Gallery Items

```typescript
import { deleteGalleryItem } from '@/lib/supabase-gallery';

const success = await deleteGalleryItem(itemId);
// Returns: boolean
```

---

## 📝 Configuration Files

### `.env.local` (Created)
Stores Supabase credentials. **Keep this file private!**

**DO NOT commit to git** - add to `.gitignore`:
```
.env.local
.env.*.local
```

### `lib/supabase/client.ts`
Initializes Supabase client using environment variables.

### `lib/supabase-gallery.ts`
Gallery CRUD operations with Firebase auth integration.

---

## 🛠️ Next Steps

1. ✅ **Run provisioning script** (SQL)
2. ✅ **Test gallery upload** (Edit page)
3. ✅ **Test gallery view** (Chat page)
4. 📧 **Optional**: Set up email notifications
5. 🔐 **Optional**: Implement server-side token validation
6. 📊 **Optional**: Add analytics/logging

---

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Next.js SSR with Supabase](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

## 🆘 Still Having Issues?

Check these in order:

1. **Browser Console** (`F12` → Console):
   - Copy all `[v0]` messages
   - Look for red error messages

2. **Network Tab** (`F12` → Network):
   - Filter for `supabase.co` requests
   - Check response status and body

3. **Supabase Dashboard**:
   - Go to **Logs** → **API** to see raw requests
   - Check **Realtime** section for connection status

4. **Firebase Console**:
   - Verify your user is authenticated
   - Check Auth section for your Firebase UID

5. **Restart dev server**:
   ```bash
   # Kill the dev server (Ctrl+C)
   # Restart it
   npm run dev
   ```

---

**Last Updated**: January 1, 2026
**Status**: ✅ Ready for Testing
