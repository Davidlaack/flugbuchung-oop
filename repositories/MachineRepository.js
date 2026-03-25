const Maschine = require('../models/Maschine');

class MachineRepository {
  constructor(db) {
    this.db = db;
  }

  getByKuerzel(kuerzel) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT * FROM Maschine WHERE maschinen_kuerzel = ?
      `, [kuerzel], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(new Maschine(row.maschinen_id, row.maschinen_name, row.maschinen_kuerzel,
                             row.anzahl_reihen, row.anzahl_sitze, row.anzahl_ebenen));
      });
    });
  }
}

module.exports = MachineRepository;