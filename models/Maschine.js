class Maschine {
  constructor(maschinen_id, maschinen_name, maschinen_kuerzel, anzahl_reihen, anzahl_sitze, anzahl_ebenen) {
    this.maschinen_id = maschinen_id;
    this.maschinen_name = maschinen_name;
    this.maschinen_kuerzel = maschinen_kuerzel;
    this.anzahl_reihen = anzahl_reihen;
    this.anzahl_sitze = anzahl_sitze;
    this.anzahl_ebenen = anzahl_ebenen;
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Maschine;