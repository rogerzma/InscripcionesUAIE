# Endpoints de Coordinadores

Base URL: `/api/coordinadores`

Todos los endpoints requieren autenticacion JWT.

---

## Endpoints Disponibles

### GET /
Obtener todos los coordinadores.

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "...",
    "id_carrera": "ISftw",
    "personalMatricula": "C0001",
    "horas": 40,
    "comprobantePagoHabilitado": true
  }
]
```

---

### GET /alumnos/:id
Obtener alumnos asignados a un coordinador por ID.

**Parametros:**
- `id` (path): ID del coordinador

---

### GET /matricula/:matricula
Obtener alumnos asignados al coordinador por matricula.

**Parametros:**
- `matricula` (path): Matricula del coordinador

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "...",
    "matricula": "2024630001",
    "nombre": "Juan Perez",
    "id_carrera": "ISftw"
  }
]
```

---

### GET /estatus/:matricula
Obtener el estatus del horario de un alumno.

**Parametros:**
- `matricula` (path): Matricula del alumno

---

### GET /tutores/:matricula
Obtener lista de tutores disponibles para la carrera.

**Parametros:**
- `matricula` (path): Matricula del coordinador

**Respuesta exitosa (200):**
```json
[
  {
    "matricula": "T0001",
    "nombre": "Maria Garcia"
  }
]
```

---

### GET /horas/:id_carrera
Obtener las horas maximas de inscripcion permitidas.

**Parametros:**
- `id_carrera` (path): ID de la carrera

**Respuesta exitosa (200):**
```json
{
  "horas": 40
}
```

---

### PUT /horas/:matricula
Actualizar las horas maximas de inscripcion.

**Parametros:**
- `matricula` (path): Matricula del coordinador

**Body:**
```json
{
  "horas": 45
}
```

---

### GET /comprobante-habilitado/:id_carrera
Verificar si el comprobante de pago esta habilitado.

**Parametros:**
- `id_carrera` (path): ID de la carrera

**Respuesta exitosa (200):**
```json
{
  "habilitado": true
}
```

---

### PUT /comprobante-habilitado/:id_carrera
Habilitar o deshabilitar el comprobante de pago.

**Parametros:**
- `id_carrera` (path): ID de la carrera

**Body:**
```json
{
  "habilitado": false
}
```

---

## Codigos de Estado

| Codigo | Descripcion |
|--------|-------------|
| 200 | Operacion exitosa |
| 401 | No autenticado |
| 404 | No encontrado |
| 500 | Error del servidor |
