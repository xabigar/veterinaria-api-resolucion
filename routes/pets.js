// DADO (ejemplos de las diapositivas).
// DELETE también elimina las citas de la mascota, gracias al hook del modelo Pet (extra).
const router = require('express').Router();
const Pet = require('../models/Pet');

// Crear: POST /api/pets
router.post('/', async (req, res, next) => {
  try {
    const pet = await Pet.create(req.body);
    res.status(201).json(pet);
  } catch (err) { next(err); }
});

// Leer: GET /api/pets?species=dog
router.get('/', async (req, res, next) => {
  try {
    const { species } = req.query;
    const filter = species ? { species: String(species) } : {};
    const pets = await Pet.find(filter)
      .select('name species owner')
      .sort({ name: 1 })
      .limit(20);
    res.json(pets);
  } catch (err) { next(err); }
});

// Actualizar: PATCH /api/pets/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!pet) return res.status(404).json({ error: 'No encontrado' });
    res.json(pet);
  } catch (err) { next(err); }
});

// Eliminar: DELETE /api/pets/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) return res.status(404).json({ error: 'No encontrado' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
