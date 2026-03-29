# ✅ Complete Setup Checklist

Use this checklist to track your backend setup progress.

---

## 📋 Pre-Setup

- [ ] Node.js 18+ installed
- [ ] Google account created
- [ ] Cloudflare account created (free)
- [ ] Text editor ready (VS Code recommended)
- [ ] Terminal open

---

## 🔧 Backend Setup

### Installation
- [ ] Navigated to `backend` folder
- [ ] Ran `npm install`
- [ ] Copied `.env.example` to `.env`

### JWT Secret
- [ ] Generated secret with `openssl rand -base64 32`
- [ ] Added to `.env` → `JWT_SECRET`

### Cloudflare R2
- [ ] Created account at https://dash.cloudflare.com
- [ ] Created R2 bucket named `nuruos-audits`
- [ ] Enabled public access on bucket
- [ ] Copied public bucket URL
- [ ] Created API token with "Admin Read & Write"
- [ ] Saved credentials:
  - [ ] R2_ACCOUNT_ID
  - [ ] R2_ACCESS_KEY_ID
  - [ ] R2_SECRET_ACCESS_KEY
  - [ ] R2_BUCKET_NAME
  - [ ] R2_PUBLIC_URL

### Google Sheets
- [ ] Created project at https://console.cloud.google.com
- [ ] Enabled Google Sheets API
- [ ] Created service account
- [ ] Downloaded JSON key file
- [ ] Created Google Sheet with two tabs:
  - [ ] "Farm Audits"
  - [ ] "Business Audits"
- [ ] Added headers to both sheets
- [ ] Shared sheet with service account email
- [ ] Copied sheet ID from URL
- [ ] Saved credentials:
  - [ ] GOOGLE_CLIENT_EMAIL
  - [ ] GOOGLE_PRIVATE_KEY
  - [ ] GOOGLE_SHEET_ID

### Configuration
- [ ] All values in `.env` filled out
- [ ] No placeholder values remaining
- [ ] Private key includes `\n` characters
- [ ] Saved `.env` file

---

## 🧪 Testing

### Backend
- [ ] Started backend: `npm run dev`
- [ ] Server shows "Running" message
- [ ] Health check works: `curl http://localhost:3001/health`
- [ ] No errors in console

### Frontend
- [ ] Updated frontend `.env.local`:
  - [ ] VITE_GEMINI_API_KEY
  - [ ] VITE_API_BASE_URL=http://localhost:3001
- [ ] Started frontend: `npm run dev` (from root)
- [ ] Frontend loads at http://localhost:5173
- [ ] No CORS errors in browser console

### Integration
- [ ] Can login from frontend
- [ ] Can create new audit
- [ ] Can upload photo
- [ ] Photo appears in R2 bucket
- [ ] Can sync audit
- [ ] Audit appears in Google Sheet
- [ ] All data fields correct

---

## 🚀 Deployment (Optional)

### Preparation
- [ ] Chose deployment platform (Railway/Render/DO)
- [ ] Created account on platform
- [ ] Pushed code to GitHub (if using Render/DO)

### Configuration
- [ ] Set all environment variables on platform
- [ ] Updated `FRONTEND_URL` to production URL
- [ ] Set `NODE_ENV=production`
- [ ] Configured custom domain (optional)

### Testing
- [ ] Backend deployed successfully
- [ ] Health endpoint accessible
- [ ] SSL certificate active (HTTPS)
- [ ] Frontend connects to backend
- [ ] Full audit flow works in production

---

## 📊 Monitoring Setup (Optional)

- [ ] Added Sentry for error tracking
- [ ] Set up Cloudflare R2 analytics alerts
- [ ] Configured Google Sheets notifications
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Added performance monitoring

---

## 🔒 Security Review

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] `.env` file NOT committed to git
- [ ] `.env.local` NOT committed to git
- [ ] CORS allows only frontend domain
- [ ] Rate limiting enabled
- [ ] HTTPS enabled in production
- [ ] Service account permissions minimal
- [ ] R2 bucket public access intentional
- [ ] No hardcoded secrets in code

---

## 📚 Documentation Review

- [ ] Read `BACKEND_SETUP.md`
- [ ] Bookmarked `backend/README.md`
- [ ] Understand API endpoints
- [ ] Know how to check logs
- [ ] Know how to troubleshoot errors

---

## ✅ Final Checks

- [ ] Backend running without errors
- [ ] Frontend connected to backend
- [ ] Can create and sync audits
- [ ] Images upload to R2
- [ ] Data syncs to Google Sheets
- [ ] Authentication works
- [ ] No console errors
- [ ] Ready for production

---

## 🎉 Completion

**Setup Status:** _____% Complete

**Estimated Time:**
- Backend Setup: ____ minutes
- Testing: ____ minutes
- Deployment: ____ minutes (if applicable)
- **Total: ____ minutes**

**Blockers/Issues:**
- _____________________
- _____________________

**Notes:**
- _____________________
- _____________________

---

**Date Completed:** _____________________  
**Deployed URL:** _____________________  
**Next Steps:** _____________________

---

## 📞 Need Help?

- **Setup Issues:** `BACKEND_SETUP.md`
- **API Questions:** `backend/README.md`
- **Quick Reference:** `QUICK_BACKEND_SETUP.md`
- **Complete Guide:** `BACKEND_COMPLETE.md`

**All documentation is in your project folder!**
