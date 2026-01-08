# Modelo Coordinador

Modelo que representa un coordinador de carrera con sus configuraciones especificas.

---

## Archivo

`node_backend/models/Coordinadores.js`

---

## Schema

```javascript
const CoordinadorMdl = new Schema({
  id_carrera: {
    type: String,
    required: true
  },
  personalMatricula: {
    type: String,
    ref: 'Personal',
    required: true
  },
  alumnos: [{
    type: Schema.Types.ObjectId,
    ref: 'Alumno',
    default: []
  }],
  horas: {
    type: Number,
    default: 40
  },
  comprobantePagoHabilitado: {
    type: Boolean,
    default: true
  }
});
```

---

## Campos

| Campo | Tipo | Requerido | Default | Descripcion |
|-------|------|-----------|---------|-------------|
| `id_carrera` | String | Si | - | Codigo de carrera |
| `personalMatricula` | String (ref: Personal) | Si | - | Matricula del coordinador |
| `alumnos` | Array[ObjectId] (ref: Alumno) | No | [] | Alumnos de la carrera |
| `horas` | Number | No | 40 | Horas maximas permitidas |
| `comprobantePagoHabilitado` | Boolean | No | true | Requiere comprobante |

---

## Coleccion

MongoDB: `coordinadors`

---

## Relaciones

- **Personal**: Referencia por `personalMatricula`
- **Alumno**: Array de referencias a alumnos de la carrera

---

## Uso

```javascript
const Coordinador = require('../models/Coordinadores');

// Crear coordinador
const coordinador = new Coordinador({
  id_carrera: 'ISftw',
  personalMatricula: 'C0001',
  horas: 40,
  comprobantePagoHabilitado: true
});
await coordinador.save();

// Actualizar horas permitidas
await Coordinador.findOneAndUpdate(
  { id_carrera: 'ISftw' },
  { horas: 45 }
);

// Habilitar/deshabilitar comprobante
await Coordinador.findOneAndUpdate(
  { id_carrera: 'ISftw' },
  { comprobantePagoHabilitado: false }
);
```

---

## Funciones del Coordinador

1. **Gestionar alumnos**: CRUD de alumnos de su carrera
2. **Gestionar materias**: CRUD de materias de su carrera
3. **Gestionar personal**: CRUD de personal de su carrera
4. **Asignar tutores**: Asignar tutores a alumnos
5. **Configurar horas**: Establecer horas maximas de inscripcion
6. **Validar comprobantes**: Aceptar/rechazar comprobantes de pago
7. **Habilitar comprobante**: Activar/desactivar requisito de comprobante

---

## Notas

- Cada carrera tiene un unico coordinador
- El coordinador se crea automaticamente cuando se asigna el rol 'C' a un personal
- Las horas por defecto son 40 (equivalentes a creditos)
- El comprobante de pago puede deshabilitarse temporalmente
