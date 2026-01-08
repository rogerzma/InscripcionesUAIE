# Endpoints de Personal

Base URL: `/api/personal`

Todos los endpoints requieren autenticacion JWT.

---

## Endpoints CRUD

### POST /
Crear nuevo personal.

**Body:**
```json
{
  "matricula": "D0001",
  "nombre": "Maria Garcia",
  "password": "password123",
  "roles": ["D", "T"],
  "correo": "maria@ejemplo.com",
  "telefono": "5551234567"
}
```

**Respuesta exitosa (201):**
```json
{
  "_id": "...",
  "matricula": "D0001",
  "nombre": "Maria Garcia",
  "roles": ["D", "T"]
}
```

---

### GET /
Obtener todo el personal.

---

### GET /paginados
Obtener personal con paginacion.

**Query params:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (opcional)

---

### GET /:id
Obtener personal por ID.

---

### PUT /:id
Actualizar personal.

---

### DELETE /:id
Eliminar personal.

---

### DELETE /coordinador
Eliminar personal con rol de coordinador.

---

## Endpoints por Carrera

### GET /carrera/:matricula
Obtener personal por carrera (segun matricula del coordinador).

### GET /carrera-paginados/:matricula
Obtener personal paginado por carrera.

---

## Endpoints Especiales

### GET /administradores-generales
Obtener lista de administradores generales.

**Respuesta exitosa (200):**
```json
[
  {
    "matricula": "AG0001",
    "nombre": "Admin General",
    "roles": ["AG"]
  }
]
```

---

### GET /password/:matricula
Recuperar contrasena (endpoint de desarrollo).

> **Advertencia:** Este endpoint solo debe usarse en desarrollo.

---

## Endpoints CSV

### GET /exportar-csv
Exportar todo el personal a CSV.

### POST /subir-csv
Importar personal desde CSV.

**Headers:** `Content-Type: multipart/form-data`
**Body:** archivo `csv`

### GET /exportar-csv/carrera/:id_carrera
Exportar personal por carrera.

### POST /subir-csv/carrera/:id_carrera
Importar personal por carrera.

### POST /exportar-csv/filtrados
Exportar personal filtrado.

### POST /exportar-csv/carrera-filtrados/:id_carrera
Exportar personal filtrado por carrera.

---

## Roles Disponibles

| Codigo | Rol |
|--------|-----|
| D | Docente |
| T | Tutor |
| C | Coordinador |
| A | Administrador |
| CG | Coordinador General |
| AG | Administrador General |

Un personal puede tener multiples roles simultaneamente.

---

## Codigos de Estado

| Codigo | Descripcion |
|--------|-------------|
| 200 | Operacion exitosa |
| 201 | Creado correctamente |
| 400 | Datos invalidos o matricula duplicada |
| 401 | No autenticado |
| 404 | Personal no encontrado |
| 500 | Error del servidor |
