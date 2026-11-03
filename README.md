# API de veterinaria · Solución

Solución del ejercicio de la sesión Web Sistemas · Almacenaje de datos (MongoDB y Mongoose).

## Arrancar

```bash
npm install
npm run dev               # http://localhost:3000 · MongoDB en memoria + datos de ejemplo
```

Sin `.env`, MongoDB arranca en memoria (`mongodb-memory-server`) y los datos se cargan al arrancar.
Con una base de datos real: `.env.example` → `.env`, poner la URI y `npm run seed`.

Pruebas: `requests.http` (VS Code + extensión REST Client), Thunder Client, Postman o curl.

## Estructura

```
veterinaria-api/
├── server.js                  Express, rutas y middleware de errores
├── db.js                      Conexión: MONGODB_URI o MongoDB en memoria
├── seed.js                    Datos de ejemplo (en memoria: al arrancar; si no: npm run seed)
├── requests.http              Todas las pruebas
├── middleware/errorHandler.js Parte 3 (manejador básico dado + reto resuelto)
├── models/                    Parte 1
│   ├── Owner.js  Pet.js  Vet.js  Appointment.js
└── routes/                    Parte 2
    ├── owners.js  pets.js  vets.js  appointments.js
```

Si has usado Express Generator: lo que allí está en `app.js` (configuración y rutas) y en `bin/www`
(`app.listen()`), aquí está en un solo fichero, `server.js`.

## Lo que venía dado (el de las diapositivas)

`db.js`, `server.js`, `seed.js`, `requests.http`, `models/Owner.js`, `models/Pet.js` y `routes/pets.js`
(POST, GET, PATCH y DELETE), y el manejador básico de errores. En la solución, al modelo `Pet` se le ha
añadido el borrado en cascada (extra).

## Parte 1 · Modelos

`models/Vet.js` y `models/Appointment.js`. `Owner` y `Pet`, tal como vienen, cumplen las condiciones.

## Parte 2 · Endpoints

| # | Ruta | Resultado |
|---|---|---|
| 1 | `POST /api/owners` | 201 · email duplicado → 409 · datos no válidos → 400 |
| 2 | `GET /api/vets?day=…&speciality=…` | `$or`: ese día O esa especialidad; solo un parámetro → solo ese; ninguno → todos |
| 3 | `PATCH /api/vets/:id` | 200 · email no válido → 400 · si no existe → 404 |
| 4 | `POST /api/appointments` | 201 · si no existe la mascota o el veterinario → 400 |
| 5 | `GET /api/appointments/upcoming` | `populate`: pet → owner, vet · solo `scheduled` · filtro opcional `?vet=id` |
| 6 | `DELETE /api/appointments/past` | `{ deleted: N }` |

## Parte 3 · Reto

`middleware/errorHandler.js`: ValidationError → 400 con la lista de campos (`errors`), CastError → 400,
E11000 → 409, JSON no válido → 400, otros → 500. Además, `notFound`: rutas desconocidas → 404 en JSON.

## Decisiones importantes

- **`String()` en los filtros.** Los valores de la query string se convierten a texto para evitar la
  inyección NoSQL. No se usa `mongoose.set('sanitizeFilter', true)`: activado globalmente, también
  neutraliza nuestros propios operadores (`$gte`, `$lt`, los de dentro de `$or`), y estos necesitarían
  `mongoose.trusted()`.
- **`returnDocument: 'after'`.** En Mongoose 9, `new: true` está obsoleto (da un aviso).
- **`runValidators: true`.** Si no, `PATCH` aceptaría emails no válidos.
- **`appointment.validate()` antes de comprobar la existencia.** Primero el formato (required,
  ObjectId), después `Pet.exists()` / `Vet.exists()`.
- **`/upcoming` y `/past`** hay que definirlas antes de las rutas del tipo `/:id`.
- **Un `$or` vacío da error:** si no llega ningún parámetro, el filtro es `{}`.
- **`?vet=` no válido** lo gestiona el manejador de errores (CastError → 400).

## Preguntas para la puesta en común

1. **Datos del veterinario dentro de la cita: ¿embeber o referenciar?**
   Referenciar. Si el veterinario cambia de email, habría que actualizar todas las copias embebidas.
   Embeber solo tiene sentido si se quiere una «foto histórica» (cómo se llamaba el veterinario el día
   de la cita), y entonces la duplicación es intencionada.
2. **Al eliminar una mascota, ¿qué hacer con sus citas?**
   Dos opciones: borrarlas en cascada (aquí, con el hook `post('findOneAndDelete')`) o marcar la
   mascota como «inactiva» para conservar el historial (*soft delete*). El hook mantiene la lógica
   dentro del modelo, igual para todas las rutas.
3. **¿Qué endpoint necesita `populate()`? ¿Cuántas consultas se hacen?**
   Solo `/upcoming`. Se hacen cuatro consultas: citas, veterinarios, mascotas y dueños (una por cada
   `populate`, no una por cada documento).
