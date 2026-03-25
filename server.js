const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const { generateSeatsForFlight } = require('./generate_seats.js');
const FlightRepository = require('./repositories/FlightRepository');
const MachineRepository = require('./repositories/MachineRepository');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const db = new sqlite3.Database('flugdatenbank.db');
const flightRepo = new FlightRepository(db);
const machineRepo = new MachineRepository(db);

// Hilfsfunktion: YYYY-MM-DD → TT.MM.JJJJ
function formatToGermanDate(isoDate) {
  if (!isoDate) return isoDate;
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

// Abfrage aller Flüge (für index.html)
app.get('/api/flights', async (req, res) => {
  try {
    const flights = await flightRepo.getAll(); 
    res.json(flights);                            
  } catch (err) {
    console.error('Flüge-Abfrage Fehler:', err);
    res.status(500).json({ error: err.message });
  }
});

// Einzelner Flug (für seats.html)
app.get('/api/flights/:flugId', async (req, res) => {
  try {
    const flight = await flightRepo.getById(req.params.flugId);
    if (!flight) return res.status(404).json({ error: 'Flug nicht gefunden' });
    res.json(flight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Gebuchte Sitze
app.get('/api/flights/:flightId/bookings', async (req, res) => {
  try {
    const seats = await flightRepo.getBookedSeats(req.params.flightId);
    res.json(seats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buchung eines Sitzes
app.post('/api/bookings', (req, res) => {
  const { flightId, reihe, sitz } = req.body;
  if (!flightId || !reihe || !sitz) {
    return res.status(400).json({ error: 'Fehlende Daten' });
  }
  db.run(`
    UPDATE Sitz 
    SET status = 1 
    WHERE flug_id = ? AND reihe = ? AND buchstabe = ?
  `, [flightId, reihe, sitz], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(400).json({ error: 'Sitz nicht gefunden oder bereits gebucht' });
    res.json({ success: true, message: 'Sitz erfolgreich gebucht' });
  });
});

// Flug hinzufügen
app.post('/api/flights', async (req, res) => {
  const { flugname, maschinen_kuerzel, startflughafen, endflughafen, datum, uhrzeit } = req.body;

  if (!flugname || !maschinen_kuerzel || !startflughafen || !endflughafen || !datum || !uhrzeit) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
  }

  const germanDatum = formatToGermanDate(datum);

  try {
    const machine = await machineRepo.getByKuerzel(maschinen_kuerzel);
    if (!machine) return res.status(400).json({ error: 'Maschine nicht gefunden' });

    const flug = new (require('./models/Flug'))(
      null,
      flugname,
      machine.maschinen_id,
      startflughafen,
      endflughafen,
      germanDatum,
      uhrzeit
    );

    const flug_id = await flightRepo.create(flug);
    const anzahlNeuerSitze = await generateSeatsForFlight(flug_id, machine.anzahl_reihen, machine.anzahl_sitze, machine.anzahl_ebenen);

    res.json({
      success: true,
      message: `Flug und ${anzahlNeuerSitze} Sitze erfolgreich angelegt`,
      flug_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server läuft: http://localhost:${port}`);
});