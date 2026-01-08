# Endpoints de Docentes

Base URL: `/api/docentes`

Todos los endpoints requieren autenticacion JWT.

---

## Endpoints Disponibles

### GET /
Obtener todos los docentes.

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "...",
    "personalMatricula": "D0001",
    "materias": [...],
    "alumnos": [...]
  }
]
```

---

### GET /:id
Obtener docente por ID.

**Parametros:**
- `id` (path): ID del docente

**Respuesta exitosa (200):**
```json
{
  "_id": "...",
  "personalMatricula": "D0001",
  "materias": [...],
  "alumnos": [...]
}
```

---

### GET /alumnos/:matricula
Obtener alumnos asignados a un docente.

**Parametros:**
- `matricula` (path): Matricula del docente

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "...",
    "matricula": "2024630001",
    "nombre": "Juan Perez"
  }
]
```

---

### GET /materias/:matricula
Obtener materias asignadas a un docente.

**Parametros:**
- `matricula` (path): Matricula del docente

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "...",
    "nombre": "Calculo I",
    "grupo": "A",
    "salon": "101"
  }
]
```

---

### GET /horario/:matricula
Obtener el horario de un alumno.

**Parametros:**
- `matricula` (path): Matricula del alumno

---

### GET /estatus/:matricula
Obtener el estatus del horario de un alumno.

**Parametros:**
- `matricula` (path): Matricula del alumno

---

### PUT /estatus/actualizar/:matricula
Actualizar el estatus del horario.

**Parametros:**
- `matricula` (path): Matricula del alumno

**Body:**
```json
{
  "estatus": 1,
  "comentario": "Horario validado"
}
```

---

### DELETE /eliminar/:matricula
Eliminar el horario de un alumno.

**Parametros:**
- `matricula` (path): Matricula del alumno

---

### POST /enviarCorreo
Enviar comentario por correo al alumno.

**Body:**
```json
{
  "correoAlumno": "alumno@ejemplo.com",
  "comentario": "Comentario del docente",
  "nombreAlumno": "Juan Perez"
}
```

---

### GET /materia/:materiaId/alumnos
Obtener alumnos inscritos en una materia especifica.

**Parametros:**
- `materiaId` (path): ID de la materia

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "...",
    "matricula": "2024630001",
    "nombre": "Juan Perez"
  }
]
```

---

## Codigos de Estado

| Codigo | Descripcion |
|--------|-------------|
| 200 | Operacion exitosa |
| 401 | No autenticado |
| 404 | No encontrado |
| 500 | Error del servidor |
