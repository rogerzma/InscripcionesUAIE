# Guia de Instalacion

## Requisitos Previos

### Software Requerido

| Software | Version Minima | Verificar |
|----------|---------------|-----------|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| MongoDB | 6.x | `mongod --version` |
| Git | 2.x | `git --version` |

### Requisitos del Sistema

- **RAM**: Minimo 4GB, recomendado 8GB
- **Espacio**: 500MB para dependencias
- **SO**: Windows 10+, macOS 10.15+, Ubuntu 20.04+

---

## Instalacion Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/[usuario]/Proyecto_Ing_Electrica.git
cd Proyecto_Ing_Electrica/InscripcionesUAIE
```

### 2. Configurar Backend

```bash
# Navegar al backend
cd node_backend

# Instalar dependencias
npm install

# Crear archivo de configuracion
cp .env.example .env
```

Editar `.env` con tus valores:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inscripciones_uaie
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura_aqui
```

### 3. Configurar Frontend

```bash
# Navegar al frontend (desde raiz del proyecto)
cd react_frontend

# Instalar dependencias
npm install

# Crear archivo de configuracion
cp .env.example .env
```

Editar `.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Configurar MongoDB

**Opcion A: MongoDB Local**

```bash
# Iniciar servicio (Windows)
net start MongoDB

# Iniciar servicio (macOS/Linux)
sudo systemctl start mongod
```

**Opcion B: MongoDB Atlas (Nube)**

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear cluster gratuito
3. Obtener connection string
4. Actualizar `MONGODB_URI` en `.env`

### 5. Iniciar la Aplicacion

**Terminal 1 - Backend:**

```bash
cd node_backend
npm run dev
```

Deberas ver:
```
Servidor corriendo en puerto 5000
Conectado a MongoDB
```

**Terminal 2 - Frontend:**

```bash
cd react_frontend
npm start
```

Se abrira automaticamente en `http://localhost:3000`

---

## Verificar Instalacion

### Probar Backend

```bash
curl http://localhost:5000/api/health
```

Respuesta esperada:
```json
{ "status": "ok" }
```

### Probar Frontend

1. Abrir `http://localhost:3000`
2. Deberia cargar la pagina de login
3. Verificar en consola del navegador que no hay errores

---

## Solucion de Problemas

### Error: ECONNREFUSED (MongoDB)

**Problema**: No se puede conectar a MongoDB

**Solucion**:
```bash
# Verificar que MongoDB esta corriendo
sudo systemctl status mongod

# Iniciar si no esta corriendo
sudo systemctl start mongod
```

### Error: Port 5000 already in use

**Problema**: El puerto ya esta ocupado

**Solucion**:
```bash
# Encontrar proceso usando el puerto
# Windows
netstat -ano | findstr :5000

# Linux/macOS
lsof -i :5000

# Matar proceso o cambiar puerto en .env
```

### Error: Module not found

**Problema**: Faltan dependencias

**Solucion**:
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: Invalid Token

**Problema**: JWT_SECRET no configurado

**Solucion**:
1. Verificar que `.env` existe
2. Verificar que `JWT_SECRET` tiene un valor
3. Reiniciar el servidor

---

## Datos de Prueba

### Crear Usuario Admin (opcional)

```bash
cd node_backend
node scripts/createAdmin.js
```

### Importar Datos de Ejemplo

```bash
cd node_backend
node scripts/seedDatabase.js
```

---

## Estructura Final

Despues de la instalacion, deberas tener:

```
InscripcionesUAIE/
├── node_backend/
│   ├── node_modules/
│   ├── .env              # Configurado
│   └── package.json
├── react_frontend/
│   ├── node_modules/
│   ├── .env              # Configurado
│   └── package.json
└── docs/
```

---

## Siguiente Paso

Ver [Variables de Entorno](./variables-entorno.md) para configuracion avanzada.
