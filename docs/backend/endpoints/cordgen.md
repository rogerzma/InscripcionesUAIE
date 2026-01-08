# Endpoints de Coordinador General

Base URL: `/api/cordgen`

Todos los endpoints requieren autenticacion JWT.

---

## Endpoints Disponibles

### GET /carrera/:matricula
Obtener el ID de carrera asociado al coordinador/administrador.

**Parametros:**
- `matricula` (path): Matricula del personal

**Respuesta exitosa (200):**
```json
{
  "id_carrera": "ISftw"
}
```

---

### POST /alumnos
Crear un nuevo alumno (desde Coordinador General).

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

### PUT /alumnos/:id
Actualizar un alumno existente.

**Parametros:**
- `id` (path): ID del alumno

**Body:**
```json
{
  "nombre": "Juan Perez Garcia",
  "correo": "nuevo@ejemplo.com"
}
```

**Respuesta exitosa (200):**
```json
{
  "_id": "...",
  "matricula": "2024630001",
  "nombre": "Juan Perez Garcia"
}
```

---

### GET /tutores
Obtener lista de todos los tutores.

**Respuesta exitosa (200):**
```json
[
  {
    "matricula": "T0001",
    "nombre": "Maria Garcia",
    "correo": "maria@ejemplo.com"
  }
]
```

---

## Codigos de Estado

| Codigo | Descripcion |
|--------|-------------|
| 200 | Operacion exitosa |
| 201 | Creado correctamente |
| 400 | Datos invalidos |
| 401 | No autenticado |
| 404 | No encontrado |
| 500 | Error del servidor |
