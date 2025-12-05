const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DATA_DIR = path.join("/tmp", "data");
const WEBSITES_FILE = path.join(DATA_DIR, "websites.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const readJsonFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
    throw err;
  }
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { name, url } = req.body;
      
      if (!name || !url) {
        return res.status(400).json({ error: "Name und URL erforderlich" });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: "Ungültiges URL-Format" });
      }

      const website = {
        id: uuidv4(),
        name,
        url,
        createdAt: new Date().toISOString(),
      };

      const websites = readJsonFile(WEBSITES_FILE);
      websites.push(website);
      writeJsonFile(WEBSITES_FILE, websites);

      return res.status(201).json(website);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create website" });
    }
  }

  if (req.method === "DELETE") {
    try {
      // Extract ID from query parameter
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: "Website ID erforderlich" });
      }

      const websites = readJsonFile(WEBSITES_FILE);
      const filtered = websites.filter((w) => w.id !== id);
      
      if (filtered.length === websites.length) {
        return res.status(404).json({ error: "Website nicht gefunden" });
      }

      writeJsonFile(WEBSITES_FILE, filtered);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete website" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
