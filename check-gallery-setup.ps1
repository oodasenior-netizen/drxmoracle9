#!/usr/bin/env pwsh
# Media Upload & Gallery Test Script (Windows)
# Run this to verify your Supabase integration is working

Write-Host "🔧 Oracle8 Gallery Integration Checklist" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check .env.local
Write-Host "✓ Checking .env.local..." -ForegroundColor Yellow
if (Test-Path ".\.env.local") {
    $envContent = Get-Content ".\.env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "  ✅ .env.local exists with SUPABASE_URL" -ForegroundColor Green
    } else {
        Write-Host "  ❌ .env.local missing SUPABASE_URL" -ForegroundColor Red
    }
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
        Write-Host "  ✅ .env.local exists with SUPABASE_ANON_KEY" -ForegroundColor Green
    } else {
        Write-Host "  ❌ .env.local missing SUPABASE_ANON_KEY" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ .env.local not found" -ForegroundColor Red
}
Write-Host ""

# 2. Check provisioning script
Write-Host "✓ Checking SQL provisioning script..." -ForegroundColor Yellow
if (Test-Path ".\scripts\007_oracle8_supabase_provisioning.sql") {
    Write-Host "  ✅ Provisioning script found at scripts/007_oracle8_supabase_provisioning.sql" -ForegroundColor Green
    Write-Host "  📋 Next step: Run this script in Supabase SQL Editor" -ForegroundColor Cyan
} else {
    Write-Host "  ❌ Provisioning script not found" -ForegroundColor Red
}
Write-Host ""

# 3. Check library files
Write-Host "✓ Checking library files..." -ForegroundColor Yellow
if (Test-Path ".\lib\supabase-gallery.ts") {
    Write-Host "  ✅ supabase-gallery.ts (with error handling)" -ForegroundColor Green
} else {
    Write-Host "  ❌ supabase-gallery.ts not found" -ForegroundColor Red
}

if (Test-Path ".\lib\supabase\client.ts") {
    Write-Host "  ✅ supabase/client.ts" -ForegroundColor Green
} else {
    Write-Host "  ❌ supabase/client.ts not found" -ForegroundColor Red
}

if (Test-Path ".\lib\firebase.ts") {
    Write-Host "  ✅ firebase.ts" -ForegroundColor Green
} else {
    Write-Host "  ❌ firebase.ts not found" -ForegroundColor Red
}
Write-Host ""

# 4. Check dependencies
Write-Host "✓ Checking dependencies..." -ForegroundColor Yellow
$packageJson = Get-Content ".\package.json" -Raw
if ($packageJson -match "@supabase/supabase-js") {
    Write-Host "  ✅ @supabase/supabase-js installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  @supabase/supabase-js not in package.json" -ForegroundColor Yellow
}

if ($packageJson -match "firebase") {
    Write-Host "  ✅ Firebase installed" -ForegroundColor Green
} else {
    Write-Host "  ❌ Firebase not in package.json" -ForegroundColor Red
}
Write-Host ""

Write-Host "📋 SETUP CHECKLIST:" -ForegroundColor Cyan
Write-Host "1. [ ] .env.local created with Supabase credentials"
Write-Host "2. [ ] Ran SQL provisioning script in Supabase dashboard"
Write-Host "3. [ ] Logged in to Firebase"
Write-Host "4. [ ] Started dev server: npm run dev"
Write-Host "5. [ ] Navigated to: /characters/[id]/edit"
Write-Host "6. [ ] Opened browser console (F12)"
Write-Host "7. [ ] Pasted a media URL in gallery section"
Write-Host "8. [ ] Checked console for [v0] messages"
Write-Host "9. [ ] Verified no errors about 'Supabase not configured'"
Write-Host "10. [ ] Items appeared in gallery list"
Write-Host ""

Write-Host "🧪 TEST URLS (for gallery testing):" -ForegroundColor Cyan
Write-Host "- Image: https://picsum.photos/400/300"
Write-Host "- Video: https://files.catbox.moe/example.mp4"
Write-Host "- YouTube: https://youtube.com/watch?v=dQw4w9WgXcQ"
Write-Host "- Imgur: https://imgur.com/gallery/abcd123"
Write-Host ""

Write-Host "🆘 If gallery still shows loading spinner:" -ForegroundColor Yellow
Write-Host "1. Open browser Developer Tools (F12)"
Write-Host "2. Go to Console tab"
Write-Host "3. Look for messages starting with [v0]"
Write-Host "4. Common issues:"
Write-Host "   - 'Supabase environment variables not configured'"
Write-Host "   - 'No Firebase user authenticated'"
Write-Host "   - 'Error fetching gallery items'"
Write-Host "5. Copy the full error message and check SUPABASE_SETUP.md"
Write-Host ""

Write-Host "✅ Setup instructions: See SUPABASE_SETUP.md" -ForegroundColor Green
