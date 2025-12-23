# Modelos de Datos - MongoDB

## Vision General

Este directorio documenta todos los modelos de datos utilizados en InscripcionesUAIE. Los modelos estan implementados con Mongoose ODM y definen la estructura de las colecciones en MongoDB.

---

## Modelos Disponibles

| Modelo | Coleccion | Descripcion | Documentacion |
|--------|-----------|-------------|---------------|
| Alumno | alumnos | Estudiantes inscritos en el sistema | [Ver](./alumno.md) |
| Personal | personal | Personal academico (docentes, tutores, coordinadores, etc.) | [Ver](./personal.md) |
| Materia | materias | Asignaturas ofrecidas por carrera | [Ver](./materia.md) |
| Horario | horarios | Horarios de inscripcion de alumnos | [Ver](./horario.md) |
| HistorialAcademico | historialacademicos | Historico de semestres | [Ver](./historial-academico.md) |
| Docente | docentes | Informacion de docentes | [Ver](./docente.md) |
| Coordinador | coordinadores | Informacion de coordinadores | [Ver](./coordinador.md) |
| Tutor | tutores | Informacion de tutores | [Ver](./tutor.md) |
| Administrador | administradores | Informacion de administradores | [Ver](./administrador.md) |

---

## Relaciones Entre Modelos

```
┌─────────────┐
│   Alumno    │
├─────────────┤
│ - horario   │──────┐
│ - tutor     │──┐   │
└─────────────┘  │   │
                 │   │    ┌──────────────┐
                 │   └───>│   Horario    │
                 │        ├──────────────┤
                 │        │ - materias[] │───┐
                 │        └──────────────┘   │
                 │                            │
                 │        ┌──────────────┐   │
                 └───────>│    Tutor     │   │
                          └──────────────┘   │
                                             │
┌─────────────┐                              │
│   Materia   │<─────────────────────────────┘
├─────────────┤
│ - alumnos[] │
│ - docente   │──────┐
└─────────────┘      │
                     │
                     │    ┌──────────────┐
                     └───>│   Docente    │
                          └──────────────┘

┌─────────────┐
│  Personal   │
├─────────────┤
│ - roles[]   │
└─────────────┘
```

---

## Convenciones

### Tipos de Datos Mongoose

| Tipo | Mongoose | Descripcion |
|------|----------|-------------|
| Texto | `String` | Cadenas de texto |
| Numero | `Number` | Valores numericos |
| Booleano | `Boolean` | true/false |
| Fecha | `Date` | Fechas y timestamps |
| Referencia | `Schema.Types.ObjectId` | Relacion a otro documento |
| Array | `[]` | Lista de valores |

### Referencias

Las relaciones entre documentos usan:
- `ref: 'NombreModelo'` para especificar el modelo relacionado
- `.populate()` en queries para obtener datos relacionados

Ejemplo:
```javascript
// Obtener alumno con horario poblado
const alumno = await Alumno.findById(id).populate('horario');
```

---

## Indices

### Alumno
- `matricula` (unico)

### Personal
- `matricula` (unico)

### Materia
- Sin indices especificos definidos

### Horario
- Sin indices especificos definidos

---

## Validaciones

Mongoose proporciona validaciones a nivel de esquema:

- **required**: Campo obligatorio
- **unique**: Valor debe ser unico en la coleccion
- **enum**: Valor debe estar en lista predefinida
- **default**: Valor por defecto si no se proporciona

---

## Ubicacion de Archivos

Todos los modelos estan en: `node_backend/models/`

```
node_backend/models/
├── Alumno.js
├── Personal.js
├── Materia.js
├── Horario.js
├── HistorialAcademico.js
├── Docentes.js
├── Coordinadores.js
├── Tutores.js
├── Administradores.js
├── Coordinador_Gen.js
└── Administrador_Gen.js
```

---

## Uso General

### Importar Modelo

```javascript
const Alumno = require('../models/Alumno');
const Personal = require('../models/Personal');
```

### Crear Documento

```javascript
const nuevoAlumno = new Alumno({
  matricula: '2024630001',
  nombre: 'Juan Perez',
  id_carrera: 'IE',
  correo: 'juan@ejemplo.com',
  telefono: '5551234567'
});

await nuevoAlumno.save();
```

### Consultar

```javascript
// Buscar por ID
const alumno = await Alumno.findById(id);

// Buscar uno
const alumno = await Alumno.findOne({ matricula: '2024630001' });

// Buscar varios
const alumnos = await Alumno.find({ id_carrera: 'IE' });
```

### Actualizar

```javascript
await Alumno.findByIdAndUpdate(id, {
  telefono: '5559876543'
}, { new: true });
```

### Eliminar

```javascript
await Alumno.findByIdAndDelete(id);
```

---

## Documentos Relacionados

- [Arquitectura del Sistema](../../arquitectura/README.md)
- [Endpoints API](../endpoints/README.md)
- [Roles y Permisos](../../referencia/roles-permisos.md)
