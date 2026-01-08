# Endpoints de Alumnos

Base URL: `/api/alumnos`

Todos los endpoints requieren autenticacion JWT.

---

## Endpoints CRUD

### POST /
Crear un nuevo alumno.

**Body:**
```json
{
  "matricula": "2024630001",
  "nombre": "Juan Perez",
  "id_carrera": "ISftw",
  "correo": "juan@ejemplo.com",
  "telefono": "5551234567"
}
```

**Respuesta exitosa (201):**
```json
{
  "_id": "...",
  "matricula": "2024630001",
  "nombre": "Juan Perez",
  "id_carrera": "ISftw"
}
```

---

### GET /
Obtener todos los alumnos.

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "...",
    "matricula": "2024630001",
    "nombre": "Juan Perez",
    "id_carrera": "ISftw",
    "horario": { ... }
  }
]
```

---

### GET /paginados
Obtener alumnos con paginacion.

**Query params:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (opcional)

**Respuesta exitosa (200):**
```json
{
  "data": [...],
  "currentPage": 1,
  "totalPages": 5,
  "totalItems": 48
}
```

---

### GET /:id
Obtener alumno por ID.

---

### GET /matricula/:matricula
Obtener alumno por matricula.

---

### PUT /:id
Actualizar alumno.

---

### DELETE /:id
Eliminar alumno.

---

## Endpoints por Carrera

### GET /carrera/:matricula
Obtener alumnos de la carrera del coordinador.

### GET /carrera-paginados/:matricula
Obtener alumnos paginados por carrera.

### GET /carrera-admin/:matricula
Obtener alumnos de la carrera del administrador.

### GET /carrera-admin-paginados/:matricula
Obtener alumnos paginados (admin).

---

## Endpoints de Horarios

### GET /horario/:id
Obtener alumno con horario detallado.

### PUT /horario/:id
Actualizar horario del alumno.

### GET /estatus/:matricula
Obtener estatus del horario.

### GET /asignados/:matricula
Obtener alumnos asignados a un personal.

---

## Endpoints CSV

### GET /exportar-csv
Exportar todos los alumnos a CSV.

### POST /subir-csv
Importar alumnos desde CSV.

**Headers:** `Content-Type: multipart/form-data`
**Body:** archivo `csv`

### GET /exportar-csv/carrera/:id_carrera
Exportar alumnos por carrera.

### POST /subir-csv/carrera/:id_carrera
Importar alumnos por carrera.

### POST /exportar-csv/filtrados
Exportar alumnos filtrados.

### POST /exportar-csv/carrera-filtrados/:id_carrera
Exportar alumnos filtrados por carrera.

---

## Endpoints de Comprobantes

### POST /subir-comprobante/:matricula
Subir comprobante de pago (PDF).

**Headers:** `Content-Type: multipart/form-data`
**Body:** archivo `comprobante` (PDF)

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Comprobante subido correctamente"
}
```

---

### GET /comprobante/:matricula
Verificar si existe comprobante de pago.

**Respuesta exitosa (200):**
```json
{
  "existe": true,
  "ruta": "/uploads/comprobantes/Pago_2024630001.pdf"
}
```

---

### PUT /validar-comprobante/:matricula
Validar o rechazar comprobante de pago.

**Body:**
```json
{
  "estatus": "Aceptado"
}
```

Valores permitidos: `"Pendiente"`, `"Aceptado"`, `"Rechazado"`

---

### GET /comprobantes/lista
Obtener lista de todos los comprobantes subidos.

**Respuesta exitosa (200):**
```json
[
  "Pago_2024630001.pdf",
  "Pago_2024630002.pdf"
]
```

---

## Codigos de Estado

| Codigo | Descripcion |
|--------|-------------|
| 200 | Operacion exitosa |
| 201 | Creado correctamente |
| 400 | Datos invalidos o matricula duplicada |
| 401 | No autenticado |
| 404 | Alumno no encontrado |
| 500 | Error del servidor |
