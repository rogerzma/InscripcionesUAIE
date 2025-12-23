# Glosario de Terminos

## A

**Admin (A)**: Rol de administrador con permisos de solo lectura para una carrera especifica. Puede visualizar alumnos, personal y materias pero no modificar.

**Administrador General (AG)**: Rol con permisos de solo lectura para todas las carreras del sistema.

**Alumno**: Estudiante inscrito en el sistema. Puede inscribir materias, consultar su horario y ver su historial academico.

**API**: Application Programming Interface. Interfaz que permite la comunicacion entre el frontend y el backend.

**Axios**: Biblioteca JavaScript para realizar peticiones HTTP. Utilizada en el frontend para comunicarse con la API.

---

## B

**Backend**: Servidor que maneja la logica de negocio, autenticacion y acceso a la base de datos. Implementado con Node.js y Express.

**bcrypt**: Algoritmo de hashing utilizado para encriptar passwords del personal.

---

## C

**Carrera**: Programa academico (IE, ICE, IES, ICES, ISISA). Define el conjunto de materias disponibles para un alumno.

**Coordinador (C)**: Rol con permisos completos (CRUD) sobre alumnos, personal y materias de una carrera especifica.

**Coordinador General (CG)**: Rol con permisos completos (CRUD) sobre todas las carreras del sistema.

**CORS**: Cross-Origin Resource Sharing. Mecanismo que permite peticiones entre dominios diferentes (frontend y backend).

**CRUD**: Create, Read, Update, Delete. Las cuatro operaciones basicas sobre datos.

**CSV**: Comma-Separated Values. Formato de archivo para importar/exportar datos masivamente.

**Cupo**: Numero maximo de alumnos que pueden inscribirse en una materia.

---

## D

**Debounce**: Tecnica para retrasar la ejecucion de una funcion hasta que pase un tiempo sin nuevas invocaciones. Usado en busquedas.

**Docente (D)**: Rol de profesor que imparte materias. Puede ver sus materias asignadas y listas de alumnos.

---

## E

**Endpoint**: URL especifica de la API que realiza una operacion (ej: `/api/alumnos`).

**Escolarizada**: Modalidad de carrera con clases de lunes a viernes.

**Estatus**: Estado de validacion de un horario (0: Pendiente, 1: Aprobado, 2: Rechazado).

**Express**: Framework de Node.js para crear servidores y APIs REST.

---

## F

**Frontend**: Aplicacion web con interfaz de usuario. Implementada con React.

---

## H

**Horario**: Conjunto de materias inscritas por un alumno en un semestre. Requiere validacion del tutor.

**HTTP**: HyperText Transfer Protocol. Protocolo de comunicacion entre frontend y backend.

---

## I

**ICE**: Ingenieria en Control y Automatizacion (Escolarizada).

**ICES**: Ingenieria en Control y Automatizacion (Semiescolarizada).

**IE**: Ingenieria Electrica (Escolarizada).

**IES**: Ingenieria Electrica (Semiescolarizada).

**Interceptor**: Funcion que se ejecuta antes/despues de cada peticion HTTP para modificar headers o manejar errores.

**ISISA**: Ingenieria en Sistemas Automotrices (Escolarizada).

---

## J

**JWT**: JSON Web Token. Estandar para crear tokens de autenticacion. Usado para validar sesiones de usuarios.

---

## L

**localStorage**: Almacenamiento del navegador que persiste datos entre sesiones. Usado para guardar token y datos de usuario.

---

## M

**Materia**: Asignatura o curso que se imparte en una carrera. Tiene horarios, docente asignado y cupo.

**Matricula**: Identificador unico de alumno o personal en el sistema.

**Middleware**: Funcion que se ejecuta entre la peticion y la respuesta en Express. Usado para autenticacion, logging, etc.

**MongoDB**: Base de datos NoSQL orientada a documentos. Almacena los datos del sistema.

**Mongoose**: ODM (Object Document Mapper) para MongoDB. Facilita la interaccion con la base de datos desde Node.js.

---

## N

**Node.js**: Entorno de ejecucion de JavaScript en el servidor. Base del backend.

---

## O

**ODM**: Object Document Mapper. Biblioteca que mapea objetos JavaScript a documentos MongoDB (Mongoose).

**ORM**: Object Relational Mapper. Similar a ODM pero para bases de datos relacionales.

---

## P

**Paginacion**: Tecnica para dividir grandes conjuntos de datos en paginas mas pequeñas.

**Password**: Contraseña. Solo requerida para personal, no para alumnos.

**Personal**: Miembro del staff (docentes, tutores, coordinadores, administradores). Requiere matricula y password para login.

**Props**: Propiedades que se pasan a un componente React.

---

## R

**React**: Biblioteca de JavaScript para construir interfaces de usuario.

**React Router**: Biblioteca para manejo de rutas en aplicaciones React.

**REST**: Representational State Transfer. Estilo arquitectonico para APIs basadas en HTTP.

**Rol**: Funcion o conjunto de permisos de un miembro del personal (D, T, C, A, CG, AG).

---

## S

**Salt Rounds**: Numero de iteraciones del algoritmo bcrypt. Mayor numero = mas seguro pero mas lento.

**Semestre**: Periodo academico de aproximadamente 6 meses.

**Semiescolarizada**: Modalidad de carrera con clases viernes y sabado.

**sessionStorage**: Almacenamiento del navegador que persiste datos solo durante la sesion actual.

**SPA**: Single Page Application. Aplicacion web que carga una sola pagina HTML y actualiza dinamicamente el contenido.

**Stack**: Conjunto de tecnologias usadas (React, Node.js, Express, MongoDB).

---

## T

**Token**: Cadena codificada (JWT) que identifica a un usuario autenticado. Incluido en cada peticion API.

**Toastify**: Biblioteca React para mostrar notificaciones temporales.

**Tutor (T)**: Rol que supervisa a un grupo de alumnos. Valida horarios y da seguimiento academico.

**Tutorado**: Alumno asignado a un tutor especifico.

---

## U

**UAIE**: Unidad Academica de Ingenieria Electrica. Departamento del IPN.

**useEffect**: Hook de React para ejecutar efectos secundarios (fetch, subscripciones, etc.).

**useState**: Hook de React para manejar estado en componentes funcionales.

---

## V

**Validacion**: Proceso de revision y aprobacion/rechazo de un horario por el tutor.

**Variables de Entorno**: Configuraciones que varian entre entornos (desarrollo, produccion). Almacenadas en archivos `.env`.

---

## Siglas Comunes

| Sigla | Significado |
|-------|-------------|
| API | Application Programming Interface |
| CORS | Cross-Origin Resource Sharing |
| CRUD | Create, Read, Update, Delete |
| CSV | Comma-Separated Values |
| HOC | Higher-Order Component |
| HTTP | HyperText Transfer Protocol |
| JWT | JSON Web Token |
| ODM | Object Document Mapper |
| REST | Representational State Transfer |
| SPA | Single Page Application |
| URL | Uniform Resource Locator |

---

## Codigos de Carrera

| Codigo | Nombre Completo | Tipo |
|--------|----------------|------|
| IE | Ingenieria Electrica | Escolarizada |
| ICE | Ingenieria en Control y Automatizacion | Escolarizada |
| ISISA | Ingenieria en Sistemas Automotrices | Escolarizada |
| IES | Ingenieria Electrica | Semiescolarizada |
| ICES | Ingenieria en Control y Automatizacion | Semiescolarizada |

---

## Codigos de Rol

| Codigo | Nombre | Permisos |
|--------|--------|----------|
| D | Docente | Ver materias y alumnos asignados |
| T | Tutor | Validar horarios de tutorados |
| C | Coordinador | CRUD en su carrera |
| A | Administrador | Solo lectura en su carrera |
| CG | Coordinador General | CRUD en todas las carreras |
| AG | Administrador General | Solo lectura en todas las carreras |

---

## Documentos Relacionados

- [Roles y Permisos](./roles-permisos.md)
- [Codigos de Error](./codigos-error.md)
- [Arquitectura del Sistema](../arquitectura/README.md)
