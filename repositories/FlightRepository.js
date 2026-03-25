const Flug = require('../models/Flug');
const Maschine = require('../models/Maschine');

class FlightRepository {
  constructor(db) {
    this.db = db;
  }

  async create(flug) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO Flug (flugname, maschinen_id, startflughafen, endflughafen, datum, uhrzeit)
        VALUES (?,?,?,?,?,?)
      `, [flug.flugname, flug.maschinen_id, flug.startflughafen, flug.endflughafen, flug.datum, flug.uhrzeit],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });
  }

  // Gibt flache Objekte zurück, die ALLE Daten enthalten (für index.html + seats.html)
  getAll() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT f.*, 
               m.maschinen_name, 
               m.maschinen_kuerzel,
               m.anzahl_reihen, 
               m.anzahl_sitze, 
               m.anzahl_ebenen
        FROM Flug f 
        JOIN Maschine m ON f.maschinen_id = m.maschinen_id 
        ORDER BY f.flug_id DESC
      `, (err, rows) => {
        if (err) return reject(err);

        const result = rows.map(row => {
          //Erzeugen eines Objektes mit den Eigenschaften, die zur Klasse Flug gehören
          const flug = new Flug(
            row.flug_id,
            row.flugname,
            row.maschinen_id,
            row.startflughafen,
            row.endflughafen,
            row.datum,
            row.uhrzeit
          );
          ////Erzeugen eines Objektes mit den Eigenschaften, die zur Klasse Maschine gehören
          const maschine = new Maschine(
            row.maschinen_id,
            row.maschinen_name,
            row.maschinen_kuerzel,
            row.anzahl_reihen,
            row.anzahl_sitze,
            row.anzahl_ebenen
          );

          // Hier werden die beiden Objekte zu einem flachen Objekt zusammengeführt
          return {
            ...flug.toJSON(),
            ...maschine.toJSON()
          };
        });

        resolve(result);
      });
    });
  }

  getById(flugId) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT f.*, 
               m.maschinen_name, 
               m.maschinen_kuerzel, 
               m.anzahl_reihen, 
               m.anzahl_sitze, 
               m.anzahl_ebenen
        FROM Flug f 
        JOIN Maschine m ON f.maschinen_id = m.maschinen_id 
        WHERE f.flug_id = ?
      `, [flugId], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        const flug = new Flug(
          row.flug_id,
          row.flugname,
          row.maschinen_id,
          row.startflughafen,
          row.endflughafen,
          row.datum,
          row.uhrzeit
        );

        const maschine = new Maschine(
          row.maschinen_id,
          row.maschinen_name,
          row.maschinen_kuerzel,
          row.anzahl_reihen,
          row.anzahl_sitze,
          row.anzahl_ebenen
        );

        resolve({
          ...flug.toJSON(),
          maschinen_name: maschine.maschinen_name,
          maschinen_kuerzel: maschine.maschinen_kuerzel,
          anzahl_reihen: maschine.anzahl_reihen,
          anzahl_sitze: maschine.anzahl_sitze,
          anzahl_ebenen: maschine.anzahl_ebenen
        });
      });
    });
  }

  getBookedSeats(flightId) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT reihe, buchstabe FROM Sitz 
        WHERE flug_id = ? AND status = 1
      `, [flightId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
}

module.exports = FlightRepository;