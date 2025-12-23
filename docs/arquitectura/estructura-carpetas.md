# Estructura de Carpetas

## Vision General

Documentacion detallada de la estructura de directorios del proyecto InscripcionesUAIE.

---

## Estructura Completa

```
InscripcionesUAIE/
├── .github/                      # Configuracion GitHub
│   ├── agents/                   # Custom agents para GitHub Copilot
│   │   └── documentacion.md
│   └── copilot-instructions.md   # Instrucciones para Copilot
├── .git/                         # Control de versiones Git
├── .gitignore                    # Archivos ignorados por Git
├── docs/                         # Documentacion del proyecto
│   ├── README.md
│   ├── arquitectura/
│   ├── backend/
│   ├── frontend/
│   ├── guias/
│   └── referencia/
├── node_backend/                 # Servidor Express/API
│   ├── controllers/              # Logica de controladores
│   ├── exports/                  # Archivos CSV exportados
│   ├── middlewares/              # Middlewares personalizados
│   ├── models/                   # Modelos Mongoose
│   ├── node_modules/             # Dependencias Node.js
│   ├── routes/                   # Rutas de la API
│   ├── scripts/                  # Scripts de utilidad
│   ├── uploads/                  # Archivos subidos
│   ├── utils/                    # Funciones auxiliares
│   ├── .env                      # Variables de entorno
│   ├── .env.example              # Plantilla de variables
│   ├── package.json              # Dependencias y scripts
│   ├── package-lock.json
│   └── server.js                 # Punto de entrada
├── react_frontend/               # Aplicacion React
│   ├── build/                    # Build de produccion
│   ├── node_modules/             # Dependencias npm
│   ├── public/                   # Archivos publicos
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/                      # Codigo fuente
│   │   ├── assets/               # Imagenes, iconos
│   │   ├── components/           # Componentes React
│   │   ├── utils/                # Utilidades
│   │   ├── App.js                # Componente raiz
│   │   ├── App.css
│   │   ├── index.js              # Punto de entrada
│   │   └── index.css
│   ├── .env                      # Variables de entorno
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
├── exports/                      # Exportaciones historicas
├── package.json                  # Dependencias raiz (si existe)
└── README.md                     # Documentacion principal
```

---

## Backend (node_backend/)

### controllers/

Logica de negocio para cada recurso.

```
controllers/
├── alumnoController.js           # Operaciones de alumnos
├── materiaController.js          # Operaciones de materias
├── personalController.js         # Operaciones de personal
└── ...
```

**Responsabilidad**: 
- Recibir datos del request
- Validar datos
- Llamar modelos
- Formatear respuesta

### middlewares/

Funciones que se ejecutan entre request y response.

```
middlewares/
├── authMiddleware.js             # Validacion JWT
├── roleMiddleware.js             # Validacion de roles
└── uploadMiddleware.js           # Manejo de archivos
```

**Tipos comunes**:
- Autenticacion
- Autorizacion (roles)
- Validacion de datos
- Logging
- Manejo de errores

### models/

Esquemas de Mongoose para MongoDB.

```
models/
├── Alumno.js                     # Modelo de alumno
├── Personal.js                   # Modelo de personal
├── Materia.js                    # Modelo de materia
├── Horario.js                    # Modelo de horario
├── HistorialAcademico.js
├── Docentes.js
├── Tutores.js
├── Coordinadores.js
├── Administradores.js
├── Coordinador_Gen.js
└── Administrador_Gen.js
```

Ver [Modelos de Datos](../backend/modelos/README.md)

### routes/

Definicion de endpoints de la API.

```
routes/
├── authRoutes.js                 # Login
├── alumnoRoutes.js               # CRUD alumnos
├── personalRoutes.js             # CRUD personal
├── materiasRoutes.js             # CRUD materias
├── docenteRoutes.js
├── tutorRoutes.js
├── coordinadorRoutes.js
├── administradorRoutes.js
├── coordinadorGenRoutes.js
├── administradorGenRoutes.js
├── historialAcademicoRoutes.js
└── userRoutes.js
```

Ver [Endpoints API](../backend/endpoints/README.md)

### scripts/

Scripts de utilidad para mantenimiento.

```
scripts/
├── createAdmin.js                # Crear admin inicial
├── seedDatabase.js               # Poblar BD con datos
├── migrateData.js                # Migraciones
└── cleanUploads.js               # Limpiar archivos viejos
```

### uploads/

Archivos subidos por usuarios.

```
uploads/
├── comprobantes/                 # Comprobantes de pago
│   ├── Pago_2024630001.pdf
│   └── Pago_2024630002.pdf
├── csvs/                         # CSVs importados
└── temp/                         # Archivos temporales
```

**Importante**: Agregar a .gitignore

### exports/

CSVs exportados del sistema.

```
exports/
├── alumnos_2024-06-01.csv
├── personal_2024-06-01.csv
└── materias_2024-06-01.csv
```

---

## Frontend (react_frontend/)

### public/

Archivos estaticos accesibles publicamente.

```
public/
├── index.html                    # HTML base
├── favicon.ico                   # Icono del sitio
├── logo192.png
├── logo512.png
├── manifest.json                 # PWA manifest
└── robots.txt                    # SEO
```

**No modificar**: React inyecta el bundle en index.html automaticamente.

### src/

Codigo fuente de la aplicacion.

```
src/
├── components/                   # Componentes React
├── utils/                        # Utilidades
├── assets/                       # Recursos estaticos
├── App.js                        # Componente principal
├── App.css                       # Estilos globales
├── index.js                      # Entry point
├── index.css                     # Estilos base
└── setupTests.js                 # Configuracion tests
```

### components/

Todos los componentes React.

```
components/
├── Administrar*/                 # Componentes admin
├── Alumno*/                      # Componentes alumnos
├── Crear*/                       # Formularios crear
├── Modificar*/                   # Formularios editar
├── Inicio*/                      # Dashboards
├── Encabezado.js                 # Header
├── Pie_pagina.js                 # Footer
├── PrivateRoute.js               # HOC rutas privadas
└── RedirectRoute.js              # HOC redirect
```

Ver [Componentes](../frontend/componentes/README.md)

### utils/

Funciones y configuraciones auxiliares.

```
utils/
├── axiosConfig.js                # Cliente HTTP configurado
├── formatters.js                 # Formateadores de datos
└── validators.js                 # Validaciones
```

### assets/

Recursos estaticos (imagenes, iconos).

```
assets/
├── images/
│   ├── logo.png
│   └── banner.jpg
├── icons/
│   └── user-icon.svg
└── fonts/
```

---

## Documentacion (docs/)

### Estructura

```
docs/
├── README.md                     # Indice principal
├── arquitectura/                 # Arquitectura del sistema
│   ├── README.md
│   ├── estructura-carpetas.md
│   └── flujo-datos.md
├── backend/                      # Documentacion backend
│   ├── autenticacion.md
│   ├── configuracion.md
│   ├── endpoints/
│   │   ├── README.md
│   │   ├── auth.md
│   │   ├── alumnos.md
│   │   └── ...
│   └── modelos/
│       ├── README.md
│       ├── alumno.md
│       └── ...
├── frontend/                     # Documentacion frontend
│   ├── configuracion.md
│   ├── rutas.md
│   ├── utilidades.md
│   └── componentes/
│       ├── README.md
│       └── ...
├── guias/                        # Guias practicas
│   ├── instalacion.md
│   ├── despliegue.md
│   └── variables-entorno.md
└── referencia/                   # Documentacion de referencia
    ├── roles-permisos.md
    ├── codigos-error.md
    └── glosario.md
```

---

## Archivos de Configuracion

### .gitignore

Define que archivos NO trackear en Git:

```gitignore
# Dependencies
node_modules/

# Environment variables
.env
.env.local

# Build outputs
build/
dist/

# Uploads
uploads/
exports/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

### package.json (Backend)

```json
{
  "name": "inscripciones-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "dotenv": "^16.0.0"
  }
}
```

### package.json (Frontend)

```json
{
  "name": "inscripciones-frontend",
  "version": "1.0.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.10.0",
    "axios": "^1.4.0"
  }
}
```

---

## Convenciones de Nombres

### Archivos

- **Componentes React**: PascalCase (ej: `AlumnoList.js`)
- **Modelos**: PascalCase (ej: `Alumno.js`)
- **Rutas**: camelCase (ej: `alumnoRoutes.js`)
- **Utilidades**: camelCase (ej: `axiosConfig.js`)
- **CSS**: PascalCase matching component (ej: `AlumnoList.css`)

### Carpetas

- **Minusculas con guiones**: `node_backend`, `react_frontend`
- **Minusculas**: `models`, `routes`, `components`

---

## Tamaño de Carpetas (Aproximado)

| Carpeta | Tamaño | Notas |
|---------|--------|-------|
| `node_modules/` (backend) | ~150 MB | Dependencias Node |
| `node_modules/` (frontend) | ~250 MB | Dependencias React |
| `build/` | ~2 MB | Build optimizado React |
| `uploads/` | Variable | Segun archivos subidos |
| `exports/` | Variable | Segun exportaciones |

---

## Exclusiones de Git

### Archivos que NO commitear

- `node_modules/` - Regenerar con `npm install`
- `.env` - Contiene secrets
- `build/` - Regenerar con `npm run build`
- `uploads/` - Archivos de usuarios
- `exports/` - Datos exportados

### Archivos que SI commitear

- `package.json` y `package-lock.json` - Define dependencias
- `.env.example` - Plantilla de configuracion
- `.gitignore` - Define exclusiones
- Codigo fuente (`.js`, `.jsx`, `.css`)
- Documentacion (`.md`)

---

## Navegacion Rapida

### Desde Raiz

```bash
# Backend
cd node_backend
npm start

# Frontend
cd react_frontend
npm start

# Ver logs
cd node_backend
tail -f logs/app.log
```

### Comandos Utiles

```bash
# Ver estructura de carpetas
tree -L 2 -I 'node_modules|build'

# Contar archivos JavaScript
find . -name "*.js" -not -path "*/node_modules/*" | wc -l

# Buscar en codigo
grep -r "funcionBuscada" --include="*.js" .
```

---

## Documentos Relacionados

- [Arquitectura General](./README.md)
- [Guia de Instalacion](../guias/instalacion.md)
- [Configuracion Backend](../backend/configuracion.md)
- [Configuracion Frontend](../frontend/configuracion.md)
