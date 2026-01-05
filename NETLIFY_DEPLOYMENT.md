# Netlify Deployment Guide for DrxMoracle9

## ✅ Repository Status
- **GitHub Repository**: Successfully pushed and up to date
- **Branch**: master
- **Latest Commit**: Netlify configuration updated for Next.js

---

## 📦 Deployment Configuration

### Folder Structure
**Deploy from**: Root directory (`/`)
**Build output**: `.next` (automatically handled by Netlify Next.js plugin)

### Build Settings
```
Build command: npm run build
Publish directory: .next
Node version: 20
```

---

## 🚀 Netlify Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify**: https://app.netlify.com/
2. **Click "Add new site" → "Import an existing project"**
3. **Connect to GitHub**:
   - Select: `oodasenior-netizen/drxmoracle9`
   - Branch: `master`
4. **Build settings** (auto-detected from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `20`
5. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://daphamdpuwmvmvyqsepu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_2CwCqzAKZeX0S0ecDQaUjw_m0jqQCrs
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_IqZccVSwkaJoDjEbgVxkRA_bHhieJay
   ```
6. **Click "Deploy site"**

### Option 2: Deploy via Netlify CLI

```powershell
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Or deploy manually
netlify deploy --prod
```

---

## 🔐 Required Environment Variables

Add these in **Netlify Dashboard → Site Settings → Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://daphamdpuwmvmvyqsepu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_2CwCqzAKZeX0S0ecDQaUjw_m0jqQCrs
SUPABASE_SERVICE_ROLE_KEY=sb_secret_IqZccVSwkaJoDjEbgVxkRA_bHhieJay
```

**Note**: Firebase configuration is hardcoded in `lib/firebase.ts` - no environment variables needed for Firebase.

---

## 📋 Pre-Deployment Checklist

✅ **GitHub repository pushed**: Yes  
✅ **Netlify configuration (netlify.toml)**: Updated  
✅ **Next.js build command**: Configured (`npm run build`)  
✅ **Supabase credentials**: Updated in .env.local (add to Netlify)  
✅ **Firebase credentials**: Hardcoded in lib/firebase.ts  
✅ **Database migrations**: character_gallery table exists  
✅ **Node version**: 20 specified  

---

## 🔧 Build Configuration Details

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### next.config.mjs
```javascript
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
```

---

## 🎯 What to Deploy

**Root Folder**: `C:\Users\Administrator\Documents\GitHub\drxmoracle9`

Netlify will automatically:
- Clone your GitHub repository
- Install dependencies (`npm install`)
- Run build command (`npm run build`)
- Deploy the `.next` output folder
- Enable Next.js server-side features via the Netlify plugin

---

## 🧪 Post-Deployment Testing

After deployment, test these features:
1. **Authentication**: Firebase login should work
2. **Character Gallery**: Supabase integration
3. **PWA**: Service worker and manifest
4. **Routing**: All Next.js pages load correctly

---

## ⚠️ Important Notes

1. **Environment Variables**: Must be added in Netlify Dashboard (not committed to GitHub)
2. **Build Time**: First build may take 5-10 minutes
3. **Continuous Deployment**: Enabled automatically - every push to `master` triggers a new build
4. **Domain**: Netlify provides a free subdomain (e.g., `drxmoracle9.netlify.app`)
5. **HTTPS**: Automatically enabled by Netlify

---

## 🔗 Useful Links

- **Netlify Dashboard**: https://app.netlify.com/
- **Next.js on Netlify**: https://docs.netlify.com/frameworks/next-js/
- **Your GitHub Repo**: https://github.com/oodasenior-netizen/drxmoracle9

---

## 📞 Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Verify all environment variables are set
- Ensure Node version is 20

### Functions Not Working
- Next.js API routes are automatically converted to Netlify Functions
- Check function logs in Netlify dashboard

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase dashboard for RLS policies
- Test connection locally first

---

**Ready to Deploy!** 🚀
