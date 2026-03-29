# 🚀 Deploy Frontend - Get Live Link

Get your NuruOS app live in **5 minutes** with a public testing link!

---

## ⚡ Option 1: Vercel (Recommended - Fastest)

**Time:** 2 minutes  
**Cost:** FREE  
**Result:** `https://your-app.vercel.app`

### Steps:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy (from project root)
vercel --prod

# Follow prompts:
# - Setup project? Yes
# - Link to existing? No
# - Project name? nuruos-field-intelligence
# - Directory? ./
# - Override settings? No

# ✅ Done! You'll get: https://nuruos-field-intelligence.vercel.app
```

**Add Environment Variables:**
```bash
# After first deploy, add your API key:
vercel env add VITE_GEMINI_API_KEY production

# Redeploy to apply changes:
vercel --prod
```

---

## ⚡ Option 2: Netlify (Easy)

**Time:** 3 minutes  
**Cost:** FREE  
**Result:** `https://your-app.netlify.app`

### Steps:

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build the app
npm run build

# 3. Deploy
netlify deploy --prod

# Follow prompts:
# - Authorize? Yes
# - Create new site? Yes
# - Team? [Your team]
# - Site name? nuruos-field-intelligence
# - Publish directory? dist

# ✅ Done! You'll get: https://nuruos-field-intelligence.netlify.app
```

**Add Environment Variables:**
1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Add: `VITE_GEMINI_API_KEY`
4. Redeploy

---

## ⚡ Option 3: Cloudflare Pages (Fastest)

**Time:** 2 minutes  
**Cost:** FREE  
**Result:** `https://nuruos.pages.dev`

### Steps:

```bash
# 1. Build the app
npm run build

# 2. Deploy with Wrangler
npx wrangler pages deploy dist --project-name=nuruos-field-intelligence

# Follow prompts to login

# ✅ Done! You'll get: https://nuruos-field-intelligence.pages.dev
```

**Add Environment Variables:**
```bash
# Add via dashboard:
# 1. Go to https://dash.cloudflare.com/
# 2. Pages → Your project → Settings → Environment variables
# 3. Add: VITE_GEMINI_API_KEY
```

---

## ⚡ Option 4: GitHub Pages (Free)

**Time:** 5 minutes  
**Cost:** FREE  
**Result:** `https://yourusername.github.io/nuruos-field-intelligence`

### Steps:

```bash
# 1. Install gh-pages
npm install -D gh-pages

# 2. Add to package.json scripts:
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}

# 3. Update vite.config.ts base:
export default defineConfig({
  base: '/nuruos-field-intelligence/',
  // ... rest of config
})

# 4. Deploy
npm run deploy

# ✅ Done! Enable GitHub Pages in repo settings
```

---

## 🎯 Quick Comparison

| Platform | Time | Cost | Custom Domain | Auto Deploy |
|----------|------|------|---------------|-------------|
| **Vercel** | 2 min | FREE | Yes | Yes (Git) |
| **Netlify** | 3 min | FREE | Yes | Yes (Git) |
| **Cloudflare** | 2 min | FREE | Yes | Manual |
| **GitHub Pages** | 5 min | FREE | No | Manual |

**Recommendation:** Use **Vercel** for the easiest setup with Git integration.

---

## 📱 Test Your Deployed App

Once deployed, test these features:

1. **Open on mobile device**
   - Visit the URL on your phone
   - Install as PWA (Add to Home Screen)

2. **Test offline mode**
   - Open app
   - Turn off WiFi/data
   - Create audit
   - Turn WiFi back on
   - Click Sync

3. **Test AI features**
   - Take photo → AI analysis
   - Record voice → Transcription
   - Generate summary

4. **Share link**
   - Share URL with team
   - Anyone can access and test

---

## 🔧 Update Environment Variables

**For Vercel:**
```bash
vercel env add VITE_GEMINI_API_KEY production
vercel env add VITE_API_BASE_URL production

# Enter values when prompted
# Redeploy:
vercel --prod
```

**For Netlify:**
```bash
# Via dashboard:
# Settings → Environment variables → Add variable
# Then: Deploys → Trigger deploy
```

**For Cloudflare:**
```bash
# Via dashboard:
# Pages → Project → Settings → Environment variables
# Add variables, then redeploy
```

---

## 🌐 Add Custom Domain (Optional)

**Vercel:**
```bash
# Dashboard → Domains → Add Domain
# Follow DNS setup instructions
```

**Netlify:**
```bash
# Dashboard → Domain settings → Add custom domain
```

**Cloudflare Pages:**
```bash
# Dashboard → Custom domains → Set up custom domain
```

---

## 🚀 Continuous Deployment (Recommended)

**Connect to GitHub for auto-deploys:**

1. Push code to GitHub
2. Go to Vercel/Netlify dashboard
3. Import project from GitHub
4. Configure:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add environment variables
5. Deploy!

**Now every push to `main` automatically deploys!**

---

## ✅ Your Live Link Is Ready!

**Example URLs:**
- Vercel: `https://nuruos-field-intelligence.vercel.app`
- Netlify: `https://nuruos-field-intelligence.netlify.app`
- Cloudflare: `https://nuruos-field-intelligence.pages.dev`

**Share this link to:**
- Test on different devices
- Demo to stakeholders
- Get user feedback
- Show to investors

---

## 🐛 Troubleshooting

**Build fails:**
```bash
# Check locally first
npm run build

# If successful locally, check logs on platform
```

**Environment variables not working:**
```bash
# Make sure they start with VITE_
# Example: VITE_GEMINI_API_KEY (not GEMINI_API_KEY)
```

**404 on refresh:**
```bash
# Add to dist/_redirects (Netlify) or vercel.json (Vercel):
/* /index.html 200
```

---

**Questions?** Check platform docs:
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- Cloudflare: https://developers.cloudflare.com/pages
