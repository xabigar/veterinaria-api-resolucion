const mongoose = require('mongoose');

// Si existe MONGODB_URI (.env): se usa esa base de datos (local o Atlas).
// Si no existe: MongoDB arranca en memoria. No hay que instalar nada,
// pero los datos se pierden al parar el servidor.
async function connectDB() {
  let uri = process.env.MONGODB_URI;
  let inMemory = false;

  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri('veterinaria');
    inMemory = true;
  }

  await mongoose.connect(uri);
  console.log(inMemory
    ? `MongoDB en memoria. Para verlo en Compass: ${uri}`
    : 'Conectado a MongoDB');
  return { inMemory };
}

module.exports = connectDB;
