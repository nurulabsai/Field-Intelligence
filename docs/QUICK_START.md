# 🚀 Quick Start Guide - NuruOS Field Intelligence

**5-Minute Setup for Developers**

---

## Step 1: Install Dependencies (1 min)

```bash
cd nuruos-field-intelligence
npm install
```

---

## Step 2: Configure API Key (2 min)

```bash
# Copy environment template
cp .env.example .env.local

# Open .env.local and add your Gemini API key
# Get free key from: https://aistudio.google.com/app/apikey
```

**Edit `.env.local`:**
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

---

## Step 3: Run Development Server (1 min)

```bash
npm run dev
```

**Open**: http://localhost:5173

---

## Step 4: Test Core Features (1 min)

1. **Sign In**: Click "Sign In" (demo mode, any name works)
2. **New Audit**: Click "New Audit" → "Farm Audit"
3. **Take Photo**: Click camera icon, allow permissions
4. **AI Analysis**: Watch AI analyze the image automatically
5. **Save Draft**: Form auto-saves to IndexedDB

---

## ✅ You're Done!

**What's Working:**
- ✅ Offline-first functionality
- ✅ AI image analysis (Gemini 2.0)
- ✅ Voice transcription
- ✅ GPS location capture
- ✅ Data validation
- ✅ Image compression
- ✅ IndexedDB storage

---

## 🔧 Common Issues

### Issue: "API key not configured"
```bash
# Make sure .env.local exists and has your key
cat .env.local

# Should show:
# VITE_GEMINI_API_KEY=your_key_here
```

### Issue: Camera not working
```bash
# Run on HTTPS or localhost
# Browsers require secure context for camera access
```

### Issue: AI analysis fails
```bash
# Check API key is valid
# Check internet connection (AI requires online)
# Check browser console for errors
```

---

## 📚 Next Steps

**Read Full Documentation:**
- `README.md` - Complete setup guide
- `IMPROVEMENTS.md` - All improvements and roadmap
- `COMPLETED_IMPROVEMENTS.md` - What's been done
- `IMPLEMENTATION_STATUS.md` - Current status

**Try Advanced Features:**
- Voice notes (microphone icon)
- Offline mode (disable network)
- Sync queue (enable network after offline edits)
- Export to JSON (admin panel)

---

## 🎯 File Structure

```
Important Files:
├── .env.local              ← Your API key here
├── src/
│   ├── App.tsx             ← Main app component
│   ├── services/
│   │   ├── geminiService.ts  ← AI integration
│   │   ├── storageService.ts ← IndexedDB
│   │   └── syncService.ts    ← Sync logic
│   └── utils/
│       ├── errorHandler.ts   ← Error handling
│       ├── imageCompression.ts ← Image utils
│       ├── validation.ts     ← Validators
│       └── constants.ts      ← App config
```

---

## 💡 Pro Tips

1. **Use Chrome DevTools** → Application → IndexedDB to inspect data
2. **Enable offline mode** → Network tab → Offline checkbox
3. **Check console** for AI processing logs
4. **Use React DevTools** to inspect component state

---

**Ready to build!** 🎉

For questions: Check `README.md` or `IMPROVEMENTS.md`
