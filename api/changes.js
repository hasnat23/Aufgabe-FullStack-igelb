import fs from "fs";
import path from "path";

const DATA_DIR = path.join("/tmp", "data");
const CHANGES_FILE = path.join(DATA_DIR, "changes.json");

// Initialize data directory and files
const initializeStorage = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CHANGES_FILE)) {
      fs.writeFileSync(CHANGES_FILE, JSON.stringify([], null, 2));
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
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error("Error reading file:", err);
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
      const { websiteId } = req.query;
      
      if (!websiteId) {
        return res.status(400).json({ error: "Website ID erforderlich" });
      }

      const changes_list = readJsonFile(CHANGES_FILE);
      const filtered = changes_list
        .filter((c) => c.websiteId === websiteId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return res.status(200).json(
        filtered.map((change) => ({
          id: change.id,
          data: change,
        }))
      );
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch changes" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};

export default module.exports;
