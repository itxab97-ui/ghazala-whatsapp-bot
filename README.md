# 🤖 Ghazala Institute WhatsApp Chatbot

Complete WhatsApp chatbot with:
- ✅ Auto replies (Courses, Fees, Admissions, Study Abroad)
- ✅ Student registration flow
- ✅ Bulk messaging API

---

## 🚀 Step-by-Step Deployment on Railway.app

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com) → Sign up / Log in
2. Click **"New repository"**
3. Name it: `ghazala-whatsapp-bot`
4. Click **Create repository**
5. Upload all these files to the repo

### Step 2: Deploy on Railway
1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `ghazala-whatsapp-bot`
4. Railway will auto-detect Node.js and deploy!

### Step 3: Add Environment Variables on Railway
In Railway dashboard → Your project → **Variables** tab, add:

```
ACCESS_TOKEN = (your token from Meta screenshot)
PHONE_NUMBER_ID = 1225024960686596
VERIFY_TOKEN = ghazala_verify_123
BULK_SECRET = ghazala_bulk_secret_2024
```

### Step 4: Get Your Webhook URL
After deploy, Railway gives you a URL like:
```
https://ghazala-whatsapp-bot-production.up.railway.app
```

Your webhook URL will be:
```
https://ghazala-whatsapp-bot-production.up.railway.app/webhook
```

### Step 5: Configure Webhook on Meta
1. Go to Meta Developer Console → Your App
2. Click **"Configure webhooks"** (Step 3 in your screenshot)
3. Enter:
   - **Callback URL:** `https://your-railway-url.up.railway.app/webhook`
   - **Verify Token:** `ghazala_verify_123`
4. Click **Verify and Save**
5. Subscribe to **messages** field

---

## 📱 Chatbot Features

When a student messages your WhatsApp number:

**Main Menu:**
- 📚 Courses & Fees
- 🎓 Admission Info  
- ✈️ Study Abroad

**Courses Available:**
- German (A1-C2)
- IELTS
- PTE Academic
- OET
- Arabic
- English

**Registration Flow:**
Bot collects Name → Phone → Course Interest automatically

---

## 📤 Bulk Messaging

Send bulk messages via API:

```bash
curl -X POST https://your-url.up.railway.app/send-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "ghazala_bulk_secret_2024",
    "message": "📢 New batch starting Monday! Contact us: 03142230194",
    "numbers": ["923001234567", "923009876543"]
  }'
```

⚠️ Numbers must include country code (92 for Pakistan), no + sign.

---

## 🆘 Support
Contact developer if you face any issues.
