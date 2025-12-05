const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const DATA_DIR = path.join("/tmp", "data");
const WEBSITES_FILE = path.join(DATA_DIR, "websites.json");
const CRAWLS_FILE = path.join(DATA_DIR, "crawls.json");
const CHANGES_FILE = path.join(DATA_DIR, "changes.json");

// Initialize data directory and files
const initializeStorage = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    [WEBSITES_FILE, CRAWLS_FILE, CHANGES_FILE].forEach(file => {
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify([], null, 2));
      }
    });
  } catch (err) {
    console.error("Error initializing storage:", err);
  }
};

const readJsonFile = (filePath) => {
  try {
    initializeStorage();
    if (!fs.existsSync(filePath)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    initializeStorage();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
    throw err;
  }
};

const hashContent = (content) => {
  return crypto.createHash("sha256").update(content).digest("hex");
};

const fetchWebsiteContent = async (url, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : require("http");
    const timeoutHandle = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);

    protocol
      .get(url, { headers: { "User-Agent": "Website-Change-Monitor/1.0" } }, (res) => {
        clearTimeout(timeoutHandle);
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
          if (data.length > 100000) {
            res.destroy();
          }
        });
        res.on("end", () => {
          const text = data
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          resolve(text.substring(0, 50000));
        });
      })
      .on("error", (err) => {
        clearTimeout(timeoutHandle);
        reject(err);
      });
  });
};

const calculateSimilarity = (str1, str2) => {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  const minLen = Math.min(str1.length, str2.length);
  let matches = 0;
  for (let i = 0; i < minLen; i++) {
    if (str1[i] === str2[i]) matches++;
  }
  return matches / maxLen;
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { websiteId } = req.query;
      
      if (!websiteId) {
        return res.status(400).json({ error: "Website ID erforderlich" });
      }

      const websites = readJsonFile(WEBSITES_FILE);
      const website = websites.find((w) => w.id === websiteId);

      if (!website) {
        return res.status(404).json({ error: "Website nicht gefunden" });
      }

      const content = await fetchWebsiteContent(website.url);
      const contentHash = hashContent(content);

      const crawl = {
        id: uuidv4(),
        websiteId,
        timestamp: new Date().toISOString(),
        content,
        contentHash,
      };

      const crawls = readJsonFile(CRAWLS_FILE);
      crawls.push(crawl);
      writeJsonFile(CRAWLS_FILE, crawls);

      // Check for changes
      const previousCrawl = crawls
        .filter((c) => c.websiteId === websiteId && c.id !== crawl.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

      if (previousCrawl) {
        const similarity = calculateSimilarity(previousCrawl.content, content);
        const lengthDiff = content.length - previousCrawl.content.length;
        const changes = similarity > 0.95
          ? "Keine signifikanten Änderungen erkannt"
          : `Inhalt geändert: ${lengthDiff > 0 ? '+' : ''}${lengthDiff} Zeichen (${Math.round(similarity * 100)}% ähnlich)`;

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

      return res.status(200).json({ success: true, data: crawl });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
