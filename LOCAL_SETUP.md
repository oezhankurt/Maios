# 🚀 Maios Local Development Setup

## Prerequisites

- Node.js 18+ (mit npm)
- Docker & Docker Compose
- Git

## Quick Start (5 Minuten)

### 1️⃣ Clone & Install

```bash
git clone https://github.com/oezhankurt/Maios.git
cd Maios
npm install  # Root packages
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2️⃣ Start Database (Docker)

```bash
docker compose up -d
```

**Check:** 
```bash
docker compose ps
# Should show maios-postgres running on port 5432
```

### 3️⃣ Setup Backend

```bash
cd backend

# Create/check .env
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=maios_db
# DB_USER=maios_user
# DB_PASSWORD=maios_password
# PORT=5000
# JWT_SECRET=dev_secret_key_change_in_prod

# Run migrations (wenn nötig)
npm run migrate

# Start server
npm start
```

**Check:**
```bash
# Should see: ✅ Server listening on port 5000
```

### 4️⃣ Setup Frontend

```bash
cd frontend
npm run dev
```

**Opens:** `http://localhost:5173`

---

## 🔑 Test Login

**Default Test User:**
- Email: `test@example.com`
- Password: `password123`

(Oder registriere einen neuen Account)

---

## 🐛 Troubleshooting

### "ECONNREFUSED 127.0.0.1:5432"
→ Database läuft nicht
```bash
docker compose up -d
docker compose ps
```

### "Cannot find module..."
→ Dependencies nicht installiert
```bash
npm install  # im jeweiligen Ordner
```

### "Port 5000 already in use"
→ Backend läuft schon
```bash
lsof -i :5000
kill -9 <PID>
```

### "Port 5173 already in use"
→ Frontend läuft schon
```bash
lsof -i :5173
kill -9 <PID>
```

### "Database connection error"
→ .env Credentials stimmen nicht
```
Prüfe: .env hat die gleichen Credentials wie docker-compose.yml
DB_USER=maios_user
DB_PASSWORD=maios_password
DB_NAME=maios_db
```

---

## 📋 Full Command Overview

```bash
# Start everything
docker compose up -d           # Database
cd backend && npm start        # Backend (Terminal 1)
cd frontend && npm run dev     # Frontend (Terminal 2)

# Stop everything
docker compose down            # Database
# Kill Terminal 1 & 2 with Ctrl+C
```

---

## ✅ When You See This = It Works

**Backend Terminal:**
```
✅ Server listening on port 5000
✅ Database connected
```

**Frontend Terminal:**
```
  VITE v5.4.21  ready in 314 ms
  ➜  Local:   http://localhost:5173/
```

**Browser:**
- Maios Login Page loads ✅
- Can register/login ✅
- Dashboard shows ✅

---

## 🚀 Next: Deploy to Production

Once local works:
```bash
git push -u origin claude/fervent-ptolemy-1t6a1e
```

Then Vercel/Railway picks it up automatically via GitHub Actions.
