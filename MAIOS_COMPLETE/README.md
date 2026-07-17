# MAIOS - All-in-One E-Commerce Marketplace Solution

**Version:** 1.0.0  
**Status:** Active  
**Deployed:** Railway (Backend) + Vercel (Frontend)

---

## 📋 Projekt-Übersicht

MAIOS ist deine **All-in-One Lösung** für Amazon.de, eBay, Otto, Kaufland und mehr. Ein Verkäufer braucht **NUR MAIOS** - alles andere ist integriert.

### Was MAIOS macht:
- ✅ Produkte auflisten & verwalten (multi-platform)
- ✅ Echtzeit-Preisanalyse & Wettbewerbstracking
- ✅ Amazon PPC Kampagnen optimieren
- ✅ Verkaufsmetriken & Profitanalyse
- ✅ Keyword-Recherche & Ranking-Tracking
- ✅ Google Ads & Bing Ads Integration
- ✅ Chrome Extension für Amazon/Otto (Echtzeit-Daten in Sidebar)

---

## 🎯 Quick Start

### 1. Login
**URL:** https://maios-production.up.railway.app  
**Test Credentials:**
```
Email: test@example.com
Passwort: password123
```

### 2. Chrome Extension installieren
1. Öffne: `chrome://extensions/`
2. Schalte "Entwicklermodus" ein (oben rechts)
3. Klick "Entpackte Extension laden"
4. Wähle: `/home/user/Maios/extension`

### 3. Extension testen
- Gehe zu: https://www.amazon.de/
- Öffne eine beliebige Produktseite
- Sidebar öffnet automatisch mit Maios-Daten

---

## 🏗️ Architektur

```
MAIOS
├── frontend/              (React + Vite)
│   ├── src/pages/         Dashboard, PPC, Keywords, Listings...
│   ├── src/api/api.js     Axios API Client
│   └── vercel.json        Vercel Deployment Config
│
├── backend/               (Express.js + PostgreSQL)
│   ├── src/routes/        Auth, Products, PPC, Keywords...
│   ├── src/middleware/    CSRF, Auth, Error Handler
│   └── railway.json       Railway Deployment Config
│
├── extension/             (Chrome Extension)
│   ├── manifest.json      Extension Config
│   ├── background.js      Service Worker
│   ├── content-scripts/   Amazon.js, Otto.js
│   └── styles/content.css Sidebar Design
│
└── docker-compose.yml     Local Development
```

---

## 🔧 Setup (Lokal)

### Backend

```bash
cd /home/user/Maios/backend
npm install
npm run dev
```

Server läuft auf: http://localhost:5000/api

### Frontend

```bash
cd /home/user/Maios/frontend
npm install
npm run dev
```

App läuft auf: http://localhost:5173

### PostgreSQL (Docker)

```bash
docker-compose up -d
```

Credentials:
- Host: localhost
- User: maios_user
- Password: maios_password
- Database: maios_db
- Port: 5432

---

## 📊 API Endpoints (Backend)

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Products
```
GET    /api/products              (Liste)
POST   /api/products              (Erstellen)
GET    /api/products/:id          (Details)
PUT    /api/products/:id          (Update)
DELETE /api/products/:id          (Löschen)
GET    /api/products/:id/stats    (Statistiken)
GET    /api/products/:id/competitors
GET    /api/products/:id/analysis
```

### Keywords
```
GET    /api/keywords/product/:productId
GET    /api/keywords/master/:productId
POST   /api/keywords
PUT    /api/keywords/:id
DELETE /api/keywords/:id
POST   /api/keywords/research
GET    /api/keywords/:id/suggestions
```

### Rankings
```
GET    /api/rankings/product/:productId
GET    /api/rankings/:keywordId/history
GET    /api/rankings/:keywordId/trend
```

### PPC (Amazon Ads)
```
GET    /api/ppc/overview
GET    /api/ppc/campaigns
POST   /api/ppc/campaigns
PUT    /api/ppc/campaigns/:id
GET    /api/ppc/campaigns/:id/performance
POST   /api/ppc/optimize
```

### Listings
```
GET    /api/listings/builder
POST   /api/listings/builder
PUT    /api/listings/builder/:id
POST   /api/listings/analyzer/main
GET    /api/listings/index/check
```

### Analytics
```
GET    /api/dashboard/overview
GET    /api/dashboard/profit-chart
GET    /api/dashboard/top-products
```

---

## 🌍 Deployment

### Production URLs
- **Frontend:** https://maios.vercel.app
- **Backend:** https://maios-production.up.railway.app/api

### Vercel (Frontend)
```bash
git push origin claude/fervent-ptolemy-1t6a1e
# Vercel deployt automatisch
```

### Railway (Backend)
```bash
git push origin claude/fervent-ptolemy-1t6a1e
# Railway deployt automatisch
# Dashboard: https://railway.app
```

---

## 🔐 Sicherheit

### CSRF Protection
- **Status:** Momentan deaktiviert (Cross-Origin Development)
- **Wird re-enabled:** Vor Production Launch
- **Grund:** Vercel (Frontend) + Railway (Backend) sind unterschiedliche Origins

### Authentication
- JWT Tokens via localStorage
- Bearer Token in Authorization Header
- Session Auto-Logout bei 401

### Rate Limiting
- Auth Endpoints: 5 Versuche / 15 Min
- API: 1000 Requests / 15 Min

---

## 🧩 Chrome Extension

### Features
✅ Automatische ASIN/SKU Erkennung  
✅ Echtzeit Produktdaten in Sidebar  
✅ Verkaufsmetriken (täglich, monatlich)  
✅ Wettbewerbsanalyse  
✅ Ranking & BSR  
✅ Direct Link zu Maios Dashboard  

### Unterstützte Seiten
- amazon.de (Produktseiten)
- otto.de (Produktseiten)

### Wie es funktioniert
1. **Content Script** auf Amazon/Otto laden
2. ASIN/SKU aus URL extrahieren
3. Message an **Background Service Worker** senden
4. **Background Worker** ruft Maios API ab
5. Token aus `chrome.storage.sync` nehmen
6. Daten in **Sidebar** anzeigen

### Weitere Marketplaces
- [ ] eBay.de
- [ ] Kaufland.de
- [ ] Amazon.com (international)

---

## 📱 Features Pro Version

### Dashboard
- 📊 Profit-Chart (Daily, Monthly, Yearly)
- 📈 Top Products Overview
- 🔔 Real-time Alerts
- 📋 Login History

### Product Management
- 🏪 Multi-Marketplace Listings
- 📸 Image Management
- 💰 Dynamic Pricing
- 🔍 Product Search & Analytics

### PPC Management
- 🎯 Campaign Management
- 💡 AI-Powered Optimization
- 📊 Performance Tracking
- 🤖 Automation Rules
- 💼 Smart Portfolios

### Keyword Tools
- 🔎 Master Keyword Database
- 📈 Ranking Tracker
- 🎯 Cerebro (Reverse ASIN Analysis)
- 💡 Keyword Suggestions
- 📊 Research Tools

### Listing Tools
- ✍️ Listing Builder
- 🤖 Scribbles (AI Copywriter)
- 📝 Listing Analyzer
- 📍 Index Checker
- 🔍 Content Optimization

### Research
- 🔬 Black Box (Market Research)
- 🎯 Niche Research
- 👥 Audience Insights
- 🎬 Google & Bing Ads Integration

---

## 🚀 Next Steps

### Immediate
1. ✅ Fix Login (CSRF deaktiviert)
2. ✅ Deploy Backend (Railway)
3. ✅ Deploy Frontend (Vercel)
4. ✅ Chrome Extension erstellt

### Short-term
- [ ] Token-Übergabe in Frontend (Extension Login)
- [ ] eBay.de & Kaufland.de zur Extension hinzufügen
- [ ] Extension Icons (16x16, 48x48, 128x128)
- [ ] Extension Web Store Submission

### Mid-term
- [ ] CSRF Re-Enable (mit Same-Origin Fix)
- [ ] Options Page für Extension
- [ ] Dark Mode Support
- [ ] Notifications für Preisänderungen

### Long-term
- [ ] Mobile App (iOS/Android)
- [ ] Shopify Integration
- [ ] WooCommerce Integration
- [ ] Multi-Language Support

---

## 🐛 Debugging

### Extension nicht funktioniert?
1. Check Console: F12 → Console Tab
2. Check Extension Status: chrome://extensions/
3. Check Token: chrome://sync → Storage → maios_token
4. Stelle sicher: In Maios angemeldet

### Login funktioniert nicht?
1. Backend läuft? https://maios-production.up.railway.app/api/health
2. Network Tab: F12 → Network → Filter "login"
3. Check Response: Status 200, Token in Response?

### API Calls fehlschlagen?
1. Token abgelaufen? Neu einloggen
2. CORS Problem? Check browser console
3. Backend Down? Railway Dashboard checken

---

## 📚 Wichtige Files

| File | Zweck |
|------|-------|
| `/frontend/src/api/api.js` | API Client & Interceptors |
| `/backend/src/middleware/csrf.js` | CSRF Middleware (momentan disabled) |
| `/backend/src/services/` | Business Logic (Products, PPC, Keywords...) |
| `/extension/manifest.json` | Extension Konfiguration |
| `/extension/content-scripts/` | Page Injection Scripts |
| `/docker-compose.yml` | Local PostgreSQL Setup |

---

## 💡 Best Practices

### Frontend
- Use `useAuthStore()` für Auth State
- Use `api.*` für alle API Calls
- Nutze `useToast()` für User Feedback

### Backend
- Use `ApiError.*` für Fehlerbehandlung
- Return `{ success: true, data: ... }` Format
- Implement Error Handling in try/catch

### Extension
- Nutze `chrome.storage.sync` für persistente Daten
- Content Scripts sollten schnell sein
- Background Worker macht die API Calls

---

## 🎓 Ressourcen

- **Chrome Extension Docs:** https://developer.chrome.com/docs/extensions/
- **React Docs:** https://react.dev
- **Express Docs:** https://expressjs.com
- **Sequelize Docs:** https://sequelize.org
- **Railway Docs:** https://docs.railway.app

---

## 📞 Support

**Issues/Questions?**
- Check `/backend/LOCAL_SETUP.md`
- Check `/extension/README.md`
- GitHub Issues: https://github.com/oezhankurt/maios/issues

---

**Last Updated:** 2026-07-17  
**Built by:** Claude (claude-haiku-4-5)  
**For:** All-in-One E-Commerce Management
