# Endpoints de Administradores

Base URL: `/api/administradores`

Todos los endpoints requieren autenticacion JWT.

---

## Endpoints Disponibles

### GET /
Obtener todos los administradores.

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "...",
    "id_carrera": "ISftw",
    "personalMatricula": "A0001"
  }
]
```

---

### GET /alumnos/:id
Obtener alumnos asignados a un administrador por ID.

**Parametros:**
- `id` (path): ID del administrador

---

### GET /matricula/:matricula
Obtener alumnos asignados al administrador por matricula.

**Parametros:**
- `matricula` (path): Matricula del administrador

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

**Respuesta exitosa (200):**
```json
{
  "estatus": 1,
  "comentario": "Aprobado"
}
```

---

### GET /tutores/:matricula
Obtener lista de tutores disponibles para la carrera.

**Parametros:**
- `matricula` (path): Matricula del administrador

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

## Codigos de Estado

| Codigo | Descripcion |
|--------|-------------|
| 200 | Operacion exitosa |
| 401 | No autenticado |
| 404 | No encontrado |
| 500 | Error del servidor |
