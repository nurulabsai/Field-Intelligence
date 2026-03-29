# NuruOS Backend API

Complete backend server for NuruOS Field Intelligence with JWT authentication, Cloudflare R2 storage, and Google Sheets integration.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

---

## 🔧 Configuration Guide

### Step 1: JWT Secret

Generate a secure JWT secret:

```bash
openssl rand -base64 32
```

Add to `.env`:
```env
JWT_SECRET=your_generated_secret_here
```

---

### Step 2: Cloudflare R2 Setup

**Create R2 Bucket:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → R2
2. Click "Create bucket" → Name it `nuruos-audits`
3. Enable public access (Settings → Public access → Allow)

**Get API Credentials:**

1. Go to R2 → Manage R2 API Tokens
2. Click "Create API token"
3. Select "Admin Read & Write" permissions
4. Copy the credentials

**Configure `.env`:**

```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=nuruos-audits
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

**Get Public URL:**
- Go to bucket settings → Public URL
- Copy the URL (format: `https://pub-xxxxx.r2.dev`)

**Cost:** FREE for first 10GB storage + 10 million requests/month

---

### Step 3: Google Sheets Setup

**Create Service Account:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project (or select existing)
3. Enable Google Sheets API:
   - APIs & Services → Enable APIs → Google Sheets API → Enable
4. Create Service Account:
   - IAM & Admin → Service Accounts → Create
   - Name: `nuruos-sheets-service`
   - Grant role: "Editor"
5. Create JSON key:
   - Click on service account → Keys → Add Key → JSON
   - Download the JSON file

**Create Google Sheet:**

1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet named "NuruOS Audits"
3. Create two sheets (tabs):
   - `Farm Audits`
   - `Business Audits`
4. Add headers to both sheets (Row 1):
   ```
   Audit ID | Date | Auditor | Business Name | Location | Latitude | Longitude | Status | Data | Sync Time
   ```
5. Share sheet with service account email:
   - Click "Share" button
   - Add service account email (from JSON: `client_email`)
   - Give "Editor" permission
6. Copy Sheet ID from URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`

**Configure `.env`:**

```env
GOOGLE_CLIENT_EMAIL=nuruos-sheets-service@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1abc123def456ghi789
```

**Important:** Copy the entire private key from the JSON file, including `\n` newlines.

**Cost:** FREE

---

## 📡 API Endpoints

### Authentication

**POST `/api/auth/login`**
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "Demo User",
    "role": "auditor"
  }
}
```

**POST `/api/auth/register`** (optional)
```json
Request:
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

---

### Image Upload

**POST `/api/upload/presign`** (requires auth)
```json
Request:
{
  "fileName": "audit_photo.jpg",
  "contentType": "image/jpeg"
}

Response:
{
  "uploadUrl": "https://...", // Use this to upload file
  "publicUrl": "https://...", // Use this to display image
  "key": "audits/1234_abc_photo.jpg"
}
```

**Usage:**
```typescript
// 1. Get presigned URL
const { uploadUrl, publicUrl } = await fetch('/api/upload/presign', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ fileName: 'photo.jpg' })
}).then(r => r.json());

// 2. Upload file directly to R2
await fetch(uploadUrl, {
  method: 'PUT',
  body: imageBlob,
  headers: { 'Content-Type': 'image/jpeg' }
});

// 3. Save publicUrl to database
```

---

### Audit Sync

**POST `/api/audits/sync`** (requires auth)
```json
Request:
{
  "id": "audit_123",
  "type": "farm",
  "businessName": "Mpanda Farm",
  "location": {
    "latitude": -6.3690,
    "longitude": 34.8888
  },
  "status": "synced",
  "farmData": {
    "farmerName": "John Doe",
    "crops": [...],
    ...
  }
}

Response:
{
  "success": true,
  "message": "Audit synced to Google Sheets"
}
```

**POST `/api/audits/batch-sync`** (requires auth)
```json
Request: [audit1, audit2, audit3]

Response:
{
  "success": true,
  "message": "3 audits synced to Google Sheets"
}
```

---

## 🧪 Testing

**Test Health Endpoint:**
```bash
curl http://localhost:3001/health
```

**Test Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@nuruos.com","password":"demo123"}'
```

**Test Upload (with token):**
```bash
curl -X POST http://localhost:3001/api/upload/presign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg"}'
```

---

## 🚀 Deployment

### Option 1: Railway (Easiest)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway up
```

**Cost:** $5/month (500 hours)

---

### Option 2: Render

1. Push code to GitHub
2. Go to [Render Dashboard](https://render.com)
3. New → Web Service
4. Connect GitHub repo
5. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables from `.env`

**Cost:** FREE tier available

---

### Option 3: DigitalOcean App Platform

1. Go to [DigitalOcean](https://www.digitalocean.com)
2. Create App → Use existing repo
3. Select backend folder
4. Add environment variables
5. Deploy

**Cost:** $5/month

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Enable HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Review R2 bucket permissions
- [ ] Rotate Google Service Account keys regularly
- [ ] Enable rate limiting (already configured)
- [ ] Add database for user management (replace in-memory store)

---

## 📊 Monitoring

**View Logs:**
```bash
npm run dev  # Shows all console logs
```

**Production Monitoring:**
- Cloudflare R2: Dashboard → R2 → Analytics
- Google Sheets: File → Version history
- Server: Use Railway/Render built-in logs

---

## 🐛 Troubleshooting

### "JWT_SECRET not found"
```bash
# Make sure .env exists
cat .env | grep JWT_SECRET

# If empty, generate new secret
openssl rand -base64 32
```

### "R2 upload failed"
- Check `R2_ACCOUNT_ID` is correct
- Verify API token has "Admin Read & Write" permissions
- Test bucket is accessible: https://pub-xxxxx.r2.dev

### "Google Sheets permission denied"
- Make sure service account email has Editor access to sheet
- Check `GOOGLE_SHEET_ID` is correct
- Verify private key includes `\n` characters

### "CORS error from frontend"
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- Restart backend server after changing `.env`

---

## 📦 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment validation
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication
│   ├── routes/
│   │   ├── auth.ts             # Login/register
│   │   ├── upload.ts           # Presigned URLs
│   │   └── audits.ts           # Audit sync
│   ├── services/
│   │   ├── r2Storage.ts        # Cloudflare R2
│   │   └── googleSheets.ts     # Google Sheets
│   └── index.ts                # Main server
├── .env                        # Your config (not in git)
├── .env.example                # Template
├── package.json
└── tsconfig.json
```

---

**Status:** ✅ MVP Ready  
**Total Setup Time:** ~30 minutes  
**Monthly Cost:** FREE (with free tiers) or $5-10/month for production

For issues: See main project README or create GitHub issue
