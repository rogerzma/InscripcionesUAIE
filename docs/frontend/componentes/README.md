# Componentes React - Frontend

## Vision General

Este directorio documenta los componentes React del sistema InscripcionesUAIE. Los componentes estan organizados por funcionalidad y rol de usuario.

---

## Estructura de Componentes

### Por Funcionalidad

| Categoria | Componentes | Descripcion |
|-----------|-------------|-------------|
| **Administracion** | Administrar*.js | CRUD de alumnos, personal, materias |
| **Listados** | *List*.js | Visualizacion de datos en tablas |
| **Formularios** | Crear*.js, Modificar*.js | Creacion y edicion |
| **Dashboards** | Inicio*.js | Paginas principales por rol |
| **Navegacion** | Encabezado.js, Pie_pagina.js | Componentes de layout |
| **Autenticacion** | Registro.js, Validacion*.js | Login y validaciones |
| **Horarios** | Horario*.js | Gestion de horarios |

---

## Componentes por Rol

### Alumno
- `HorarioSeleccion.js` - Seleccion de materias
- `HistorialAcademico.js` - Ver historial academico

### Docente (D)
- `InicioDocente.js` - Dashboard docente
- `DocenteAlumnos.js` - Lista de alumnos por materia

### Tutor (T)
- `InicioTutor.js` - Dashboard tutor
- `AdministrarTutorados.js` - Gestion de alumnos tutorados
- `RevisionHorarioTutor.js` - Validacion de horarios

### Coordinador (C)
- `InicioCoordinador.js` - Dashboard coordinador
- `AdministrarMateriasCoordinador.js` - CRUD materias de su carrera
- `AdministrarPersonalCoordinador.js` - CRUD personal de su carrera
- `AlumnoListCoord.js` - Lista de alumnos de su carrera
- `AsignarTutor.js` - Asignacion de tutores

### Administrador (A)
- `InicioAdministrador.js` - Dashboard administrador
- `AdministrarMateriasAdmin.js` - Vista lectura materias
- `AdministrarPersonalAdmin.js` - Vista lectura personal
- `AlumnoListAdmin.js` - Vista lectura alumnos

### Coordinador General (CG)
- `InicioCoordinadorGeneral.js` - Dashboard coord general
- `AdministrarMateriasCG.js` - CRUD materias todas las carreras
- `AdministrarPersonalCG.js` - CRUD personal todas las carreras
- `AlumnoListCG.js` - Lista alumnos todas las carreras
- `AdministrarTutoradosCG.js` - Gestion tutorados global
- `CrearAlumnoCG.js` - Crear alumno cualquier carrera
- `CrearMateriaCG.js` - Crear materia cualquier carrera
- `CrearPersonalCG.js` - Crear personal cualquier carrera

### Administrador General (AG)
- `InicioAdministradorGeneral.js` - Dashboard admin general
- `AdministrarMateriasAG.js` - Vista lectura materias global
- `AdministrarPersonalAG.js` - Vista lectura personal global
- `AlumnoListAG.js` - Vista lectura alumnos global

---

## Componentes de Utilidad

### Encabezado.js

Barra de navegacion superior con menu y perfil de usuario.

**Props**: Ninguna

**Estado**:
- Usuario actual (desde localStorage)
- Menu desplegable

**Funciones**:
- `handleLogout()` - Cerrar sesion
- `toggleMenu()` - Abrir/cerrar menu

### Pie_pagina.js

Footer del sitio con informacion de copyright.

**Props**: Ninguna

### PrivateRoute.js

Componente de orden superior (HOC) para proteger rutas.

**Props**:
- `children` - Componente a proteger

**Funcionalidad**:
- Verifica token en localStorage
- Redirige a login si no esta autenticado
- Renderiza children si esta autenticado

**Uso**:
```jsx
<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />
```

### RedirectRoute.js

Redirige a dashboard si ya esta autenticado.

**Props**:
- `children` - Componente a renderizar

**Funcionalidad**:
- Verifica token en localStorage
- Redirige a dashboard si esta autenticado
- Renderiza children si NO esta autenticado

**Uso**:
```jsx
<Route path="/login" element={
  <RedirectRoute>
    <Login />
  </RedirectRoute>
} />
```

---

## Patrones Comunes

### Estructura Basica de Componente

```javascript
import React, { useState, useEffect } from 'react';
import apiClient from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import './Componente.css';

const Componente = () => {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Efectos
  useEffect(() => {
    fetchData();
  }, []);
  
  // Funciones
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/endpoint');
      setData(response.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };
  
  // Render
  return (
    <div className="componente-container">
      {loading ? <p>Cargando...</p> : (
        <div>{/* Contenido */}</div>
      )}
    </div>
  );
};

export default Componente;
```

### Paginacion

```javascript
const [currentPage, setCurrentPage] = useState(1);
const [pagination, setPagination] = useState({
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10
});

const fetchPaginado = async (page) => {
  const response = await apiClient.get('/api/endpoint/paginados', {
    params: { page, limit: pagination.itemsPerPage }
  });
  
  setData(response.data.data);
  setPagination({
    totalPages: response.data.totalPages,
    totalItems: response.data.totalItems,
    itemsPerPage: response.data.itemsPerPage
  });
  setCurrentPage(page);
};

const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= pagination.totalPages) {
    fetchPaginado(newPage);
  }
};
```

### Busqueda con Debounce

```javascript
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

// Debounce del termino de busqueda
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 500);
  
  return () => clearTimeout(timer);
}, [searchTerm]);

// Fetch cuando cambia el termino debounced
useEffect(() => {
  fetchData(debouncedSearch);
}, [debouncedSearch]);
```

### Formularios Controlados

```javascript
const [formData, setFormData] = useState({
  nombre: '',
  correo: '',
  telefono: ''
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    await apiClient.post('/api/endpoint', formData);
    toast.success('Guardado exitosamente');
    // Reset form
    setFormData({ nombre: '', correo: '', telefono: '' });
  } catch (error) {
    toast.error('Error al guardar');
  }
};
```

---

## Convenciones de Codigo

### Nomenclatura

- **Componentes**: PascalCase (ej: `AdministrarMateriasCG.js`)
- **Funciones**: camelCase (ej: `fetchAlumnos`, `handleDelete`)
- **Estados**: camelCase (ej: `alumnos`, `currentPage`)
- **CSS Classes**: kebab-case (ej: `.alumno-list-container`)

### Organizacion de Imports

```javascript
// 1. React y hooks
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 2. Librerias externas
import { toast } from 'react-toastify';

// 3. Utilidades propias
import apiClient from '../utils/axiosConfig';

// 4. Componentes
import Encabezado from './Encabezado';

// 5. Estilos
import './Componente.css';
```

### Comentarios

```javascript
// Fetch inicial de datos
useEffect(() => {
  fetchAlumnos();
}, []);

/**
 * Elimina un alumno del sistema
 * @param {string} id - ID del alumno a eliminar
 */
const handleDelete = async (id) => {
  // ...
};
```

---

## Persistencia de Estado

### sessionStorage

Para persistir estado de vista (ej: pagina actual):

```javascript
// Guardar
sessionStorage.setItem('currentPage', currentPage.toString());

// Recuperar
useEffect(() => {
  const savedPage = sessionStorage.getItem('currentPage');
  if (savedPage) {
    setCurrentPage(parseInt(savedPage));
  }
}, []);
```

### localStorage

Para persistir sesion de usuario:

```javascript
// Guardar token
localStorage.setItem('token', token);

// Leer token
const token = localStorage.getItem('token');

// Limpiar todo
localStorage.clear();
```

---

## Manejo de Errores

### Error Boundaries

Considerar implementar en componentes principales:

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Algo salio mal.</h1>;
    }

    return this.props.children;
  }
}
```

---

## Testing

### Jest + React Testing Library

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Componente from './Componente';

test('renders component', () => {
  render(<Componente />);
  const element = screen.getByText(/texto/i);
  expect(element).toBeInTheDocument();
});

test('handles click', () => {
  render(<Componente />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  // Assertions
});
```

---

## Documentos Relacionados

- [Configuracion Frontend](../configuracion.md)
- [Rutas](../rutas.md)
- [Utilidades](../utilidades.md)
- [Roles y Permisos](../../referencia/roles-permisos.md)
