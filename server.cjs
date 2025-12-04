const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const https = require("https");

// Konfiguration für Datenspeicherung
const DATA_DIR = path.join(__dirname, "data");
const WEBSITES_FILE = path.join(DATA_DIR, "websites.json");
const CRAWLS_FILE = path.join(DATA_DIR, "crawls.json");
const CHANGES_FILE = path.join(DATA_DIR, "changes.json");

// Sicherstellen, dass das Datenverzeichnis existiert
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialisiere JSON-Dateien wenn sie nicht existieren
const initializeFiles = () => {
  [WEBSITES_FILE, CRAWLS_FILE, CHANGES_FILE].forEach((file) => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([], null, 2));
    }
  });
};

// Lese JSON-Datei und gebe leeres Array zurück bei Fehler
const readJsonFile = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
};

// Schreibe Daten in JSON-Datei
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Fehler beim Schreiben in ${filePath}:`, err);
    throw err;
  }
};

// Generiere SHA256 Hash des Website-Inhalts
const hashContent = (content) => {
  return crypto.createHash("sha256").update(content).digest("hex");
};

// Hole Website-Inhalt mit Timeout und HTML-Bereinigung
const fetchWebsiteContent = async (url, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : require("http");
    const timeoutHandle = setTimeout(() => {
      reject(new Error(`Anforderungs-Timeout nach ${timeout}ms`));
    }, timeout);

    protocol
      .get(
        url,
        { headers: { "User-Agent": "Website-Change-Monitor/1.0" } },
        (res) => {
          clearTimeout(timeoutHandle);
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
            // Begrenze die Datengröße auf 100KB
            if (data.length > 100000) {
              res.destroy();
            }
          });
          res.on("end", () => {
            // Bereinige HTML-Tags und Whitespace
            const text = data
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim();
            resolve(text.substring(0, 50000));
          });
        }
      )
      .on("error", (err) => {
        clearTimeout(timeoutHandle);
        reject(err);
      });
  });
};

const server = http.createServer(async (req, res) => {
  // CORS-Header für Cross-Origin-Anfragen
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  // Protokolliere alle API-Anfragen
  console.log(`${req.method} ${req.url}`);

  // Verarbeite OPTIONS-Anfragen für CORS
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // GET /websites - Hole alle überwachten Websites
    if (req.method === "GET" && req.url === "/websites") {
      const websites = readJsonFile(WEBSITES_FILE);
      res.writeHead(200);
      res.end(JSON.stringify(websites));
      return;
    }

    // POST /websites - Erstelle neue Website
    if (req.method === "POST" && req.url === "/websites") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("error", (err) => {
        console.error("Anforderungsfehler:", err);
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Ungültige Anfrage" }));
      });
      req.on("end", () => {
        try {
          console.log("POST-Body erhalten:", body);
          const { name, url } = JSON.parse(body);
          console.log("Analysierte Daten:", { name, url });
          if (!name || !url) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Name und URL erforderlich" }));
            return;
          }
          // Validiere URL-Format
          try {
            new URL(url);
          } catch {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Ungültiges URL-Format" }));
            return;
          }

          // Erstelle neue Website mit eindeutiger ID
          const website = {
            id: uuidv4(),
            name,
            url,
            createdAt: new Date().toISOString(),
          };
          console.log("Erstelle Website:", website);
          const websites = readJsonFile(WEBSITES_FILE);
          websites.push(website);
          writeJsonFile(WEBSITES_FILE, websites);
          console.log("Website erfolgreich gespeichert");

          res.writeHead(201);
          res.end(JSON.stringify(website));
        } catch (parseErr) {
          console.error("Parse-Fehler:", parseErr);
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Ungültiges JSON" }));
        }
      });
      return;
    }

    // DELETE /websites/:id - Lösche Website
    if (req.method === "DELETE" && req.url.startsWith("/websites/")) {
      const id = req.url.split("/")[2];
      const websites = readJsonFile(WEBSITES_FILE);
      const filtered = websites.filter((w) => w.id !== id);
      if (filtered.length === websites.length) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Nicht gefunden" }));
        return;
      }
      writeJsonFile(WEBSITES_FILE, filtered);
      res.writeHead(204);
      res.end();
      return;
    }

    // POST /crawl/:websiteId - Starte Website-Crawl
    if (req.method === "POST" && req.url.startsWith("/crawl/")) {
      const websiteId = req.url.split("/")[2];
      const websites = readJsonFile(WEBSITES_FILE);
      const website = websites.find((w) => w.id === websiteId);

      if (!website) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Website nicht gefunden" }));
        return;
      }

      try {
        // Hole Website-Inhalt und berechne Hash
        const content = await fetchWebsiteContent(website.url);
        const contentHash = hashContent(content);

        const crawl = {
          id: uuidv4(),
          websiteId,
          timestamp: new Date().toISOString(),
          content,
          contentHash,
        };

        // Speichere Crawl-Ergebnis
        const crawls = readJsonFile(CRAWLS_FILE);
        crawls.push(crawl);
        writeJsonFile(CRAWLS_FILE, crawls);

        // Vergleiche mit vorherigem Crawl um Änderungen zu erkennen
        const previousCrawl = crawls
          .filter((c) => c.websiteId === websiteId && c.id !== crawl.id)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

        if (previousCrawl) {
          const similarity = content === previousCrawl.content ? 1.0 : 0.5;
          const changes =
            similarity > 0.95
              ? "Keine signifikanten Änderungen erkannt"
              : `Inhalt geändert von ${previousCrawl.content.length} zu ${content.length} Zeichen`;

          const changeDetection = {
            id: uuidv4(),
            websiteId,
            previousCrawlId: previousCrawl.id,
            currentCrawlId: crawl.id,
            changes,
            timestamp: new Date().toISOString(),
            similarity,
          };

          const changes_list = readJsonFile(CHANGES_FILE);
          changes_list.push(changeDetection);
          writeJsonFile(CHANGES_FILE, changes_list);
        }

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: crawl }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    // GET /changes/:websiteId - Hole Änderungsverlauf
    if (req.method === "GET" && req.url.startsWith("/changes/")) {
      const websiteId = req.url.split("/")[2];
      const changes_list = readJsonFile(CHANGES_FILE);
      const filtered = changes_list
        .filter((c) => c.websiteId === websiteId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      res.writeHead(200);
      res.end(
        JSON.stringify(
          filtered.map((change) => ({
            id: change.id,
            data: change,
          }))
        )
      );
      return;
    }

    // GET /health - Gesundheitsprüfung
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200);
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    // 404 für unbekannte Routen
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Nicht gefunden" }));
  } catch (err) {
    console.error("Fehler:", err);
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Interner Serverfehler" }));
  }
});

initializeFiles();

// Starte HTTP-Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n✅ Backend läuft auf http://localhost:${PORT}`);
  console.log(`📁 Datenspeicherung: ${DATA_DIR}`);
  console.log(`🔗 Gesundheitsprüfung: http://localhost:${PORT}/health\n`);
});
