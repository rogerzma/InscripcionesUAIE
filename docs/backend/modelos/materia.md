# Modelo: Materia

## Descripcion

Representa las asignaturas ofrecidas en el sistema. Cada materia pertenece a una carrera especifica y contiene informacion sobre horarios, cupo, docente asignado y alumnos inscritos.

---

## Coleccion

**Nombre**: `materias`

---

## Esquema

| Campo | Tipo | Requerido | Unico | Default | Descripcion |
|-------|------|-----------|-------|---------|-------------|
| `id_materia` | Number | No | No | - | Identificador numerico de la materia |
| `id_carrera` | String | Si | No | - | Codigo de la carrera (IE, ICE, IES, etc.) |
| `nombre` | String | Si | No | - | Nombre de la materia |
| `horarios` | Object | No | No | - | Horarios por dia de la semana |
| `horarios.lunes` | String | No | No | null | Horario del lunes |
| `horarios.martes` | String | No | No | null | Horario del martes |
| `horarios.miercoles` | String | No | No | null | Horario del miercoles |
| `horarios.jueves` | String | No | No | null | Horario del jueves |
| `horarios.viernes` | String | No | No | null | Horario del viernes |
| `horarios.sabado` | String | No | No | null | Horario del sabado |
| `semi` | String | No | No | null | Modalidad semiescolarizada |
| `alumnos` | Array[ObjectId] | No | No | [] | Alumnos inscritos (ref: 'Alumno') |
| `salon` | String | Si | No | - | Numero o nombre del salon |
| `grupo` | String | Si | No | - | Grupo (ej: 1M1, 2S1) |
| `cupo` | Number | Si | No | - | Cupo maximo de alumnos |
| `laboratorio` | Boolean | No | No | false | Indica si es materia de laboratorio |
| `docente` | ObjectId | No | No | null | Docente asignado (ref: 'Docente') |

---

## Estructura de Horarios

El campo `horarios` es un objeto con propiedades para cada dia:

```javascript
{
  horarios: {
    lunes: "07:00-09:00",
    martes: null,
    miercoles: "07:00-09:00",
    jueves: null,
    viernes: "07:00-09:00",
    sabado: null
  }
}
```

Formato de horario: `"HH:MM-HH:MM"` o `null` si no hay clase ese dia.

---

## Ejemplo de Documento

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "id_materia": 1001,
  "id_carrera": "IE",
  "nombre": "Circuitos Electricos I",
  "horarios": {
    "lunes": "07:00-09:00",
    "martes": null,
    "miercoles": "07:00-09:00",
    "jueves": null,
    "viernes": "07:00-09:00",
    "sabado": null
  },
  "semi": null,
  "alumnos": [
    "64a1b2c3d4e5f6g7h8i9j0k2",
    "64a1b2c3d4e5f6g7h8i9j0k3"
  ],
  "salon": "A-201",
  "grupo": "1M1",
  "cupo": 30,
  "laboratorio": false,
  "docente": "64a1b2c3d4e5f6g7h8i9j0k4"
}
```

---

## Uso en Codigo

### Crear Materia

```javascript
const Materia = require('../models/Materia');

const nuevaMateria = new Materia({
  id_materia: 1001,
  id_carrera: 'IE',
  nombre: 'Circuitos Electricos I',
  horarios: {
    lunes: '07:00-09:00',
    miercoles: '07:00-09:00',
    viernes: '07:00-09:00'
  },
  salon: 'A-201',
  grupo: '1M1',
  cupo: 30,
  laboratorio: false
});

await nuevaMateria.save();
```

### Buscar Materias por Carrera

```javascript
const materias = await Materia.find({ id_carrera: 'IE' });
```

### Asignar Docente

```javascript
await Materia.findByIdAndUpdate(materiaId, {
  docente: docenteId
}, { new: true });
```

### Inscribir Alumno

```javascript
await Materia.findByIdAndUpdate(materiaId, {
  $push: { alumnos: alumnoId }
}, { new: true });
```

### Desinscribir Alumno

```javascript
await Materia.findByIdAndUpdate(materiaId, {
  $pull: { alumnos: alumnoId }
}, { new: true });
```

### Obtener con Alumnos y Docente

```javascript
const materia = await Materia.findById(id)
  .populate('alumnos')
  .populate('docente');
```

---

## Relaciones

### alumnos → Alumno

Relacion **uno a muchos** con el modelo `Alumno`.

```javascript
const materia = await Materia.findById(id).populate('alumnos');
// materia.alumnos contiene array de objetos Alumno
```

### docente → Docente

Relacion **uno a uno** con el modelo `Docente`.

```javascript
const materia = await Materia.findById(id).populate('docente');
// materia.docente contiene objeto Docente
```

---

## Consultas Comunes

### Materias con Cupo Disponible

```javascript
const disponibles = await Materia.find({
  $expr: { $lt: [{ $size: '$alumnos' }, '$cupo'] }
});
```

### Materias de un Docente

```javascript
const materias = await Materia.find({ docente: docenteId });
```

### Materias de Laboratorio

```javascript
const laboratorios = await Materia.find({ laboratorio: true });
```

### Materias Semiescolarizadas

```javascript
const semiescolarizadas = await Materia.find({ 
  semi: { $ne: null } 
});
```

### Materias por Grupo

```javascript
const materias = await Materia.find({ grupo: '1M1' });
```

---

## Validaciones de Negocio

### Verificar Cupo

Antes de inscribir un alumno:

```javascript
const materia = await Materia.findById(materiaId);

if (materia.alumnos.length >= materia.cupo) {
  throw new Error('Cupo lleno');
}
```

### Verificar Conflicto de Horarios

Comparar horarios de dos materias:

```javascript
function tienenConflicto(materia1, materia2) {
  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  
  for (const dia of dias) {
    if (materia1.horarios[dia] && materia2.horarios[dia]) {
      // Verificar traslape de horarios
      // Implementar logica de comparacion de rangos
      return true;
    }
  }
  
  return false;
}
```

---

## Notas

- El campo `id_materia` es opcional y puede usarse para referencias externas
- El campo `semi` se usa para materias semiescolarizadas
- El array `alumnos` no debe exceder el `cupo` definido
- Los horarios se almacenan como strings en formato "HH:MM-HH:MM"
- Una materia sin `docente` asignado tiene valor `null`

---

## Ubicacion del Archivo

`node_backend/models/Materia.js`

---

## Documentos Relacionados

- [Modelo Alumno](./alumno.md)
- [Modelo Docente](./docente.md)
- [Endpoints Materias](../endpoints/materias.md)
- [Roles y Permisos](../../referencia/roles-permisos.md)
