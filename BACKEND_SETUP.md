# 🚀 Complete Backend Setup Guide

This guide will walk you through setting up the complete backend infrastructure for NuruOS Field Intelligence in **30 minutes**.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Google account (for Sheets)
- Cloudflare account (free tier OK)

---

## ⚡ Quick Setup (5 Steps)

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Generate JWT Secret

```bash
# On macOS/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the output - you'll need it for `.env`

---

### Step 3: Set Up Cloudflare R2 (5 minutes)

**Create Bucket:**

1. Go to https://dash.cloudflare.com/
2. Click "R2" in sidebar
3. Click "Create bucket"
4. Name: `nuruos-audits`
5. Click "Create bucket"

**Enable Public Access:**

1. Click on your bucket
2. Settings → Public access
3. Click "Allow Access"
4. Copy the Public bucket URL (e.g., `https://pub-abc123.r2.dev`)

**Create API Token:**

1. Go back to R2 main page
2. Click "Manage R2 API Tokens"
3. Click "Create API token"
4. Token name: `nuruos-backend`
5. Permissions: "Admin Read & Write"
6. Click "Create API token"
7. **IMPORTANT:** Copy all three values:
   - Access Key ID
   - Secret Access Key
   - Account ID (shown at top)

**Don't close this page until you've saved the credentials!**

---

### Step 4: Set Up Google Sheets (10 minutes)

**A. Create Service Account:**

1. Go to https://console.cloud.google.com/
2. Create new project:
   - Click project dropdown → "New Project"
   - Name: `NuruOS Backend`
   - Click "Create"
3. Enable Google Sheets API:
   - Click "Enable APIs and Services"
   - Search "Google Sheets API"
   - Click "Enable"
4. Create Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `nuruos-sheets`
   - Click "Create and Continue"
   - Skip roles (click "Continue")
   - Click "Done"
5. Create Key:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON"
   - Click "Create" (downloads a JSON file)

**B. Create Google Sheet:**

1. Go to https://sheets.google.com/
2. Create new spreadsheet
3. Name it: `NuruOS Audits Database`
4. Create two sheets (tabs):
   - Rename "Sheet1" to `Farm Audits`
   - Add new sheet, name it `Business Audits`
5. Add headers to both sheets (Row 1, columns A-J):
   ```
   Audit ID | Date | Auditor | Business Name | Location | Latitude | Longitude | Status | Data | Sync Time
   ```
6. Share with service account:
   - Click "Share" button (top right)
   - Paste the email from the JSON file (`client_email` field)
   - Give "Editor" access
   - Uncheck "Notify people"
   - Click "Share"
7. Copy Sheet ID from URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the `SHEET_ID_HERE` part

---

### Step 5: Configure Environment

**Create `.env` file:**

```bash
cd backend
cp .env.example .env
nano .env  # or use any text editor
```

**Fill in all values:**

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT (from Step 2)
JWT_SECRET=paste_your_generated_secret_here
JWT_EXPIRES_IN=7d

# Cloudflare R2 (from Step 3)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=nuruos-audits
R2_PUBLIC_URL=https://pub-abc123.r2.dev

# Google Sheets (from Step 4 JSON file)
GOOGLE_CLIENT_EMAIL=nuruos-sheets@nuruos-backend.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1abc123def456

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important Notes:**
- For `GOOGLE_PRIVATE_KEY`: Copy entire value from JSON file's `private_key` field (including quotes and `\n`)
- Make sure there are NO spaces around the `=` signs
- Keep the quotes around the private key

---

## ✅ Test Your Setup

**1. Start Backend:**

```bash
cd backend
npm run dev
```

You should see:
```
🚀 NuruOS Backend Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: development
Port: 3001
Frontend: http://localhost:5173
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**2. Test Health Endpoint:**

Open new terminal:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","timestamp":"2026-01-23T..."}
```

**3. Test R2 Upload:**

```bash
curl -X POST http://localhost:3001/api/upload/presign \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg"}'
```

If you get "No token provided" - that's OK! Authentication is working.

**4. Start Frontend:**

Open another terminal:
```bash
cd ..  # back to project root
npm run dev
```

Frontend runs on http://localhost:5173

---

## 🔗 Connect Frontend to Backend

**Update Frontend `.env.local`:**

```bash
cd ..  # project root
cp .env.example .env.local
nano .env.local
```

Add:
```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_API_BASE_URL=http://localhost:3001
```

**Restart frontend** (`npm run dev`)

---

## 🎯 Complete Test Flow

**1. Login:**
- Open http://localhost:5173
- Click "Sign In"
- Use demo credentials (or register new user)

**2. Create Audit:**
- Click "New Audit" → "Farm Audit"
- Fill in basic info
- Take a photo (allows camera access)
- Save draft

**3. Sync:**
- Click "Sync" button
- Backend uploads images to R2
- Backend writes data to Google Sheets
- Check your Google Sheet - you should see the data!

---

## 🐛 Troubleshooting

### Backend won't start

**Error: "JWT_SECRET not found"**
```bash
# Check .env file exists
ls -la backend/.env

# If missing:
cd backend
cp .env.example .env
# Then edit and add JWT_SECRET
```

**Error: "Cannot find module"**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

### R2 Upload Fails

**Error: "Access Denied"**
- Check `R2_ACCOUNT_ID` matches your account
- Verify API token has "Admin Read & Write" permissions
- Make sure bucket is set to "Allow Public Access"

**Test R2 directly:**
```bash
curl https://pub-abc123.r2.dev/test.txt
# Should return 404 (bucket is working) or the file if it exists
```

---

### Google Sheets Fails

**Error: "Permission denied"**
- Make sure you shared the sheet with service account email
- Check the email matches `GOOGLE_CLIENT_EMAIL` in .env
- Verify editor permissions were granted

**Error: "Invalid private key"**
- Make sure private key includes `\n` characters
- Keep quotes around the entire key
- Copy directly from JSON file

**Test Sheets Access:**
1. Go to your Google Sheet
2. Check "Last edit" timestamp
3. Should show service account email when backend syncs

---

### CORS Errors

**Error: "CORS policy blocked"**
- Make sure `FRONTEND_URL` in backend `.env` matches frontend URL
- Restart backend after changing `.env`
- Clear browser cache

---

## 📊 Monitor Your Setup

**Backend Logs:**
```bash
cd backend
npm run dev
# Watch console for sync activity
```

**R2 Usage:**
- Go to Cloudflare Dashboard → R2 → Your Bucket
- Check "Metrics" tab

**Google Sheets:**
- Open your sheet
- See new rows appear when audits sync
- Check "Version history" for all changes

---

## 🚀 Deploy to Production

See `backend/README.md` for deployment options:
- Railway (easiest) - $5/month
- Render (free tier available)
- DigitalOcean - $5/month

**Don't forget to:**
1. Update `FRONTEND_URL` to production URL
2. Set `NODE_ENV=production`
3. Enable HTTPS
4. Add a real user database (replace in-memory users)

---

## 💰 Cost Summary

**Development (FREE):**
- Cloudflare R2: FREE (10GB + 10M requests/month)
- Google Sheets: FREE
- Local development: FREE

**Production (~$5-10/month):**
- Backend server: $5/month (Railway/DigitalOcean)
- Cloudflare R2: FREE tier sufficient for MVP
- Google Sheets: FREE

**Total Setup Time:** 30 minutes
**Monthly Cost:** $0 (dev) or $5-10 (production)

---

## ✅ Setup Complete!

You now have:
- ✅ Express backend with JWT auth
- ✅ Cloudflare R2 image storage
- ✅ Google Sheets data sync
- ✅ CORS configured
- ✅ Rate limiting enabled
- ✅ Production-ready architecture

**Next Steps:**
1. Test the complete audit flow
2. Customize authentication (add real user DB)
3. Deploy to production
4. Monitor usage and costs

**Questions?** Check `backend/README.md` or create GitHub issue

---

**Status:** ✅ BACKEND READY  
**Created:** January 23, 2026  
**Version:** 1.0.0
