// DADO (ejemplo de las diapositivas)
// Parte 1: comprueba que cumple las condiciones pedidas.
const { Schema, model } = require('mongoose');

const ownerSchema = new Schema({
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true,
           lowercase: true, trim: true, match: /.+@.+\..+/ },
  phone: String
}, { timestamps: true });

module.exports = model('Owner', ownerSchema);   // colección: owners
