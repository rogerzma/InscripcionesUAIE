# Modelo Administrador

Modelo que representa un administrador de carrera (solo lectura).

---

## Archivo

`node_backend/models/Administradores.js`

---

## Schema

```javascript
const AdministradorMdl = new Schema({
  id_carrera: {
    type: String,
    required: true
  },
  personalMatricula: {
    type: String,
    ref: 'Personal',
    required: true
  }
});
```

---

## Campos

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `id_carrera` | String | Si | Codigo de carrera |
| `personalMatricula` | String (ref: Personal) | Si | Matricula del administrador |

---

## Coleccion

MongoDB: `administradors`

---

## Relaciones

- **Personal**: Referencia por `personalMatricula`

---

## Uso

```javascript
const Administrador = require('../models/Administradores');

// Crear administrador
const admin = new Administrador({
  id_carrera: 'ISftw',
  personalMatricula: 'A0001'
});
await admin.save();

// Obtener administrador por carrera
const adminCarrera = await Administrador.findOne({ id_carrera: 'ISftw' });
```

---

## Funciones del Administrador

El administrador tiene acceso de **solo lectura** a:

1. **Ver alumnos**: Lista de alumnos de su carrera
2. **Ver materias**: Lista de materias de su carrera
3. **Ver personal**: Lista de personal de su carrera
4. **Ver horarios**: Estado de horarios de alumnos
5. **Ver tutores**: Lista de tutores disponibles

---

## Diferencias con Coordinador

| Caracteristica | Coordinador | Administrador |
|----------------|-------------|---------------|
| CRUD Alumnos | Si | No |
| CRUD Materias | Si | No |
| CRUD Personal | Si | No |
| Asignar tutores | Si | No |
| Ver datos | Si | Si |
| Configurar horas | Si | No |
| Validar comprobantes | Si | No |

---

## Notas

- El administrador se crea automaticamente cuando se asigna el rol 'A' a un personal
- Puede haber multiples administradores por carrera
- Util para personal que necesita consultar datos sin modificarlos
