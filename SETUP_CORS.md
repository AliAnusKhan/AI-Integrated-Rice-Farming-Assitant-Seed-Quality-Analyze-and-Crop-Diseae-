# Firebase Storage CORS Fix - Quick Guide

## Easiest Solution: Use Firebase Console

### Step 1: Download gsutil
1. Go to: https://cloud.google.com/sdk/docs/install-sdk#windows
2. Download Windows installer
3. Run installer

### Step 2: Initialize
```bash
gcloud init
```
- Login when prompted
- Select your project: `ai-integrated-rice-assistant`

### Step 3: Set CORS
```bash
gsutil cors set cors.json gs://ai-integrated-rice-assistant.firebasestorage.app
```

---

## Alternative: Use This Direct URL

Open this in browser (must be logged into Google Cloud):
https://console.cloud.google.com/apis/api/firebasestorage.googleapis.com/metrics?project=ai-integrated-rice-assistant

---

## Quick Workaround: Base64 (No CORS needed)

If gsutil install not possible, I can switch to base64 image storage.
