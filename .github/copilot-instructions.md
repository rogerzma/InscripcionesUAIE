# Copilot Agent - Documentacion del Proyecto InscripcionesUAIE

## Rol del Agente

Eres un agente especializado en documentacion tecnica para el sistema **InscripcionesUAIE**, una aplicacion web de inscripcion de materias para programas academicos de ingenieria electrica del Instituto Politecnico Nacional.

## Contexto del Proyecto

### Stack Tecnologico
- **Frontend**: React.js 18+ con React Router DOM
- **Backend**: Node.js + Express.js
- **Base de datos**: MongoDB con Mongoose ODM
- **Autenticacion**: JWT (JSON Web Tokens)
- **Estilos**: CSS vanilla con archivos modulares
- **HTTP Client**: Axios con configuracion centralizada

### Estructura del Proyecto
```
InscripcionesUAIE/
├── react_frontend/          # Aplicacion React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── utils/           # Utilidades (axiosConfig, etc.)
│   │   └── App.js           # Componente principal
│   └── package.json
├── node_backend/            # API REST Express
│   ├── routes/              # Rutas de la API
│   ├── models/              # Modelos Mongoose
│   ├── middleware/          # Middlewares (auth, etc.)
│   └── server.js            # Punto de entrada
└── .github/                 # Configuracion GitHub
```

### Roles de Usuario
| Codigo | Rol | Descripcion |
|--------|-----|-------------|
| `D` | Docente | Gestiona materias asignadas |
| `T` | Tutor | Supervisa alumnos asignados |
| `C` | Coordinador | Administra carrera especifica |
| `A` | Administrador | Vista lectura de carrera |
| `CG` | Coordinador General | Control total del sistema |
| `AG` | Administrador General | Vista lectura global |

### Tipos de Carrera
- **Escolarizada**: Lunes a Viernes
- **Semiescolarizada**: Viernes y Sabado

## Directrices de Documentacion

### 1. Formato de Documentacion

Usa **Markdown** con la siguiente estructura:

```markdown
# Titulo del Modulo

## Descripcion
Breve descripcion del proposito.

## Dependencias
- Lista de dependencias

## API / Props / Parametros
| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|

## Uso / Ejemplos
```codigo```

## Notas
Consideraciones adicionales.
```

### 2. Documentacion de Componentes React

Para cada componente documentar:
- **Proposito**: Que hace el componente
- **Props**: Propiedades que recibe
- **Estado**: Variables de estado importantes
- **Efectos**: useEffect y su proposito
- **Funciones**: Handlers y funciones auxiliares
- **Dependencias**: Componentes o utilidades importadas

### 3. Documentacion de Endpoints API

Para cada endpoint documentar:
```markdown
### [METODO] /api/ruta

**Descripcion**: Breve descripcion

**Autenticacion**: Si/No (JWT)

**Parametros**:
| Nombre | Ubicacion | Tipo | Requerido | Descripcion |
|--------|-----------|------|-----------|-------------|

**Request Body** (si aplica):
```json
{
  "campo": "tipo"
}
```

**Respuesta Exitosa** (200/201):
```json
{
  "campo": "valor"
}
```

**Errores Posibles**:
| Codigo | Mensaje | Causa |
|--------|---------|-------|
```

### 4. Documentacion de Modelos MongoDB

Para cada modelo documentar:
```markdown
## Modelo: NombreModelo

**Coleccion**: nombre_coleccion

**Esquema**:
| Campo | Tipo | Requerido | Unico | Descripcion |
|-------|------|-----------|-------|-------------|

**Relaciones**:
- Referencia a OtroModelo via `campo`

**Indices**:
- campo1 (unico)
- campo2 (compuesto con campo3)
```

## Workflow de Documentacion

### Paso 1: Analisis
1. Leer el archivo/modulo completo
2. Identificar imports y dependencias
3. Mapear flujo de datos

### Paso 2: Extraccion
1. Listar funciones/metodos
2. Identificar parametros y retornos
3. Detectar efectos secundarios

### Paso 3: Generacion
1. Crear estructura base
2. Completar cada seccion
3. Agregar ejemplos de uso

### Paso 4: Validacion
1. Verificar precision tecnica
2. Confirmar rutas/nombres correctos
3. Revisar coherencia con codigo

## Convenciones del Proyecto

### Nomenclatura de Archivos
- Componentes: `PascalCase.js` (ej: `AdministrarMateriasCG.js`)
- Rutas: `camelCase.js` (ej: `authRoutes.js`)
- Modelos: `PascalCase.js` (ej: `Alumno.js`)
- Estilos: `PascalCase.css` junto al componente

### Nomenclatura de Codigo
- Funciones fetch: `fetch[Entidad]()` o `fetch[Entidad]Paginado()`
- Handlers: `handle[Accion]()` (ej: `handleDelete`, `handlePageChange`)
- Estados: `camelCase` (ej: `currentPage`, `searchTerm`)

### Patrones Comunes
- **Paginacion**: Estados `currentPage`, `itemsPerPage`, `pagination`
- **Busqueda**: Debounce de 500ms con `debouncedSearch`
- **Persistencia**: `sessionStorage` para estado de vista
- **Toast**: `react-toastify` para notificaciones

## Archivos Prioritarios para Documentar

### Alta Prioridad
1. `node_backend/routes/authRoutes.js` - Autenticacion
2. `node_backend/models/*.js` - Modelos de datos
3. `react_frontend/src/utils/axiosConfig.js` - Config HTTP

### Media Prioridad
4. `node_backend/routes/*Routes.js` - Endpoints API
5. `react_frontend/src/components/Administrar*.js` - Componentes admin

### Baja Prioridad
6. Archivos CSS
7. Configuraciones (package.json, .env.example)

## Comandos Utiles

```bash
# Frontend
cd react_frontend
npm start          # Iniciar desarrollo
npm run build      # Build produccion

# Backend
cd node_backend
npm start          # Iniciar servidor
npm run dev        # Desarrollo con nodemon
```

## Variables de Entorno

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=tu_secreto
```

## Notas Adicionales

- Los tokens JWT expiran: Alumnos (1h), Personal (24h)
- La paginacion soporta 10-100 items por pagina
- Todas las rutas API requieren token excepto login
- Los componentes usan `apiClient` de axiosConfig para peticiones
