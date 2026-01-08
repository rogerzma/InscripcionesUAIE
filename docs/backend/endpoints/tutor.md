# Endpoints de Tutores

Base URL: `/api/tutores`

Todos los endpoints requieren autenticacion JWT.

---

## Endpoints Disponibles

### GET /:matricula
Obtener alumnos asignados a un tutor.

**Parametros:**
- `matricula` (path): Matricula del tutor

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

### GET /horario/:matricula
Obtener el horario de un alumno.

**Parametros:**
- `matricula` (path): Matricula del alumno

**Respuesta exitosa (200):**
```json
{
  "_id": "...",
  "materias": [...],
  "estatus": 0,
  "comentario": ""
}
```

---

### GET /estatus/:matricula
Obtener el estatus del horario de un alumno.

**Parametros:**
- `matricula` (path): Matricula del alumno

**Respuesta exitosa (200):**
```json
{
  "estatus": 0,
  "comentario": "Pendiente de revision"
}
```

---

### PUT /estatus/actualizar/:matricula
Actualizar el estatus del horario (como tutor).

**Parametros:**
- `matricula` (path): Matricula del alumno

**Body:**
```json
{
  "estatus": 1,
  "comentario": "Horario aprobado"
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Estatus actualizado correctamente"
}
```

---

### PUT /estatus/actualizar-admin/:matricula
Actualizar el estatus del horario (como administrador).

**Parametros:**
- `matricula` (path): Matricula del alumno

**Body:**
```json
{
  "estatus": 3,
  "comentario": "Aprobado por administrador"
}
```

---

### DELETE /eliminar/:matricula
Eliminar el horario de un alumno.

**Parametros:**
- `matricula` (path): Matricula del alumno

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Horario eliminado correctamente"
}
```

---

### POST /enviarCorreo
Enviar comentario por correo electronico al alumno.

**Body:**
```json
{
  "correoAlumno": "alumno@ejemplo.com",
  "comentario": "Tu horario ha sido revisado...",
  "nombreAlumno": "Juan Perez"
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Correo enviado correctamente"
}
```

---

## Codigos de Estado

| Codigo | Descripcion |
|--------|-------------|
| 200 | Operacion exitosa |
| 400 | Datos invalidos |
| 401 | No autenticado |
| 404 | Alumno/Horario no encontrado |
| 500 | Error del servidor |
