# Modelo: Horario

## Descripcion

Representa el horario de inscripcion de un alumno. Contiene las materias inscritas, el estado de validacion del horario y comentarios del tutor.

---

## Coleccion

**Nombre**: `horarios`

---

## Esquema

| Campo | Tipo | Requerido | Unico | Default | Descripcion |
|-------|------|-----------|-------|---------|-------------|
| `materias` | Array[ObjectId] | No | No | [] | Materias inscritas (ref: 'Materia') |
| `estatus` | Number | No | No | 0 | Estado del horario (0, 1, 2) |
| `comentario` | String | No | No | '' | Comentarios del tutor |

---

## Estados del Horario

El campo `estatus` indica el estado de validacion:

| Valor | Estado | Descripcion |
|-------|--------|-------------|
| `0` | Pendiente | Horario no revisado por el tutor |
| `1` | Aprobado | Horario validado y aprobado |
| `2` | Rechazado | Horario rechazado, requiere cambios |

---

## Ejemplo de Documento

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "materias": [
    "64a1b2c3d4e5f6g7h8i9j0k2",
    "64a1b2c3d4e5f6g7h8i9j0k3",
    "64a1b2c3d4e5f6g7h8i9j0k4",
    "64a1b2c3d4e5f6g7h8i9j0k5"
  ],
  "estatus": 1,
  "comentario": "Horario aprobado. Buena seleccion de materias."
}
```

---

## Uso en Codigo

### Crear Horario

```javascript
const Horario = require('../models/Horario');

const nuevoHorario = new Horario({
  materias: [materiaId1, materiaId2, materiaId3],
  estatus: 0,
  comentario: ''
});

await nuevoHorario.save();
```

### Agregar Materia

```javascript
await Horario.findByIdAndUpdate(horarioId, {
  $push: { materias: materiaId }
}, { new: true });
```

### Quitar Materia

```javascript
await Horario.findByIdAndUpdate(horarioId, {
  $pull: { materias: materiaId }
}, { new: true });
```

### Aprobar Horario

```javascript
await Horario.findByIdAndUpdate(horarioId, {
  estatus: 1,
  comentario: 'Horario aprobado'
}, { new: true });
```

### Rechazar Horario

```javascript
await Horario.findByIdAndUpdate(horarioId, {
  estatus: 2,
  comentario: 'Conflicto de horarios entre Calculo II y Fisica I'
}, { new: true });
```

### Obtener con Materias

```javascript
const horario = await Horario.findById(id)
  .populate({
    path: 'materias',
    populate: { path: 'docente' }
  });
```

---

## Relaciones

### materias → Materia

Relacion **uno a muchos** con el modelo `Materia`.

```javascript
const horario = await Horario.findById(id).populate('materias');
// horario.materias contiene array de objetos Materia
```

### Alumno → Horario

Un `Alumno` tiene referencia a un `Horario` (relacion inversa):

```javascript
const alumno = await Alumno.findById(id).populate('horario');
// alumno.horario contiene objeto Horario
```

---

## Consultas Comunes

### Horarios Pendientes

```javascript
const pendientes = await Horario.find({ estatus: 0 });
```

### Horarios Aprobados

```javascript
const aprobados = await Horario.find({ estatus: 1 });
```

### Horarios Rechazados

```javascript
const rechazados = await Horario.find({ estatus: 2 });
```

### Horario de un Alumno

```javascript
const alumno = await Alumno.findById(alumnoId).populate({
  path: 'horario',
  populate: {
    path: 'materias',
    populate: { path: 'docente' }
  }
});

const horario = alumno.horario;
```

---

## Validaciones de Negocio

### Verificar Conflictos de Horario

Antes de agregar una materia, verificar que no haya traslape de horarios:

```javascript
const horario = await Horario.findById(horarioId).populate('materias');
const nuevaMateria = await Materia.findById(nuevaMateriaId);

for (const materia of horario.materias) {
  if (tienenConflicto(materia, nuevaMateria)) {
    throw new Error('Conflicto de horarios');
  }
}
```

### Limitar Numero de Materias

Algunos programas limitan el numero de materias por semestre:

```javascript
const MAX_MATERIAS = 6;

if (horario.materias.length >= MAX_MATERIAS) {
  throw new Error(`Maximo ${MAX_MATERIAS} materias por semestre`);
}
```

---

## Flujo de Validacion

1. **Alumno inscribe materias** → `estatus: 0` (Pendiente)
2. **Tutor revisa horario**
   - Si aprueba → `estatus: 1` + comentario positivo
   - Si rechaza → `estatus: 2` + comentario con razones
3. **Alumno ajusta** (si fue rechazado) → `estatus: 0` de nuevo
4. **Repite hasta aprobacion**

```javascript
// Tutor aprueba
await validarHorario(horarioId, true, 'Todo correcto');

// Tutor rechaza
await validarHorario(horarioId, false, 'Traslape en martes 9-11');

async function validarHorario(id, aprobado, comentario) {
  await Horario.findByIdAndUpdate(id, {
    estatus: aprobado ? 1 : 2,
    comentario: comentario
  }, { new: true });
}
```

---

## Notas

- Un horario vacio es valido (array `materias` vacio)
- El `comentario` es especialmente importante cuando `estatus` es 2 (rechazado)
- Los horarios aprobados (`estatus: 1`) no deberian modificarse sin resetear el estatus
- Al agregar/quitar materias de un horario aprobado, considerar resetear `estatus` a 0

---

## Ubicacion del Archivo

`node_backend/models/Horario.js`

---

## Documentos Relacionados

- [Modelo Alumno](./alumno.md)
- [Modelo Materia](./materia.md)
- [Endpoints Horarios](../endpoints/horarios.md)
- [Rol Tutor](../../referencia/roles-permisos.md#tutores-t)
