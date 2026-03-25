// Fügt Maschinen-Daten in bestehende DB ein
// Voraussetzung: node init-db.js bereits ausgeführt
// npm install sqlite3

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('flugdatenbank.db');

const insertMaschinen = `
  INSERT OR IGNORE INTO Maschine (maschinen_name, maschinen_kuerzel, anzahl_reihen, anzahl_sitze, anzahl_ebenen) VALUES
  ('Airbus A320',    'A320',  30, 6, 1),   -- 3-3 = 6 Sitze/Reihe
  ('Boeing 737',     'B737',  27, 6, 1),   -- 3-3 = 6 Sitze/Reihe
  ('Airbus A319',    'A319',  24, 6, 1),   -- 3-3 = 6 Sitze/Reihe
  ('Airbus A380',    'A380',  20, 10, 2),  -- 3-4-3 = 10 Sitze/Reihe × 2 Ebenen
  ('Airbus A321neo', 'A321neo',34, 6, 1),  -- 3-3 = 6 Sitze/Reihe
  ('Boeing 777',     'B777',  39, 9, 1);   -- 3-3-3 = 9 Sitze/Reihe
`;

async function seedMaschinen() {
  return new Promise((resolve, reject) => {
    db.exec(insertMaschinen, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Anzahl eingefügter Maschinen prüfen
      db.get('SELECT COUNT(*) as anzahl FROM Maschine', (err, row) => {
        if (err) reject(err);
        else {
          console.log('Maschinen eingefügt:');
          console.log(`Gesamt: ${row.anzahl} Maschinen`);
          db.close();
          resolve();
        }
      });
    });
  });
}

// Ausführen
seedMaschinen()
  .catch(console.error);
