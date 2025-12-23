# Flujo de Datos

## Vision General

Documentacion del flujo de datos en InscripcionesUAIE, desde la interfaz de usuario hasta la base de datos y viceversa.

---

## Flujo General de Peticiones

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React Component                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  1. Usuario interactua (click, input, submit)        │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                           │                                 │ │
│  │                           ▼                                 │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  2. Handler dispara peticion con Axios              │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Request
                              │ Authorization: Bearer <token>
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                       SERVIDOR EXPRESS                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  3. authMiddleware valida JWT                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  4. Router direcciona a controlador                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  5. Controlador procesa logica de negocio                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose Query
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                         MONGODB                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  6. Query ejecutada en base de datos                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  7. Retorna documentos                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Response Data
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                       SERVIDOR EXPRESS                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  8. Controlador formatea respuesta JSON                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Response
                              │ JSON Data
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                        NAVEGADOR                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  9. Axios recibe respuesta                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  10. Componente actualiza estado con useState              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  11. React re-renderiza UI                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Autenticacion (Login)

### Alumno Login

```
1. Alumno ingresa matricula
        │
        ▼
2. Frontend: POST /api/auth/alumno/login
        │
        ▼
3. Backend: Busca alumno en BD
        │
        ▼
4. Backend: Genera JWT (expira 1h)
        │
        ▼
5. Frontend: Guarda token en localStorage
        │
        ▼
6. Frontend: Redirige a dashboard alumno
```

**Codigo Frontend**:
```javascript
const handleLogin = async (matricula) => {
  try {
    const response = await apiClient.post('/api/auth/alumno/login', { matricula });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('nombre', response.data.nombre);
    navigate('/alumno/horario');
  } catch (error) {
    toast.error('Error al iniciar sesion');
  }
};
```

**Codigo Backend**:
```javascript
router.post('/alumno/login', async (req, res) => {
  const { matricula } = req.body;
  const alumno = await Alumno.findOne({ matricula }).populate('horario');
  
  if (!alumno) {
    return res.status(400).json({ mensaje: 'Alumno no encontrado' });
  }
  
  const token = jwt.sign({ id: alumno._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  res.json({
    mensaje: 'Inicio de sesion exitoso',
    token,
    nombre: alumno.nombre,
    horario: alumno.horario
  });
});
```

---

## Flujo CRUD

### Crear Alumno

```
1. Usuario llena formulario
        │
        ▼
2. Frontend valida datos localmente
        │
        ▼
3. Frontend: POST /api/alumnos
   Headers: { Authorization: Bearer <token> }
   Body: { nombre, matricula, ... }
        │
        ▼
4. Backend: authMiddleware valida token
        │
        ▼
5. Backend: Controlador valida datos
        │
        ▼
6. Backend: new Alumno({ ... }).save()
        │
        ▼
7. MongoDB: Inserta documento, retorna ID
        │
        ▼
8. Backend: Retorna JSON con alumno creado
        │
        ▼
9. Frontend: Muestra toast de exito
        │
        ▼
10. Frontend: Redirige a lista de alumnos
```

**Codigo Frontend**:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validacion local
  if (!formData.nombre || !formData.matricula) {
    toast.error('Campos obligatorios');
    return;
  }
  
  try {
    const response = await apiClient.post('/api/alumnos', formData);
    toast.success('Alumno creado exitosamente');
    navigate('/alumnos');
  } catch (error) {
    toast.error(error.response?.data?.mensaje || 'Error al crear alumno');
  }
};
```

**Codigo Backend**:
```javascript
exports.createAlumno = async (req, res) => {
  try {
    const { nombre, matricula, correo, telefono, id_carrera } = req.body;
    
    // Validaciones
    if (!nombre || !matricula || !correo) {
      return res.status(400).json({ mensaje: 'Datos incompletos' });
    }
    
    // Crear alumno
    const nuevoAlumno = new Alumno({
      nombre,
      matricula,
      correo,
      telefono,
      id_carrera
    });
    
    await nuevoAlumno.save();
    
    res.status(201).json({
      mensaje: 'Alumno creado',
      alumno: nuevoAlumno
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Matricula ya existe' });
    }
    res.status(500).json({ mensaje: 'Error al crear alumno' });
  }
};
```

### Leer Alumnos (Paginado)

```
1. Usuario navega a lista
        │
        ▼
2. useEffect dispara fetch
        │
        ▼
3. Frontend: GET /api/alumnos/paginados?page=1&limit=10
        │
        ▼
4. Backend: authMiddleware valida token
        │
        ▼
5. Backend: Calcula skip y limit
        │
        ▼
6. Backend: Alumno.find().skip().limit()
        │
        ▼
7. Backend: Cuenta total de documentos
        │
        ▼
8. Backend: Retorna { data, currentPage, totalPages, totalItems }
        │
        ▼
9. Frontend: Actualiza estado con setAlumnos(data)
        │
        ▼
10. React renderiza tabla con datos
```

**Codigo Frontend**:
```javascript
const fetchAlumnos = async (page = 1) => {
  try {
    setLoading(true);
    const response = await apiClient.get('/api/alumnos/paginados', {
      params: { page, limit: 10 }
    });
    
    setAlumnos(response.data.data);
    setPagination({
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
      totalItems: response.data.totalItems
    });
  } catch (error) {
    toast.error('Error al cargar alumnos');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchAlumnos(currentPage);
}, [currentPage]);
```

**Codigo Backend**:
```javascript
exports.getAlumnosPaginados = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const alumnos = await Alumno.find()
      .skip(skip)
      .limit(limit)
      .sort({ nombre: 1 });
    
    const totalItems = await Alumno.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);
    
    res.json({
      data: alumnos,
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener alumnos' });
  }
};
```

### Actualizar Alumno

```
1. Usuario edita formulario
        │
        ▼
2. Frontend: PUT /api/alumnos/:id
   Body: { nombre, telefono, correo }
        │
        ▼
3. Backend: Valida token y datos
        │
        ▼
4. Backend: Alumno.findByIdAndUpdate(id, datos)
        │
        ▼
5. MongoDB: Actualiza documento
        │
        ▼
6. Backend: Retorna alumno actualizado
        │
        ▼
7. Frontend: Actualiza lista local
        │
        ▼
8. Frontend: Muestra toast de exito
```

### Eliminar Alumno

```
1. Usuario click en boton eliminar
        │
        ▼
2. Frontend muestra confirmacion
        │
        ▼
3. Usuario confirma
        │
        ▼
4. Frontend: DELETE /api/alumnos/:id
        │
        ▼
5. Backend: Valida token y permisos
        │
        ▼
6. Backend: Alumno.findByIdAndDelete(id)
        │
        ▼
7. MongoDB: Elimina documento
        │
        ▼
8. Backend: Retorna confirmacion
        │
        ▼
9. Frontend: Remueve de lista local
        │
        ▼
10. Frontend: Muestra toast de exito
```

---

## Flujo de Inscripcion de Materias

```
1. Alumno ve materias disponibles
        │
        ▼
2. GET /api/materias/carrera/:id_carrera
        │
        ▼
3. Frontend muestra lista con filtros
        │
        ▼
4. Alumno selecciona materia
        │
        ▼
5. Frontend verifica conflictos de horario localmente
        │
        ▼
6. Si OK: POST /api/horarios/:horarioId/agregar-materia
   Body: { materiaId }
        │
        ▼
7. Backend valida:
   - Cupo disponible
   - Sin conflictos de horario
   - Prerequisitos cumplidos
        │
        ▼
8. Backend actualiza horario y materia
        │
        ▼
9. MongoDB: $push materia a horario
              $push alumno a materia
        │
        ▼
10. Frontend actualiza UI
        │
        ▼
11. Alumno ve materia en su horario
```

---

## Flujo de Validacion de Horario (Tutor)

```
1. Tutor ve lista de tutorados
        │
        ▼
2. GET /api/alumnos/asignados/:matriculaTutor
        │
        ▼
3. Tutor selecciona alumno
        │
        ▼
4. GET /api/alumnos/horario/:alumnoId
        │
        ▼
5. Frontend muestra horario con materias
        │
        ▼
6. Tutor revisa y decide:
   ├─ Aprobar
   │  └─ PUT /api/horarios/:id
   │     Body: { estatus: 1, comentario: "Aprobado" }
   │
   └─ Rechazar
      └─ PUT /api/horarios/:id
         Body: { estatus: 2, comentario: "Conflicto en..." }
        │
        ▼
7. Backend actualiza estatus
        │
        ▼
8. Alumno ve resultado en su dashboard
```

---

## Manejo de Estado Frontend

### Estado Local (useState)

```javascript
const [alumnos, setAlumnos] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### Estado Global (localStorage)

```javascript
// Guardar
localStorage.setItem('token', token);
localStorage.setItem('roles', JSON.stringify(roles));

// Leer
const token = localStorage.getItem('token');
const roles = JSON.parse(localStorage.getItem('roles'));

// Limpiar
localStorage.clear();
```

### Estado de Session (sessionStorage)

```javascript
// Guardar pagina actual
sessionStorage.setItem('currentPage', page.toString());

// Recuperar al volver
const savedPage = sessionStorage.getItem('currentPage');
```

---

## Optimizaciones de Flujo

### Debouncing en Busqueda

```javascript
// Evita llamadas excesivas a la API
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 500);
  
  return () => clearTimeout(timer);
}, [searchTerm]);

useEffect(() => {
  fetchAlumnos(debouncedSearch);
}, [debouncedSearch]);
```

### Caching de Resultados

```javascript
const cache = useRef({});

const fetchWithCache = async (key) => {
  if (cache.current[key]) {
    return cache.current[key];
  }
  
  const response = await apiClient.get(`/api/${key}`);
  cache.current[key] = response.data;
  return response.data;
};
```

### Optimistic UI Updates

```javascript
const handleDelete = async (id) => {
  // Actualizar UI inmediatamente
  setAlumnos(alumnos.filter(a => a._id !== id));
  
  try {
    await apiClient.delete(`/api/alumnos/${id}`);
    toast.success('Eliminado');
  } catch (error) {
    // Revertir si falla
    fetchAlumnos();
    toast.error('Error al eliminar');
  }
};
```

---

## Documentos Relacionados

- [Arquitectura General](./README.md)
- [Estructura de Carpetas](./estructura-carpetas.md)
- [Endpoints API](../backend/endpoints/README.md)
- [Componentes React](../frontend/componentes/README.md)
