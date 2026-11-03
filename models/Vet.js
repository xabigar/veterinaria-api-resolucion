const { Schema, model } = require('mongoose');

const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

const vetSchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  speciality: {
    type: String,
    required: [true, 'La especialidad es obligatoria'],
    trim: true,
    lowercase: true
  },
  email: {                             // opcional: solo se comprueba si existe
    type: String,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'El email no tiene un formato válido']
  },
  availableDays: [{
    type: String,
    lowercase: true,
    enum: { values: DAYS, message: '{VALUE} no es un día de la semana' }
  }]
}, { timestamps: true });

module.exports = model('Vet', vetSchema);
