# Manual Tecnico para Desarrolladores
## Sistema Web de Reinscripcion - Facultad de Ingenieria Electronica UAZ

---

## Contenido

1. [Introduccion](#1-introduccion)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Configuracion del Entorno](#3-configuracion-del-entorno)
4. [Base de Datos](#4-base-de-datos)
5. [Backend - API REST](#5-backend---api-rest)
6. [Frontend - React](#6-frontend---react)
7. [Autenticacion y Seguridad](#7-autenticacion-y-seguridad)
8. [Servicios Externos](#8-servicios-externos)
9. [Tareas Programadas](#9-tareas-programadas)
10. [Despliegue](#10-despliegue)
11. [Mantenimiento](#11-mantenimiento)
12. [Guia de Contribucion](#12-guia-de-contribucion)

---

## 1. Introduccion

### 1.1 Proposito del Documento

Este manual tecnico proporciona informacion detallada sobre la arquitectura, implementacion y mantenimiento del Sistema Web de Reinscripcion. Esta dirigido a desarrolladores que necesiten:

- Entender la estructura del codigo
- Realizar modificaciones o mejoras
- Corregir errores
- Desplegar el sistema
- Dar mantenimiento

### 1.2 Stack Tecnologico

| Componente | Tecnologia | Version |
|------------|------------|---------|
| Frontend | React | 18.3.1 |
| Routing Frontend | React Router DOM | 7.0.1 |
| HTTP Client | Axios | 1.7.9 |
| Notificaciones | React Toastify | 11.0.3 |
| Backend | Node.js | 18+ |
| Framework Backend | Express.js | 4.x |
| Base de Datos | MongoDB | Atlas |
| ODM | Mongoose | 8.x |
| Autenticacion | JWT | - |
| Encriptacion | bcrypt/bcryptjs | - |
| Email | Nodemailer | - |
| PDF | PDFKit | - |
| Archivos | Multer | - |
| CSV | csv-parser, json2csv | - |
| Cron | node-cron | - |

### 1.3 Repositorio

```
Poryecto_Ing_Electrica/
|-- node_backend/       # API REST
|-- react_frontend/     # Aplicacion React
|-- react-app-native/   # App nativa (en desarrollo)
|-- exports/            # Historiales academicos
|-- README.md           # Documentacion principal
|-- SRS_Actualizado.md  # Especificacion de requerimientos
|-- Manual_Usuario.md   # Manual de usuario
|-- Manual_Tecnico.md   # Este documento
```

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura

```
+------------------+       +------------------+       +------------------+
|                  |       |                  |       |                  |
|   React App      | <---> |   Express API    | <---> |   MongoDB        |
|   (Frontend)     |  HTTP |   (Backend)      | Mongo |   Atlas          |
|   Port: 3000     |  JSON |   Port: 5000     |       |   (Cloud)        |
|                  |       |                  |       |                  |
+------------------+       +--------+---------+       +------------------+
                                    |
                          +---------+---------+
                          |                   |
                    +-----+-----+       +-----+-----+
                    |           |       |           |
                    | Nodemailer|       |  PDFKit   |
                    | (Email)   |       |  (PDF)    |
                    |           |       |           |
                    +-----------+       +-----------+
```

### 2.2 Patron de Diseno

El backend sigue el patron **MVC (Model-View-Controller)**:

- **Models/** - Esquemas de Mongoose (definicion de datos)
- **Controllers/** - Logica de negocio
- **Routes/** - Definicion de endpoints (rutas)

### 2.3 Flujo de Datos

```
1. Cliente hace peticion HTTP
2. Express recibe la peticion
3. Middleware de autenticacion valida JWT
4. Router dirige a controller correspondiente
5. Controller ejecuta logica de negocio
6. Controller interactua con Model (MongoDB)
7. Controller retorna respuesta JSON
8. Cliente procesa respuesta
```

---

## 3. Configuracion del Entorno

### 3.1 Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Git
- Editor de codigo (VS Code recomendado)
- Cuenta en MongoDB Atlas
- Cuenta Gmail para SMTP

### 3.2 Clonar Repositorio

```bash
git clone <url-repositorio>
cd Poryecto_Ing_Electrica
```

### 3.3 Configurar Backend

```bash
cd node_backend
npm install
```

Crear archivo `.env`:

```env
# Puerto del servidor
PORT=5000

# Clave secreta para JWT (generar una segura)
JWT_SECRET=tu_clave_secreta_muy_segura_aqui

# URI de MongoDB Atlas
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority

# Credenciales de email (opcional, para nodemailer)
EMAIL_USER=correo@gmail.com
EMAIL_PASS=app_password_de_gmail
```

### 3.4 Configurar Frontend

```bash
cd react_frontend
npm install
```

Crear archivo `.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 3.5 Iniciar en Desarrollo

**Terminal 1 - Backend:**
```bash
cd node_backend
npm run dev  # Con nodemon
# o
npm start    # Sin hot-reload
```

**Terminal 2 - Frontend:**
```bash
cd react_frontend
npm start
```

### 3.6 Variables de Entorno

#### Backend

| Variable | Descripcion | Requerido |
|----------|-------------|-----------|
| `PORT` | Puerto del servidor | No (default: 5000) |
| `JWT_SECRET` | Clave para firmar JWT | Si |
| `MONGODB_URI` | URI de conexion MongoDB | Si |
| `EMAIL_USER` | Correo para SMTP | No |
| `EMAIL_PASS` | Password de app Gmail | No |

#### Frontend

| Variable | Descripcion | Requerido |
|----------|-------------|-----------|
| `REACT_APP_API_URL` | URL base de la API | Si |

---

## 4. Base de Datos

### 4.1 MongoDB Atlas

El sistema utiliza MongoDB Atlas (cloud). Para configurar:

1. Crear cuenta en https://www.mongodb.com/atlas
2. Crear cluster (tier gratuito disponible)
3. Crear usuario de base de datos
4. Agregar IP a whitelist (0.0.0.0/0 para desarrollo)
5. Obtener connection string

### 4.2 Colecciones

| Coleccion | Descripcion |
|-----------|-------------|
| `alumnos` | Estudiantes registrados |
| `materias` | Materias disponibles |
| `horarios` | Horarios generados |
| `personals` | Personal (docentes, tutores, etc.) |
| `docentes` | Relacion docente-materias |
| `tutors` | Relacion tutor-alumnos |
| `coordinadors` | Coordinadores por carrera |
| `admins` | Administradores por carrera |
| `cordgens` | Coordinadores generales |
| `admingens` | Administradores generales |
| `historialacademicos` | Historiales por semestre |

### 4.3 Esquemas Mongoose

#### Alumno (models/Alumno.js)

```javascript
const alumnoSchema = new mongoose.Schema({
  id_carrera: {
    type: String,
    required: true
  },
  matricula: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  telefono: String,
  correo: String,
  horario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Horario'
  },
  tutor: String,  // Matricula del tutor (opcional)
  estatusComprobante: {
    type: String,
    enum: ['Pendiente', 'Aceptado', 'Rechazado'],
    default: 'Pendiente'
  }
});
```

#### Materia (models/Materia.js)

```javascript
const materiaSchema = new mongoose.Schema({
  id_materia: {
    type: Number,
    required: true
  },
  id_carrera: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  horarios: {
    lunes: String,
    martes: String,
    miercoles: String,
    jueves: String,
    viernes: String,
    sabado: String
  },
  semi: String,  // Semestre
  alumnos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumno'
  }],
  salon: String,
  grupo: String,
  cupo: Number,
  laboratorio: {
    type: Boolean,
    default: false
  },
  docente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Docente'
  }
});
```

#### Horario (models/Horario.js)

```javascript
const horarioSchema = new mongoose.Schema({
  materias: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Materia'
  }],
  estatus: {
    type: Number,
    default: 0
    // 0 = Pendiente
    // 1 = Aprobado por Tutor
    // 2 = Rechazado
    // 3 = Aprobado por Admin
  },
  comentario: String
});
```

#### Personal (models/Personal.js)

```javascript
const personalSchema = new mongoose.Schema({
  matricula: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  roles: [{
    type: String,
    enum: ['D', 'T', 'C', 'A', 'CG', 'AG']
    // D = Docente
    // T = Tutor
    // C = Coordinador
    // A = Administrador
    // CG = Coordinador General
    // AG = Administrador General
  }],
  correo: String,
  telefono: String,
  activo: {
    type: Boolean,
    default: true
  }
});
```

#### Coordinador (models/Coordinador.js)

```javascript
const coordinadorSchema = new mongoose.Schema({
  id_carrera: {
    type: String,
    required: true
  },
  personalMatricula: {
    type: String,
    required: true
  },
  alumnos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumno'
  }],
  horas: {
    type: Number,
    default: 40  // Horas maximas de inscripcion
  },
  comprobantePagoHabilitado: {
    type: Boolean,
    default: true
  }
});
```

#### HistorialAcademico (models/HistorialAcademico.js)

```javascript
const historialSchema = new mongoose.Schema({
  semestre: {
    type: String,
    required: true  // "2025-1", "2025-2"
  },
  fecha_generacion: {
    type: Date,
    default: Date.now
  },
  archivos: {
    personal: String,  // Ruta al CSV
    alumnos: String,
    materias: String
  },
  generado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personal'
  },
  fecha_de_borrado: Date
});
```

### 4.4 Indices

Para optimizar consultas, crear indices:

```javascript
// En Alumno
alumnoSchema.index({ matricula: 1 }, { unique: true });
alumnoSchema.index({ id_carrera: 1 });

// En Materia
materiaSchema.index({ id_carrera: 1 });
materiaSchema.index({ id_materia: 1, id_carrera: 1 });

// En Personal
personalSchema.index({ matricula: 1 }, { unique: true });
```

### 4.5 Relaciones

```
Alumno 1--1 Horario (un alumno tiene un horario)
Horario 1--N Materia (un horario tiene muchas materias)
Materia N--1 Docente (una materia tiene un docente)
Materia N--N Alumno (una materia tiene muchos alumnos)
Personal 1--N Roles (un personal puede tener varios roles)
Tutor 1--N Alumno (un tutor tiene varios alumnos)
Coordinador 1--1 Carrera (un coordinador por carrera)
```

---

## 5. Backend - API REST

### 5.1 Estructura de Carpetas

```
node_backend/
|-- controllers/           # Logica de negocio
|   |-- alumnoController.js
|   |-- materiaController.js
|   |-- PersonalController.js
|   |-- docenteController.js
|   |-- tutorController.js
|   |-- coordinadorController.js
|   |-- cordGenController.js
|   |-- adminGenController.js
|   |-- historialController.js
|   |-- authController.js
|
|-- models/                # Esquemas Mongoose
|   |-- Alumno.js
|   |-- Materia.js
|   |-- Horario.js
|   |-- Personal.js
|   |-- Docente.js
|   |-- Tutor.js
|   |-- Coordinador.js
|   |-- Admin.js
|   |-- CordGen.js
|   |-- AdminGen.js
|   |-- HistorialAcademico.js
|
|-- routes/                # Definicion de endpoints
|   |-- alumnoRoutes.js
|   |-- materiaRoutes.js
|   |-- personalRoutes.js
|   |-- docenteRoutes.js
|   |-- tutorRoutes.js
|   |-- coordinadorRoutes.js
|   |-- cordGenRoutes.js
|   |-- adminGenRoutes.js
|   |-- historialRoutes.js
|   |-- authRoutes.js
|
|-- middlewares/
|   |-- authMiddleware.js  # Verificacion JWT
|
|-- utils/
|   |-- pdfHorario.js      # Generacion PDF
|   |-- email.js           # Envio de correos
|
|-- uploads/
|   |-- comprobantes/      # PDFs de comprobantes
|
|-- exports/               # CSVs exportados
|
|-- server.js              # Punto de entrada
|-- package.json
|-- .env
```

### 5.2 Punto de Entrada (server.js)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexion a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexion:', err));

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/alumnos', require('./routes/alumnoRoutes'));
app.use('/api/materias', require('./routes/materiaRoutes'));
app.use('/api/personal', require('./routes/personalRoutes'));
app.use('/api/docentes', require('./routes/docenteRoutes'));
app.use('/api/tutores', require('./routes/tutorRoutes'));
app.use('/api/coordinadores', require('./routes/coordinadorRoutes'));
app.use('/api/cordgen', require('./routes/cordGenRoutes'));
app.use('/api/admingen', require('./routes/adminGenRoutes'));
app.use('/api/historial', require('./routes/historialRoutes'));

// Servir archivos estaticos
app.use('/uploads', express.static('uploads'));
app.use('/exports', express.static('exports'));

// Cron job para purga automatica
cron.schedule('0 0 * * *', async () => {
  // Verificar si es fecha de borrado
  // Exportar y purgar si corresponde
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

### 5.3 Definicion de Rutas

#### Ejemplo: alumnoRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnoController');
const { verificarToken } = require('../middlewares/authMiddleware');
const multer = require('multer');

// Configuracion de multer para comprobantes
const storage = multer.diskStorage({
  destination: './uploads/comprobantes/',
  filename: (req, file, cb) => {
    cb(null, `Pago_${req.params.matricula}.pdf`);
  }
});
const upload = multer({ storage });

// Rutas CRUD
router.get('/', verificarToken, alumnoController.obtenerAlumnos);
router.post('/', verificarToken, alumnoController.crearAlumno);
router.get('/:id', verificarToken, alumnoController.obtenerAlumnoPorId);
router.put('/:id', verificarToken, alumnoController.actualizarAlumno);
router.delete('/:id', verificarToken, alumnoController.eliminarAlumno);

// Rutas especificas
router.get('/carrera/:id_carrera', verificarToken, alumnoController.obtenerPorCarrera);
router.get('/matricula/:matricula', verificarToken, alumnoController.obtenerPorMatriculaTutor);
router.get('/horario/:id', verificarToken, alumnoController.obtenerHorarioDetallado);
router.get('/estatus/:matricula', verificarToken, alumnoController.obtenerEstatus);

// CSV
router.get('/exportar-csv', verificarToken, alumnoController.exportarCSV);
router.post('/subir-csv', verificarToken, upload.single('archivo'), alumnoController.importarCSV);

// Comprobantes
router.post('/subir-comprobante/:matricula', verificarToken, upload.single('comprobante'), alumnoController.subirComprobante);
router.put('/validar-comprobante/:matricula', verificarToken, alumnoController.validarComprobante);
router.get('/comprobante/:matricula', verificarToken, alumnoController.verificarComprobante);

module.exports = router;
```

### 5.4 Controllers

#### Ejemplo: alumnoController.js

```javascript
const Alumno = require('../models/Alumno');
const Horario = require('../models/Horario');
const { Parser } = require('json2csv');
const csv = require('csv-parser');
const fs = require('fs');

// Obtener todos los alumnos
exports.obtenerAlumnos = async (req, res) => {
  try {
    const alumnos = await Alumno.find().populate('horario');
    res.json(alumnos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener alumnos', error });
  }
};

// Crear alumno
exports.crearAlumno = async (req, res) => {
  try {
    const { matricula, nombre, correo, telefono, id_carrera } = req.body;

    // Verificar si ya existe
    const existente = await Alumno.findOne({ matricula });
    if (existente) {
      return res.status(400).json({ mensaje: 'La matricula ya existe' });
    }

    const alumno = new Alumno({
      matricula,
      nombre,
      correo,
      telefono,
      id_carrera
    });

    await alumno.save();
    res.status(201).json(alumno);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear alumno', error });
  }
};

// Obtener alumno por ID
exports.obtenerAlumnoPorId = async (req, res) => {
  try {
    const alumno = await Alumno.findById(req.params.id).populate('horario');
    if (!alumno) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }
    res.json(alumno);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener alumno', error });
  }
};

// Actualizar alumno
exports.actualizarAlumno = async (req, res) => {
  try {
    const alumno = await Alumno.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!alumno) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }
    res.json(alumno);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar alumno', error });
  }
};

// Eliminar alumno
exports.eliminarAlumno = async (req, res) => {
  try {
    const alumno = await Alumno.findByIdAndDelete(req.params.id);
    if (!alumno) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }
    res.json({ mensaje: 'Alumno eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar alumno', error });
  }
};

// Obtener por carrera
exports.obtenerPorCarrera = async (req, res) => {
  try {
    const alumnos = await Alumno.find({ id_carrera: req.params.id_carrera });
    res.json(alumnos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener alumnos', error });
  }
};

// Exportar a CSV
exports.exportarCSV = async (req, res) => {
  try {
    const alumnos = await Alumno.find();
    const campos = ['matricula', 'nombre', 'correo', 'telefono', 'id_carrera'];
    const parser = new Parser({ fields: campos });
    const csv = parser.parse(alumnos);

    res.header('Content-Type', 'text/csv');
    res.attachment('alumnos.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al exportar', error });
  }
};

// Importar desde CSV
exports.importarCSV = async (req, res) => {
  try {
    const resultados = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => resultados.push(data))
      .on('end', async () => {
        for (const row of resultados) {
          await Alumno.findOneAndUpdate(
            { matricula: row.matricula },
            row,
            { upsert: true }
          );
        }
        fs.unlinkSync(req.file.path);
        res.json({ mensaje: 'Importacion completada', total: resultados.length });
      });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al importar', error });
  }
};

// Subir comprobante
exports.subirComprobante = async (req, res) => {
  try {
    const { matricula } = req.params;
    await Alumno.findOneAndUpdate(
      { matricula },
      { estatusComprobante: 'Pendiente' }
    );
    res.json({ mensaje: 'Comprobante subido correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al subir comprobante', error });
  }
};

// Validar comprobante
exports.validarComprobante = async (req, res) => {
  try {
    const { matricula } = req.params;
    const { estatus } = req.body; // 'Aceptado' o 'Rechazado'

    await Alumno.findOneAndUpdate(
      { matricula },
      { estatusComprobante: estatus }
    );
    res.json({ mensaje: `Comprobante ${estatus.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al validar', error });
  }
};
```

### 5.5 Middleware de Autenticacion

```javascript
// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token invalido o expirado' });
  }
};

// Middleware para verificar rol especifico
exports.verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario.roles) {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    const tieneRol = req.usuario.roles.some(rol => rolesPermitidos.includes(rol));
    if (!tieneRol) {
      return res.status(403).json({ mensaje: 'No tiene permisos para esta accion' });
    }

    next();
  };
};
```

### 5.6 Controlador de Autenticacion

```javascript
// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Alumno = require('../models/Alumno');
const Personal = require('../models/Personal');

// Login de alumno
exports.loginAlumno = async (req, res) => {
  try {
    const { matricula, id_carrera } = req.body;

    const alumno = await Alumno.findOne({ matricula, id_carrera });
    if (!alumno) {
      return res.status(401).json({ mensaje: 'Matricula o carrera incorrecta' });
    }

    const token = jwt.sign(
      {
        id: alumno._id,
        userType: 'alumno',
        matricula: alumno.matricula,
        id_carrera: alumno.id_carrera
      },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    res.json({ token, alumno });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// Login de personal
exports.loginPersonal = async (req, res) => {
  try {
    const { matricula, password } = req.body;

    const personal = await Personal.findOne({ matricula });
    if (!personal) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const passwordValido = await bcrypt.compare(password, personal.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      {
        id: personal._id,
        userType: 'personal',
        matricula: personal.matricula,
        roles: personal.roles
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, personal });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};
```

---

## 6. Frontend - React

### 6.1 Estructura de Carpetas

```
react_frontend/
|-- public/
|   |-- index.html
|   |-- favicon.ico
|
|-- src/
|   |-- components/
|   |   |-- Registro.js                    # Login
|   |   |-- PrivateRoute.js                # Proteccion de rutas
|   |   |-- RedirectRoute.js               # Redireccion
|   |   |
|   |   |-- # Alumno
|   |   |-- HorarioSeleccion.js
|   |   |-- Validacion1.js
|   |   |-- Validacion2.js
|   |   |
|   |   |-- # Tutor
|   |   |-- InicioTutor.js
|   |   |-- RevisionHorarioTutor.js
|   |   |-- AsignarTutor.js
|   |   |
|   |   |-- # Docente
|   |   |-- InicioDocente.js
|   |   |-- InicioDocente2.js
|   |   |-- DocenteAlumnos.js
|   |   |
|   |   |-- # Coordinador
|   |   |-- InicioCoordinador.js
|   |   |-- AlumnoListCoord.js
|   |   |-- CrearAlumno.js
|   |   |-- ModificarAlumno.js
|   |   |-- AdministrarMaterias.js
|   |   |-- AdministrarTutorados.js
|   |   |
|   |   |-- # Coordinador General
|   |   |-- InicioCoordinadorGeneral.js
|   |   |-- AlumnoListCG.js
|   |   |-- AdministrarMateriasCG.js
|   |   |-- HistorialAcademico.js
|   |   |
|   |   |-- # Administrador General
|   |   |-- InicioAdministradorGeneral.js
|   |   |-- AlumnoListAG.js
|   |   |
|   |   |-- # UI Compartida
|   |   |-- Encabezado.js
|   |   |-- Pie_pagina.js
|   |   |-- RevisionComprobantePago.js
|   |
|   |-- utils/
|   |   |-- axiosConfig.js
|   |
|   |-- App.js
|   |-- index.js
|   |-- index.css
|
|-- package.json
|-- .env
```

### 6.2 Configuracion de Axios

```javascript
// src/utils/axiosConfig.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 6.3 Rutas (App.js)

```javascript
// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PrivateRoute from './components/PrivateRoute';
import Registro from './components/Registro';
import HorarioSeleccion from './components/HorarioSeleccion';
import Validacion1 from './components/Validacion1';
import Validacion2 from './components/Validacion2';
import InicioTutor from './components/InicioTutor';
import InicioDocente from './components/InicioDocente';
import InicioCoordinador from './components/InicioCoordinador';
// ... mas imports

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Publicas */}
        <Route path="/" element={<Registro />} />
        <Route path="/login" element={<Registro />} />

        {/* Alumno */}
        <Route path="/horario-seleccion" element={
          <PrivateRoute><HorarioSeleccion /></PrivateRoute>
        } />
        <Route path="/validacion" element={
          <PrivateRoute><Validacion1 /></PrivateRoute>
        } />
        <Route path="/validacion-estatus" element={
          <PrivateRoute><Validacion2 /></PrivateRoute>
        } />

        {/* Tutor */}
        <Route path="/tutor" element={
          <PrivateRoute><InicioTutor /></PrivateRoute>
        } />

        {/* Docente */}
        <Route path="/docente/alumnos" element={
          <PrivateRoute><InicioDocente /></PrivateRoute>
        } />
        <Route path="/docente/materias" element={
          <PrivateRoute><InicioDocente2 /></PrivateRoute>
        } />

        {/* Coordinador */}
        <Route path="/coordinador" element={
          <PrivateRoute><InicioCoordinador /></PrivateRoute>
        } />

        {/* ... mas rutas */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 6.4 Proteccion de Rutas

```javascript
// src/components/PrivateRoute.js
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
```

### 6.5 Componente de Login

```javascript
// src/components/Registro.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';

const Registro = () => {
  const [tipoUsuario, setTipoUsuario] = useState('alumno');
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  const [carrera, setCarrera] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (tipoUsuario === 'alumno') {
        response = await axios.post('/api/auth/alumno/login', {
          matricula,
          id_carrera: carrera
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('alumno', JSON.stringify(response.data.alumno));
        navigate('/horario-seleccion');
      } else {
        response = await axios.post('/api/auth/personal/login', {
          matricula,
          password
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('personal', JSON.stringify(response.data.personal));

        // Redirigir segun rol
        const roles = response.data.personal.roles;
        if (roles.includes('CG')) navigate('/coord-gen');
        else if (roles.includes('AG')) navigate('/admin-gen');
        else if (roles.includes('C')) navigate('/coordinador');
        else if (roles.includes('T')) navigate('/tutor');
        else if (roles.includes('D')) navigate('/docente/materias');
        else navigate('/');
      }

      toast.success('Inicio de sesion exitoso');
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al iniciar sesion');
    }
  };

  return (
    <div className="login-container">
      <h1>Sistema de Reinscripcion</h1>
      <form onSubmit={handleSubmit}>
        {/* Selector de tipo de usuario */}
        <select value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)}>
          <option value="alumno">Alumno</option>
          <option value="personal">Personal</option>
        </select>

        <input
          type="text"
          placeholder="Matricula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          required
        />

        {tipoUsuario === 'alumno' && (
          <select value={carrera} onChange={(e) => setCarrera(e.target.value)} required>
            <option value="">Seleccione carrera</option>
            <option value="IElec">Ing. Electricista</option>
            <option value="ISftw">Ing. Software</option>
            {/* ... mas carreras */}
          </select>
        )}

        {tipoUsuario === 'personal' && (
          <input
            type="password"
            placeholder="Contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}

        <button type="submit">Iniciar Sesion</button>
      </form>
    </div>
  );
};

export default Registro;
```

### 6.6 Componente de Seleccion de Horario

```javascript
// src/components/HorarioSeleccion.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';

const HorarioSeleccion = () => {
  const [materias, setMaterias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const alumno = JSON.parse(localStorage.getItem('alumno'));

  useEffect(() => {
    cargarMaterias();
  }, []);

  const cargarMaterias = async () => {
    try {
      const response = await axios.get(`/api/materias/carrera/${alumno.id_carrera}`);
      setMaterias(response.data);
    } catch (error) {
      toast.error('Error al cargar materias');
    }
  };

  const agregarMateria = (materia) => {
    // Validar traslapes
    const hayConflicto = seleccionadas.some(sel => {
      return verificarTraslape(sel.horarios, materia.horarios);
    });

    if (hayConflicto) {
      toast.error('Conflicto de horario detectado');
      return;
    }

    setSeleccionadas([...seleccionadas, materia]);
    toast.success('Materia agregada');
  };

  const quitarMateria = (materiaId) => {
    setSeleccionadas(seleccionadas.filter(m => m._id !== materiaId));
  };

  const guardarHorario = async () => {
    try {
      await axios.post('/api/alumnos/guardar-horario', {
        matricula: alumno.matricula,
        materias: seleccionadas.map(m => m._id)
      });
      toast.success('Horario guardado. Revise su correo.');
    } catch (error) {
      toast.error('Error al guardar horario');
    }
  };

  return (
    <div>
      <h1>Seleccion de Materias</h1>

      <div className="materias-disponibles">
        <h2>Materias Disponibles</h2>
        {materias.map(materia => (
          <div key={materia._id} className="materia-card">
            <h3>{materia.nombre}</h3>
            <p>Grupo: {materia.grupo}</p>
            <p>Salon: {materia.salon}</p>
            <p>Cupo: {materia.cupo - materia.alumnos.length}</p>
            <button onClick={() => agregarMateria(materia)}>Agregar</button>
          </div>
        ))}
      </div>

      <div className="materias-seleccionadas">
        <h2>Materias Seleccionadas</h2>
        {seleccionadas.map(materia => (
          <div key={materia._id}>
            <span>{materia.nombre}</span>
            <button onClick={() => quitarMateria(materia._id)}>Quitar</button>
          </div>
        ))}
        <button onClick={guardarHorario}>Guardar Horario</button>
      </div>
    </div>
  );
};

export default HorarioSeleccion;
```

---

## 7. Autenticacion y Seguridad

### 7.1 Flujo de Autenticacion

```
1. Usuario ingresa credenciales
2. Frontend envia POST a /api/auth/login
3. Backend valida credenciales
4. Backend genera JWT con datos del usuario
5. Backend retorna token al frontend
6. Frontend almacena token en localStorage
7. Frontend incluye token en header de cada peticion
8. Backend verifica token en cada peticion protegida
```

### 7.2 Estructura del Token JWT

```javascript
// Payload del token
{
  id: "ObjectId",           // ID del usuario
  userType: "alumno|personal",
  matricula: "12345678",
  id_carrera: "IElec",      // Solo para alumnos
  roles: ["D", "T"],        // Solo para personal
  iat: 1234567890,          // Issued at
  exp: 1234567890           // Expiration
}
```

### 7.3 Expiracion de Tokens

- **Alumnos:** 30 minutos
- **Personal:** 1 hora

### 7.4 Encriptacion de Contrasenas

```javascript
const bcrypt = require('bcryptjs');

// Al crear usuario
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Al verificar
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 7.5 Proteccion de Rutas por Rol

```javascript
// Ejemplo de ruta protegida por rol
router.get('/datos-sensibles',
  verificarToken,
  verificarRol('CG', 'AG'),
  controller.obtenerDatos
);
```

---

## 8. Servicios Externos

### 8.1 Envio de Emails (Nodemailer)

#### Configuracion

```javascript
// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // App password de Gmail
  }
});

const enviarCorreo = async (destinatario, asunto, contenidoHtml, adjuntos = []) => {
  const mailOptions = {
    from: `Sistema UAZ <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: asunto,
    html: contenidoHtml,
    attachments: adjuntos
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { enviarCorreo };
```

#### Uso

```javascript
const { enviarCorreo } = require('../utils/email');

// Enviar horario
await enviarCorreo(
  alumno.correo,
  'Horario Provisional',
  '<h1>Su horario ha sido generado</h1><p>Adjunto encontrara el PDF.</p>',
  [{ path: './temp/horario.pdf' }]
);
```

#### Configurar Gmail

1. Activar verificacion en 2 pasos en Google
2. Generar "Contrasena de aplicacion"
3. Usar esa contrasena en `EMAIL_PASS`

### 8.2 Generacion de PDF (PDFKit)

```javascript
// utils/pdfHorario.js
const PDFDocument = require('pdfkit');
const fs = require('fs');

const generarPDFHorario = async (alumno, materias) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const filename = `./temp/horario_${alumno.matricula}.pdf`;
    const stream = fs.createWriteStream(filename);

    doc.pipe(stream);

    // Encabezado
    doc.fontSize(20).text('HORARIO DE CLASES', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Alumno: ${alumno.nombre}`);
    doc.text(`Matricula: ${alumno.matricula}`);
    doc.text(`Carrera: ${alumno.id_carrera}`);
    doc.moveDown();

    // Tabla de materias
    doc.fontSize(10);
    materias.forEach(materia => {
      doc.text(`${materia.nombre} - ${materia.grupo} - ${materia.salon}`);
      doc.text(`  Lunes: ${materia.horarios.lunes || '-'}`);
      doc.text(`  Martes: ${materia.horarios.martes || '-'}`);
      // ... otros dias
      doc.moveDown();
    });

    // Marca de agua
    doc.fillColor('red')
       .fontSize(24)
       .text('PROVISIONAL', 200, 400, { opacity: 0.3 });

    doc.end();

    stream.on('finish', () => resolve(filename));
    stream.on('error', reject);
  });
};

module.exports = { generarPDFHorario };
```

---

## 9. Tareas Programadas

### 9.1 Cron Job de Purga Automatica

```javascript
// En server.js
const cron = require('node-cron');
const HistorialAcademico = require('./models/HistorialAcademico');
const Alumno = require('./models/Alumno');
const Materia = require('./models/Materia');
const Personal = require('./models/Personal');
const { Parser } = require('json2csv');
const fs = require('fs');

// Ejecutar diariamente a las 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('Ejecutando tarea de verificacion de purga...');

  try {
    const historial = await HistorialAcademico.findOne().sort({ fecha_generacion: -1 });

    if (!historial || !historial.fecha_de_borrado) {
      console.log('No hay fecha de borrado configurada');
      return;
    }

    const hoy = new Date();
    const fechaBorrado = new Date(historial.fecha_de_borrado);

    if (hoy >= fechaBorrado) {
      console.log('Iniciando proceso de purga...');

      const semestre = historial.semestre;
      const carpeta = `./exports/${semestre}`;

      // Crear carpeta si no existe
      if (!fs.existsSync(carpeta)) {
        fs.mkdirSync(carpeta, { recursive: true });
      }

      // Exportar alumnos
      const alumnos = await Alumno.find();
      const csvAlumnos = new Parser().parse(alumnos);
      fs.writeFileSync(`${carpeta}/alumnos.csv`, csvAlumnos);

      // Exportar materias
      const materias = await Materia.find();
      const csvMaterias = new Parser().parse(materias);
      fs.writeFileSync(`${carpeta}/materias.csv`, csvMaterias);

      // Exportar personal (excepto CG y AG)
      const personal = await Personal.find({ roles: { $nin: ['CG', 'AG'] } });
      const csvPersonal = new Parser().parse(personal);
      fs.writeFileSync(`${carpeta}/personal.csv`, csvPersonal);

      // Actualizar historial con rutas de archivos
      historial.archivos = {
        alumnos: `${carpeta}/alumnos.csv`,
        materias: `${carpeta}/materias.csv`,
        personal: `${carpeta}/personal.csv`
      };
      await historial.save();

      // Purgar datos
      await Alumno.deleteMany({});
      await Materia.deleteMany({});
      await Personal.deleteMany({ roles: { $nin: ['CG', 'AG'] } });

      console.log('Purga completada exitosamente');
    }
  } catch (error) {
    console.error('Error en tarea de purga:', error);
  }
});
```

### 9.2 Sintaxis de Cron

```
* * * * *
| | | | |
| | | | +-- Dia de la semana (0-7, 0 y 7 = Domingo)
| | | +---- Mes (1-12)
| | +------ Dia del mes (1-31)
| +-------- Hora (0-23)
+---------- Minuto (0-59)

Ejemplos:
'0 0 * * *'     - Todos los dias a medianoche
'0 */6 * * *'   - Cada 6 horas
'0 9 * * 1-5'   - Lunes a Viernes a las 9am
```

---

## 10. Despliegue

### 10.1 Requisitos de Produccion

- Servidor con Node.js 18+
- MongoDB Atlas o servidor MongoDB
- Dominio y certificado SSL
- Servidor web (Nginx recomendado)

### 10.2 Build del Frontend

```bash
cd react_frontend
npm run build
```

Esto genera la carpeta `build/` con archivos estaticos.

### 10.3 Configuracion de Nginx

```nginx
# /etc/nginx/sites-available/reinscripcion

server {
    listen 80;
    server_name tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name tudominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend (archivos estaticos)
    location / {
        root /var/www/reinscripcion/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend (proxy)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Archivos subidos
    location /uploads {
        proxy_pass http://localhost:5000/uploads;
    }
}
```

### 10.4 PM2 para Backend

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicacion
cd node_backend
pm2 start server.js --name "api-reinscripcion"

# Configurar inicio automatico
pm2 startup
pm2 save

# Ver logs
pm2 logs api-reinscripcion

# Reiniciar
pm2 restart api-reinscripcion
```

### 10.5 Variables de Entorno en Produccion

```env
# Backend (.env)
PORT=5000
NODE_ENV=production
JWT_SECRET=clave_muy_segura_de_produccion
MONGODB_URI=mongodb+srv://...
EMAIL_USER=correo@institucion.edu
EMAIL_PASS=app_password
```

```env
# Frontend (.env.production)
REACT_APP_API_URL=https://tudominio.com
```

---

## 11. Mantenimiento

### 11.1 Logs

#### Backend

Los logs se imprimen en consola. Con PM2:

```bash
pm2 logs api-reinscripcion
pm2 logs api-reinscripcion --lines 100
```

#### Agregar logging estructurado

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Uso
logger.info('Usuario inicio sesion', { matricula: '12345678' });
logger.error('Error al procesar', { error: err.message });
```

### 11.2 Backups de Base de Datos

#### MongoDB Atlas

Atlas hace backups automaticos. Para backup manual:

```bash
mongodump --uri="mongodb+srv://..." --out=./backup/$(date +%Y%m%d)
```

#### Restaurar

```bash
mongorestore --uri="mongodb+srv://..." ./backup/20250105
```

### 11.3 Monitoreo

#### Endpoints de Salud

```javascript
// En server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

app.get('/health/db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});
```

### 11.4 Actualizaciones

#### Actualizar dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar una dependencia
npm update <paquete>

# Actualizar todas (con cuidado)
npm update
```

#### Proceso de actualizacion

1. Hacer backup de base de datos
2. Probar en entorno de desarrollo
3. Crear rama de release
4. Desplegar en staging (si existe)
5. Desplegar en produccion
6. Monitorear logs

---

## 12. Guia de Contribucion

### 12.1 Flujo de Trabajo Git

```bash
# 1. Clonar repositorio
git clone <url>

# 2. Crear rama para feature/fix
git checkout -b feature/nueva-funcionalidad

# 3. Hacer cambios y commits
git add .
git commit -m "Agregar nueva funcionalidad X"

# 4. Push a remoto
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request en GitHub/GitLab
```

### 12.2 Convenciones de Commits

```
tipo(alcance): descripcion

Tipos:
- feat: Nueva funcionalidad
- fix: Correccion de bug
- docs: Documentacion
- style: Formato (no afecta codigo)
- refactor: Refactorizacion
- test: Agregar tests
- chore: Tareas de mantenimiento

Ejemplos:
feat(alumnos): agregar validacion de matricula
fix(auth): corregir expiracion de token
docs(readme): actualizar instrucciones de instalacion
```

### 12.3 Estructura de Codigo

#### Backend

- Usar async/await para operaciones asincronas
- Manejar errores con try/catch
- Validar datos de entrada
- Retornar respuestas consistentes

```javascript
// Estructura de respuesta exitosa
res.json({
  success: true,
  data: resultado,
  mensaje: 'Operacion exitosa'
});

// Estructura de error
res.status(400).json({
  success: false,
  mensaje: 'Descripcion del error',
  error: detalles
});
```

#### Frontend

- Componentes funcionales con hooks
- Separar logica de presentacion
- Usar PropTypes o TypeScript
- Manejar estados de carga y error

### 12.4 Testing

#### Backend (Jest)

```javascript
// tests/alumno.test.js
const request = require('supertest');
const app = require('../server');

describe('API Alumnos', () => {
  it('deberia obtener lista de alumnos', async () => {
    const res = await request(app)
      .get('/api/alumnos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

#### Frontend (React Testing Library)

```javascript
// src/components/__tests__/Login.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Registro from '../Registro';

test('muestra formulario de login', () => {
  render(<Registro />);
  expect(screen.getByText('Iniciar Sesion')).toBeInTheDocument();
});
```

### 12.5 Reportar Bugs

Al reportar un bug, incluir:

1. Descripcion del problema
2. Pasos para reproducir
3. Comportamiento esperado
4. Comportamiento actual
5. Capturas de pantalla (si aplica)
6. Logs relevantes
7. Entorno (navegador, version de Node, etc.)

---

## Anexos

### A. Codigos de Carrera

| ID | Nombre | Modalidad |
|----|--------|-----------|
| ISftw | Ing. Software | Escolarizado |
| IDsr | Ing. Desarrollo | Escolarizado |
| IEInd | Ing. Electronica Industrial | Escolarizado |
| ICmp | Ing. Computacion | Escolarizado |
| IRMca | Ing. Robotica y Mecatronica | Escolarizado |
| IElec | Ing. Electricista | Escolarizado |
| ISftwS | Ing. Software | Semiescolarizado |
| IDsrS | Ing. Desarrollo | Semiescolarizado |
| IEIndS | Ing. Electronica Industrial | Semiescolarizado |
| ICmpS | Ing. Computacion | Semiescolarizado |
| IRMcaS | Ing. Robotica y Mecatronica | Semiescolarizado |
| IElecS | Ing. Electricista | Semiescolarizado |

### B. Codigos de Rol

| Codigo | Rol | Descripcion |
|--------|-----|-------------|
| D | Docente | Imparte clases |
| T | Tutor | Valida horarios de tutorados |
| C | Coordinador | Gestiona una carrera |
| A | Administrador | Solo lectura de una carrera |
| CG | Coordinador General | Gestiona todas las carreras |
| AG | Administrador General | Solo lectura de todas |

### C. Estados de Horario

| Codigo | Estado | Descripcion |
|--------|--------|-------------|
| 0 | Pendiente | Esperando validacion |
| 1 | Aprobado Tutor | Tutor aprobo |
| 2 | Rechazado | Tutor o admin rechazo |
| 3 | Aprobado Admin | Admin aprobo |

### D. Estados de Comprobante

| Estado | Descripcion |
|--------|-------------|
| Pendiente | Subido, esperando validacion |
| Aceptado | Validado correctamente |
| Rechazado | Rechazado, debe subir otro |

---

*Manual Tecnico - Version 2.0*
*Ultima actualizacion: Enero 2026*
