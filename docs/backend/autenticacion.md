# Autenticacion JWT

## Descripcion General

El sistema utiliza JSON Web Tokens (JWT) para autenticacion. Existen dos flujos de login separados para alumnos y personal.

---

## Flujo de Autenticacion

```
┌─────────┐      ┌─────────┐      ┌─────────┐
│ Cliente │──1──>│  API    │──2──>│ MongoDB │
│         │<──4──│         │<──3──│         │
└─────────┘      └─────────┘      └─────────┘
     │
     5 (Guardar token en localStorage)
```

1. Cliente envia credenciales
2. API busca usuario en BD
3. BD retorna usuario (o null)
4. API genera y retorna JWT
5. Cliente guarda token

---

## Endpoints de Login

### Login Alumno

```http
POST /api/auth/alumno/login
```

**Request Body:**
```json
{
  "matricula": "2020630001"
}
```

**Response (200):**
```json
{
  "mensaje": "Inicio de sesion exitoso",
  "id_carrera": "IE",
  "nombre": "Juan Perez",
  "id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "horario": { ... },
  "validacionCompleta": false
}
```

**Errores:**
| Codigo | Mensaje |
|--------|---------|
| 400 | Alumno no encontrado |
| 500 | Error al iniciar sesion |

---

### Login Personal

```http
POST /api/auth/personal/login
```

**Request Body:**
```json
{
  "matricula": "P2020001",
  "password": "contraseña123"
}
```

**Response (200):**
```json
{
  "mensaje": "Inicio de sesion exitoso",
  "nombre": "Maria Garcia",
  "matricula": "P2020001",
  "roles": ["C", "D"],
  "id_carrera": "IE",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errores:**
| Codigo | Mensaje |
|--------|---------|
| 400 | Matricula y contraseña son obligatorias |
| 401 | Contraseña incorrecta |
| 404 | Usuario no encontrado |
| 500 | Error interno del servidor |

---

## Configuracion JWT

### Generacion del Token

```javascript
const jwt = require('jsonwebtoken');

// Alumno - 1 hora
const token = jwt.sign(
  { id: alumno._id },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Personal - 24 horas
const token = jwt.sign(
  { id: personal._id },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### Estructura del Token (Payload)

```json
{
  "id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "iat": 1688000000,
  "exp": 1688086400
}
```

---

## Middleware de Autenticacion

### Ubicacion
`node_backend/middleware/authMiddleware.js`

### Uso en Rutas

```javascript
const authMiddleware = require('../middleware/authMiddleware');

// Ruta protegida
router.get('/protegido', authMiddleware, (req, res) => {
  // req.user contiene el usuario decodificado
  res.json({ user: req.user });
});
```

### Implementacion

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token invalido o expirado' });
  }
};
```

---

## Manejo en Frontend

### Configuracion Axios

`react_frontend/src/utils/axiosConfig.js`

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// Interceptor para agregar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Guardar Sesion

```javascript
// Despues del login exitoso
const handleLoginSuccess = (response) => {
  const { token, nombre, matricula, roles, id_carrera } = response.data;

  localStorage.setItem('token', token);
  localStorage.setItem('nombre', nombre);
  localStorage.setItem('matricula', matricula);
  localStorage.setItem('roles', JSON.stringify(roles));
  localStorage.setItem('id_carrera', id_carrera);
};
```

### Cerrar Sesion

```javascript
const handleLogout = () => {
  localStorage.clear();
  navigate('/login');
};
```

---

## Seguridad

### Buenas Practicas Implementadas

1. **Password hashing**: bcrypt con salt rounds
2. **Token en header**: `Authorization: Bearer <token>`
3. **Expiracion corta**: 1h alumnos, 24h personal
4. **Secret en env**: JWT_SECRET no en codigo

### Recomendaciones Adicionales

- Implementar refresh tokens
- Agregar rate limiting al login
- Registrar intentos fallidos
- Implementar logout en servidor (blacklist)

---

## Variables de Entorno

```env
JWT_SECRET=tu_secreto_muy_seguro_aqui
```

**Nota**: En produccion usar un secret largo y aleatorio (min 32 caracteres).
