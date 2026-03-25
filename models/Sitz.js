class Sitz {
  constructor(flug_id, reihe, buchstabe, status = 0) {
    this.flug_id = flug_id;
    this.reihe = reihe;
    this.buchstabe = buchstabe;
    this.status = status;   // 0 = frei, 1 = gebucht
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Sitz;