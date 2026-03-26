class Flug {
  constructor(flug_id, flugname, maschinen_id, startflughafen, endflughafen, datum, uhrzeit) {
    this.flug_id = flug_id;
    this.flugname = flugname;
    this.maschinen_id = maschinen_id;
    this.startflughafen = startflughafen;
    this.endflughafen = endflughafen;
    this.datum = datum; 
    this.uhrzeit = uhrzeit;
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Flug;