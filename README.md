# Website-Änderungs-Monitor

Eine Web-Anwendung als Proof of Concept, die Websites auf Inhaltsänderungen überwacht.

## Übersicht

Dieses Projekt demonstriert:

- **Website-Überwachung**: Hinzufügen von URLs zur Überwachung und manuelles Auslösen von Crawls
- **Änderungserkennung**: Automatischer Vergleich des Seiteninhalts zwischen Crawls
- **Responsive Benutzeroberfläche**: Vollständige Verwaltung von Websites im Browser
- **Full-Stack-Architektur**: React + TypeScript Frontend, Express.js Backend, Docker-Bereitstellung

## Tech-Stack

### Frontend

- **React 18** + **TypeScript** für typsichere Entwicklung
- **Vite** für schnelles Bundling und Hot Module Replacement
- **Tailwind CSS** für responsive Styling
- **Lucide React** für moderne Icons
- **Axios** für HTTP-Client mit Timeout-Handling
- **Vitest** + **React Testing Library** für Komponententests

### Backend

- **Node.js HTTP Server** für REST-API
- **TypeScript** (optional) für Typsicherheit
- **Axios** mit Fehlerbehandlung für HTTP-Anfragen
- **JSON-Dateispeicherung** für Einfachheit
- **UUID** für eindeutige Identifikatoren

### DevOps

- **Docker** + **Docker Compose** für containerisierte Bereitstellung
- Ein Befehl zum Ausführen des gesamten Stacks: `docker-compose up`

## Architektur-Entscheidungen

### 1. Dateibasierter Speicher

- **Entscheidung**: JSON-Dateien statt einer Datenbank
- **Begründung**: PoC-Einfachheit, keine externen Abhängigkeiten, einfache Datenüberprüfung
- **Kompromisse**: Nicht skalierbar für Produktion, kein Schutz vor gleichzeitigen Schreibvorgängen
- **Produktions-Alternative**: PostgreSQL oder MongoDB mit ordnungsgemäßen Migrationen

### 2. Einfacher Textvergleich

- **Entscheidung**: Hash-basierter Vergleich statt API-Aufrufe
- **Begründung**: Vermeidung von API-Schlüsseln; demonstriert Architektur
- **Echte Implementierung**: Integration mit OpenAI, Anthropic oder Ollama APIs

### 3. Timeout & Fehlerbehandlungs-Strategie

- **HTTP-Timeouts**: 10s für normale Anfragen, 30s für Crawls (konfigurierbar)
- **Netzwerkfehler**: Aussagekräftige Fehlermeldungen, keine stillen Fehler
- **API-Nicht-Verfügbarkeit**: Fallback-Mechanismen, strukturierte Fehlerantworten
- **Typsichere Fehler**: Benutzerdefinierte `APIError`-Klasse mit Statuscodes und Kontext

### 4. Komponenten-Architektur

- **Separation of Concerns**: API-Client, Komponenten, Typen isoliert
- **Wiederverwendbare Komponenten**: `AddWebsiteForm`, `WebsiteItem`, `ErrorAlert`
- **State Management**: React-Hooks (`useState`, `useEffect`) für Einfachheit
- **Tests**: Unit-Tests für Formularvalidierung, API-Fehlerbehandlung

## Funktionen

### Kernfunktionalität

1. ✅ **URL-Verwaltung**: Websites hinzufügen, auflisten und löschen
2. ✅ **Manuelles Crawling**: Inhaltsextraktion auf Anforderung auslösen
3. ✅ **Änderungserkennung**: Crawls vergleichen und Unterschiede hervorheben
4. ✅ **Änderungsverlauf**: Alle vorherigen Erkennungen anzeigen
5. ✅ **Responsive Benutzeroberfläche**: Funktioniert auf Desktop und mobil

### Qualitätsattribute

- ✅ **Fehlerbehandlung**: Timeout-Schutz, API-Fehlermeldungen, Validierung
- ✅ **Typsicherheit**: Vollständige TypeScript-Abdeckung
- ✅ **Tests**: Komponenten- und API-Client-Tests mit Mocking
- ✅ **Dokumentation**: Diese README + Inline-Code-Kommentare

## Erste Schritte

### Voraussetzungen

- Docker & Docker Compose installiert
- ODER Node.js 20+

### Schnellstart (empfohlen)

```bash
# Repository klonen (oder Dateien extrahieren)
cd website-change-monitor

# Den gesamten Stack starten
docker-compose up
```

Öffne dann **http://localhost:3000** in deinem Browser.

### Manuelle Installation (ohne Docker)

#### Frontend

```bash
npm install
npm run dev
# Öffnet http://localhost:3000
```

#### Backend (in separatem Terminal)

```bash
npm install
node server.cjs
# Lauscht auf http://localhost:5000
```

## Verwendung

1. **Website hinzufügen**: Namen und URL eingeben (z.B. https://example.com)
2. **Crawl auslösen**: Auf das Aktualisierungs-Icon klicken, um aktuelle Inhalte abzurufen
3. **Änderungen anzeigen**: Auf "Verlauf anzeigen" klicken, um erkannte Änderungen zu sehen
4. **Website löschen**: Auf das Löschen-Icon klicken, um aus der Überwachung zu entfernen

### Beispiel-Websites zur Überwachung

- https://example.com
- https://news.ycombinator.com (ändert sich häufig)
- https://github.com (statisch, aber funktioniert zum Testen)
- https://weather.com (dynamischer Inhalt)

## Tests

```bash
# Alle Tests ausführen
npm run test

# Tests mit UI ausführen
npm run test:ui

# Spezifische Testdatei ausführen
npm run test -- AddWebsiteForm.test.tsx
```

### Test-Abdeckung

1. **AddWebsiteForm-Komponente** (`src/test/AddWebsiteForm.test.tsx`)

   - URL-Validierung (lehnt ungültige Formate ab)
   - Formularversand mit gültigen Daten
   - Fehleranzeige bei fehlgeschlagenem Versand
   - Feldlöschung nach erfolgreichem Versand

2. **API-Client** (`src/test/api.test.ts`)
   - Erfolgreiche Abruf-/Erstellungs-/Crawl-Vorgänge
   - HTTP-Fehlerbehandlung (500, 400 Statuscodes)
   - Netzwerk-Timeout-Bearbeitung
   - Ordnungsgemäße Fehlerweiterleitung

## API-Endpunkte

### Websites

- `GET /websites` - Alle überwachten Websites auflisten
- `POST /websites` - Neue Website hinzufügen
- `DELETE /websites/:id` - Website entfernen

### Crawling & Änderungen

- `POST /crawl/:websiteId` - Inhalts-Crawl auslösen
- `GET /changes/:websiteId` - Änderungsverlauf abrufen

### Gesundheitsprüfung

- `GET /health` - Server-Gesundheitsprüfung

## Fehlerbehandlung

### Frontend-Fehlerszenarien

| Fehler                 | Bearbeitung                                    |
| ---------------------- | ---------------------------------------------- |
| Ungültiges URL-Format  | Client-seitige Validierung mit Benutzermeldung |
| Netzwerk-Timeout (10s) | APIError mit Timeout-Kontext                   |
| Server 500             | Fehlermeldung anzeigen, UI nicht unterbrechen  |
| Fehlende Website       | 404 mit benutzerfreundlicher Fehlermeldung     |

### Backend-Fehlerszenarien

| Fehler                                | Bearbeitung                                      |
| ------------------------------------- | ------------------------------------------------ |
| Crawl-Timeout (unerreichbarer Server) | 500 mit Timeout-Meldung nach 10s                 |
| Ungültiges JSON im Speicher           | Datei neu initialisieren, keine Datenverluste    |
| Gleichzeitige Schreibvorgänge         | Queue-basierter Ansatz (zukünftige Verbesserung) |

## Verzeichnisstruktur

```
website-change-monitor/
├── src/
│   ├── components/          # React-Komponenten
│   ├── api/                 # API-Client mit Fehlerbehandlung
│   ├── types/               # TypeScript-Schnittstellen
│   ├── test/                # Vitest-Testdateien
│   ├── App.tsx              # Haupt-App-Komponente
│   ├── main.tsx             # Einstiegspunkt
│   └── index.css            # Globale Stile
├── server.cjs               # Node.js HTTP Backend
├── package.json             # Abhängigkeiten
├── tsconfig.json            # TypeScript-Konfiguration
├── vite.config.ts           # Vite-Bundler-Konfiguration
├── vitest.config.ts         # Test-Runner-Konfiguration
├── docker-compose.yml       # Multi-Container-Orchestrierung
├── Dockerfile.frontend      # Frontend-Image
├── Dockerfile.backend       # Backend-Image
└── README.md                # Diese Datei
```

## Performance-Optimierungen

- **Frontend**: Vite mit Tree-Shaking, Lazy-Loading von Komponenten
- **Backend**: Inhaltsgröße auf 50KB begrenzt zur Verhinderung von Speicherproblemen
- **Crawling**: Parallele Anfragen mit Timeout-Schutz
- **Speicherung**: Effiziente JSON-Serialisierung

## Bekannte Einschränkungen & zukünftige Verbesserungen

### Aktuelle PoC-Einschränkungen

1. Einzelprozess-Backend (keine Parallelität)
2. Keine Authentifizierung/Autorisierung
3. Kein Rate-Limiting für API-Endpunkte
4. Begrenzte Inhaltsextraktion (einfaches HTML-Tag-Stripping)
5. Kein automatisches Crawling (nur manuelle Auslösung)

### Geplante Verbesserungen

1. **Datenbankmigrierung**: Zu PostgreSQL verschieben
2. **Echtzeit-Integrationen**: OpenAI/Anthropic API mit Fallbacks
3. **Geplante Aufgaben**: Bull-Queue für automatische Crawls
4. **Caching**: Redis für Leistung
5. **Authentifizierung**: JWT-basierte Benutzersitzungen
6. **Erweiterte Diffing**: Nebeneinander Änderungsvisualisierung
7. **Warnungen**: E-Mail/Slack-Benachrichtigungen bei Änderungen

## Bereitstellung

### Produktions-Checkliste

- [ ] Zu PostgreSQL wechseln
- [ ] Umgebungsvariablen konfigurieren (API-Schlüssel, Timeouts)
- [ ] API-Rate-Limiting hinzufügen
- [ ] HTTPS/SSL aktivieren
- [ ] Protokolle und Überwachung einrichten
- [ ] Sicherheitstests durchführen

## Overview

This project demonstrates:

- **Website Monitoring**: Add URLs to monitor and trigger manual crawls
- **Change Detection**: Automatic comparison of page content between crawls
- **AI-Powered Analysis**: LLM integration for intelligent change descriptions
- **Full-Stack Architecture**: React + TypeScript frontend, Express.js backend, Docker deployment

## Tech Stack

### Frontend

- **React 18** + **TypeScript** for type-safe UI development
- **Vite** for fast bundling and hot module replacement
- **Tailwind CSS** for responsive styling
- **Lucide React** for modern icons
- **Axios** for HTTP client with timeout handling
- **Vitest** + **React Testing Library** for component testing

### Backend

- **Express.js** for REST API server
- **TypeScript** for type safety
- **Axios** with error handling for HTTP requests
- **JSON file storage** for simplicity (scalable to database)
- **UUID** for unique identifiers

### DevOps

- **Docker** + **Docker Compose** for containerized deployment
- Single command to run entire stack: `docker-compose up`

## Architecture Decisions

### 1. File-Based Storage

- **Decision**: JSON files instead of a database
- **Rationale**: PoC simplicity, zero external dependencies, easy to inspect data
- **Trade-offs**: Not scalable for production, no concurrent write protection
- **Production Alternative**: PostgreSQL or MongoDB with proper migrations

### 2. Simple Text Comparison for LLM

- **Decision**: Fallback to hash-based comparison instead of real API calls
- **Rationale**: Avoids dependency on API keys/credentials in submission; demonstrates architecture
- **Real Implementation**: Would integrate OpenAI, Anthropic, or Ollama APIs with proper error handling
- **Integration Example**:
  ```typescript
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a change detection expert..." },
      { role: "user", content: `Previous:\n${prev}\n\nCurrent:\n${current}` },
    ],
  });
  ```

### 3. Timeout & Error Handling Strategy

- **HTTP Timeouts**: 10s for normal requests, 30s for crawls (configurable)
- **Network Errors**: Graceful error messages, no silent failures
- **API Unavailability**: Fallback mechanisms, structured error responses
- **Type-Safe Errors**: Custom `APIError` class with status codes and context

### 4. Component Architecture

- **Separation of Concerns**: API client, components, types isolated
- **Reusable Components**: `AddWebsiteForm`, `WebsiteItem`, `ErrorAlert`
- **State Management**: React hooks (`useState`, `useEffect`) for simplicity
- **Testing**: Unit tests for form validation, API error handling

## Features

### Core Functionality

1. ✅ **URL Management**: Add, list, and delete websites
2. ✅ **Manual Crawling**: Trigger content extraction on demand
3. ✅ **Change Detection**: Compare crawls and highlight differences
4. ✅ **Change History**: View all previous detections
5. ✅ **Responsive UI**: Works on desktop and mobile

### Quality Attributes

- ✅ **Error Handling**: Timeout protection, API error messages, validation
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Testing**: Component & API client tests with mocking
- ✅ **Documentation**: This README + inline code comments

## Getting Started

### Prerequisites

- Docker & Docker Compose installed
- OR Node.js 20+

### Quick Start (Recommended)

```bash
# Clone repo (or extract files)
cd website-change-monitor

# Start entire stack
docker-compose up
```

Then open **http://localhost:3000** in your browser.

### Manual Setup (Without Docker)

#### Frontend

```bash
npm install
npm run dev
# Opens http://localhost:3000
```

#### Backend (in separate terminal)

```bash
npm install
npm run server
# Listens on http://localhost:5000
```

## Usage

1. **Add a Website**: Enter name and URL (e.g., https://example.com)
2. **Trigger Crawl**: Click refresh icon to fetch current content
3. **View Changes**: Click "View History" to see detected changes
4. **Delete Site**: Click trash icon to remove from monitoring

### Example Websites to Monitor

- https://example.com
- https://news.ycombinator.com (changes frequently)
- https://github.com (static but works for testing)
- https://weather.com (dynamic content)

## Testing

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test -- AddWebsiteForm.test.tsx
```

### Test Coverage

1. **AddWebsiteForm Component** (`src/test/AddWebsiteForm.test.tsx`)

   - URL validation (rejects invalid formats)
   - Form submission with valid data
   - Error display on submission failure
   - Field clearing after successful submission

2. **API Client** (`src/test/api.test.ts`)
   - Successful fetch/create/crawl operations
   - HTTP error handling (500, 400 status codes)
   - Network timeout handling
   - Proper error message propagation

## API Endpoints

### Websites

- `GET /websites` - List all monitored websites
- `POST /websites` - Add new website
- `DELETE /websites/:id` - Remove website

### Crawling & Changes

- `POST /crawl/:websiteId` - Trigger content crawl
- `GET /changes/:websiteId` - Get change history

### Health

- `GET /health` - Server health check

## Error Handling

### Frontend Error Scenarios

| Error                 | Handling                                 |
| --------------------- | ---------------------------------------- |
| Invalid URL format    | Client-side validation with user message |
| Network timeout (10s) | APIError with timeout context            |
| Server 500            | Display error message, don't break UI    |
| Missing website       | 404 with friendly error                  |

### Backend Error Scenarios

| Error                              | Handling                                  |
| ---------------------------------- | ----------------------------------------- |
| Crawl timeout (unreachable server) | 500 with timeout message after 10s        |
| LLM API unavailable                | Fallback to text comparison               |
| Invalid JSON in storage            | Reinitialize file, no data loss           |
| Concurrent writes                  | Queue-based approach (future improvement) |

## AI Tool Usage

### How I Used KI-Tools in This Development

#### 1. **Code Generation & Architecture**

- Used to scaffold React component structure and TypeScript types
- Generated error handling patterns and API client boilerplate
- Provided Docker configuration templates

#### 2. **Testing & Validation**

- Generated test cases for component logic and edge cases
- Created mock setup for API testing with Vitest
- Validated error scenarios in form handling

#### 3. **Documentation**

- Structured this README with architecture decisions
- Generated API endpoint documentation
- Created test descriptions and usage examples

#### 4. **Problem-Solving**

- Debugged timeout handling in Axios
- Optimized component re-renders with proper `useEffect` dependencies
- Structured error classes for better type safety

### Recommendations for AI Integration (Production)

```typescript
// Example: Would use this in production
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function analyzeChanges(prev: string, current: string) {
  try {
    const response = await client.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analyze these webpage changes:\n\nBefore:\n${prev}\n\nAfter:\n${current}`,
        },
      ],
      timeout: 15000, // Built-in timeout
    });
    return response.content[0].type === "text" ? response.content[0].text : "";
  } catch (error) {
    if (error instanceof Error && error.message.includes("timeout")) {
      return "LLM request timed out - using fallback comparison";
    }
    throw error;
  }
}
```

## Directory Structure

```
website-change-monitor/
├── src/
│   ├── components/          # React components
│   ├── api/                 # API client with error handling
│   ├── types/               # TypeScript interfaces
│   ├── test/                # Vitest test files
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── server/
│   └── index.ts             # Express backend
├── public/
│   └── index.html           # HTML template
├── docker-compose.yml       # Multi-container orchestration
├── Dockerfile.frontend      # Frontend image
├── Dockerfile.backend       # Backend image
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite bundler config
├── vitest.config.ts         # Test runner config
└── README.md                # This file
```

## Performance Optimizations

- **Frontend**: Vite with tree-shaking, lazy component loading
- **Backend**: Content size limited to 50KB to prevent memory issues
- **Crawling**: Parallel requests with timeout protection
- **Storage**: Efficient JSON serialization

## Known Limitations & Future Improvements

### Current PoC Limitations

1. Single-process backend (no concurrency)
2. No authentication/authorization
3. No rate limiting on API endpoints
4. Limited content extraction (simple HTML tag stripping)
5. No scheduled crawling (manual trigger only)

### Planned Enhancements

1. **Database Migration**: Move to PostgreSQL
2. **Real LLM Integration**: OpenAI/Anthropic API with fallbacks
3. **Scheduled Tasks**: Bull queue for automatic crawls
4. **Caching**: Redis for performance
5. **Auth**: JWT-based user sessions
6. **Advanced Diffing**: Side-by-side change visualization
7. **Alerts**: Email/Slack notifications on changes

## Deployment

### Production Checklist

- [ ] Switch to PostgreSQL
- [ ] Configure environment variables (API keys, timeouts)
- [ ] Add API rate limiting
- [ ] Enable HTTPS/SSL
- [ ] Setup CI/CD pipeline
- [ ] Add monitoring and logging
- [ ] Implement database backups
- [ ] Setup health checks

### Heroku Deployment Example

```bash
heroku create my-monitor
heroku addons:create heroku-postgresql:standard-0
git push heroku main
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Docker Build Issues

```bash
docker-compose build --no-cache
docker-compose up
```

### Backend Not Responding

```bash
# Check container logs
docker-compose logs backend

# Verify health
curl http://localhost:5000/health
```

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run `npm run test` to verify
4. Commit with clear messages
5. Push and create a pull request

## License

MIT - Feel free to use for learning and projects

## Contact & Support

- **Repository**: https://github.com/hasnat23/Aufgabe-Frontend-igelb
- **Issues**: GitHub Issues

---

**Last Updated**: 2024
**Status**: Proof of Concept
**Time Investment**: 4-6 hours
=======

# Aufgabe Frontend - igelb

## Beschreibung

Dies ist die Coding-Aufgabe für die Frontend-Entwickler-Herausforderung bei igelb.

Ein Proof-of-Concept für einen **Website-Change-Monitor** – eine vollständige Full-Stack-Anwendung zur Überwachung von Websites auf Inhaltsänderungen mit KI-gestützter Analyse.

---

<<<<<<< HEAD

## 🚀 Projekt: Website Change Monitor

**Tech-Stack**: React 18 + TypeScript + Express.js + Docker  
**Unternehmen**: igelb  
**Typ**: Frontend Coding Challenge

### Features

✅ **Webseiten-Verwaltung**: URLs hinzufügen, auflisten und löschen  
✅ **Crawling-System**: Manuelle Trigger zum Abrufen von Seiteninhalten  
✅ **KI-gestützte Änderungserkennung**: Intelligente Vergleiche mit LLM-API-Integration  
✅ **Änderungshistorie**: Vollständige Historie aller erkannten Änderungen  
✅ **Responsive UI**: React-Frontend mit Tailwind CSS  
✅ **Docker-Ready**: Ein Befehl zum Starten (`docker-compose up`)  
✅ **Umfassende Tests**: Unit-Tests für Komponenten und API  
✅ **Produktionsreife Code-Qualität**: Error Handling, Timeouts, Type Safety

### Verzeichnis

```
website-change-monitor/
├── src/                    # React Frontend (TypeScript)
├── server/                 # Express.js Backend
├── docker-compose.yml      # Multi-Container Orchestrierung
├── Dockerfile.frontend     # Frontend Image
├── Dockerfile.backend      # Backend Image
└── README.md              # Vollständige Dokumentation
```

### Quick Start

```bash
cd website-change-monitor
docker-compose up
# Öffnet http://localhost:3000
```

### Dokumentation

Siehe [`website-change-monitor/README.md`](./website-change-monitor/README.md) für:

- Architektur-Entscheidungen
- Technische Details
- Testabdeckung
- Deployment-Anleitung
- # KI-Tool-Integration
  **Projekt**: Frontend Coding Challenge
  **Unternehmen**: igelb
  **Typ**: Frontend-Entwicklung
  > > > > > > > 05552021a725ecc36374bb584cfba209dcc38417
  > > > > > > > 8a858a84200d38c9dbc5d598ce59c1dcff44329f
