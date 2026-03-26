const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('flugdatenbank.db');

console.log('Sitz-Generator-Modul (mit Ebenen) geladen.');

/**
 * Generiert Sitze für einen einzelnen Flug
 * (wird auch aus addFlight.html aufgerufen)
 */
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
      let gesamtReihe = 1;

      for (let ebene = 1; ebene <= anzahl_ebenen; ebene++) {
        for (let reiheInEbene = 1; reiheInEbene <= anzahl_reihen_pro_ebene; reiheInEbene++) {
          for (let i = 0; i < anzahl_sitze; i++) {
            const buchstabe = String.fromCharCode(65 + i);

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

if (require.main === module) {
  console.log('Starte manuelle Sitz-Generierung für ALLE Flüge ohne Sitze...');

  // Sitzkonfiguration pro Maschinen-ID
  const seatConfigByMachine = {
    1: { anzahl_reihen_pro_ebene: 30, anzahl_sitze: 6, anzahl_ebenen: 1 },   // A320
    2: { anzahl_reihen_pro_ebene: 30, anzahl_sitze: 6, anzahl_ebenen: 1 },   // B737
    3: { anzahl_reihen_pro_ebene: 25, anzahl_sitze: 6, anzahl_ebenen: 1 },   // A319
    4: { anzahl_reihen_pro_ebene: 20, anzahl_sitze: 10, anzahl_ebenen: 2 },  // A380 (40 Reihen gesamt)
    5: { anzahl_reihen_pro_ebene: 35, anzahl_sitze: 6, anzahl_ebenen: 1 },   // A321neo
    6: { anzahl_reihen_pro_ebene: 30, anzahl_sitze: 9, anzahl_ebenen: 1 },   // B777
  };

  db.all(`SELECT flug_id, maschinen_id FROM Flug ORDER BY flug_id`, [], (err, flights) => {
    if (err) {
      console.error('Fehler beim Laden der Flüge:', err);
      return;
    }

    if (flights.length === 0) {
      console.log('Keine Flüge in der Datenbank gefunden.');
      db.close();
      return;
    }

    console.log(`Prüfe ${flights.length} Flüge auf fehlende Sitze...`);

    let totalAdded = 0;
    let processed = 0;

    const processNext = async () => {
      if (processed === flights.length) {
        console.log(`Manuelle Sitz-Generierung abgeschlossen. Insgesamt ${totalAdded} Sitze angelegt.`);
        db.close();
        return;
      }

      const flight = flights[processed];
      const config = seatConfigByMachine[flight.maschinen_id];

      if (!config) {
        console.log(`Warnung: Keine Sitzkonfiguration für Maschine ID ${flight.maschinen_id} (Flug ${flight.flug_id})`);
        processed++;
        processNext();
        return;
      }

      try {
        const added = await generateSeatsForFlight(
          flight.flug_id,
          config.anzahl_reihen_pro_ebene,
          config.anzahl_sitze,
          config.anzahl_ebenen
        );
        totalAdded += added;
      } catch (e) {
        console.error(`Fehler bei Flug ID ${flight.flug_id}:`, e);
      }

      processed++;
      processNext();
    };

    processNext();
  });
}

module.exports = { generateSeatsForFlight };