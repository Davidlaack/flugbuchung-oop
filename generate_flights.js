// Fügt Flüge in bestehende DB ein
// Reihenfolge: 1. node init-db.js  2. node generate_machines.js  3. node seed-fluege.js
// npm install sqlite3

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('flugdatenbank.db');

const insertFluege = `
  INSERT OR IGNORE INTO Flug (flugname, maschinen_id, startflughafen, endflughafen, datum, uhrzeit) VALUES
  ('LH123', 1, 'BRE', 'MUC', '25.03.2026', '14:00'),      -- A320 (maschinen_id 1)
  ('LH456', 2, 'BRE', 'FRA', '26.03.2026', '09:30'),      -- B737 (maschinen_id 2)
  ('KL1766', 3, 'BRE', 'AMS', '26.03.2026', '16:30'),     -- A319 (maschinen_id 3)
  ('LH789', 4, 'BRE', 'STN', '27.03.2026', '11:00'),      -- A380 (maschinen_id 4)
  ('LX234', 5, 'BRE', 'AYT', '27.03.2026', '16:45'), -- A321neo (maschinen_id 5)
  ('TK1987', 6, 'BRE', 'IST', '28.03.2026', '08:30'); -- B777 (maschinen_id 6)
`;

async function seedFluege() {
  return new Promise((resolve, reject) => {
    db.exec(insertFluege, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Anzahl eingefügter Flüge prüfen
      db.get('SELECT COUNT(*) as anzahl FROM Flug', (err, row) => {
        if (err) reject(err);
        else {
          console.log('Flüge eingefügt:');
          console.log(`Gesamt: ${row.anzahl} Flüge aus Bremen`);
          db.close();
          resolve();
        }
      });
    });
  });
}

// Ausführen
seedFluege()
  .catch(console.error);