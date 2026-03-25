const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('flugdatenbank.db');

console.log('Sitz-Generator-Modul (mit Ebenen) geladen.');

async function generateSeatsForFlight(flug_id, anzahl_reihen_pro_ebene, anzahl_sitze, anzahl_ebenen = 1) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM Sitz WHERE flug_id = ?`, [flug_id], (err, row) => {
      if (err) return reject(err);

      if (row.count > 0) {
        console.log(`Flug ID ${flug_id} übersprungen – hat bereits Sitze`);
        return resolve(0);
      }

      console.log(`Generiere Sitze für Flug ID ${flug_id} – ${anzahl_ebenen} Ebenen × ${anzahl_reihen_pro_ebene} Reihen × ${anzahl_sitze} Sitze`);

      const insertPromises = [];
      let gesamtReihe = 1;   // fortlaufende Reihennummer (1 bis 40 beim A380)

      for (let ebene = 1; ebene <= anzahl_ebenen; ebene++) {
        for (let reiheInEbene = 1; reiheInEbene <= anzahl_reihen_pro_ebene; reiheInEbene++) {
          for (let i = 0; i < anzahl_sitze; i++) {
            const buchstabe = String.fromCharCode(65 + i); // A–J

            const p = new Promise((res, rej) => {
              db.run(`
                INSERT INTO Sitz (flug_id, reihe, buchstabe, status)
                VALUES (?, ?, ?, 0)
              `, [flug_id, gesamtReihe, buchstabe], (err) => {
                if (err) rej(err); else res();
              });
            });
            insertPromises.push(p);
          }
          gesamtReihe++;
        }
      }

      Promise.all(insertPromises)
        .then(() => {
          const total = insertPromises.length;
          console.log(`${total} Sitze für Flug ${flug_id} angelegt (${anzahl_ebenen} Ebenen)`);
          resolve(total);
        })
        .catch(reject);
    });
  });
}

// Manueller Aufruf (node generate_seats.js)
if (require.main === module) {
  console.log('Starte manuelle Sitz-Generierung...');
  // ... (kann später erweitert werden)
}

module.exports = { generateSeatsForFlight };