# Modelo User

Modelo basico de usuario del sistema.

---

## Archivo

`node_backend/models/User.js`

---

## Schema

```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  matricula: { type: String, required: true, unique: true }
});
```

---

## Campos

| Campo | Tipo | Requerido | Unico | Descripcion |
|-------|------|-----------|-------|-------------|
| `name` | String | Si | No | Nombre del usuario |
| `email` | String | Si | Si | Correo electronico |
| `password` | String | Si | No | Contrasena (encriptada) |
| `matricula` | String | Si | Si | Matricula del usuario |

---

## Coleccion

MongoDB: `users`

---

## Uso

```javascript
const User = require('../models/User');

// Crear usuario
const nuevoUser = new User({
  name: 'Juan Perez',
  email: 'juan@ejemplo.com',
  password: hashedPassword,
  matricula: '2024630001'
});
await nuevoUser.save();
```

---

## Notas

Este modelo es un modelo basico que puede usarse para propositos generales. Para el sistema de reinscripcion, se utilizan principalmente los modelos `Alumno` y `Personal`.
