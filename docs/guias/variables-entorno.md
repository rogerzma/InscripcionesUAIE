# Variables de Entorno

## Vision General

Documentacion completa de las variables de entorno utilizadas en InscripcionesUAIE para configurar backend y frontend.

---

## Backend (.env)

### Ubicacion

`node_backend/.env`

### Variables Requeridas

```env
# Puerto del servidor
PORT=5000

# Conexion a MongoDB
MONGODB_URI=mongodb://localhost:27017/inscripciones_uaie

# Secreto para JWT
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura_aqui
```

### Descripcion Detallada

#### PORT

**Tipo**: Number

**Default**: 5000

**Descripcion**: Puerto en el que escucha el servidor Express.

**Ejemplos**:
```env
PORT=5000          # Desarrollo
PORT=8080          # Alternativo
PORT=3001          # Si 5000 esta ocupado
```

#### MONGODB_URI

**Tipo**: String (MongoDB Connection String)

**Descripcion**: Cadena de conexion a la base de datos MongoDB.

**Formato Local**:
```env
MONGODB_URI=mongodb://localhost:27017/inscripciones_uaie
```

**Formato MongoDB Atlas**:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/inscripciones_uaie?retryWrites=true&w=majority
```

**Parametros Comunes**:
- `retryWrites=true` - Reintentar escrituras automaticamente
- `w=majority` - Nivel de escritura garantizada
- `authSource=admin` - Base de datos de autenticacion

#### JWT_SECRET

**Tipo**: String

**Descripcion**: Clave secreta para firmar y verificar tokens JWT.

**Requisitos**:
- Minimo 32 caracteres
- Usar caracteres aleatorios
- No compartir publicamente
- Diferente en cada entorno

**Generar Secret Seguro**:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

**Ejemplo**:
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Variables Opcionales

```env
# Entorno de ejecucion
NODE_ENV=development

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:3000

# Nivel de logging
LOG_LEVEL=info

# Tiempo de expiracion de tokens
JWT_ALUMNO_EXPIRES=1h
JWT_PERSONAL_EXPIRES=24h

# Configuracion de email (si se implementa)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
```

---

## Frontend (.env)

### Ubicacion

`react_frontend/.env`

### Variables Requeridas

```env
# URL de la API backend
REACT_APP_API_URL=http://localhost:5000
```

### Descripcion Detallada

#### REACT_APP_API_URL

**Tipo**: String (URL)

**Descripcion**: URL base del servidor backend API.

**Importante**: Debe empezar con `REACT_APP_` para ser accesible en React.

**Ejemplos**:
```env
# Desarrollo local
REACT_APP_API_URL=http://localhost:5000

# Produccion
REACT_APP_API_URL=https://api.inscripciones.ipn.mx

# Red local
REACT_APP_API_URL=http://192.168.1.100:5000
```

### Variables Opcionales

```env
# Modo de debugging
REACT_APP_DEBUG=true

# Version de la app
REACT_APP_VERSION=1.0.0

# Feature flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_MAINTENANCE_MODE=false
```

---

## Archivos de Ejemplo

### Backend (.env.example)

Crear archivo con valores de ejemplo (commitear este):

```env
# .env.example
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inscripciones_uaie
JWT_SECRET=cambiame_por_un_secret_seguro
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.example)

```env
# .env.example
REACT_APP_API_URL=http://localhost:5000
REACT_APP_DEBUG=false
```

---

## Por Entorno

### Desarrollo

**Backend (.env.development)**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inscripciones_uaie_dev
JWT_SECRET=development_secret_key_change_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug
```

**Frontend (.env.development)**:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_DEBUG=true
```

### Testing

**Backend (.env.test)**:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/inscripciones_uaie_test
JWT_SECRET=test_secret_key
NODE_ENV=test
LOG_LEVEL=error
```

**Frontend (.env.test)**:
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_DEBUG=false
```

### Produccion

**Backend (.env.production)**:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/inscripciones_uaie
JWT_SECRET=CAMBIAR_POR_SECRET_MUY_SEGURO_Y_ALEATORIO_64_CARACTERES_MINIMO
NODE_ENV=production
FRONTEND_URL=https://inscripciones.ipn.mx
LOG_LEVEL=warn
```

**Frontend (.env.production)**:
```env
REACT_APP_API_URL=https://api.inscripciones.ipn.mx
REACT_APP_DEBUG=false
```

---

## Cargar Variables

### Backend (Node.js)

Usar `dotenv` para cargar variables:

```javascript
// server.js
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Validar variables criticas
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no configurado');
  process.exit(1);
}
```

### Frontend (React)

Variables automaticamente disponibles con `REACT_APP_` prefijo:

```javascript
// Acceder a variables
const API_URL = process.env.REACT_APP_API_URL;
const DEBUG = process.env.REACT_APP_DEBUG === 'true';

// Verificar en tiempo de build
if (!process.env.REACT_APP_API_URL) {
  throw new Error('REACT_APP_API_URL no configurado');
}
```

---

## Seguridad

### Buenas Practicas

1. **Nunca commitear archivos .env**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Usar .env.example como plantilla**
   ```bash
   cp .env.example .env
   # Editar .env con valores reales
   ```

3. **Rotar secretos regularmente**
   - Cambiar JWT_SECRET periodicamente
   - Actualizar passwords de BD

4. **Diferentes secrets por entorno**
   - Desarrollo != Produccion
   - Test != Produccion

5. **No exponer en logs**
   ```javascript
   // ❌ Incorrecto
   console.log('JWT_SECRET:', process.env.JWT_SECRET);
   
   // ✅ Correcto
   console.log('JWT_SECRET configurado:', !!process.env.JWT_SECRET);
   ```

### Variables Sensibles

| Variable | Sensible | Commitear | Notas |
|----------|----------|-----------|-------|
| PORT | No | Si (en .example) | Informacion publica |
| MONGODB_URI | Si | No | Contiene credenciales |
| JWT_SECRET | Si | No | Critico para seguridad |
| EMAIL_PASSWORD | Si | No | Credenciales de terceros |
| API_KEYS | Si | No | Claves de servicios externos |

---

## Validacion de Variables

### Backend

```javascript
// utils/validateEnv.js
function validateEnv() {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  
  for (const variable of required) {
    if (!process.env[variable]) {
      throw new Error(`Variable de entorno ${variable} no configurada`);
    }
  }
  
  // Validar formato
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }
  
  console.log('✓ Variables de entorno validadas');
}

module.exports = validateEnv;
```

Usar en `server.js`:
```javascript
require('dotenv').config();
const validateEnv = require('./utils/validateEnv');

validateEnv();
// ... resto del codigo
```

---

## Herramientas

### dotenv

```bash
npm install dotenv
```

```javascript
require('dotenv').config();
```

### dotenv-expand

Para variables que referencian otras:

```bash
npm install dotenv-expand
```

```env
BASE_URL=http://localhost
PORT=5000
API_URL=${BASE_URL}:${PORT}
```

### cross-env

Para establecer variables en scripts npm:

```bash
npm install --save-dev cross-env
```

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon server.js",
    "prod": "cross-env NODE_ENV=production node server.js"
  }
}
```

---

## Troubleshooting

### Variables no se cargan

1. **Verificar nombre del archivo**: Debe ser `.env` (con punto al inicio)
2. **Verificar ubicacion**: Debe estar en la raiz del proyecto
3. **Verificar dotenv**: `require('dotenv').config()` al inicio de server.js
4. **Reiniciar servidor**: Cambios en .env requieren reinicio

### Variables de React no disponibles

1. **Verificar prefijo**: Debe empezar con `REACT_APP_`
2. **Reiniciar servidor**: Cambios requieren reiniciar `npm start`
3. **Rebuild**: En produccion, hacer `npm run build` nuevamente

### MongoDB no conecta

1. **Verificar MongoDB corriendo**: `systemctl status mongod`
2. **Verificar URI**: Formato correcto de connection string
3. **Verificar red**: Firewall o restricciones de IP

---

## Documentos Relacionados

- [Guia de Instalacion](./instalacion.md)
- [Guia de Despliegue](./despliegue.md)
- [Configuracion Backend](../backend/configuracion.md)
- [Configuracion Frontend](../frontend/configuracion.md)
