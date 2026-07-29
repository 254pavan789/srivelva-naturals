# Vercel Deploy Guide — SriVelvaNaturals-Miri

## Repo Structure
```
SriVelvaNaturals-Miri/   ← GitHub repo root
├── frontend/            ← React (Vite) app
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── backend/             ← Spring Boot (deploy separately)
└── vercel.json
```

---

## FRONTEND — Vercel Deploy

### Step 1: Import Project
1. https://vercel.com → "Add New Project"
2. Select GitHub repo: `SriVelvaNaturals-Miri`
3. **⚠️ IMPORTANT — Set Root Directory:**
   - Click "Edit" next to Root Directory
   - Type: `frontend`
   - Click Continue

### Step 2: Build Settings (auto-filled after root dir set)
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Step 3: Environment Variables
Add these in Vercel → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://your-backend.up.railway.app` |
| `VITE_WHATSAPP_NUMBER` | `9944268288` |
| `VITE_RAZORPAY_KEY` | `rzp_test_xxxx` |
| `VITE_PAYMENT_DEMO_MODE` | `true` |

### Step 4: Deploy ✅

---

## BACKEND — Railway Deploy

### Step 1: Create Railway Project
1. https://railway.app → New Project
2. Deploy from GitHub → `SriVelvaNaturals-Miri`
3. **Set Root Directory: `backend`**

### Step 2: Add MySQL Database
1. Railway → New → Database → MySQL
2. Connect to your service

### Step 3: Backend Environment Variables
| Variable | Value |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://...` (Railway provides) |
| `SPRING_DATASOURCE_USERNAME` | (Railway provides) |
| `SPRING_DATASOURCE_PASSWORD` | (Railway provides) |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | your password |
| `JWT_SECRET` | any long random string |

### Step 4: Copy Railway URL
After deploy, copy URL like `https://srivelvanaturals.up.railway.app`
→ Paste as `VITE_API_BASE_URL` in Vercel env vars
→ Redeploy Vercel

---

## ✅ Final Checklist
- [ ] Vercel Root Directory = `frontend`
- [ ] `VITE_API_BASE_URL` = Railway backend URL
- [ ] Railway `CORS_ALLOWED_ORIGINS` = Vercel frontend URL
- [ ] Test: https://your-app.vercel.app loads
- [ ] Test: https://your-app.vercel.app/admin works
- [ ] Test: Add to cart → checkout works
