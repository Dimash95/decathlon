const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("database.db", err => {
  if (err) {
    console.error("Ошибка подключения к БД:", err.message);
  } else {
    console.log("Подключено к SQLite. База данных: database.db");
    db.run(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

app.post("/attendance", (req, res) => {
  const { name, action, timestamp } = req.body;

  if (!name || !action || !timestamp) {
    return res
      .status(400)
      .json({ error: "Необходимо указать имя, действие и время." });
  }

  db.run(
    "INSERT INTO attendance (name, action, timestamp) VALUES (?, ?, ?)",
    [name, action, timestamp],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Ошибка записи в базу данных." });
      }
      res.status(200).json({ id: this.lastID, name, action, timestamp });
    },
  );
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
