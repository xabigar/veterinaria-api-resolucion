// Datos de ejemplo. En memoria: se cargan al arrancar el servidor.
// En una base de datos real (MONGODB_URI): npm run seed. CUIDADO: borra los datos anteriores.
const mongoose = require('mongoose');
const connectDB = require('./db');
const Owner = require('./models/Owner');
const Pet = require('./models/Pet');
const Vet = require('./models/Vet');
const Appointment = require('./models/Appointment');

const DAY = 24 * 60 * 60 * 1000;

async function loadSampleData() {
  await Promise.all([
    Owner.deleteMany({}), Pet.deleteMany({}), Vet.deleteMany({}), Appointment.deleteMany({})
  ]);
  await Owner.syncIndexes();               // asegurar que el índice único del email está creado

  const [alice, bob] = await Owner.create([
    { name: 'Alice', email: 'alice@mail.com' },
    { name: 'Bob', email: 'bob@mail.com' }
  ]);

  const [rex, mimi, luna, txio] = await Pet.create([
    { name: 'Rex', species: 'dog', owner: alice._id,
      vaccines: [{ name: 'Rabia', date: new Date('2026-03-02') }] },
    { name: 'Mimi', species: 'cat', owner: bob._id },
    { name: 'Luna', species: 'dog', owner: alice._id },
    { name: 'Txio', species: 'bird', owner: bob._id }
  ]);

  const [ane, mikel, irati] = await Vet.create([
    { name: 'Ane Etxeberria', speciality: 'perros', email: 'ane@clinica.eus',
      availableDays: ['lunes', 'miércoles'] },
    { name: 'Mikel Goikoetxea', speciality: 'gatos',
      availableDays: ['lunes', 'viernes'] },
    { name: 'Irati Zubiri', speciality: 'aves', email: 'irati@clinica.eus',
      availableDays: ['jueves'] }
  ]);

  const now = Date.now();
  await Appointment.create([
    { date: new Date(now - 7 * DAY), reason: 'Vacuna', status: 'done', pet: rex._id, vet: ane._id },
    { date: new Date(now - 2 * DAY), reason: 'Revisión', status: 'done', pet: mimi._id, vet: mikel._id },
    { date: new Date(now + 1 * DAY), reason: 'Limpieza dental', pet: luna._id, vet: ane._id },
    { date: new Date(now + 2 * DAY), reason: 'Control', status: 'cancelled', pet: rex._id, vet: ane._id },
    { date: new Date(now + 3 * DAY), reason: 'Ala herida', pet: txio._id, vet: irati._id },
    { date: new Date(now + 5 * DAY), reason: 'Revisión', pet: mimi._id, vet: mikel._id }
  ]);

  const counts = await Promise.all([Owner, Pet, Vet, Appointment].map(M => M.countDocuments()));
  return `Datos de ejemplo: ${counts[0]} dueños, ${counts[1]} mascotas, ${counts[2]} veterinarios, ${counts[3]} citas`;
}

module.exports = loadSampleData;

// npm run seed: cargar los datos en una base de datos con MONGODB_URI (local o Atlas)
if (require.main === module) {
  require('dotenv').config({ quiet: true });
  if (!process.env.MONGODB_URI) {
    console.log('No hay MONGODB_URI: en memoria, el servidor carga los datos al arrancar (npm run dev).');
  } else {
    connectDB()
      .then(loadSampleData)
      .then(msg => console.log(msg))
      .catch(err => { console.error('Error al cargar los datos:', err.message); process.exitCode = 1; })
      .finally(() => mongoose.disconnect());
  }
}
