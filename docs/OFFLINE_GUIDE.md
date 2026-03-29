# 📱 Offline Mode User Guide

## ✅ Your App Already Works Offline!

NuruOS Field Intelligence is built as a **Progressive Web App (PWA)** with full offline capabilities. Auditors can complete entire audits without internet connection!

---

## 🎯 How Offline Mode Works

### **1. Automatic Offline Detection**
- App automatically detects when you're offline
- All features continue to work
- Data saves to your device (IndexedDB)
- Sync happens automatically when online

### **2. What Works Offline:**
✅ **Complete audits** (Farm & Business)
✅ **Capture photos** with camera
✅ **Record voice notes**
✅ **GPS location capture**
✅ **Save drafts** automatically
✅ **View saved audits**
✅ **Edit existing drafts**

### **3. What Requires Internet:**
⚠️ **AI Analysis** (image, voice transcription)
⚠️ **Sync to Google Sheets**
⚠️ **Upload images to cloud**

**Solution:** AI tasks queue automatically and process when you're back online!

---

## 📋 Step-by-Step: Complete Audit Offline

### **Step 1: Open App (Works Offline)**
```
Open app on your device
No internet needed - app loads from cache
```

### **Step 2: Start New Audit**
```
1. Click "New Audit"
2. Select "Farm Audit" or "Business Audit"
3. App works completely offline
```

### **Step 3: Fill Out Form**
```
✅ All form fields work offline
✅ GPS captures current location
✅ Validation happens locally
✅ Auto-saves as you type
```

### **Step 4: Capture Photos**
```
1. Click camera icon
2. Take photo (camera works offline)
3. Photo saves to device storage (IndexedDB)
4. AI analysis queued for when online
```

### **Step 5: Record Voice Notes**
```
1. Click microphone icon
2. Record your notes
3. Audio saves locally
4. Transcription queued for when online
```

### **Step 6: Save Audit**
```
1. Click "Save Draft" or "Complete Audit"
2. Data saves to IndexedDB (your device)
3. Status: "Pending Sync"
4. Audit accessible offline
```

### **Step 7: Get Back Online**
```
1. Connect to WiFi/mobile data
2. App auto-detects online status
3. Click "Sync" button
4. All pending audits upload automatically
```

---

## 🔄 Sync Process Explained

### **When You Go Online:**

**Automatic Process:**
1. ⏳ **Processes AI Queue**
   - Analyzes queued photos
   - Transcribes voice recordings
   
2. ⏳ **Uploads Images**
   - Uploads to Cloudflare R2
   - Clears local base64 data (frees space)
   - Saves public URLs

3. ⏳ **Syncs to Google Sheets**
   - Sends audit data
   - Updates sync status
   - Marks as "Synced"

**Manual Sync:**
```
Dashboard → Click "Sync" button
Shows progress: "Syncing 3 of 10 audits..."
```

---

## 💾 Data Storage Explained

### **Where Data is Stored:**

**IndexedDB (On Your Device):**
- Audit forms (all fields)
- Photos (compressed base64)
- Voice recordings
- GPS coordinates
- Draft status

**Size Limits:**
- Chrome: ~80% of device storage
- Safari: ~1GB
- Firefox: ~2GB

**Typical Storage:**
- 1 Audit with 5 photos: ~2-3 MB
- Can store 100+ audits offline

---

## 📱 Install as PWA (Recommended)

### **Why Install:**
- Works like native app
- Faster loading
- Better offline experience
- Home screen icon
- No browser chrome

### **How to Install:**

**Android (Chrome/Edge):**
1. Open app in browser
2. Tap menu (⋮)
3. Tap "Install app" or "Add to Home screen"
4. Tap "Install"
5. App appears on home screen

**iOS (Safari):**
1. Open app in Safari
2. Tap Share button (□↑)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"
5. App appears on home screen

**Desktop (Chrome/Edge):**
1. Look for install icon in address bar (⊕)
2. Click "Install"
3. App opens in window

---

## 🎯 Best Practices for Auditors

### **Before Going to Field:**
- [ ] Install app as PWA
- [ ] Open app while online (caches resources)
- [ ] Check storage space available
- [ ] Fully charge device
- [ ] Test camera/microphone permissions

### **While in Field (Offline):**
- [ ] Complete audits normally
- [ ] Take as many photos as needed
- [ ] Record voice notes
- [ ] Save drafts frequently (auto-saves)
- [ ] Don't close app until saved

### **After Returning (Online):**
- [ ] Connect to WiFi (faster than mobile data)
- [ ] Open app
- [ ] Click "Sync" button
- [ ] Wait for "All synced" message
- [ ] Verify in Google Sheets

---

## 🐛 Troubleshooting Offline Issues

### **"Storage quota exceeded"**
**Cause:** Too many photos stored locally

**Fix:**
```
1. Connect to internet
2. Click "Sync" to upload photos
3. After sync, photos are cleared from device
4. Space freed up automatically
```

### **"Audit not saving"**
**Cause:** Browser storage disabled

**Fix:**
```
1. Check browser settings
2. Enable cookies/storage
3. Clear cache and reload
4. Try again
```

### **"Can't sync audits"**
**Cause:** No internet or backend down

**Fix:**
```
1. Check internet connection
2. Wait and try again later
3. Audits remain safe on device
4. Will sync when connection restored
```

### **"Photos not uploading"**
**Cause:** Network timeout or large files

**Fix:**
```
1. Wait for better connection
2. App will retry automatically (up to 5 times)
3. Check backend logs if persists
```

---

## 📊 Check Sync Status

### **Dashboard Indicators:**

**Pending Sync Badge:**
```
🔴 "3 pending" - 3 audits waiting to sync
```

**Sync Status in Audit Card:**
```
⏸️  Draft - Not completed yet
⏳ Pending - Waiting to sync
✅ Synced - Uploaded to cloud
❌ Failed - Sync failed (will retry)
```

**Last Sync Time:**
```
"Last synced: 5 minutes ago"
```

---

## 🔐 Data Safety

### **Your Data is Safe:**
- ✅ Stored encrypted in IndexedDB
- ✅ Survives browser restart
- ✅ Survives device restart
- ✅ Auto-backed up when synced
- ✅ Can't be accessed by other websites

### **Data Cleared When:**
- ❌ You clear browser data manually
- ❌ You uninstall PWA (device storage cleared)
- ✅ After successful sync (images only, not audit data)

**Recommendation:** Sync daily to backup data!

---

## 📈 Storage Management

### **Check Storage Usage:**
```javascript
// Open browser console (F12)
navigator.storage.estimate().then(estimate => {
  console.log(`Used: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Available: ${(estimate.quota / 1024 / 1024).toFixed(2)} MB`);
});
```

### **Free Up Space:**
1. Sync pending audits (uploads and clears photos)
2. Delete old synced audits (if needed)
3. Clear browser cache (keep app data)

---

## ✅ Testing Offline Mode

### **Test Before Field Deployment:**

**Test 1: Offline Form**
```
1. Open app (online)
2. Turn off WiFi/data
3. Create new audit
4. Fill out form
5. Save audit
6. ✅ Should save successfully
```

**Test 2: Offline Photos**
```
1. While offline
2. Capture photo
3. Photo should save
4. Turn WiFi back on
5. Click sync
6. ✅ Photo should upload
```

**Test 3: Sync Recovery**
```
1. Create audit offline
2. Go online briefly (start sync)
3. Go offline mid-sync
4. Go online again
5. ✅ Sync should resume
```

---

## 🎓 Training Auditors

### **Quick Training Script:**

> "This app works completely offline. You can fill out the entire audit form, take photos, and record notes without any internet connection. Everything saves to your phone automatically. When you get back to the office, just connect to WiFi and click the 'Sync' button. All your audits will upload to Google Sheets automatically. The app will remember where you left off, even if you close it."

### **Demo:**
1. Show app working online
2. Turn on airplane mode
3. Complete a sample audit
4. Show it saves successfully
5. Turn off airplane mode
6. Show sync process
7. Verify in Google Sheets

---

## 📞 Support

**Common Questions:**

**Q: Will I lose data if I close the app?**
A: No! Data saves automatically to your device.

**Q: How many audits can I do offline?**
A: 100+ audits (depends on device storage).

**Q: Do I need to sync every audit?**
A: You can batch sync multiple audits at once.

**Q: What if sync fails?**
A: App retries automatically up to 5 times.

**Q: Can I edit a synced audit offline?**
A: Yes! Edit and re-sync when online.

---

## ✅ Summary

**Your app already has:**
- ✅ Full offline form functionality
- ✅ Offline photo capture
- ✅ Offline voice recording
- ✅ Automatic sync when online
- ✅ IndexedDB storage
- ✅ Service Worker caching
- ✅ PWA capabilities

**Auditors can:**
- ✅ Complete entire audits offline
- ✅ Save and edit drafts
- ✅ Sync when convenient
- ✅ Work without interruption

**No changes needed - it's ready to use!** 🎉

---

**Status:** ✅ FULLY FUNCTIONAL OFFLINE  
**Storage:** IndexedDB (100+ audits)  
**Sync:** Automatic when online  
**PWA:** Installable on all devices
