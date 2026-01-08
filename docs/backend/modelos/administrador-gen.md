# Modelo Administrador General

Modelo que representa al administrador general con acceso de lectura a todas las carreras.

---

## Archivo

`node_backend/models/Administrador_Gen.js`

---

## Schema

```javascript
const AdministradorGenMdl = new Schema({
  nombre: {
    type: String,
    required: true
  },
  personalMatricula: {
    type: String,
    required: true,
    unique: true
  }
});
```

---

## Campos

| Campo | Tipo | Requerido | Unico | Descripcion |
|-------|------|-----------|-------|-------------|
| `nombre` | String | Si | No | Nombre del administrador |
| `personalMatricula` | String | Si | Si | Matricula del AG |

---

## Coleccion

MongoDB: `administradorgens`

---

## Relaciones

- **Personal**: Referencia implicita por `personalMatricula`

---

## Uso

```javascript
const AdministradorGen = require('../models/Administrador_Gen');

// Crear administrador general
const ag = new AdministradorGen({
  nombre: 'Juan Perez',
  personalMatricula: 'AG0001'
});
await ag.save();
```

---

## Funciones del Administrador General

El Administrador General (AG) tiene acceso de **solo lectura** a:

1. **Ver alumnos**: De todas las carreras
2. **Ver materias**: De todas las carreras
3. **Ver personal**: De todas las carreras
4. **Ver horarios**: Estado de todos los horarios
5. **Ver tutores**: Lista completa de tutores
6. **Ver historiales**: Historiales academicos generados

---

## Permisos vs Coordinador General

| Caracteristica | Admin General | Coord General |
|----------------|---------------|---------------|
| Alcance | Todas las carreras | Todas las carreras |
| Ver datos | Si | Si |
| CRUD Alumnos | No | Si |
| CRUD Materias | No | Si |
| CRUD Personal | No | Si |
| Historial academico | Solo ver | Crear/Gestionar |
| Purga de datos | No | Si |

---

## Notas

- El Administrador General es un rol de supervision
- Puede haber multiples administradores generales
- Matricula tipica: `AG0001`, `AG0002`, etc.
- NO es eliminado durante la purga de fin de semestre
- Util para personal directivo que necesita visualizar estadisticas
