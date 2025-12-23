# Sistema de Inscripciones UAIE

Sistema web completo para la gestión de inscripciones académicas de la Unidad Académica de Ingeniería Eléctrica (UAIE). Permite a los alumnos seleccionar sus horarios, gestionar comprobantes de pago y a los coordinadores/administradores administrar el proceso de inscripción.

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Roles de Usuario](#roles-de-usuario)
- [Funcionalidades Principales](#funcionalidades-principales)
- [API Endpoints](#api-endpoints)
- [Modelos de Datos](#modelos-de-datos)
- [Flujos del Sistema](#flujos-del-sistema)

---

## Descripción General

El sistema resuelve los siguientes problemas:

- **Gestión centralizada** de inscripciones de estudiantes a materias
- **Validación automática** de horarios y detección de traslapes entre materias
- **Control de horas máximas** por carrera configurable
- **Validación de comprobantes de pago** con flujo de aprobación
- **Asignación de tutores y docentes** a alumnos
- **Generación automática** de historiales académicos semestrales
- **Importación/exportación masiva** de datos en formato CSV
- **Soporte para carreras semiescolarizadas** (horarios de fin de semana)

---

## Arquitectura del Proyecto

El proyecto sigue una arquitectura **cliente-servidor** con tres componentes principales:

```
InscripcionesUAIE/
├── node_backend/          # Servidor API REST (Express + MongoDB)
├── react_frontend/        # Aplicación web (React)
├── react-app-native/      # Aplicación móvil (React Native)
└── exports/               # Archivos exportados (CSV, PDF)
```

### Diagrama de Arquitectura

```
┌─────────────────┐     HTTP/REST      ┌─────────────────┐
│  React Frontend │◄──────────────────►│  Node Backend   │
│   (Puerto 3000) │                    │   (Puerto 5001) │
└─────────────────┘                    └────────┬────────┘
                                                │
                                                │ Mongoose
                                                ▼
                                       ┌─────────────────┐
                                       │  MongoDB Atlas  │
                                       └─────────────────┘
```

---

## Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 14+ | Runtime de JavaScript |
| Express.js | 4.21.1 | Framework web |
| MongoDB | - | Base de datos NoSQL |
| Mongoose | 8.8.2 | ODM para MongoDB |
| JWT | 9.0.2 | Autenticación |
| bcrypt/bcryptjs | - | Hash de contraseñas |
| multer | - | Carga de archivos |
| exceljs | - | Generación de Excel |
| pdfkit | - | Generación de PDF |
| nodemailer | - | Envío de correos |
| node-cron | - | Tareas programadas |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3.1 | Biblioteca UI |
| React Router DOM | 7.0.1 | Enrutamiento |
| Axios | 1.7.9 | Cliente HTTP |
| React Toastify | 11.0.3 | Notificaciones |

---

## Requisitos Previos

- **Node.js** versión 14 o superior
- **npm** o **yarn**
- Cuenta de **MongoDB Atlas** (o MongoDB local)
- Editor de código (recomendado: VS Code)

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/InscripcionesUAIE.git
cd InscripcionesUAIE
```

### 2. Instalar dependencias del Backend

```bash
cd node_backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../react_frontend
npm install
```

---

## Configuración

### Variables de Entorno - Backend

Crear archivo `.env` en la carpeta `node_backend/`:

```env
MONGO_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/nombre_bd
JWT_SECRET=tu_clave_secreta_segura
EMAIL_USER=correo@ejemplo.com
EMAIL_PASS=contraseña_correo
```

### Variables de Entorno - Frontend

Crear archivo `.env` en la carpeta `react_frontend/`:

```env
REACT_APP_API_URL=http://localhost:5001
```

---

## Ejecución

### Desarrollo

**Terminal 1 - Backend:**
```bash
cd node_backend
npm run dev    # Con recarga automática (nodemon)
```

**Terminal 2 - Frontend:**
```bash
cd react_frontend
npm start
```

### Producción

**Backend:**
```bash
cd node_backend
npm start
```

**Frontend:**
```bash
cd react_frontend
npm run build
```

### URLs de Acceso

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5001 |

---

## Estructura del Proyecto

### Backend (`node_backend/`)

```
node_backend/
├── server.js                 # Punto de entrada del servidor
├── middlewares/
│   └── authMiddleware.js     # Verificación de JWT
├── models/                   # Esquemas de MongoDB
│   ├── Alumno.js
│   ├── Materia.js
│   ├── Personal.js
│   ├── Horario.js
│   ├── Coordinadores.js
│   ├── Docentes.js
│   ├── Tutores.js
│   ├── Administradores.js
│   └── HistorialAcademico.js
├── routes/                   # Definición de rutas API
│   ├── authRoutes.js
│   ├── alumnoRoutes.js
│   ├── materiasRoutes.js
│   ├── personalRoutes.js
│   └── ...
├── controllers/              # Lógica de negocio
│   ├── alumnoController.js
│   ├── materiaController.js
│   └── PersonalController.js
├── utils/                    # Utilidades
│   ├── email.js
│   ├── pdfHorario.js
│   └── exportarAlumnos.js
├── uploads/                  # Archivos subidos
│   └── comprobantes/         # PDFs de comprobantes
└── exports/                  # Archivos exportados
    └── {semestre}/           # Backups por semestre
```

### Frontend (`react_frontend/`)

```
react_frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.js                # Definición de rutas
│   ├── index.js              # Punto de entrada
│   ├── components/           # Componentes React
│   │   ├── Registro.js                    # Login
│   │   ├── HorarioSeleccion.js            # Selección de horario
│   │   ├── Validacion1.js                 # Validación comprobante
│   │   ├── Validacion2.js                 # Validación estatus
│   │   │
│   │   ├── InicioTutor.js                 # Dashboard tutor
│   │   ├── RevisionHorarioTutor.js        # Revisión de horarios
│   │   ├── RevisionComprobantePago.js     # Validación de pagos
│   │   │
│   │   ├── InicioDocente.js               # Dashboard docente
│   │   ├── DocenteAlumnos.js              # Lista de alumnos
│   │   │
│   │   ├── InicioCoordinador.js           # Dashboard coordinador
│   │   ├── AlumnoListCoord.js             # Gestión de alumnos
│   │   ├── AdministrarMateriasCG.js       # Gestión de materias
│   │   ├── AdministrarPersonalCoordinador.js
│   │   │
│   │   ├── InicioAdministrador.js         # Dashboard admin
│   │   ├── InicioCoordinadorGeneral.js    # Dashboard coord. general
│   │   ├── InicioAdministradorGeneral.js  # Dashboard admin. general
│   │   │
│   │   ├── HistorialAcademico.js          # Ver historiales
│   │   ├── PrivateRoute.js                # Protección de rutas
│   │   └── Encabezado.js, Pie_pagina.js
│   │
│   └── utils/
│       └── axiosConfig.js    # Configuración de Axios con JWT
└── package.json
```

---

## Roles de Usuario

El sistema maneja múltiples roles con diferentes permisos:

| Rol | Código | Permisos |
|-----|--------|----------|
| **Alumno** | - | Seleccionar horario, subir comprobante de pago |
| **Docente** | D | Ver alumnos inscritos en sus materias |
| **Tutor** | T | Revisar horarios, validar comprobantes de pago |
| **Coordinador** | C | Gestionar alumnos, materias y personal de su carrera |
| **Administrador** | A | Gestionar alumnos, materias y personal de su carrera |
| **Coordinador General** | CG | Acceso a todas las carreras |
| **Administrador General** | AG | Acceso a todas las carreras |

---

## Funcionalidades Principales

### Para Alumnos
- Inicio de sesión con matrícula
- Selección de materias con validación de traslapes en tiempo real
- Control automático de horas máximas permitidas
- Subida de comprobante de pago (PDF)
- Visualización del estatus de su inscripción

### Para Tutores/Docentes
- Revisión de horarios de alumnos asignados
- Aprobación/rechazo de horarios con comentarios
- Validación de comprobantes de pago
- Envío de notificaciones por correo electrónico

### Para Coordinadores/Administradores
- CRUD completo de alumnos, materias y personal
- Importación masiva desde archivos CSV
- Exportación de datos a CSV
- Configuración de horas máximas por carrera
- Habilitación/deshabilitación del módulo de comprobantes
- Asignación de docentes a materias

### Para Coordinadores/Administradores Generales
- Acceso a todas las carreras
- Generación de historiales académicos
- Descarga de backups semestrales
- Gestión centralizada del sistema

### Automatización
- Limpieza automática de datos al fin de semestre (1 de junio y 1 de diciembre)
- Generación automática de backups en CSV
- Creación de historiales académicos

---

## API Endpoints

### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/alumno/login` | Iniciar sesión como alumno |
| POST | `/personal/login` | Iniciar sesión como personal |

### Alumnos (`/api/alumnos`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Obtener todos los alumnos |
| POST | `/` | Crear nuevo alumno |
| GET | `/:id` | Obtener alumno por ID |
| PUT | `/:id` | Actualizar alumno |
| DELETE | `/:id` | Eliminar alumno |
| GET | `/carrera/:matricula` | Obtener alumnos de una carrera |
| POST | `/subir-csv` | Importar alumnos desde CSV |
| GET | `/exportar-csv` | Exportar alumnos a CSV |
| POST | `/subir-comprobante/:matricula` | Subir comprobante de pago |
| PUT | `/validar-comprobante/:matricula` | Validar comprobante |

### Materias (`/api/materias`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Obtener todas las materias |
| POST | `/` | Crear nueva materia |
| GET | `/:id` | Obtener materia por ID |
| GET | `/carrera/:id_carrera` | Obtener materias por carrera |
| PUT | `/:id` | Actualizar materia |
| DELETE | `/:id` | Eliminar materia |
| POST | `/subir-csv` | Importar materias desde CSV |
| GET | `/exportar-csv` | Exportar materias a CSV |

### Personal (`/api/personal`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Obtener todo el personal |
| POST | `/` | Crear nuevo personal |
| GET | `/:id` | Obtener personal por ID |
| PUT | `/:id` | Actualizar personal |
| DELETE | `/:id` | Eliminar personal |
| POST | `/subir-csv` | Importar personal desde CSV |
| GET | `/exportar-csv` | Exportar personal a CSV |
| GET | `/password/:matricula` | Recuperar contraseña por email |

### Coordinadores (`/api/coordinadores`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/horas/:id_carrera` | Obtener horas máximas |
| PUT | `/horas/:matricula` | Actualizar horas máximas |
| GET | `/comprobante-habilitado/:id_carrera` | Estado del comprobante |
| PUT | `/comprobante-habilitado/:id_carrera` | Habilitar/deshabilitar comprobante |

### Tutores (`/api/tutores`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/:matricula` | Obtener alumnos del tutor |
| GET | `/horario/:matricula` | Obtener horario del alumno |
| PUT | `/estatus/actualizar/:matricula` | Actualizar estatus de horario |
| POST | `/enviarCorreo` | Enviar comentario por email |

### Historial (`/api/historial`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Obtener historiales |
| POST | `/` | Crear historial |
| GET | `/:id` | Obtener historial por ID |
| DELETE | `/:id` | Eliminar historial |

---

## Modelos de Datos

### Alumno
```javascript
{
  id_carrera: String,           // Identificador de carrera
  matricula: String,            // Matrícula única (ej: A1234)
  nombre: String,               // Nombre completo
  telefono: String,
  correo: String,
  horario: ObjectId,            // Referencia al horario seleccionado
  tutor: String,                // Matrícula del tutor asignado
  estatusComprobante: String    // "Pendiente", "Aceptado", "Rechazado"
}
```

### Materia
```javascript
{
  id_materia: Number,
  id_carrera: String,
  nombre: String,
  horarios: {
    lunes: String,              // Formato: "08:00-10:00"
    martes: String,
    miercoles: String,
    jueves: String,
    viernes: String,
    sabado: String
  },
  semi: String,                 // Tipo de semana (semiescolarizadas)
  alumnos: [ObjectId],          // Alumnos inscritos
  salon: String,
  grupo: String,
  cupo: Number,
  laboratorio: Boolean,
  docente: ObjectId             // Docente asignado
}
```

### Personal
```javascript
{
  matricula: String,            // Matrícula única
  nombre: String,
  password: String,             // Hash bcrypt
  roles: [String],              // ['D', 'T', 'C', 'A', 'CG', 'AG']
  correo: String,
  telefono: String,
  activo: Boolean
}
```

### Horario
```javascript
{
  materias: [ObjectId],         // Materias seleccionadas
  estatus: Number,              // 0: Pendiente, 1: Aprobado, 2: Rechazado
  comentario: String            // Comentarios del tutor
}
```

---

## Flujos del Sistema

### Flujo de Inscripción de Alumno

```
1. Login con matrícula
        ↓
2. Selección de materias
   (validación de traslapes y horas)
        ↓
3. Confirmación de horario
        ↓
4. Subida de comprobante de pago
        ↓
5. Espera de validación del tutor
        ↓
6. Inscripción completada
```

### Flujo de Validación (Tutor)

```
1. Login como tutor
        ↓
2. Ver lista de alumnos asignados
        ↓
3. Revisar horario del alumno
        ↓
4. Aprobar/Rechazar con comentarios
        ↓
5. Validar comprobante de pago
        ↓
6. Notificar al alumno por email
```

### Flujo de Limpieza Semestral

```
1. Sistema detecta fecha de cierre
   (1 de junio o 1 de diciembre)
        ↓
2. Genera backup CSV de:
   - Alumnos
   - Materias
   - Personal
        ↓
3. Crea registro en HistorialAcademico
        ↓
4. Vacía colecciones principales
        ↓
5. Archivos disponibles en /exports/{semestre}/
```

---

## Scripts Disponibles

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia servidor de desarrollo en puerto 3000 |
| `npm test` | Ejecuta pruebas unitarias |
| `npm run build` | Genera build de producción |

### Backend

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia servidor en puerto 5001 |
| `npm run dev` | Inicia con nodemon (recarga automática) |

---

## Consideraciones de Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt
- Autenticación mediante JWT con expiración configurable
- Rutas protegidas con middleware de autenticación
- Validación de roles para acceso a funcionalidades
- Sanitización de datos de entrada

---

## Soporte para Carreras

El sistema soporta diferentes configuraciones por carrera:

- **Carreras escolarizadas**: Horarios de lunes a viernes
- **Carreras semiescolarizadas**: Horarios de fin de semana con configuración especial de semanas (A/B)

---

## Contacto y Contribuciones

Para reportar errores o sugerir mejoras, crear un issue en el repositorio de GitHub.

---

## Licencia

Este proyecto fue desarrollado para la Unidad Académica de Ingeniería Eléctrica (UAIE).
