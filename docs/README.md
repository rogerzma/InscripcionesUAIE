# Documentacion - InscripcionesUAIE

Sistema de inscripcion de materias para programas academicos de Ingenieria Electrica del Instituto Politecnico Nacional.

## Indice

### Arquitectura
- [Arquitectura General](./arquitectura/README.md)
- [Estructura de Carpetas](./arquitectura/estructura-carpetas.md)
- [Flujo de Datos](./arquitectura/flujo-datos.md)

### Backend (API)
- [Configuracion del Servidor](./backend/configuracion.md)
- [Autenticacion JWT](./backend/autenticacion.md)
- [Endpoints API](./backend/endpoints/README.md)
  - [Auth](./backend/endpoints/auth.md)
  - [Alumnos](./backend/endpoints/alumnos.md)
  - [Personal](./backend/endpoints/personal.md)
  - [Materias](./backend/endpoints/materias.md)
  - [Horarios](./backend/endpoints/horarios.md)
- [Modelos de Datos](./backend/modelos/README.md)

### Frontend (React)
- [Configuracion](./frontend/configuracion.md)
- [Componentes](./frontend/componentes/README.md)
- [Rutas](./frontend/rutas.md)
- [Utilidades](./frontend/utilidades.md)

### Guias
- [Instalacion y Setup](./guias/instalacion.md)
- [Despliegue](./guias/despliegue.md)
- [Variables de Entorno](./guias/variables-entorno.md)

### Referencia
- [Roles y Permisos](./referencia/roles-permisos.md)
- [Codigos de Error](./referencia/codigos-error.md)
- [Glosario](./referencia/glosario.md)

---

## Quick Start

### Requisitos
- Node.js 18+
- MongoDB 6+
- npm o yarn

### Instalacion

```bash
# Clonar repositorio
git clone [url-repositorio]
cd InscripcionesUAIE

# Backend
cd node_backend
npm install
cp .env.example .env  # Configurar variables
npm run dev

# Frontend (nueva terminal)
cd react_frontend
npm install
npm start
```

### URLs por defecto
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Contacto

Para dudas o contribuciones, contactar al equipo de desarrollo.
