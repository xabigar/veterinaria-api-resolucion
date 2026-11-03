// Con Express Generator: la configuración y las rutas van en app.js y app.listen() en bin/www.
// Aquí están las dos cosas en un solo fichero.
require('dotenv').config({ quiet: true });
const express = require('express');
const connectDB = require('./db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const loadSampleData = require('./seed');

const app = express();
app.use(express.json());
// Aquí también se podría servir el frontend: app.use(express.static('public'))

app.use('/api/owners', require('./routes/owners'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/vets', require('./routes/vets'));
app.use('/api/appointments', require('./routes/appointments'));

// Rutas desconocidas → 404 (parte 3, reto)
app.use(notFound);

// Middleware de errores: después de todas las rutas
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(async ({ inMemory }) => {
    // La base de datos en memoria empieza vacía: cargar los datos de ejemplo
    if (inMemory) {
      try {
        console.log(await loadSampleData());
      } catch (err) {
        console.warn('No se han podido cargar los datos de ejemplo (revisa los modelos):', err.message);
      }
    }
    app.listen(PORT, () => console.log(`Servidor: http://localhost:${PORT}`));
  })
  .catch(err => { console.error(err); process.exit(1); });
