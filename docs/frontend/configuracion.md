# Configuracion Frontend

## Descripcion

Configuracion del frontend React de InscripcionesUAIE. Incluye variables de entorno, estructura de carpetas y archivos de configuracion.

---

## Stack Tecnologico

- **React**: 18+
- **React Router DOM**: 6+
- **Axios**: HTTP client
- **React Toastify**: Notificaciones
- **CSS**: Vanilla CSS (sin preprocesadores)

---

## Estructura de Carpetas

```
react_frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/          # Componentes React
│   │   ├── Alumno*.js       # Componentes de alumnos
│   │   ├── Administrar*.js  # Componentes de administracion
│   │   ├── Inicio*.js       # Dashboards por rol
│   │   └── ...
│   ├── utils/               # Utilidades
│   │   └── axiosConfig.js   # Configuracion Axios
│   ├── assets/              # Imagenes, iconos
│   ├── App.js               # Componente principal
│   ├── App.css              # Estilos globales
│   └── index.js             # Punto de entrada
├── .env                     # Variables de entorno
├── package.json
└── README.md
```

---

## Variables de Entorno

### Archivo: `.env`

```env
REACT_APP_API_URL=http://localhost:5000
```

### Uso en Codigo

```javascript
const API_URL = process.env.REACT_APP_API_URL;
```

**Importante**: 
- Las variables deben empezar con `REACT_APP_`
- Se requiere reiniciar el servidor de desarrollo despues de cambiar `.env`

### Entornos

#### Desarrollo (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

#### Produccion (.env.production)
```env
REACT_APP_API_URL=https://api.inscripciones.ipn.mx
```

---

## Configuracion de Axios

Ver [axiosConfig.js](./utilidades.md#axiosconfig)

---

## Dependencias Principales

### package.json

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.10.0",
    "axios": "^1.4.0",
    "react-toastify": "^9.1.0"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}
```

### Instalacion

```bash
cd react_frontend
npm install
```

---

## Scripts Disponibles

### Desarrollo

```bash
npm start
```

- Inicia servidor de desarrollo en `http://localhost:3000`
- Hot reload habilitado
- Abre automaticamente el navegador

### Build Produccion

```bash
npm run build
```

- Genera build optimizado en carpeta `build/`
- Minifica y optimiza archivos
- Listo para deployment

### Pruebas

```bash
npm test
```

Ejecuta tests con Jest + React Testing Library.

### Eject (No recomendado)

```bash
npm run eject
```

**Advertencia**: Operacion irreversible. Expone toda la configuracion de webpack.

---

## Configuracion de Rutas

### App.js

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import RedirectRoute from './components/RedirectRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Publicas */}
        <Route path="/login" element={<RedirectRoute><Login /></RedirectRoute>} />
        <Route path="/registro" element={<Registro />} />
        
        {/* Privadas */}
        <Route path="/alumno/*" element={<PrivateRoute><AlumnoRoutes /></PrivateRoute>} />
        <Route path="/docente/*" element={<PrivateRoute><DocenteRoutes /></PrivateRoute>} />
        <Route path="/coordinador/*" element={<PrivateRoute><CoordinadorRoutes /></PrivateRoute>} />
        
        {/* Default */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
```

Ver [Rutas](./rutas.md) para documentacion completa.

---

## Estilos CSS

### Estructura

Cada componente tiene su archivo CSS asociado:

```
components/
├── AlumnoList.js
├── AlumnoList.css
├── CrearMateria.js
└── CrearMateria.css
```

### Convencion de Nombres

```css
/* AlumnoList.css */
.alumno-list-container {
  /* Estilos */
}

.alumno-list-item {
  /* Estilos */
}
```

Prefijo basado en el nombre del componente para evitar colisiones.

### Estilos Globales

`App.css` y `index.css` contienen estilos globales:

```css
/* index.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
}
```

---

## Configuracion de Notificaciones

### React Toastify

```javascript
// index.js o App.js
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Resto de la app */}
    </>
  );
}
```

### Uso

```javascript
import { toast } from 'react-toastify';

// Exito
toast.success('Operacion exitosa');

// Error
toast.error('Ocurrio un error');

// Advertencia
toast.warning('Cuidado!');

// Info
toast.info('Informacion');
```

---

## Configuracion Proxy (Desarrollo)

Para evitar problemas de CORS en desarrollo, agregar proxy en `package.json`:

```json
{
  "proxy": "http://localhost:5000"
}
```

Luego usar rutas relativas:

```javascript
// En lugar de
axios.get('http://localhost:5000/api/alumnos')

// Usar
axios.get('/api/alumnos')
```

**Nota**: Solo funciona en desarrollo, no en produccion.

---

## Build y Deployment

### Build

```bash
npm run build
```

Genera carpeta `build/` con:
- HTML, CSS, JS minificados
- Assets optimizados
- Source maps (opcional)

### Servir Build Localmente

```bash
npm install -g serve
serve -s build
```

### Deployment

#### Netlify

```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Vercel

```bash
vercel --prod
```

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
EXPOSE 3000
```

---

## Variables de Configuracion

### Create React App

Create React App usa variables predeterminadas:

- `NODE_ENV`: "development" o "production"
- `PUBLIC_URL`: URL base para assets

### Personalizar

Crear `.env.local` para valores locales (no commitear):

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_DEBUG=true
```

---

## Performance

### Code Splitting

React Router implementa lazy loading:

```javascript
import { lazy, Suspense } from 'react';

const AlumnoList = lazy(() => import('./components/AlumnoList'));

<Suspense fallback={<div>Cargando...</div>}>
  <AlumnoList />
</Suspense>
```

### Optimizacion Build

- Minificacion automatica
- Tree shaking
- Compression (gzip)

---

## Documentos Relacionados

- [Componentes](./componentes/README.md)
- [Rutas](./rutas.md)
- [Utilidades](./utilidades.md)
- [Guia de Instalacion](../guias/instalacion.md)
