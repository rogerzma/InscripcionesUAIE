# Endpoints API - InscripcionesUAIE

## Vision General

Este directorio documenta todos los endpoints REST de la API de InscripcionesUAIE. La API esta construida con Express.js y utiliza JWT para autenticacion.

---

## URL Base

```
http://localhost:5000
```

**Produccion**: Configurar segun el dominio del servidor

---

## Autenticacion

Todos los endpoints (excepto login) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

Ver [Autenticacion JWT](../autenticacion.md) para mas detalles.

---

## Grupos de Endpoints

| Grupo | Prefijo | Descripcion | Documentacion |
|-------|---------|-------------|---------------|
| Autenticacion | `/api/auth` | Login de alumnos y personal | [Ver](./auth.md) |
| Alumnos | `/api/alumnos` | CRUD y operaciones sobre alumnos | [Ver](./alumnos.md) |
| Personal | `/api/personal` | CRUD y operaciones sobre personal | [Ver](./personal.md) |
| Materias | `/api/materias` | CRUD y operaciones sobre materias | [Ver](./materias.md) |
| Horarios | `/api/horarios` | Gestion de horarios de alumnos | [Ver](./horarios.md) |
| Coordinadores | `/api/coordinadores` | Operaciones de coordinadores | [Ver](./coordinador.md) |
| Docentes | `/api/docentes` | Operaciones de docentes | [Ver](./docente.md) |
| Tutores | `/api/tutores` | Operaciones de tutores | [Ver](./tutor.md) |
| Admin General | `/api/admin-general` | Operaciones admin general | [Ver](./admin-general.md) |
| Coord General | `/api/coord-general` | Operaciones coord general | [Ver](./coord-general.md) |

---

## Convenciones de la API

### Codigos de Estado HTTP

| Codigo | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operacion exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos invalidos o faltantes |
| 401 | Unauthorized | Token invalido o expirado |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

### Formato de Respuesta

#### Respuesta Exitosa

```json
{
  "mensaje": "Operacion exitosa",
  "data": { ... }
}
```

O directamente los datos:

```json
{
  "id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "nombre": "Juan Perez",
  ...
}
```

#### Respuesta con Error

```json
{
  "mensaje": "Descripcion del error",
  "error": "Detalle tecnico (solo en desarrollo)"
}
```

### Paginacion

Endpoints con paginacion aceptan:

| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Numero de pagina |
| `limit` | Number | 10 | Items por pagina |
| `search` | String | - | Termino de busqueda |

Respuesta paginada:

```json
{
  "data": [ ... ],
  "currentPage": 1,
  "totalPages": 5,
  "totalItems": 48,
  "itemsPerPage": 10
}
```

### Filtros

Endpoints de listado soportan filtros via query params:

```
GET /api/alumnos?id_carrera=IE&search=juan
```

### Ordenamiento

Algunos endpoints soportan ordenamiento:

```
GET /api/alumnos?sort=nombre&order=asc
```

---

## Exportacion/Importacion CSV

Varios endpoints soportan operaciones masivas con CSV:

### Exportar

```
GET /api/alumnos/exportar-csv
```

Descarga un archivo CSV con los datos.

### Importar

```
POST /api/alumnos/subir-csv
Content-Type: multipart/form-data

csv: [archivo]
```

Carga datos desde un archivo CSV.

---

## Estructura de Archivos

```
node_backend/routes/
├── authRoutes.js              # Login
├── alumnoRoutes.js            # Alumnos
├── personalRoutes.js          # Personal
├── materiasRoutes.js          # Materias
├── historialAcademicoRoutes.js # Historiales
├── docenteRoutes.js           # Docentes
├── tutorRoutes.js             # Tutores
├── coordinadorRoutes.js       # Coordinadores
├── administradorRoutes.js     # Administradores
├── coordinadorGenRoutes.js    # Coord General
├── administradorGenRoutes.js  # Admin General
└── userRoutes.js              # Usuarios
```

---

## Middleware Comun

### authMiddleware

Valida JWT en todas las rutas protegidas:

```javascript
const verificarToken = require('../middlewares/authMiddleware');
router.use(verificarToken);
```

Ver [Autenticacion](../autenticacion.md#middleware-de-autenticacion)

---

## Configuracion CORS

La API permite peticiones desde el frontend:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
```

---

## Rate Limiting

**Nota**: Actualmente no implementado. Considerar agregar en produccion:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // max 100 requests por ventana
});

app.use('/api/', limiter);
```

---

## Pruebas con cURL

### Login

```bash
curl -X POST http://localhost:5000/api/auth/alumno/login \
  -H "Content-Type: application/json" \
  -d '{"matricula": "2024630001"}'
```

### GET con Token

```bash
curl -X GET http://localhost:5000/api/alumnos \
  -H "Authorization: Bearer <token>"
```

### POST con Token

```bash
curl -X POST http://localhost:5000/api/materias \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Calculo I", "id_carrera": "IE", ...}'
```

---

## Herramientas Recomendadas

- **Postman**: Cliente API con interfaz grafica
- **Insomnia**: Alternativa a Postman
- **Thunder Client**: Extension de VS Code
- **curl**: Herramienta de linea de comandos

---

## Documentos Relacionados

- [Autenticacion JWT](../autenticacion.md)
- [Modelos de Datos](../modelos/README.md)
- [Roles y Permisos](../../referencia/roles-permisos.md)
- [Codigos de Error](../../referencia/codigos-error.md)
