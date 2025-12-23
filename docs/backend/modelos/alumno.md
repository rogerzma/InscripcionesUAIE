# Modelo: Alumno

## Descripcion

Representa a los estudiantes inscritos en el sistema de Inscripciones UAIE. Almacena informacion personal, academica y de contacto de cada alumno.

---

## Coleccion

**Nombre**: `alumnos`

---

## Esquema

| Campo | Tipo | Requerido | Unico | Default | Descripcion |
|-------|------|-----------|-------|---------|-------------|
| `id_carrera` | String | Si | No | - | Codigo de la carrera (IE, ICE, IES, etc.) |
| `matricula` | String | Si | Si | - | Numero de matricula del alumno |
| `nombre` | String | Si | No | - | Nombre completo del alumno |
| `telefono` | String | Si | No | - | Numero telefonico de contacto |
| `correo` | String | Si | No | - | Correo electronico institucional o personal |
| `horario` | ObjectId | No | No | null | Referencia al horario inscrito (ref: 'Horario') |
| `tutor` | String | No | No | null | Matricula del tutor asignado |
| `estatusComprobante` | String | No | No | "Pendiente" | Estado del comprobante de pago |

---

## Validaciones

### estatusComprobante

Valores permitidos (enum):
- `"Pendiente"` - Comprobante no revisado aun
- `"Aceptado"` - Comprobante validado y aprobado
- `"Rechazado"` - Comprobante no valido o rechazado

---

## Relaciones

### horario → Horario

Relacion **uno a uno** con el modelo `Horario`.

```javascript
const alumno = await Alumno.findById(id).populate('horario');
// alumno.horario contiene el objeto Horario completo
```

### tutor → Tutores

Relacion mediante `matricula` del tutor (String).

---

## Ejemplo de Documento

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "id_carrera": "IE",
  "matricula": "2024630001",
  "nombre": "Juan Perez Garcia",
  "telefono": "5551234567",
  "correo": "juan.perez@alumno.ipn.mx",
  "horario": "64a1b2c3d4e5f6g7h8i9j0k2",
  "tutor": "P2020001",
  "estatusComprobante": "Aceptado"
}
```

---

## Uso en Codigo

### Crear Alumno

```javascript
const Alumno = require('../models/Alumno');

const nuevoAlumno = new Alumno({
  id_carrera: 'IE',
  matricula: '2024630001',
  nombre: 'Juan Perez Garcia',
  telefono: '5551234567',
  correo: 'juan.perez@alumno.ipn.mx'
});

await nuevoAlumno.save();
```

### Buscar por Matricula

```javascript
const alumno = await Alumno.findOne({ matricula: '2024630001' });
```

### Asignar Tutor

```javascript
await Alumno.findByIdAndUpdate(alumnoId, {
  tutor: 'P2020001'
}, { new: true });
```

### Actualizar Comprobante

```javascript
await Alumno.findByIdAndUpdate(alumnoId, {
  estatusComprobante: 'Aceptado'
}, { new: true });
```

### Obtener con Horario

```javascript
const alumno = await Alumno.findById(id)
  .populate({
    path: 'horario',
    populate: {
      path: 'materias'
    }
  });
```

---

## Indices

- `matricula`: Indice unico para busquedas rapidas

---

## Consultas Comunes

### Alumnos por Carrera

```javascript
const alumnos = await Alumno.find({ id_carrera: 'IE' });
```

### Alumnos sin Horario

```javascript
const sinHorario = await Alumno.find({ horario: null });
```

### Alumnos con Comprobante Pendiente

```javascript
const pendientes = await Alumno.find({ estatusComprobante: 'Pendiente' });
```

### Alumnos de un Tutor

```javascript
const tutorados = await Alumno.find({ tutor: 'P2020001' });
```

---

## Notas

- La `matricula` es unica en todo el sistema
- El campo `horario` es `null` hasta que el alumno realiza su primera inscripcion
- El campo `tutor` almacena la matricula (String) del tutor, no una referencia ObjectId
- Los alumnos inician sesion solo con matricula (sin password)

---

## Ubicacion del Archivo

`node_backend/models/Alumno.js`

---

## Documentos Relacionados

- [Modelo Horario](./horario.md)
- [Modelo Tutores](./tutor.md)
- [Endpoints Alumnos](../endpoints/alumnos.md)
- [Login Alumno](../autenticacion.md#login-alumno)
