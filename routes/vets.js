const router = require('express').Router();
const Vet = require('../models/Vet');

// POST /api/vets: crear un veterinario (para las pruebas)
router.post('/', async (req, res, next) => {
  try {
    const vet = await Vet.create(req.body);
    res.status(201).json(vet);
  } catch (err) { next(err); }
});

// 2. GET /api/vets?day=lunes&speciality=perros
//    Los que atienden ese día O tienen esa especialidad ($or)
router.get('/', async (req, res, next) => {
  try {
    const { day, speciality } = req.query;
    const conditions = [];
    if (day) conditions.push({ availableDays: String(day).toLowerCase() });  // buscar dentro de un array
    if (speciality) conditions.push({ speciality: String(speciality).toLowerCase() });

    const filter = conditions.length ? { $or: conditions } : {};   // un $or vacío da error
    const vets = await Vet.find(filter).sort({ name: 1 });
    res.json(vets);
  } catch (err) { next(err); }
});

// 3. PATCH /api/vets/:id: actualizar el email
//    returnDocument: 'after' → devuelve el documento actualizado (si no, el antiguo)
//    runValidators: true     → el validador match también se ejecuta al actualizar
router.patch('/:id', async (req, res, next) => {
  try {
    const { email } = req.body ?? {};
    if (!email) return res.status(400).json({ error: 'Falta el campo email' });

    const vet = await Vet.findByIdAndUpdate(
      req.params.id,
      { email },
      { returnDocument: 'after', runValidators: true }
    );
    if (!vet) return res.status(404).json({ error: 'Veterinario no encontrado' });
    res.json(vet);
  } catch (err) { next(err); }
});

module.exports = router;
