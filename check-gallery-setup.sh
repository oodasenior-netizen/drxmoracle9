#!/bin/bash
# Media Upload & Gallery Test Script
# Run this to verify your Supabase integration is working

echo "🔧 Oracle8 Gallery Integration Checklist"
echo "========================================"
echo ""

# 1. Check .env.local
echo "✓ Checking .env.local..."
if [ -f ".env.local" ]; then
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "  ✅ .env.local exists with SUPABASE_URL"
    else
        echo "  ❌ .env.local missing SUPABASE_URL"
    fi
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "  ✅ .env.local exists with SUPABASE_ANON_KEY"
    else
        echo "  ❌ .env.local missing SUPABASE_ANON_KEY"
    fi
else
    echo "  ❌ .env.local not found"
fi
echo ""

# 2. Check provisioning script
echo "✓ Checking SQL provisioning script..."
if [ -f "scripts/007_oracle8_supabase_provisioning.sql" ]; then
    echo "  ✅ Provisioning script found at scripts/007_oracle8_supabase_provisioning.sql"
    echo "  📋 Next step: Run this script in Supabase SQL Editor"
else
    echo "  ❌ Provisioning script not found"
fi
echo ""

# 3. Check library files
echo "✓ Checking library files..."
if [ -f "lib/supabase-gallery.ts" ]; then
    echo "  ✅ supabase-gallery.ts (with error handling)"
else
    echo "  ❌ supabase-gallery.ts not found"
fi

if [ -f "lib/supabase/client.ts" ]; then
    echo "  ✅ supabase/client.ts"
else
    echo "  ❌ supabase/client.ts not found"
fi

if [ -f "lib/firebase.ts" ]; then
    echo "  ✅ firebase.ts"
else
    echo "  ❌ firebase.ts not found"
fi
echo ""

# 4. Check dependencies
echo "✓ Checking dependencies..."
if grep -q "@supabase/supabase-js" package.json; then
    echo "  ✅ @supabase/supabase-js installed"
else
    echo "  ⚠️  @supabase/supabase-js not in package.json"
fi

if grep -q "firebase" package.json; then
    echo "  ✅ Firebase installed"
else
    echo "  ❌ Firebase not in package.json"
fi
echo ""

echo "📋 SETUP CHECKLIST:"
echo "1. [ ] .env.local created with Supabase credentials"
echo "2. [ ] Ran SQL provisioning script in Supabase dashboard"
echo "3. [ ] Logged in to Firebase"
echo "4. [ ] Started dev server: npm run dev"
echo "5. [ ] Navigated to: /characters/[id]/edit"
echo "6. [ ] Opened browser console (F12)"
echo "7. [ ] Pasted a media URL in gallery section"
echo "8. [ ] Checked console for [v0] messages"
echo "9. [ ] Verified no errors about 'Supabase not configured'"
echo "10. [ ] Items appeared in gallery list"
echo ""

echo "🧪 TEST URLS (for gallery testing):"
echo "- Image: https://picsum.photos/400/300"
echo "- Video: https://files.catbox.moe/example.mp4"
echo "- YouTube: https://youtube.com/watch?v=dQw4w9WgXcQ"
echo "- Imgur: https://imgur.com/gallery/abcd123"
echo ""

echo "🆘 If gallery still shows loading spinner:"
echo "1. Open browser Developer Tools (F12)"
echo "2. Go to Console tab"
echo "3. Look for messages starting with [v0]"
echo "4. Common issues:"
echo "   - 'Supabase environment variables not configured'"
echo "   - 'No Firebase user authenticated'"
echo "   - 'Error fetching gallery items'"
echo "5. Copy the full error message and check SUPABASE_SETUP.md"
echo ""

echo "✅ Setup instructions: See SUPABASE_SETUP.md"
