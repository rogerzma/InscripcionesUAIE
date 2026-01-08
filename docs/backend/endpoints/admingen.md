# Endpoints de Administrador General

Base URL: `/api/admingen`

Todos los endpoints requieren autenticacion JWT.

---

## Endpoints Disponibles

### GET /carrera/:matricula
Obtener el ID de carrera asociado al administrador.

**Parametros:**
- `matricula` (path): Matricula del administrador general

**Respuesta exitosa (200):**
```json
{
  "id_carrera": null
}
```

> Nota: El Administrador General no tiene carrera asignada especifica, puede ver todas las carreras.

---

### GET /tutores
Obtener lista de todos los tutores del sistema.

**Respuesta exitosa (200):**
```json
[
  {
    "matricula": "T0001",
    "nombre": "Maria Garcia",
    "correo": "maria@ejemplo.com"
  },
  {
    "matricula": "T0002",
    "nombre": "Carlos Lopez",
    "correo": "carlos@ejemplo.com"
  }
]
```

---

## Permisos

El Administrador General (AG) tiene acceso de **solo lectura** a todo el sistema:
- Puede visualizar alumnos de todas las carreras
- Puede visualizar materias de todas las carreras
- Puede visualizar personal de todas las carreras
- **NO** puede crear, modificar o eliminar registros

---

## Codigos de Estado

| Codigo | Descripcion |
|--------|-------------|
| 200 | Operacion exitosa |
| 401 | No autenticado |
| 403 | Sin permisos |
| 500 | Error del servidor |
