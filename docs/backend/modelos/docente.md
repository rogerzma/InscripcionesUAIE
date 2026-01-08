# Modelo Docente

Modelo que representa la relacion entre personal con rol de docente, sus materias y alumnos asignados.

---

## Archivo

`node_backend/models/Docentes.js`

---

## Schema

```javascript
const DocentesMdl = new Schema({
  personalMatricula: {
    type: String,
    ref: 'Personal',
    required: true
  },
  materias: [{
    type: Schema.Types.ObjectId,
    ref: 'Materia',
    default: []
  }],
  alumnos: [{
    type: Schema.Types.ObjectId,
    ref: 'Alumno',
    default: []
  }]
});
```

---

## Campos

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `personalMatricula` | String (ref: Personal) | Si | Matricula del personal |
| `materias` | Array[ObjectId] (ref: Materia) | No | Materias que imparte |
| `alumnos` | Array[ObjectId] (ref: Alumno) | No | Alumnos asignados |

---

## Coleccion

MongoDB: `docentes`

---

## Relaciones

- **Personal**: Referencia por `personalMatricula` a la coleccion `personal`
- **Materia**: Array de referencias a la coleccion `materias`
- **Alumno**: Array de referencias a la coleccion `alumnos`

---

## Uso

```javascript
const Docente = require('../models/Docentes');

// Crear docente
const docente = new Docente({
  personalMatricula: 'D0001',
  materias: [],
  alumnos: []
});
await docente.save();

// Obtener docente con datos poblados
const docenteCompleto = await Docente.findOne({ personalMatricula: 'D0001' })
  .populate('materias')
  .populate('alumnos');
```

---

## Notas

- El docente se crea automaticamente cuando se asigna el rol 'D' a un personal
- Las materias se asignan desde el panel de coordinador
- Los alumnos se asignan automaticamente al inscribirse en las materias del docente
