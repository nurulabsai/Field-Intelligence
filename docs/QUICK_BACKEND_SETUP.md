# ⚡ Quick Backend Setup (5 Commands)

Copy-paste these commands to get your backend running in 5 minutes:

---

## 1️⃣ Install & Configure

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

---

## 2️⃣ Generate JWT Secret

```bash
# Generate secret (copy the output)
openssl rand -base64 32
```

Paste output into `.env` → `JWT_SECRET=paste_here`

---

## 3️⃣ Get Cloudflare R2 Credentials

**Quick Steps:**
1. Go to: https://dash.cloudflare.com/ → R2
2. Create bucket: `nuruos-audits`
3. Settings → Allow Public Access
4. Copy Public URL
5. Manage R2 API Tokens → Create
6. Copy: Account ID, Access Key, Secret Key

**Add to `.env`:**
```env
R2_ACCOUNT_ID=abc123
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=nuruos-audits
R2_PUBLIC_URL=https://pub-abc123.r2.dev
```

---

## 4️⃣ Get Google Sheets Credentials

**Quick Steps:**
1. Go to: https://console.cloud.google.com/
2. New Project → "NuruOS Backend"
3. Enable APIs → "Google Sheets API" → Enable
4. IAM → Service Accounts → Create
5. Add Key → JSON → Download
6. Create sheet at: https://sheets.google.com/
7. Share with service account email (from JSON)
8. Copy Sheet ID from URL

**Add to `.env`:**
```env
GOOGLE_CLIENT_EMAIL=email_from_json
GOOGLE_PRIVATE_KEY="private_key_from_json"
GOOGLE_SHEET_ID=sheet_id_from_url
```

---

## 5️⃣ Start Backend

```bash
npm run dev
```

You should see:
```
🚀 NuruOS Backend Server Running
Port: 3001
```

**Test it:**
```bash
curl http://localhost:3001/health
```

---

## ✅ Done!

Backend is running on `http://localhost:3001`

**Next:** Update frontend `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3001
```

**Full Guide:** See `BACKEND_SETUP.md` for detailed instructions

---

**Total Time:** 5-10 minutes  
**Cost:** FREE (using free tiers)
