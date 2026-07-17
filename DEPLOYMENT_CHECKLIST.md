# Deployment Checklist

**Vor jedem Deployment müssen diese Checks durchlaufen:**

## Backend Checks
- [ ] `npm run check:imports` - Alle imports korrekt?
- [ ] `npm run check:deps` - Alle Abhängigkeiten installiert?
- [ ] `npm run check:syntax` - Keine Syntax-Fehler?
- [ ] `npm start` - Server startet ohne Fehler?
- [ ] `npm run db:migrate` - Migrations erfolgreich?

## Frontend Checks
- [ ] Dependencies installiert: `npm ci`
- [ ] Build funktioniert: `npm run build`
- [ ] Dev-Server startet: `npm run dev`

## Environment Variables
- [ ] Backend .env hat alle erforderlichen Variablen
- [ ] Frontend .env hat API_URL gesetzt
- [ ] Database-Verbindung konfiguriert

## Database
- [ ] PostgreSQL läuft
- [ ] Migrations sind aktuell
- [ ] Keine pending migrations

## Git
- [ ] Alle Änderungen committed
- [ ] Branch aktuell mit main
- [ ] Keine uncommitted changes

## Pre-Deployment
- [ ] Run `npm run check` in backend/
- [ ] GitHub Actions zeigt ✅ für alle Checks
- [ ] Lokale Tests passen

---

**Automatische Checks:**
- Pre-commit hook prüft Backend
- GitHub Actions prüft beide (Frontend + Backend)
- Nur wenn alle grün sind → Deploy zu Vercel/Railway

**Deployment-Fehler vermeiden:**
1. Immer `npm ci` statt `npm install` verwenden
2. Pre-commit hooks niemals mit `--no-verify` umgehen
3. Im Zweifelsfall lokal testen vor Push
