# Roles y Permisos

## Tipos de Usuario

El sistema maneja dos tipos principales de usuarios:

### 1. Alumnos
- Acceso mediante matricula (sin password)
- Token JWT con expiracion de **1 hora**
- Funcionalidades: consultar horario, inscribir materias, ver calificaciones

### 2. Personal
- Acceso mediante matricula + password
- Token JWT con expiracion de **24 horas**
- Multiples roles posibles (pueden tener mas de uno)

---

## Roles del Personal

| Codigo | Rol | Descripcion |
|--------|-----|-------------|
| `D` | Docente | Profesor que imparte materias |
| `T` | Tutor | Supervisa grupo de alumnos |
| `C` | Coordinador | Administra una carrera especifica |
| `A` | Administrador | Vista lectura de una carrera |
| `CG` | Coordinador General | Control total del sistema |
| `AG` | Administrador General | Vista lectura de todo el sistema |

---

## Matriz de Permisos

### Alumnos

| Accion | Permitido |
|--------|-----------|
| Ver horario propio | Si |
| Inscribir materias | Si |
| Ver materias disponibles | Si |
| Modificar datos personales | No |

### Docentes (D)

| Accion | Permitido |
|--------|-----------|
| Ver materias asignadas | Si |
| Ver lista de alumnos | Si |
| Modificar calificaciones | Si |
| Crear materias | No |

### Tutores (T)

| Accion | Permitido |
|--------|-----------|
| Ver alumnos tutorados | Si |
| Ver avance academico | Si |
| Validar horarios | Si |
| Modificar inscripciones | No |

### Coordinadores (C)

| Accion | Permitido |
|--------|-----------|
| CRUD Alumnos (su carrera) | Si |
| CRUD Personal (su carrera) | Si |
| CRUD Materias (su carrera) | Si |
| Asignar docentes | Si |
| Ver reportes | Si |
| Modificar otras carreras | No |

### Administradores (A)

| Accion | Permitido |
|--------|-----------|
| Ver alumnos (su carrera) | Si |
| Ver personal (su carrera) | Si |
| Ver materias (su carrera) | Si |
| Descargar reportes CSV | Si |
| Crear/Modificar/Eliminar | No |

### Coordinador General (CG)

| Accion | Permitido |
|--------|-----------|
| CRUD Alumnos (todas) | Si |
| CRUD Personal (todas) | Si |
| CRUD Materias (todas) | Si |
| Gestionar coordinadores | Si |
| Configurar sistema | Si |
| Acceso total | Si |

### Administrador General (AG)

| Accion | Permitido |
|--------|-----------|
| Ver alumnos (todas) | Si |
| Ver personal (todas) | Si |
| Ver materias (todas) | Si |
| Descargar reportes CSV | Si |
| Crear/Modificar/Eliminar | No |

---

## Carreras Disponibles

### Escolarizadas
- `IE` - Ingenieria Electrica
- `ICE` - Ingenieria en Control y Automatizacion
- `ISISA` - Ingenieria en Sistemas Automotrices

### Semiescolarizadas
- `IES` - Ingenieria Electrica Semiescolarizada
- `ICES` - Ingenieria en Control Semiescolarizada

---

## Almacenamiento de Sesion

Los datos de sesion se almacenan en `localStorage`:

```javascript
localStorage.getItem("token")      // JWT token
localStorage.getItem("matricula")  // Matricula del usuario
localStorage.getItem("nombre")     // Nombre completo
localStorage.getItem("roles")      // Array de roles (Personal)
localStorage.getItem("id_carrera") // Carrera asociada
```

---

## Rutas por Rol

### Alumno
- `/alumno/horario` - Ver horario
- `/alumno/inscripcion` - Inscribir materias

### Docente
- `/docente/materias` - Materias asignadas
- `/docente/materias/:id/lista-alumnos` - Lista de alumnos

### Tutor
- `/tutor/alumnos` - Alumnos tutorados
- `/tutor/validar-horarios` - Validar horarios

### Coordinador
- `/coordinador/alumnos` - Gestionar alumnos
- `/coordinador/personal` - Gestionar personal
- `/coordinador/materias` - Gestionar materias

### Administrador
- `/admin/alumnos` - Ver alumnos
- `/admin/personal` - Ver personal
- `/admin/materias` - Ver materias

### Coordinador General
- `/coord-gen/alumnos` - Alumnos (todas las carreras)
- `/coord-gen/personal` - Personal (todas)
- `/coord-gen/materias` - Materias (todas)

### Administrador General
- `/admin-gen/alumnos` - Ver alumnos (todas)
- `/admin-gen/personal` - Ver personal (todas)
- `/admin-gen/materias` - Ver materias (todas)
