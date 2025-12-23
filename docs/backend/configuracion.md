# Configuracion del Servidor Backend

## Descripcion

Documentacion de la configuracion del servidor Express.js para la API de InscripcionesUAIE.

---

## server.js

### Ubicacion

`node_backend/server.js`

### Estructura Basica

```javascript
// 1. Imports
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 2. Inicializar app
const app = express();

// 3. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/alumnos', require('./routes/alumnoRoutes'));
// ... mas rutas

// 5. Conexion a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexion:', err));

// 6. Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

---

## Middlewares

### CORS (Cross-Origin Resource Sharing)

Permite peticiones desde el frontend:

```javascript
const cors = require('cors');

// Basico (permite todos los origenes)
app.use(cors());

// Configurado (recomendado)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### Body Parsers

Parsean el body de las peticiones:

```javascript
// JSON
app.use(express.json());

// URL-encoded (formularios)
app.use(express.urlencoded({ extended: true }));
```

### Archivos Estaticos

Sirve archivos estaticos (si es necesario):

```javascript
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

### Morgan (Logging HTTP)

```javascript
const morgan = require('morgan');

// Desarrollo: verbose logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Produccion: logging minimo
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}
```

---

## Configuracion de MongoDB

### Conexion Basica

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✓ MongoDB conectado'))
.catch(err => {
  console.error('✗ Error de conexion:', err.message);
  process.exit(1);
});
```

### Conexion con Opciones

```javascript
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

// Eventos de conexion
mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Conexion cerrada por terminacion de app');
  process.exit(0);
});
```

---

## Registro de Rutas

### Estructura

```javascript
// Rutas publicas (sin autenticacion)
app.use('/api/auth', require('./routes/authRoutes'));

// Rutas protegidas (con autenticacion)
app.use('/api/alumnos', require('./routes/alumnoRoutes'));
app.use('/api/personal', require('./routes/personalRoutes'));
app.use('/api/materias', require('./routes/materiasRoutes'));
app.use('/api/docentes', require('./routes/docenteRoutes'));
app.use('/api/tutores', require('./routes/tutorRoutes'));
app.use('/api/coordinadores', require('./routes/coordinadorRoutes'));
app.use('/api/administradores', require('./routes/administradorRoutes'));
app.use('/api/coord-general', require('./routes/coordinadorGenRoutes'));
app.use('/api/admin-general', require('./routes/administradorGenRoutes'));
app.use('/api/historial', require('./routes/historialAcademicoRoutes'));
```

### Ruta de Health Check

```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

---

## Manejo de Errores

### Middleware de Error Global

```javascript
// Debe ir al FINAL de todas las rutas
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Error de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      mensaje: 'Error de validacion',
      errores: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Error de cast (ID invalido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      mensaje: 'ID invalido'
    });
  }
  
  // Error generico
  res.status(err.status || 500).json({
    mensaje: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### Ruta 404 (No Encontrada)

```javascript
// Debe ir ANTES del middleware de error
app.use('*', (req, res) => {
  res.status(404).json({
    mensaje: 'Ruta no encontrada',
    ruta: req.originalUrl
  });
});
```

---

## Variables de Entorno

### Validacion al Inicio

```javascript
require('dotenv').config();

// Validar variables criticas
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`ERROR: Variable ${envVar} no configurada`);
    process.exit(1);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('ERROR: JWT_SECRET debe tener al menos 32 caracteres');
  process.exit(1);
}
```

---

## Configuracion de Seguridad

### Helmet (Headers de Seguridad)

```javascript
const helmet = require('helmet');

app.use(helmet());
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // max 100 requests por IP
  message: 'Demasiadas peticiones, intenta mas tarde'
});

// Aplicar a rutas especificas
app.use('/api/auth', limiter);

// O globalmente
app.use('/api', limiter);
```

### Express Mongo Sanitize

Previene inyeccion NoSQL:

```javascript
const mongoSanitize = require('express-mongo-sanitize');

app.use(mongoSanitize());
```

---

## Compresion

Comprime respuestas HTTP:

```javascript
const compression = require('compression');

app.use(compression());
```

---

## Estructura Completa Recomendada

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Validar variables de entorno
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`ERROR: ${envVar} no configurada`);
    process.exit(1);
  }
}

// Inicializar app
const app = express();

// Seguridad
app.use(helmet());

// CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));

// Compresion
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Archivos estaticos
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/alumnos', require('./routes/alumnoRoutes'));
app.use('/api/personal', require('./routes/personalRoutes'));
app.use('/api/materias', require('./routes/materiasRoutes'));
// ... mas rutas

// 404
app.use('*', (req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    mensaje: err.message || 'Error del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB conectado'))
  .catch(err => {
    console.error('✗ Error MongoDB:', err);
    process.exit(1);
  });

// Iniciar servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✓ Servidor corriendo en puerto ${PORT}`);
  console.log(`✓ Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Servidor cerrado');
      process.exit(0);
    });
  });
});

module.exports = app;
```

---

## Scripts npm

### package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "seed": "node scripts/seedDatabase.js"
  }
}
```

### Usar nodemon para Desarrollo

```bash
npm install --save-dev nodemon
```

```json
// nodemon.json
{
  "watch": ["server.js", "routes/", "models/", "controllers/"],
  "ext": "js,json",
  "ignore": ["node_modules/", "uploads/"],
  "env": {
    "NODE_ENV": "development"
  }
}
```

---

## Puerto Dinamico

Para deployment en plataformas cloud:

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en puerto ${PORT}`);
});
```

---

## Testing

### Exportar App

Para poder testear:

```javascript
// Al final de server.js
module.exports = app;
```

### Test Basico

```javascript
// tests/server.test.js
const request = require('supertest');
const app = require('../server');

describe('Health Check', () => {
  it('should return status ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
```

---

## Documentos Relacionados

- [Variables de Entorno](../guias/variables-entorno.md)
- [Autenticacion JWT](./autenticacion.md)
- [Endpoints API](./endpoints/README.md)
- [Modelos de Datos](./modelos/README.md)
