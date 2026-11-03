const router = require('express').Router();
const Owner = require('../models/Owner');

// GET /api/owners: todos los dueños (ejemplo, dado)
router.get('/', async (req, res, next) => {
  try {
    const owners = await Owner.find().sort({ name: 1 });
    res.json(owners);
  } catch (err) { next(err); }
});

// 1. POST /api/owners: crear un dueño
//    Email duplicado → E11000 → 409 (en el manejador de errores)
router.post('/', async (req, res, next) => {
  try {
    const owner = await Owner.create(req.body);
    res.status(201).json(owner);
  } catch (err) { next(err); }
});

module.exports = router;
