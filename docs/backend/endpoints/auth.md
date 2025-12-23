# Endpoints - Autenticacion

## Descripcion

Endpoints para inicio de sesion de alumnos y personal. No requieren autenticacion JWT previa.

---

## Login Alumno

### POST /api/auth/alumno/login

Inicia sesion para un alumno usando solo su matricula (sin password).

**Autenticacion**: No requerida

**Request Body**:
```json
{
  "matricula": "2024630001"
}
```

**Response (200)**:
```json
{
  "mensaje": "Inicio de sesion exitoso",
  "id_carrera": "IE",
  "nombre": "Juan Perez Garcia",
  "id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "horario": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "materias": [...],
    "estatus": 1,
    "comentario": "Aprobado"
  },
  "validacionCompleta": false
}
```

**Errores**:

| Codigo | Mensaje | Causa |
|--------|---------|-------|
| 400 | Alumno no encontrado | La matricula no existe |
| 500 | Error al iniciar sesion | Error interno del servidor |

**Ejemplo cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/alumno/login \
  -H "Content-Type: application/json" \
  -d '{"matricula": "2024630001"}'
```

**Notas**:
- Token JWT expira en **1 hora**
- El campo `horario` es `null` si el alumno no ha inscrito materias
- `validacionCompleta` indica si el horario esta completamente validado

---

## Login Personal

### POST /api/auth/personal/login

Inicia sesion para miembros del personal (docentes, tutores, coordinadores, etc.) usando matricula y password.

**Autenticacion**: No requerida

**Request Body**:
```json
{
  "matricula": "P2020001",
  "password": "contraseña123"
}
```

**Response (200)**:
```json
{
  "mensaje": "Inicio de sesion exitoso",
  "nombre": "Maria Garcia Lopez",
  "matricula": "P2020001",
  "roles": ["C", "D"],
  "id_carrera": "IE",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores**:

| Codigo | Mensaje | Causa |
|--------|---------|-------|
| 400 | Matricula y contraseña son obligatorias | Faltan campos requeridos |
| 401 | Contraseña incorrecta | Password invalido |
| 404 | Usuario no encontrado | La matricula no existe |
| 500 | Error interno del servidor | Error del servidor |

**Ejemplo cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/personal/login \
  -H "Content-Type: application/json" \
  -d '{
    "matricula": "P2020001",
    "password": "contraseña123"
  }'
```

**Notas**:
- Token JWT expira en **24 horas**
- El campo `roles` es un array (puede tener multiples roles)
- El `id_carrera` se obtiene buscando en los modelos especificos (Coordinador, Docente, Tutor, Administrador)
- El password se verifica usando bcrypt

---

## Flujo de Autenticacion

### 1. Login Exitoso

```
Cliente → POST /auth/alumno/login
          ↓
       Valida matricula
          ↓
       Genera JWT
          ↓
Cliente ← { token, datos }
```

### 2. Usar Token

El cliente debe almacenar el token (ej: localStorage) y enviarlo en todas las peticiones posteriores:

```javascript
// Frontend
localStorage.setItem('token', response.data.token);

// Siguiente peticion
axios.get('/api/alumnos', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

### 3. Token Expirado

```
Cliente → GET /api/alumnos
          ↓
       Valida token
          ↓
       Token expirado
          ↓
Cliente ← 401 Unauthorized
          ↓
       Redirige a login
```

---

## Estructura del Token JWT

### Payload Alumno

```json
{
  "id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "iat": 1688000000,
  "exp": 1688003600
}
```

### Payload Personal

```json
{
  "id": "64a1b2c3d4e5f6g7h8i9j0k2",
  "iat": 1688000000,
  "exp": 1688086400
}
```

---

## Seguridad

### Password Hashing

Los passwords del personal se almacenan hasheados con bcrypt:

```javascript
const bcrypt = require('bcrypt');

// Al crear usuario
const passwordHash = await bcrypt.hash('contraseña', 10);

// Al validar login
const esValido = await bcrypt.compare(passwordIngresado, passwordHash);
```

### JWT Secret

Configurado en variables de entorno:

```env
JWT_SECRET=tu_secreto_muy_largo_y_aleatorio_aqui
```

**Importante**: Usar un secret fuerte en produccion (minimo 32 caracteres).

---

## Manejo en Frontend

### Guardar Sesion

```javascript
const handleLoginSuccess = (response) => {
  const { token, nombre, matricula, roles, id_carrera } = response.data;
  
  localStorage.setItem('token', token);
  localStorage.setItem('nombre', nombre);
  localStorage.setItem('matricula', matricula);
  
  if (roles) {
    localStorage.setItem('roles', JSON.stringify(roles));
  }
  
  if (id_carrera) {
    localStorage.setItem('id_carrera', id_carrera);
  }
  
  // Redirigir segun rol
  navigate('/dashboard');
};
```

### Cerrar Sesion

```javascript
const handleLogout = () => {
  localStorage.clear();
  navigate('/login');
};
```

### Interceptor Axios

Ver [axiosConfig](../../frontend/utilidades.md#axiosconfig) para configuracion automatica de headers.

---

## Diferencias Login Alumno vs Personal

| Aspecto | Alumno | Personal |
|---------|--------|----------|
| Campos requeridos | Solo matricula | Matricula + password |
| Validacion | Busqueda en BD | bcrypt compare |
| Expiracion token | 1 hora | 24 horas |
| Respuesta incluye | horario, validacionCompleta | roles, id_carrera |
| Modelo | Alumno | Personal + (Coordinador\|Docente\|Tutor\|Admin) |

---

## Ubicacion del Archivo

`node_backend/routes/authRoutes.js`

---

## Documentos Relacionados

- [Autenticacion JWT](../autenticacion.md)
- [Modelo Alumno](../modelos/alumno.md)
- [Modelo Personal](../modelos/personal.md)
- [Middleware Auth](../autenticacion.md#middleware-de-autenticacion)
- [Roles y Permisos](../../referencia/roles-permisos.md)
