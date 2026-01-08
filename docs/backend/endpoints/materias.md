# Endpoints de Materias

Base URL: `/api/materias`

Todos los endpoints requieren autenticacion JWT.

---

## Endpoints CRUD

### POST /
Crear una nueva materia.

**Body:**
```json
{
  "id_materia": 101,
  "id_carrera": "ISftw",
  "nombre": "Calculo I",
  "horarios": {
    "lunes": "07:00-09:00",
    "miercoles": "07:00-09:00",
    "viernes": "07:00-09:00"
  },
  "semi": "1",
  "salon": "A101",
  "grupo": "A",
  "cupo": 30,
  "laboratorio": false
}
```

**Respuesta exitosa (201):**
```json
{
  "_id": "...",
  "id_materia": 101,
  "nombre": "Calculo I"
}
```

---

### GET /
Obtener todas las materias.

---

### GET /paginadas
Obtener materias con paginacion.

**Query params:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (opcional)

**Respuesta exitosa (200):**
```json
{
  "data": [...],
  "currentPage": 1,
  "totalPages": 10,
  "totalItems": 95
}
```

---

### GET /:id
Obtener materia por ID.

---

### PUT /:id
Actualizar materia.

---

### DELETE /:id
Eliminar materia.

---

## Endpoints por Carrera

### GET /carrera/:id_carrera
Obtener materias por carrera.

**Parametros:**
- `id_carrera` (path): Codigo de carrera (ej: ISftw, IElec)

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "...",
    "id_materia": 101,
    "nombre": "Calculo I",
    "grupo": "A",
    "cupo": 30,
    "alumnos": []
  }
]
```

---

### GET /carrera-paginadas/:id_carrera
Obtener materias paginadas por carrera.

---

## Endpoints CSV

### GET /exportar-csv
Exportar todas las materias a CSV.

### POST /subir-csv
Importar materias desde CSV.

**Headers:** `Content-Type: multipart/form-data`
**Body:** archivo `csv`

### GET /exportar-csv-por-carrera
Exportar materias por carrera.

**Query params:**
- `id_carrera`: Codigo de carrera

### POST /subir-csv-por-carrera
Importar materias por carrera desde CSV.

**Headers:** `Content-Type: multipart/form-data`
**Body:** archivo `csv`, `id_carrera`

### POST /exportar-csv/filtrados
Exportar materias filtradas.

### POST /exportar-csv/carrera-filtrados/:id_carrera
Exportar materias filtradas por carrera.

---

## Estructura de Horarios

Los horarios se definen por dia de la semana:

```json
{
  "horarios": {
    "lunes": "07:00-09:00",
    "martes": "",
    "miercoles": "07:00-09:00",
    "jueves": "",
    "viernes": "07:00-09:00",
    "sabado": ""
  }
}
```

- Formato: `"HH:MM-HH:MM"` (hora inicio - hora fin)
- Dejar vacio `""` si no hay clase ese dia

---

## Codigos de Carrera

| Codigo | Carrera | Modalidad |
|--------|---------|-----------|
| ISftw | Ing. Software | Escolarizado |
| ISftwS | Ing. Software | Semiescolarizado |
| IDsr | Ing. Desarrollo | Escolarizado |
| IDsrS | Ing. Desarrollo | Semiescolarizado |
| IEInd | Ing. Electronica Industrial | Escolarizado |
| IEIndS | Ing. Electronica Industrial | Semiescolarizado |
| ICmp | Ing. Computacion | Escolarizado |
| ICmpS | Ing. Computacion | Semiescolarizado |
| IRMca | Ing. Robotica y Mecatronica | Escolarizado |
| IRMcaS | Ing. Robotica y Mecatronica | Semiescolarizado |
| IElec | Ing. Electricista | Escolarizado |
| IElecS | Ing. Electricista | Semiescolarizado |

---

## Codigos de Estado

| Codigo | Descripcion |
|--------|-------------|
| 200 | Operacion exitosa |
| 201 | Creado correctamente |
| 400 | Datos invalidos |
| 401 | No autenticado |
| 404 | Materia no encontrada |
| 500 | Error del servidor |
