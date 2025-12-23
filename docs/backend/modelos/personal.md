# Modelo: Personal

## Descripcion

Representa al personal academico y administrativo del sistema. Un miembro del personal puede tener multiples roles simultaneos (docente, tutor, coordinador, etc.).

---

## Coleccion

**Nombre**: `personal`

---

## Esquema

| Campo | Tipo | Requerido | Unico | Default | Descripcion |
|-------|------|-----------|-------|---------|-------------|
| `matricula` | String | Si | Si | - | Numero de matricula del personal |
| `nombre` | String | Si | No | - | Nombre completo |
| `password` | String | Si | No | - | Contraseña hasheada con bcrypt |
| `roles` | Array[String] | Si | No | - | Lista de roles asignados |
| `correo` | String | Si | No | - | Correo electronico |
| `telefono` | String | Si | No | - | Numero telefonico |
| `activo` | Boolean | No | No | true | Estado activo/inactivo |

---

## Validaciones

### roles

Valores permitidos (enum):
- `'D'` - Docente
- `'T'` - Tutor
- `'C'` - Coordinador
- `'A'` - Administrador
- `'CG'` - Coordinador General
- `'AG'` - Administrador General

Un miembro del personal puede tener **multiples roles**:

```javascript
{
  roles: ['D', 'T']  // Docente y Tutor
}
```

---

## Ejemplo de Documento

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "matricula": "P2020001",
  "nombre": "Maria Garcia Lopez",
  "password": "$2b$10$abcdefghijklmnopqrstuvwxyz123456",
  "roles": ["C", "D"],
  "correo": "maria.garcia@ipn.mx",
  "telefono": "5559876543",
  "activo": true
}
```

---

## Uso en Codigo

### Crear Personal

```javascript
const Personal = require('../models/Personal');
const bcrypt = require('bcrypt');

const passwordHash = await bcrypt.hash('contraseña123', 10);

const nuevoPersonal = new Personal({
  matricula: 'P2020001',
  nombre: 'Maria Garcia Lopez',
  password: passwordHash,
  roles: ['C', 'D'],
  correo: 'maria.garcia@ipn.mx',
  telefono: '5559876543'
});

await nuevoPersonal.save();
```

### Buscar por Matricula

```javascript
const personal = await Personal.findOne({ matricula: 'P2020001' });
```

### Verificar Password

```javascript
const personal = await Personal.findOne({ matricula });
const passwordValida = await bcrypt.compare(password, personal.password);

if (!passwordValida) {
  throw new Error('Contraseña incorrecta');
}
```

### Actualizar Roles

```javascript
await Personal.findByIdAndUpdate(personalId, {
  roles: ['C', 'D', 'T']  // Agregar rol de Tutor
}, { new: true });
```

### Desactivar Personal

```javascript
await Personal.findByIdAndUpdate(personalId, {
  activo: false
}, { new: true });
```

---

## Indices

- `matricula`: Indice unico para busquedas rapidas

---

## Consultas Comunes

### Personal Activo

```javascript
const activos = await Personal.find({ activo: true });
```

### Buscar por Rol

```javascript
// Todos los coordinadores
const coordinadores = await Personal.find({ roles: 'C' });

// Todos los docentes
const docentes = await Personal.find({ roles: 'D' });

// Personal con multiples roles
const coordinadoresDocentes = await Personal.find({
  roles: { $all: ['C', 'D'] }
});
```

### Coordinadores Generales

```javascript
const coordGenerales = await Personal.find({ roles: 'CG' });
```

---

## Seguridad

### Password Hashing

- **Nunca** almacenar passwords en texto plano
- Usar bcrypt con salt rounds >= 10
- Hashear password antes de guardar:

```javascript
const bcrypt = require('bcrypt');

// Antes de save o update
if (personal.isModified('password')) {
  personal.password = await bcrypt.hash(personal.password, 10);
}
```

### Autenticacion

El personal requiere:
1. Matricula
2. Password

Ver [Autenticacion JWT](../autenticacion.md#login-personal)

---

## Notas

- La `matricula` es unica en todo el sistema
- El array `roles` permite multiples roles por persona
- El password debe hashearse con bcrypt antes de guardarse
- El campo `activo` permite deshabilitar usuarios sin eliminarlos
- Token JWT expira en 24 horas para personal

---

## Ubicacion del Archivo

`node_backend/models/Personal.js`

---

## Documentos Relacionados

- [Roles y Permisos](../../referencia/roles-permisos.md)
- [Autenticacion JWT](../autenticacion.md)
- [Endpoints Personal](../endpoints/personal.md)
