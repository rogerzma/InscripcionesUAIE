# Arquitectura del Sistema

## Vision General

InscripcionesUAIE es una aplicacion web de tres capas que sigue el patron MVC adaptado para una API REST.

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 React.js (SPA)                       │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    │
│  │  │Components│ │  Router  │ │  Axios   │            │    │
│  │  └──────────┘ └──────────┘ └──────────┘            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST (JSON)
                              │ JWT Authentication
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVIDOR                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Express.js (API)                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    │
│  │  │  Routes  │ │Middleware│ │ Controllers│           │    │
│  │  └──────────┘ └──────────┘ └──────────┘            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   MongoDB                            │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    │
│  │  │ Alumnos  │ │ Personal │ │ Materias │            │    │
│  │  └──────────┘ └──────────┘ └──────────┘            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Componentes Principales

### Frontend (React)

**Responsabilidades:**
- Interfaz de usuario
- Navegacion SPA
- Estado local de componentes
- Comunicacion con API

**Tecnologias:**
- React 18+
- React Router DOM
- Axios
- React Toastify

### Backend (Express)

**Responsabilidades:**
- API REST
- Autenticacion JWT
- Validacion de datos
- Logica de negocio

**Tecnologias:**
- Node.js
- Express.js
- JWT
- bcrypt

### Base de Datos (MongoDB)

**Responsabilidades:**
- Persistencia de datos
- Indices para busquedas
- Relaciones entre documentos

**Colecciones:**
- alumnos
- personal
- materias
- horarios
- docentes
- coordinadores
- tutores
- administradores

---

## Flujo de Peticiones

### Peticion Autenticada

```
1. Usuario interactua con UI
           │
           ▼
2. Componente React dispara accion
           │
           ▼
3. Axios agrega token JWT al header
           │
           ▼
4. Request HTTP → Express
           │
           ▼
5. Middleware valida JWT
           │
           ▼
6. Ruta procesa peticion
           │
           ▼
7. Mongoose consulta MongoDB
           │
           ▼
8. Response JSON → React
           │
           ▼
9. Componente actualiza estado/UI
```

---

## Patrones de Diseno

### Frontend

| Patron | Uso |
|--------|-----|
| Container/Presentational | Separacion de logica y UI |
| Custom Hooks | Reutilizacion de logica |
| Controlled Components | Formularios |

### Backend

| Patron | Uso |
|--------|-----|
| MVC (adaptado) | Estructura general |
| Middleware | Autenticacion, validacion |
| Repository | Acceso a datos via Mongoose |

---

## Seguridad

### Capas de Seguridad

```
┌─────────────────────────────────────┐
│           HTTPS (Produccion)        │
├─────────────────────────────────────┤
│         CORS Configuration          │
├─────────────────────────────────────┤
│         JWT Authentication          │
├─────────────────────────────────────┤
│         Input Validation            │
├─────────────────────────────────────┤
│         Password Hashing (bcrypt)   │
└─────────────────────────────────────┘
```

---

## Escalabilidad

### Actual (Monolitico)

- Un servidor Node.js
- Una instancia MongoDB
- Adecuado para ~500 usuarios concurrentes

### Futuro (Si es necesario)

- Load balancer (nginx)
- Multiples instancias Node.js
- MongoDB replica set
- Redis para sesiones/cache

---

## Documentos Relacionados

- [Estructura de Carpetas](./estructura-carpetas.md)
- [Flujo de Datos](./flujo-datos.md)
- [Modelos de Datos](../backend/modelos/README.md)
