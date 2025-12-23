# Rutas y Navegacion

## Vision General

Documentacion del sistema de rutas y navegacion en el frontend React de InscripcionesUAIE usando React Router DOM v6.

---

## Estructura de Rutas

### App.js - Rutas Principales

```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import RedirectRoute from './components/RedirectRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Publicas */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<RedirectRoute><Validacion1 /></RedirectRoute>} />
        <Route path="/registro" element={<Registro />} />
        
        {/* Rutas Alumno */}
        <Route path="/alumno/horario" element={<PrivateRoute><HorarioSeleccion /></PrivateRoute>} />
        <Route path="/alumno/historial" element={<PrivateRoute><HistorialAcademico /></PrivateRoute>} />
        
        {/* Rutas Docente */}
        <Route path="/docente/inicio" element={<PrivateRoute><InicioDocente /></PrivateRoute>} />
        <Route path="/docente/alumnos/:materiaId" element={<PrivateRoute><DocenteAlumnos /></PrivateRoute>} />
        
        {/* Rutas Tutor */}
        <Route path="/tutor/inicio" element={<PrivateRoute><InicioTutor /></PrivateRoute>} />
        <Route path="/tutor/tutorados" element={<PrivateRoute><AdministrarTutorados /></PrivateRoute>} />
        <Route path="/tutor/revision/:alumnoId" element={<PrivateRoute><RevisionHorarioTutor /></PrivateRoute>} />
        
        {/* Rutas Coordinador */}
        <Route path="/coordinador/inicio" element={<PrivateRoute><InicioCoordinador /></PrivateRoute>} />
        <Route path="/coordinador/alumnos" element={<PrivateRoute><AlumnoListCoord /></PrivateRoute>} />
        <Route path="/coordinador/materias" element={<PrivateRoute><AdministrarMateriasCoordinador /></PrivateRoute>} />
        <Route path="/coordinador/personal" element={<PrivateRoute><AdministrarPersonalCoordinador /></PrivateRoute>} />
        
        {/* Rutas Administrador */}
        <Route path="/admin/inicio" element={<PrivateRoute><InicioAdministrador /></PrivateRoute>} />
        <Route path="/admin/alumnos" element={<PrivateRoute><AlumnoListAdmin /></PrivateRoute>} />
        <Route path="/admin/materias" element={<PrivateRoute><AdministrarMateriasAdmin /></PrivateRoute>} />
        <Route path="/admin/personal" element={<PrivateRoute><AdministrarPersonalAdmin /></PrivateRoute>} />
        
        {/* Rutas Coordinador General */}
        <Route path="/coord-gen/inicio" element={<PrivateRoute><InicioCoordinadorGeneral /></PrivateRoute>} />
        <Route path="/coord-gen/alumnos" element={<PrivateRoute><AlumnoListCG /></PrivateRoute>} />
        <Route path="/coord-gen/materias" element={<PrivateRoute><AdministrarMateriasCG /></PrivateRoute>} />
        <Route path="/coord-gen/personal" element={<PrivateRoute><AdministrarPersonalCG /></PrivateRoute>} />
        
        {/* Rutas Administrador General */}
        <Route path="/admin-gen/inicio" element={<PrivateRoute><InicioAdministradorGeneral /></PrivateRoute>} />
        <Route path="/admin-gen/alumnos" element={<PrivateRoute><AlumnoListAG /></PrivateRoute>} />
        <Route path="/admin-gen/materias" element={<PrivateRoute><AdministrarMateriasAG /></PrivateRoute>} />
        <Route path="/admin-gen/personal" element={<PrivateRoute><AdministrarPersonalAG /></PrivateRoute>} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
```

---

## Rutas por Rol

### Alumno

| Ruta | Componente | Descripcion |
|------|------------|-------------|
| `/alumno/horario` | HorarioSeleccion | Seleccionar materias |
| `/alumno/historial` | HistorialAcademico | Ver historial academico |

### Docente (D)

| Ruta | Componente | Descripcion |
|------|------------|-------------|
| `/docente/inicio` | InicioDocente | Dashboard docente |
| `/docente/alumnos/:materiaId` | DocenteAlumnos | Lista alumnos de materia |

### Tutor (T)

| Ruta | Componente | Descripcion |
|------|------------|-------------|
| `/tutor/inicio` | InicioTutor | Dashboard tutor |
| `/tutor/tutorados` | AdministrarTutorados | Lista de tutorados |
| `/tutor/revision/:alumnoId` | RevisionHorarioTutor | Validar horario |

### Coordinador (C)

| Ruta | Componente | Descripcion |
|------|------------|-------------|
| `/coordinador/inicio` | InicioCoordinador | Dashboard coordinador |
| `/coordinador/alumnos` | AlumnoListCoord | CRUD alumnos |
| `/coordinador/materias` | AdministrarMateriasCoordinador | CRUD materias |
| `/coordinador/personal` | AdministrarPersonalCoordinador | CRUD personal |
| `/coordinador/crear-alumno` | CrearAlumno | Formulario crear alumno |
| `/coordinador/editar-alumno/:id` | ModificarAlumno | Formulario editar alumno |

### Administrador (A)

| Ruta | Componente | Descripcion |
|------|------------|-------------|
| `/admin/inicio` | InicioAdministrador | Dashboard admin |
| `/admin/alumnos` | AlumnoListAdmin | Vista alumnos (solo lectura) |
| `/admin/materias` | AdministrarMateriasAdmin | Vista materias (solo lectura) |
| `/admin/personal` | AdministrarPersonalAdmin | Vista personal (solo lectura) |

### Coordinador General (CG)

| Ruta | Componente | Descripcion |
|------|------------|-------------|
| `/coord-gen/inicio` | InicioCoordinadorGeneral | Dashboard coord general |
| `/coord-gen/alumnos` | AlumnoListCG | CRUD alumnos (todas carreras) |
| `/coord-gen/materias` | AdministrarMateriasCG | CRUD materias (todas) |
| `/coord-gen/personal` | AdministrarPersonalCG | CRUD personal (todas) |
| `/coord-gen/crear-alumno` | CrearAlumnoCG | Crear alumno (cualquier carrera) |
| `/coord-gen/crear-materia` | CrearMateriaCG | Crear materia (cualquier carrera) |
| `/coord-gen/crear-personal` | CrearPersonalCG | Crear personal (cualquier carrera) |

### Administrador General (AG)

| Ruta | Componente | Descripcion |
|------|------------|-------------|
| `/admin-gen/inicio` | InicioAdministradorGeneral | Dashboard admin general |
| `/admin-gen/alumnos` | AlumnoListAG | Vista alumnos (todas carreras) |
| `/admin-gen/materias` | AdministrarMateriasAG | Vista materias (todas) |
| `/admin-gen/personal` | AdministrarPersonalAG | Vista personal (todas) |

---

## Componentes de Ruta

### PrivateRoute (HOC)

Protege rutas que requieren autenticacion:

```javascript
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default PrivateRoute;
```

### RedirectRoute (HOC)

Redirige si ya esta autenticado:

```javascript
import { Navigate } from 'react-router-dom';

const RedirectRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    
    // Redirigir segun rol
    if (roles.length === 0) {
      return <Navigate to="/alumno/horario" replace />;
    } else if (roles.includes('CG')) {
      return <Navigate to="/coord-gen/inicio" replace />;
    } else if (roles.includes('AG')) {
      return <Navigate to="/admin-gen/inicio" replace />;
    } else if (roles.includes('C')) {
      return <Navigate to="/coordinador/inicio" replace />;
    } else if (roles.includes('A')) {
      return <Navigate to="/admin/inicio" replace />;
    } else if (roles.includes('D')) {
      return <Navigate to="/docente/inicio" replace />;
    } else if (roles.includes('T')) {
      return <Navigate to="/tutor/inicio" replace />;
    }
  }
  
  return children;
};

export default RedirectRoute;
```

---

## Navegacion Programatica

### useNavigate Hook

```javascript
import { useNavigate } from 'react-router-dom';

const MiComponente = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/coordinador/alumnos');
  };
  
  const handleBack = () => {
    navigate(-1); // Volver atras
  };
  
  const handleReplace = () => {
    navigate('/login', { replace: true }); // No agrega a historial
  };
  
  return (
    <button onClick={handleClick}>Ir a Alumnos</button>
  );
};
```

### Navegacion con Estado

```javascript
// Enviar estado
navigate('/coordinador/editar-alumno', {
  state: { alumnoId: '123', nombre: 'Juan' }
});

// Recibir estado
import { useLocation } from 'react-router-dom';

const EditarAlumno = () => {
  const location = useLocation();
  const { alumnoId, nombre } = location.state || {};
  
  // Usar datos
};
```

---

## Parametros de Ruta

### useParams Hook

```javascript
import { useParams } from 'react-router-dom';

const DocenteAlumnos = () => {
  const { materiaId } = useParams();
  
  useEffect(() => {
    fetchAlumnosDeMateria(materiaId);
  }, [materiaId]);
  
  // ...
};
```

### Definir Ruta con Parametro

```javascript
<Route path="/docente/alumnos/:materiaId" element={<DocenteAlumnos />} />
```

### Navegar con Parametro

```javascript
navigate(`/docente/alumnos/${materia._id}`);
```

---

## Query Params

### useSearchParams Hook

```javascript
import { useSearchParams } from 'react-router-dom';

const AlumnoList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, search });
  };
  
  // URL: /alumnos?page=2&search=juan
};
```

---

## Links

### Link Component

```javascript
import { Link } from 'react-router-dom';

<Link to="/coordinador/alumnos">Ver Alumnos</Link>

<Link 
  to="/editar-alumno" 
  state={{ alumnoId: alumno._id }}
>
  Editar
</Link>
```

### NavLink (con clase active)

```javascript
import { NavLink } from 'react-router-dom';

<NavLink 
  to="/coordinador/alumnos"
  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
>
  Alumnos
</NavLink>
```

---

## Redireccion Basada en Roles

### Funcion Auxiliar

```javascript
const getRoleBasedRoute = () => {
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  
  if (roles.length === 0) return '/alumno/horario';
  if (roles.includes('CG')) return '/coord-gen/inicio';
  if (roles.includes('AG')) return '/admin-gen/inicio';
  if (roles.includes('C')) return '/coordinador/inicio';
  if (roles.includes('A')) return '/admin/inicio';
  if (roles.includes('D')) return '/docente/inicio';
  if (roles.includes('T')) return '/tutor/inicio';
  
  return '/login';
};

// Usar despues de login
navigate(getRoleBasedRoute());
```

---

## Manejo de 404

### Componente NotFound

```javascript
const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="not-found">
      <h1>404 - Pagina No Encontrada</h1>
      <p>La pagina que buscas no existe.</p>
      <button onClick={() => navigate('/')}>
        Volver al Inicio
      </button>
    </div>
  );
};
```

---

## Lazy Loading de Rutas

### Optimizacion con React.lazy

```javascript
import { lazy, Suspense } from 'react';

const AlumnoList = lazy(() => import('./components/AlumnoList'));
const CrearAlumno = lazy(() => import('./components/CrearAlumno'));

function App() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        <Route path="/alumnos" element={<AlumnoList />} />
        <Route path="/crear-alumno" element={<CrearAlumno />} />
      </Routes>
    </Suspense>
  );
}
```

---

## Breadcrumbs

### Implementacion

```javascript
import { useLocation, Link } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  return (
    <nav className="breadcrumbs">
      <Link to="/">Inicio</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return isLast ? (
          <span key={name}> / {name}</span>
        ) : (
          <span key={name}>
            {' / '}
            <Link to={routeTo}>{name}</Link>
          </span>
        );
      })}
    </nav>
  );
};
```

---

## Scroll to Top

### Componente ScrollToTop

```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Usar en App.js
<Router>
  <ScrollToTop />
  <Routes>
    {/* rutas */}
  </Routes>
</Router>
```

---

## Documentos Relacionados

- [Componentes](./componentes/README.md)
- [Configuracion Frontend](./configuracion.md)
- [Roles y Permisos](../referencia/roles-permisos.md)
