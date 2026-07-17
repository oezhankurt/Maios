# MAIOS - Quick Links & Credentials

## 🌍 Live URLs

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | https://maios-production.up.railway.app |
| **Backend API** | https://maios-production.up.railway.app/api |
| **Health Check** | https://maios-production.up.railway.app/api/health |
| **Railway Dashboard** | https://railway.app (für Backend Monitoring) |
| **Vercel Dashboard** | https://vercel.com (für Frontend Monitoring) |

---

## 🔑 Test Credentials

### Maios Login
```
Email: test@example.com
Passwort: password123
```

### Database (Local)
```
Host: localhost
Port: 5432
User: maios_user
Passwort: maios_password
Database: maios_db
```

---

## 💻 Local Dev Commands

### Backend
```bash
cd /home/user/Maios/backend
npm install
npm run dev         # Start Server (http://localhost:5000)
npm run test        # Tests
npm run lint        # Linting
```

### Frontend
```bash
cd /home/user/Maios/frontend
npm install
npm run dev         # Start Dev Server (http://localhost:5173)
npm run build       # Production Build
npm run preview     # Preview Build
```

### PostgreSQL (Docker)
```bash
docker-compose up -d       # Start
docker-compose down        # Stop
docker-compose logs -f     # Logs
```

---

## 🧩 Chrome Extension

### Install Steps
1. Öffne: `chrome://extensions/`
2. Toggle: **Developer Mode** (top right)
3. Click: **Load unpacked**
4. Select: `/home/user/Maios/extension`

### Test on:
- https://www.amazon.de/
- https://www.otto.de/

---

## 📦 Project Structure

```
/home/user/Maios/
├── backend/                 Express.js API
├── frontend/                React + Vite
├── extension/               Chrome Extension
├── MAIOS_COMPLETE/          Documentation (THIS FOLDER)
├── docker-compose.yml
└── README.md
```

---

## 🔄 Git Branch

**Feature Branch:** `claude/fervent-ptolemy-1t6a1e`

```bash
git checkout claude/fervent-ptolemy-1t6a1e
git pull origin claude/fervent-ptolemy-1t6a1e
```

---

## 🚀 Deployment

### Auto-Deploy on Push
Both Vercel & Railway are configured for auto-deploy when pushing to the feature branch.

```bash
git add .
git commit -m "Your message"
git push -u origin claude/fervent-ptolemy-1t6a1e
```

---

## 🔧 Important Files

### Backend
- `/backend/src/app.js` - Main Express App
- `/backend/src/routes/` - All API Routes
- `/backend/src/middleware/csrf.js` - CSRF Middleware (currently disabled)
- `/backend/src/services/` - Business Logic
- `/backend/.env` - Environment Variables

### Frontend
- `/frontend/src/App.jsx` - Main Component
- `/frontend/src/pages/` - All Pages
- `/frontend/src/api/api.js` - API Client
- `/frontend/src/store/authStore.js` - Auth State
- `/frontend/.env` - Environment Variables

### Extension
- `/extension/manifest.json` - Config
- `/extension/background.js` - Service Worker
- `/extension/content-scripts/` - Page Scripts
- `/extension/popup.html` - Extension UI

---

## 📊 Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Login | ✅ Working | CSRF disabled (temporarily) |
| Products | ✅ Working | CRUD operations |
| Keywords | ✅ Working | Research & tracking |
| Rankings | ✅ Working | History & trends |
| PPC Campaigns | ✅ Working | Amazon Ads integration |
| Listings | ✅ Working | Builder & analyzer |
| Analytics | ✅ Working | Dashboard & charts |
| Chrome Extension | ✅ Working | Amazon.de & Otto.de |
| Google Ads | ✅ Working | Campaign management |
| Bing Ads | ✅ Working | Campaign management |

---

## ⚠️ Known Issues

| Issue | Status | Fix |
|-------|--------|-----|
| CSRF Token | ⚠️ Disabled | Will re-enable before production |
| Extension Token | 🔄 In Progress | Need to integrate Frontend → Extension token passing |

---

## 🎯 Priority Tasks

1. ✅ Fix Login (done - CSRF disabled)
2. ✅ Deploy Backend (done - Railway)
3. ✅ Deploy Frontend (done - Vercel)
4. ✅ Create Chrome Extension (done)
5. 🔄 **Integrate Extension Token Passing** (next)
6. 🔄 Add eBay.de & Kaufland.de to Extension (next)
7. ⏳ Re-enable CSRF with proper implementation
8. ⏳ Test full user flow
9. ⏳ Production hardening

---

## 🎓 Documentation

- **Full Guide:** `/MAIOS_COMPLETE/README.md`
- **Local Setup:** `/backend/LOCAL_SETUP.md`
- **Extension Docs:** `/extension/README.md`
- **Main README:** `/README.md`

---

## 📞 Quick Help

### Extension nicht laden?
```
1. chrome://extensions/ öffnen
2. Developer Mode aktivieren
3. "Load unpacked" klicken
4. /home/user/Maios/extension wählen
```

### Backend läuft nicht?
```bash
cd /home/user/Maios/backend
npm install
npm run dev
# Check: http://localhost:5000/api/health
```

### Frontend läuft nicht?
```bash
cd /home/user/Maios/frontend
npm install
npm run dev
# Check: http://localhost:5173
```

### Login funktioniert nicht?
```
1. Backend läuft? ✅
2. CORS enabled? ✅
3. Test-Credentials korrekt? test@example.com / password123
4. Browser Console: F12 → Console Tab → Fehler checken
```

---

**Last Updated:** 2026-07-17  
**Maios v1.0.0**
