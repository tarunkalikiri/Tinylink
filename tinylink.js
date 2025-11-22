// tinylink.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // for frontend

// --- Database ---
const db = new sqlite3.Database("./links.db");
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS links (
    code TEXT PRIMARY KEY,
    url TEXT,
    clicks INTEGER DEFAULT 0,
    last_clicked TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

// --- Helper ---
function generateCode(length = 7) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// --- API Routes ---
app.post("/api/links", (req, res) => {
  const { url, code } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });
  const shortCode = code || generateCode();
  db.run(
    "INSERT INTO links(code,url) VALUES(?,?)",
    [shortCode, url],
    function (err) {
      if (err) return res.status(409).json({ error: "Code exists" });
      db.get("SELECT * FROM links WHERE code=?", [shortCode], (err, row) => {
        res.status(201).json(row);
      });
    }
  );
});

app.get("/api/links", (req, res) => {
  db.all("SELECT * FROM links ORDER BY created_at DESC", [], (err, rows) => {
    res.json(rows);
  });
});

app.get("/api/links/:code", (req, res) => {
  const code = req.params.code;
  db.get("SELECT * FROM links WHERE code=?", [code], (err, row) => {
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  });
});

app.delete("/api/links/:code", (req, res) => {
  const code = req.params.code;
  db.run("DELETE FROM links WHERE code=?", [code], function () {
    if (this.changes === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });
});

app.get("/:code", (req, res) => {
  const code = req.params.code;
  db.get("SELECT * FROM links WHERE code=?", [code], (err, row) => {
    if (!row) return res.status(404).send("Not found");
    db.run(
      "UPDATE links SET clicks = clicks + 1, last_clicked = CURRENT_TIMESTAMP WHERE code=?",
      [code]
    );
    res.redirect(row.url);
  });
});

app.get("/healthz", (req, res) => {
  res.json({ ok: true, version: "1.0" });
});

// --- Frontend ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
  console.log(`TinyLink running at http://localhost:${PORT}`);
});
