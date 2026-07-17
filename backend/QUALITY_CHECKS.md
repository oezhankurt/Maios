# Quality Checks für Maios Backend

Diese Checks laufen automatisch vor jedem Commit und verheidern Deployment-Fehler.

## ✅ Verfügbare Checks

### 1. **Import Validation** 🔐
```bash
npm run check:imports
```
Prüft:
- Korrekte Middleware-Imports
- Richtige Funktionsnamen
- Pfade existieren

**Fehler:** `authMiddleware` statt `auth`, `verifyToken` statt `authenticate`

### 2. **Dependency Check** 📦
```bash
npm run check:deps
```
Prüft:
- Alle genutzten Pakete sind installiert
- Keine fehlenden Dependencies
- package.json ist aktuell

**Fehler:** `multer`, `csv-parse`, `json2csv` nicht in package.json

### 3. **Syntax Check** 📝
```bash
npm run check:syntax
```
Prüft:
- Keine Syntax-Fehler in JS-Dateien
- Alle Dateien sind parseble
- Valid JavaScript

**Fehler:** Typos, fehlende Klammern, ungültige Syntax

### 4. **All Checks** ✅
```bash
npm run check
```
Läuft alle Checks hintereinander. Nur wenn alle ✅ zeigen wird das Deployment freigegeben.

## 🔄 Automatische Checks

### Pre-Commit Hook
Bevor ein Commit erstellt wird, laufen die Checks automatisch:
```bash
git commit -m "..."
# → Hook läuft → npm run check
# ✅ Pass → Commit wird erstellt
# ❌ Fail → Commit wird blockiert, Fehler müssen gefixt werden
```

### GitHub Actions
Bei jedem Push laufen:
- Backend Checks (imports, deps, syntax)
- Frontend Checks (build)
- Deployment Readiness

Alle müssen ✅ sein, bevor Vercel/Railway deployed.

## 🛠️ Fehler beheben

### Problem: "Cannot find module X"
**Lösung:**
```bash
npm install X
npm run check
```

### Problem: "authMiddleware not found"
**Lösung:** In Routes-Datei:
```javascript
// FALSCH:
const { verifyToken } = require('../middleware/authMiddleware');

// RICHTIG:
const { authenticate } = require('../middleware/auth');
router.use(authenticate);
```

### Problem: "Syntax error in src/services/X.js"
**Lösung:** Datei mit `node -c` prüfen:
```bash
node -c src/services/X.js
```
Fehler fixen, dann:
```bash
npm run check
```

## 📊 Entwicklungs-Workflow

```
1. Code schreiben/ändern
   ↓
2. npm run check (lokal prüfen)
   ↓
3. git add + git commit (Hook prüft automatisch)
   ↓
4. git push (GitHub Actions prüfen)
   ↓
5. ✅ Alle grün → Vercel/Railway deployment
   ↑
   ❌ Fehler → beheben + push retry
```

## 🚀 Best Practices

1. **Immer lokal prüfen vor Commit:**
   ```bash
   npm run check
   ```

2. **Nach npm install:**
   ```bash
   npm run check
   ```

3. **Vor git push:**
   ```bash
   npm run check
   git status  # Nur geplante Dateien?
   ```

4. **Neue Dependencies:**
   ```bash
   npm install <package>
   npm run check  # Validiert neue Dep
   git commit
   ```

## 📝 Was wird geprüft

| Check | Was | Beispiel Fehler |
|-------|-----|-----------------|
| Imports | Routes Middleware-Imports | `authMiddleware` statt `auth` |
| Dependencies | Alle require() sind installiert | `multer` fehlt in package.json |
| Syntax | Gültiges JavaScript | Fehlende Klammer `}` |

---

**Ziel:** Null Deployment-Fehler durch automatische Prävention! ✅
