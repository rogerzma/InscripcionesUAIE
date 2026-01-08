# Endpoints de Historial Academico

Base URL: `/api/historial`

Estos endpoints gestionan el historial academico y la purga de datos por semestre.

---

## Endpoints Disponibles

### POST /generar
Generar historial academico manualmente.

**Body:**
```json
{
  "semestre": "2025-1",
  "generado_por": "ObjectId del personal"
}
```

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Historial generado correctamente",
  "historial": {
    "_id": "...",
    "semestre": "2025-1",
    "fecha_generacion": "2025-06-01T00:00:00.000Z",
    "archivos": {
      "alumnos": "/descargas/2025-1/alumnos.csv",
      "materias": "/descargas/2025-1/materias.csv",
      "personal": "/descargas/2025-1/personal.csv"
    }
  }
}
```

---

### GET /
Listar todos los historiales academicos.

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "...",
    "semestre": "2025-1",
    "fecha_generacion": "2025-06-01T00:00:00.000Z",
    "fecha_de_borrado": "2025-06-01T00:00:00.000Z",
    "generado_por": { ... },
    "archivos": { ... }
  }
]
```

---

### DELETE /vaciar-materias
Vaciar la coleccion de materias.

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Materias eliminadas correctamente",
  "eliminados": 150
}
```

> **Advertencia:** Esta operacion es irreversible.

---

### DELETE /vaciar-alumnos
Vaciar la coleccion de alumnos.

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Alumnos eliminados correctamente",
  "eliminados": 500
}
```

> **Advertencia:** Esta operacion es irreversible.

---

### DELETE /vaciar-personal
Vaciar la coleccion de personal (excepto CG y AG).

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Personal eliminado correctamente",
  "eliminados": 50
}
```

> Nota: Los usuarios con rol Coordinador General (CG) y Administrador General (AG) NO son eliminados.

---

### PUT /fecha-borrado
Actualizar la fecha de borrado de un historial academico.

**Body:**
```json
{
  "semestre": "2025-1",
  "fecha_de_borrado": "2025-06-15T00:00:00.000Z"
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Fecha de borrado actualizada"
}
```

---

### GET /fecha-borrado
Obtener la fecha de borrado configurada.

**Query params:**
- `semestre` (opcional): Semestre especifico

**Respuesta exitosa (200):**
```json
{
  "semestre": "2025-1",
  "fecha_de_borrado": "2025-06-01T00:00:00.000Z"
}
```

---

## Fechas de Borrado Automatico

El sistema calcula automaticamente las fechas de borrado:
- **Semestre 1** (Enero-Junio): 1 de Junio
- **Semestre 2** (Julio-Diciembre): 1 de Diciembre

---

## Archivos Exportados

Los historiales se guardan en la carpeta `/exports/{semestre}/`:
- `alumnos.csv` - Datos de alumnos
- `materias.csv` - Datos de materias
- `personal.csv` - Datos de personal

Acceso via URL: `/descargas/{semestre}/alumnos.csv`

---

## Codigos de Estado

| Codigo | Descripcion |
|--------|-------------|
| 200 | Operacion exitosa |
| 201 | Historial creado |
| 400 | Datos invalidos |
| 404 | Historial no encontrado |
| 500 | Error del servidor |
