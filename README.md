# Aufgabe Frontend - igelb

## Beschreibung

Dies ist die Coding-Aufgabe für die Frontend-Entwickler-Herausforderung bei igelb.

Ein Proof-of-Concept für einen **Website-Change-Monitor** – eine vollständige Full-Stack-Anwendung zur Überwachung von Websites auf Inhaltsänderungen mit KI-gestützter Analyse.

---

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
- KI-Tool-Integration
