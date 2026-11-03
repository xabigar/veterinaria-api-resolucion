const router = require('express').Router();
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const Vet = require('../models/Vet');

// GET /api/appointments: todas las citas (de apoyo)
router.get('/', async (req, res, next) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1 });
    res.json(appointments);
  } catch (err) { next(err); }
});

// 5. GET /api/appointments/upcoming: próximas citas programadas, con sus datos relacionados
//    Filtro opcional: ?vet=<id> → solo las de ese veterinario
//    Importante: definirla ANTES de las rutas del tipo /:id
router.get('/upcoming', async (req, res, next) => {
  try {
    const filter = { date: { $gte: new Date() }, status: 'scheduled' };
    if (req.query.vet) filter.vet = String(req.query.vet);   // id no válido → CastError → 400

    const appointments = await Appointment.find(filter)
      .sort({ date: 1 })
      .populate('vet', 'name speciality')
      .populate({
        path: 'pet',
        select: 'name species',
        populate: { path: 'owner', select: 'name email' }
      });
    res.json(appointments);
  } catch (err) { next(err); }
});

// 4. POST /api/appointments: crear una cita
//    Comprobar que existen la mascota y el veterinario
router.post('/', async (req, res, next) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.validate();          // comprobar required, enum y los ObjectId

    const [petExists, vetExists] = await Promise.all([
      Pet.exists({ _id: appointment.pet }),
      Vet.exists({ _id: appointment.vet })
    ]);
    if (!petExists) return res.status(400).json({ error: 'La mascota no existe' });
    if (!vetExists) return res.status(400).json({ error: 'El veterinario no existe' });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) { next(err); }
});

// 6. DELETE /api/appointments/past: eliminar las citas pasadas
//    Importante: definirla ANTES de las rutas del tipo /:id
router.delete('/past', async (req, res, next) => {
  try {
    const result = await Appointment.deleteMany({ date: { $lt: new Date() } });
    res.json({ deleted: result.deletedCount });
  } catch (err) { next(err); }
});

module.exports = router;
