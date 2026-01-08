# Modelo Coordinador General

Modelo que representa al coordinador general con acceso a todas las carreras.

---

## Archivo

`node_backend/models/Coordinador_Gen.js`

---

## Schema

```javascript
const CoordinadorGenMdl = new Schema({
  personalMatricula: {
    type: String,
    required: true,
    unique: true
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

| Campo | Tipo | Requerido | Unico | Descripcion |
|-------|------|-----------|-------|-------------|
| `personalMatricula` | String | Si | Si | Matricula del CG |
| `alumnos` | Array[ObjectId] (ref: Alumno) | No | - | Alumnos (todas las carreras) |

---

## Coleccion

MongoDB: `coordinadorgens`

---

## Relaciones

- **Personal**: Referencia implicita por `personalMatricula`
- **Alumno**: Array de referencias a todos los alumnos

---

## Uso

```javascript
const CoordinadorGen = require('../models/Coordinador_Gen');

// Crear coordinador general
const cg = new CoordinadorGen({
  personalMatricula: 'CG0001'
});
await cg.save();
```

---

## Funciones del Coordinador General

El Coordinador General (CG) tiene acceso completo a:

1. **Gestionar alumnos**: CRUD de alumnos de **todas** las carreras
2. **Gestionar materias**: CRUD de materias de **todas** las carreras
3. **Gestionar personal**: CRUD de personal de **todas** las carreras
4. **Asignar tutores**: Asignar tutores a cualquier alumno
5. **Configurar sistema**: Acceso a configuraciones globales
6. **Historial academico**: Generar y gestionar historiales
7. **Purga de datos**: Vaciar base de datos al fin de semestre

---

## Permisos vs Coordinador de Carrera

| Caracteristica | Coordinador | Coordinador General |
|----------------|-------------|---------------------|
| Alcance | Una carrera | Todas las carreras |
| CRUD Alumnos | Su carrera | Todas |
| CRUD Materias | Su carrera | Todas |
| CRUD Personal | Su carrera | Todas |
| Historial academico | No | Si |
| Purga de datos | No | Si |

---

## Notas

- Solo debe existir un Coordinador General activo
- Matricula tipica: `CG0000` o `CG0001`
- Es el usuario que ejecuta las tareas automaticas del cron job
- NO es eliminado durante la purga de fin de semestre
