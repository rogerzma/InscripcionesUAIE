# Modelo Tutor

Modelo que representa la relacion entre personal con rol de tutor y sus alumnos tutorados.

---

## Archivo

`node_backend/models/Tutores.js`

---

## Schema

```javascript
const TutoresMdl = new Schema({
  personalMatricula: {
    type: String,
    ref: 'Personal',
    required: true
  },
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
| `alumnos` | Array[ObjectId] (ref: Alumno) | No | Alumnos tutorados |

---

## Coleccion

MongoDB: `tutors`

---

## Relaciones

- **Personal**: Referencia por `personalMatricula` a la coleccion `personal`
- **Alumno**: Array de referencias a la coleccion `alumnos`

---

## Uso

```javascript
const Tutor = require('../models/Tutores');

// Crear tutor
const tutor = new Tutor({
  personalMatricula: 'T0001',
  alumnos: []
});
await tutor.save();

// Obtener alumnos del tutor
const tutorConAlumnos = await Tutor.findOne({ personalMatricula: 'T0001' })
  .populate('alumnos');
```

---

## Funciones del Tutor

1. **Ver alumnos tutorados**: Lista de alumnos asignados
2. **Revisar horarios**: Ver horarios generados por tutorados
3. **Aprobar/Rechazar horarios**: Cambiar estatus del horario
4. **Enviar comentarios**: Notificar al alumno por correo

---

## Estados de Horario

El tutor puede cambiar el estatus del horario a:
- `1` - Aprobado por tutor
- `2` - Rechazado

---

## Notas

- El tutor se crea automaticamente cuando se asigna el rol 'T' a un personal
- Los alumnos se asignan desde el panel de coordinador
- Un tutor puede tener multiples alumnos
- Un alumno solo puede tener un tutor asignado
