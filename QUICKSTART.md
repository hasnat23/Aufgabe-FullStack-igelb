# Website-Änderungs-Monitor - Schnellstart & Testanleitung

## 🚀 Projekt ausführen

### Voraussetzungen

- Node.js 20+
- npm 9+

### Einrichtung (einmalig)

```bash
cd website-change-monitor
npm install
mkdir -p data
```

### Frontend & Backend ausführen

**Terminal 1 - Backend:**

```bash
cd website-change-monitor
node server.cjs
```

Du solltest sehen:

```
✅ Backend läuft auf http://localhost:5000
📁 Datenspeicherung: [Pfad]/data
🔗 Gesundheitsprüfung: http://localhost:5000/health
```

**Terminal 2 - Frontend:**

```bash
cd website-change-monitor
npm run dev
```

Du solltest sehen:

```
➜  Local:   http://localhost:3000/
```

### Anwendung öffnen

Öffne deinen Browser unter: **http://localhost:3000**

---

## 📝 Anwendung testen

### Schritt 1: Website hinzufügen

1. Gib im Formular links ein:
   - **Website-Name**: `Google Startseite`
   - **URL**: `https://example.com`
2. Klicke auf **"Website hinzufügen"**
3. Du solltest sie rechts in der Liste sehen

### Schritt 2: Initialen Crawl auslösen

1. Klicke auf das **Aktualisierungs-Symbol** (🔄) auf der Website-Karte
2. Warte auf den Abschluss des Crawls (3-10 Sekunden je nach Seitengröße)
3. Du solltest sehen:
   - Aktualisierter Zeitstempel "Letzte Überprüfung"
   - "Status: 100% ähnlich" oder ähnliche Nachricht

### Schritt 3: Eine weitere Website hinzufügen

1. Füge eine weitere Website hinzu (z.B. `https://github.com`)
2. Führe auch bei dieser einen Crawl durch

### Schritt 4: Änderungsverlauf anzeigen

1. Klicke auf **"Verlauf anzeigen"** bei einer Website
2. Du wirst alle vorherigen Crawls sehen
3. Jeder Eintrag zeigt:
   - Zeitstempel
   - Änderungsbeschreibung
   - Ähnlichkeitsprozentsatz

### Schritt 5: Website löschen

1. Klicke auf das **Löschen-Symbol** (🗑️) auf einer Website-Karte
2. Die Website wird aus der Liste entfernt

---

## 🧪 Fehlerszenarien testen

### Netzwerk-Timeout testen

1. Füge eine URL hinzu, die lange dauert oder nicht existiert:
   - `https://nonexistent-domain-12345.com`
2. Starte einen Crawl
3. Warte ~10 Sekunden
4. Du solltest eine Fehlermeldung sehen

### Ungültige URL testen

1. Versuche im Formular Folgendes einzugeben:
   - **URL**: `not-a-url`
2. Klicke auf Hinzufügen
3. Du solltest sehen: **"Ungültiges URL-Format"**

### API-Fehler testen

1. Stoppe das Backend (Strg+C im Backend-Terminal)
2. Versuche eine neue Website hinzuzufügen
3. Du solltest die Fehlermeldung sehen: **"Fehler beim Erstellen der Website: Netzwerkfehler..."**

---

## 🔍 Daten überprüfen

Die Anwendung speichert Daten in JSON-Dateien:

```
data/
├── websites.json        # Liste überwachter Websites
├── crawls.json         # Alle durchforsteten Inhalte
└── changes.json        # Erkannte Änderungen zwischen Crawls
```

Um die Daten zu sehen:

```bash
# Unter Windows
type data/websites.json
type data/crawls.json
type data/changes.json

# Unter Mac/Linux
cat data/websites.json
cat data/crawls.json
cat data/changes.json
```

---

## 📊 API-Anfragen-Beispiele

### Alle Websites abrufen

```bash
curl http://localhost:5000/websites
```

### Website hinzufügen

```bash
curl -X POST http://localhost:5000/websites \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","url":"https://example.com"}'
```

### Crawl auslösen

```bash
# Ersetze {websiteId} mit der tatsächlichen ID aus der Websites-Liste
curl -X POST http://localhost:5000/crawl/{websiteId}
```

### Änderungsverlauf abrufen

```bash
curl http://localhost:5000/changes/{websiteId}
```

### Gesundheitsprüfung

```bash
curl http://localhost:5000/health
```

---

## ✅ Was du testen solltest

| Funktion          | Wie testen                     | Erwartetes Ergebnis          |
| ---------------- | ------------------------------ | --------------------------- |
| Website hinzufügen| Formularversand mit gültiger URL | Website erscheint in Liste   |
| URL-Validierung  | Ungültige URL absenden         | Fehlermeldung angezeigt      |
| Crawl auslösen   | Auf Aktualisierungs-Symbol klicken | Ladesymbol, dann Ergebnisse  |
| Änderungserkennung| Gleiche Website zweimal durchforsten | Ähnlichkeitsprozentsatz angezeigt |
| Verlauf anzeigen | Auf "Verlauf anzeigen" klicken | Bisherige Durchforstungen angezeigt |
| Website löschen  | Auf Löschen-Symbol klicken    | Website aus Liste entfernt   |
| Fehlerbehandlung | Backend stoppen & Operation versuchen | Gracefulness Fehlermeldung |
| Netzwerk-Timeout | Unerreichbare Domain durchforsten | Timeout-Fehler nach 10s    |

---

## 🐛 Fehlerbehebung

### "Kann keine Verbindung zum Backend herstellen"

- Überprüfe Backend-Terminal zeigt: `✅ Backend läuft auf http://localhost:5000`
- Überprüfe Port 5000 wird nicht verwendet: `netstat -ano | findstr :5000`

### Frontend zeigt leere Seite

- Überprüfe Browser-Konsole (F12) auf Fehler
- Überprüfe Vite-Dev-Server läuft auf Port 3000
- Aktualisiere die Seite (Strg+R oder Cmd+R)

### Daten werden nicht gespeichert

- Überprüfe `data`-Verzeichnis existiert und ist schreibbar
- Überprüfe Dateiberechtigungen im `data/`-Ordner

### "Netzwerkfehler: /websites"

- Frontend-Proxy funktioniert nicht
- Beende Frontend (Strg+C)
- Lösche `.vite`-Cache: `rm -rf node_modules/.vite`
- Starte neu mit `npm run dev`

---

## 📚 Zusätzliche Ressourcen

Siehe `README.md` für:

- Architektur-Entscheidungen
- Tech-Stack-Details
- Produktions-Bereitstellung
- AI integration guide
- Known limitations

---

**Demo Ready!** 🎉

The application is now running and ready for testing.
