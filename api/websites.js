const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DATA_DIR = path.join("/tmp", "data");
const WEBSITES_FILE = path.join(DATA_DIR, "websites.json");

// Initialize data directory and files
const initializeStorage = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(WEBSITES_FILE)) {
      fs.writeFileSync(WEBSITES_FILE, JSON.stringify([], null, 2));
    }
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
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
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

module.exports = async (req, res) => {
  console.log("🚀 [WEBSITES API v2.1] Request:", req.method, req.url);
  
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS request handled");
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      console.log("📖 Reading websites from:", WEBSITES_FILE);
      const websites = readJsonFile(WEBSITES_FILE);
      console.log("✅ Found", websites.length, "websites");
      return res.status(200).json(websites);
    } catch (error) {
      console.error("❌ GET /websites error:", error);
      return res.status(500).json({ error: "Failed to fetch websites", details: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      console.log("📝 POST body:", req.body);
      // Parse body if needed
      let body = req.body;
      if (typeof body === 'string') {
        console.log("🔄 Parsing body string");
        body = JSON.parse(body);
      }
      
      const { name, url } = body;
      console.log("📝 Creating website:", { name, url });
      
      if (!name || !url) {
        return res.status(400).json({ error: "Name und URL erforderlich" });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: "Ungültiges URL-Format" });
      }
      const websites = readJsonFile(WEBSITES_FILE);
      websites.push(website);
      writeJsonFile(WEBSITES_FILE, websites);
      
      console.log("✅ Website created successfully:", website.id);
      return res.status(201).json(website);
    } catch (error) {
      console.error("❌ POST /websites error:", error);
      console.error("Error stack:", error.stack);
      return res.status(500).json({ error: "Failed to create website", details: error.message, stack: error.stack });
    }
  }

  if (req.method === "DELETE") {
    try {
      console.log("🗑️ DELETE request URL:", req.url);
      // Get ID from URL path
      const pathParts = req.url.split('/');
      const id = pathParts[pathParts.length - 1];
      console.log("🗑️ Deleting website ID:", id);
      
      if (!id) {
        return res.status(400).json({ error: "Website ID erforderlich" });
      }

      const websites = readJsonFile(WEBSITES_FILE);
      const filtered = websites.filter((w) => w.id !== id);
      
      if (filtered.length === websites.length) {
        console.log("⚠️ Website not found:", id);
        return res.status(404).json({ error: "Website nicht gefunden" });
      }

      writeJsonFile(WEBSITES_FILE, filtered);
      console.log("✅ Website deleted successfully");
      return res.status(204).end();
    } catch (error) {
      console.error("❌ DELETE /websites error:", error);
      return res.status(500).json({ error: "Failed to delete website", details: error.message });
    }
  }

  console.log("⚠️ Method not allowed:", req.method);
  return res.status(405).json({ error: "Method not allowed" });
};    return res.status(204).end();
    } catch (error) {
      console.error("DELETE /websites error:", error);
      return res.status(500).json({ error: "Failed to delete website", details: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
