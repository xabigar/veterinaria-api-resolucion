// Parte 3: errores → códigos HTTP (manejador básico dado + reto resuelto)

// Rutas desconocidas → 404 en JSON (reto)
function notFound(req, res) {
  res.status(404).json({ error: 'La ruta no existe' });
}

function errorHandler(err, req, res, next) {
  // No se cumplen las reglas del esquema (required, enum, match…)
  // Reto: devolver también la lista de campos que fallan (err.errors)
  if (err.name === 'ValidationError') {
    const errors = {};
    for (const [field, e] of Object.entries(err.errors)) errors[field] = e.message;
    return res.status(400).json({ error: 'Datos no válidos', errors });
  }

  // ID o tipo no válido (p. ej. /api/vets/abc)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `El valor del campo '${err.path}' no es correcto` });
  }

  // Valor duplicado en un campo unique (error de MongoDB)
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Valor duplicado', fields: err.keyValue });
  }

  // JSON mal escrito en el cuerpo (express.json())
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON no válido' });
  }

  console.error(err);
  res.status(500).json({ error: 'Error del servidor' });
}

module.exports = { errorHandler, notFound };
