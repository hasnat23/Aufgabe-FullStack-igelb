const fs = require("fs");
const path = require("path");

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

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      const websites = readJsonFile(WEBSITES_FILE);
      return res.status(200).json(websites);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch websites" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
