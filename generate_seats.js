const sqlite3 = require('sqlite3').verbose();
const Sitz = require('./models/Sitz');

const db = new sqlite3.Database('flugdatenbank.db');

console.log('Sitz-Generator-Modul geladen.');

async function generateSeatsForFlight(flug_id, anzahl_reihen, anzahl_sitze) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM Sitz WHERE flug_id = ?`, [flug_id], (err, row) => {
      if (err) return reject(err);

      if (row.count > 0) {
        console.log(`Flug ID ${flug_id} übersprungen – hat bereits ${row.count} Sitze`);
        return resolve(0);
      }

      console.log(`Generiere Sitze für Flug ID ${flug_id} – ${anzahl_reihen} Reihen × ${anzahl_sitze} Sitze`);

      const insertPromises = [];
      for (let reihe = 1; reihe <= anzahl_reihen; reihe++) {
        for (let i = 0; i < anzahl_sitze; i++) {
          const buchstabe = String.fromCharCode(65 + i);
          const sitz = new Sitz(flug_id, reihe, buchstabe, 0);

          const p = new Promise((res, rej) => {
            db.run(`INSERT INTO Sitz (flug_id, reihe, buchstabe, status) VALUES (?,?,?,0)`,
              [sitz.flug_id, sitz.reihe, sitz.buchstabe], (err) => {
                if (err) rej(err); else res();
              });
          });
          insertPromises.push(p);
        }
      }

      Promise.all(insertPromises)
        .then(() => resolve(insertPromises.length))
        .catch(reject);
    });
  });
}

if (require.main === module) {
  console.log('Starte manuelle Sitz-Generierung...');
}

module.exports = { generateSeatsForFlight };