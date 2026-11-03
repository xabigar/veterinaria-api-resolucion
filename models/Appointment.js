const { Schema, model } = require('mongoose');

const appointmentSchema = new Schema({
  date: {
    type: Date,
    required: [true, 'La fecha es obligatoria']
  },
  reason: {
    type: String,
    required: [true, 'El motivo es obligatorio'],
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'done', 'cancelled'],
    default: 'scheduled'
  },
  // La relación N-N (mascotas ↔ veterinarios) se guarda en esta colección
  pet: { type: Schema.Types.ObjectId, ref: 'Pet', required: [true, 'La mascota es obligatoria'] },
  vet: { type: Schema.Types.ObjectId, ref: 'Vet', required: [true, 'El veterinario es obligatorio'] }
}, { timestamps: true });

module.exports = model('Appointment', appointmentSchema);
