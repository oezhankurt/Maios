# Dashboards (Snapshot-Kopien)

Diese HTML-Dateien sind statische Kopien der Live-Cowork-Artefakte
("Amazon Asin Dashboard" und "Life OS Dashboard"). Sie werden hier
abgelegt, damit sie über Git auf jedem Rechner verfügbar sind, auf dem
dieses Repo geklont ist — Cowork-Live-Artefakte selbst sind laut
Anthropic pro Gerät lokal und syncen nicht automatisch.

**Öffnen:** Datei einfach doppelklicken / im Browser öffnen. Alle Daten
sind zum Zeitpunkt der letzten Aktualisierung eingebettet — es ist keine
Verbindung zu Supermetrics/Cowork nötig, um die Zahlen zu sehen.

**Aktualität:** amazon-asin-dashboard.html wird automatisch nach jedem
Sync-Lauf (werktags 8 Uhr) und jedem Keyword-Refresh (Mo 9 Uhr) hier neu
abgelegt und committed/gepusht. Einfach `git pull` auf dem anderen
Rechner, um den neuesten Stand zu bekommen.

life-os-dashboard.html ist ein manueller Snapshot (Todos/Habits/Ziele
werden dort im Browser-localStorage gespeichert und syncen NICHT
automatisch zwischen Kopien/Geräten — jede Kopie führt ihren eigenen
lokalen Stand).
