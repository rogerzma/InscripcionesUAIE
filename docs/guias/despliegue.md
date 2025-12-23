# Guia de Despliegue

## Vision General

Guia completa para desplegar InscripcionesUAIE en produccion. Incluye opciones para diferentes plataformas y configuraciones.

---

## Pre-requisitos

### Requisitos Minimos

- Node.js 18+ instalado
- MongoDB 6+ (local o Atlas)
- Dominio configurado (opcional)
- Certificado SSL (recomendado)

### Cuentas Necesarias

- [ ] MongoDB Atlas (si usas cloud)
- [ ] Servicio de hosting (Heroku, DigitalOcean, AWS, etc.)
- [ ] Servicio de frontend (Netlify, Vercel, etc.)

---

## Opcion 1: Despliegue Separado (Recomendado)

### Backend en Servidor

#### 1. Preparar Servidor

**VPS (Ubuntu 20.04+)**:

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MongoDB (opcional si usas local)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Instalar PM2 (process manager)
sudo npm install -g pm2
```

#### 2. Clonar y Configurar

```bash
# Clonar repositorio
cd /var/www
sudo git clone https://github.com/usuario/InscripcionesUAIE.git
cd InscripcionesUAIE/node_backend

# Instalar dependencias
sudo npm ci --only=production

# Configurar variables de entorno
sudo nano .env
```

**.env de Produccion**:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/inscripciones
JWT_SECRET=SECRET_MUY_LARGO_Y_SEGURO_DE_64_CARACTERES_MINIMO
NODE_ENV=production
FRONTEND_URL=https://inscripciones.ipn.mx
```

#### 3. Iniciar con PM2

```bash
# Iniciar aplicacion
pm2 start server.js --name inscripciones-api

# Auto-restart en reboot
pm2 startup
pm2 save

# Ver logs
pm2 logs inscripciones-api

# Monitorear
pm2 monit
```

#### 4. Configurar Nginx como Reverse Proxy

```bash
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/inscripciones-api
```

**Configuracion Nginx**:
```nginx
server {
    listen 80;
    server_name api.inscripciones.ipn.mx;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar configuracion
sudo ln -s /etc/nginx/sites-available/inscripciones-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Configurar SSL con Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d api.inscripciones.ipn.mx

# Auto-renovacion
sudo certbot renew --dry-run
```

### Frontend en Netlify/Vercel

#### Netlify

1. **Build el Proyecto**:
```bash
cd react_frontend
npm run build
```

2. **Configurar `netlify.toml`**:
```toml
[build]
  base = "react_frontend/"
  command = "npm run build"
  publish = "build/"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  REACT_APP_API_URL = "https://api.inscripciones.ipn.mx"
```

3. **Desplegar**:
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

#### Vercel

1. **Crear `vercel.json`**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "react_frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://api.inscripciones.ipn.mx"
  }
}
```

2. **Desplegar**:
```bash
npm install -g vercel

vercel --prod
```

---

## Opcion 2: Despliegue Todo-en-Uno

### Heroku

#### Backend + Frontend en Heroku

1. **Preparar `package.json` raiz**:
```json
{
  "name": "inscripciones-uaie",
  "version": "1.0.0",
  "scripts": {
    "start": "node node_backend/server.js",
    "heroku-postbuild": "cd react_frontend && npm install && npm run build"
  },
  "engines": {
    "node": "18.x"
  }
}
```

2. **Configurar Backend para servir Frontend**:
```javascript
// node_backend/server.js
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../react_frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../react_frontend/build/index.html'));
  });
}
```

3. **Crear `Procfile`**:
```
web: npm start
```

4. **Desplegar**:
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create inscripciones-uaie

# Configurar variables
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="..."
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

---

## Opcion 3: Docker

### Dockerfile Backend

```dockerfile
# node_backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### Dockerfile Frontend

```dockerfile
# react_frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    restart: always
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"

  backend:
    build: ./node_backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/inscripciones?authSource=admin
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./react_frontend
      args:
        REACT_APP_API_URL: http://localhost:5000
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

### Desplegar con Docker

```bash
# Build y run
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Actualizar
git pull
docker-compose up -d --build
```

---

## Base de Datos

### MongoDB Atlas (Cloud)

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear cluster (M0 Free tier disponible)
3. Configurar IP Whitelist (0.0.0.0/0 para acceso desde cualquier IP)
4. Crear usuario de base de datos
5. Obtener connection string:
```
mongodb+srv://usuario:password@cluster.mongodb.net/inscripciones?retryWrites=true&w=majority
```

### MongoDB Local

```bash
# Ubuntu
sudo systemctl start mongod
sudo systemctl enable mongod

# macOS
brew services start mongodb-community

# Crear usuario admin
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "password",
  roles: ["root"]
})

# Connection string
mongodb://admin:password@localhost:27017/inscripciones?authSource=admin
```

---

## Configuracion DNS

### Subdominios

```
Tipo    Nombre              Valor
A       api                 [IP_SERVIDOR]
CNAME   www                 [DOMINIO_NETLIFY]
CNAME   inscripciones       [DOMINIO_NETLIFY]
```

---

## Monitoreo y Logs

### PM2 Monitoring

```bash
# Dashboard web
pm2 web

# Logs en tiempo real
pm2 logs

# Monitoreo de recursos
pm2 monit
```

### Log Rotation

```bash
pm2 install pm2-logrotate

pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
```

---

## Backup

### Backup MongoDB

```bash
# Crear backup
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)

# Restaurar backup
mongorestore --uri="mongodb+srv://..." /backups/20240601

# Automatizar con cron
crontab -e
# Agregar: 0 2 * * * /usr/bin/mongodump --uri="..." --out=/backups/$(date +\%Y\%m\%d)
```

### Backup Codigo

```bash
# Git tags para releases
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Backup archivos uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz node_backend/uploads/
```

---

## Actualizaciones

### Actualizar Backend

```bash
cd /var/www/InscripcionesUAIE/node_backend

# Pull cambios
sudo git pull

# Instalar nuevas dependencias
sudo npm ci --only=production

# Reiniciar
pm2 restart inscripciones-api

# Verificar
pm2 logs inscripciones-api
```

### Actualizar Frontend

```bash
# Netlify/Vercel: automatico con git push

# Manual:
cd react_frontend
npm run build
# Subir carpeta build/
```

---

## Seguridad

### Checklist de Seguridad

- [ ] HTTPS habilitado (SSL)
- [ ] JWT_SECRET fuerte y unico
- [ ] MongoDB con autenticacion
- [ ] Firewall configurado (UFW)
- [ ] Rate limiting activo
- [ ] Headers de seguridad (Helmet)
- [ ] CORS restringido a dominio correcto
- [ ] Passwords de BD rotados periodicamente
- [ ] Backups automaticos configurados
- [ ] Logs monitoreados

### Firewall (UFW)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

---

## Troubleshooting

### Backend no inicia

```bash
# Ver logs
pm2 logs inscripciones-api

# Verificar puerto
sudo netstat -tlnp | grep 5000

# Verificar variables
pm2 env 0
```

### Frontend no conecta con Backend

- Verificar REACT_APP_API_URL correcta
- Verificar CORS en backend incluye dominio frontend
- Verificar firewall permite puerto 5000

### MongoDB no conecta

- Verificar MongoDB corriendo: `sudo systemctl status mongod`
- Verificar connection string correcta
- Verificar IP whitelist en Atlas

---

## Documentos Relacionados

- [Variables de Entorno](./variables-entorno.md)
- [Guia de Instalacion](./instalacion.md)
- [Configuracion Backend](../backend/configuracion.md)
- [Configuracion Frontend](../frontend/configuracion.md)
