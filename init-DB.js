// init-db.js - Erstellt Flugbuchung-Datenbankstruktur
// Node.js + sqlite3 erforderlich: npm install sqlite3

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'flugdatenbank.db');
const db = new sqlite3.Database(dbPath);

const createTables = `
  CREATE TABLE IF NOT EXISTS Maschine (
    maschinen_id INTEGER PRIMARY KEY AUTOINCREMENT,
    maschinen_name TEXT NOT NULL,
    maschinen_kuerzel TEXT NOT NULL,
    anzahl_reihen INTEGER NOT NULL,
    anzahl_sitze INTEGER NOT NULL,
    anzahl_ebenen INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Flug (
    flug_id INTEGER PRIMARY KEY AUTOINCREMENT,
    flugname TEXT NOT NULL,
    maschinen_id INTEGER NOT NULL,
    startflughafen TEXT NOT NULL,
    endflughafen TEXT NOT NULL,
    datum TEXT NOT NULL,
    uhrzeit TEXT NOT NULL,
    FOREIGN KEY(maschinen_id) REFERENCES Maschine(maschinen_id)
  );

  CREATE TABLE IF NOT EXISTS Sitz (
    sitz_id INTEGER PRIMARY KEY AUTOINCREMENT,
    flug_id INTEGER NOT NULL,
    reihe INTEGER NOT NULL,
    buchstabe TEXT NOT NULL,
    status INTEGER DEFAULT 0,
    FOREIGN KEY(flug_id) REFERENCES Flug(flug_id)
  );
`;

async function initDatabase() {
  console.log('Erstelle Flugbuchung-Datenbankstruktur...');

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabellen erstellen
      db.exec(createTables, (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log('Tabellen erstellt: Maschine, Flug, Sitz');
        
        console.log('\nDB bereit!');
        console.log(`Datei: ${dbPath}`);
        
        db.close();
        resolve();
      });
    });
  });
}

// Ausführen
initDatabase()
  .catch(console.error);