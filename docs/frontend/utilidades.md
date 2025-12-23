# Utilidades Frontend

## Descripcion

Archivos y funciones auxiliares utilizados en el frontend React de InscripcionesUAIE.

---

## axiosConfig.js

Cliente HTTP configurado con Axios para comunicacion con la API.

### Ubicacion

`react_frontend/src/utils/axiosConfig.js`

### Configuracion

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Parametros

| Parametro | Valor | Descripcion |
|-----------|-------|-------------|
| `baseURL` | `process.env.REACT_APP_API_URL` | URL base de la API (ej: http://localhost:5000) |
| `timeout` | `10000` | Tiempo maximo de espera en ms (10 segundos) |
| `headers` | `{'Content-Type': 'application/json'}` | Headers por defecto |

---

## Interceptores

### Request Interceptor

Agrega automaticamente el token JWT a todas las peticiones:

```javascript
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

**Funcionalidad**:
1. Lee el token de `localStorage`
2. Si existe, lo agrega al header `Authorization`
3. Formato: `Bearer <token>`

**Beneficio**: No necesitas agregar el token manualmente en cada peticion.

### Response Interceptor

Maneja errores de autenticacion globalmente:

```javascript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Token invalido o expirado');
      // Redirigir a login, limpiar token, etc.
    }
    return Promise.reject(error);
  }
);
```

**Funcionalidad**:
- Detecta respuestas con codigo 401 (Unauthorized)
- Puede limpiar sesion y redirigir a login
- Centraliza manejo de errores de autenticacion

---

## Uso en Componentes

### Importar

```javascript
import apiClient from '../utils/axiosConfig';
```

### GET Request

```javascript
const fetchAlumnos = async () => {
  try {
    const response = await apiClient.get('/api/alumnos');
    setAlumnos(response.data);
  } catch (error) {
    console.error('Error al obtener alumnos:', error);
    toast.error('Error al cargar datos');
  }
};
```

### POST Request

```javascript
const crearAlumno = async (datos) => {
  try {
    const response = await apiClient.post('/api/alumnos', datos);
    toast.success('Alumno creado exitosamente');
    return response.data;
  } catch (error) {
    console.error('Error al crear alumno:', error);
    toast.error(error.response?.data?.mensaje || 'Error al crear alumno');
  }
};
```

### PUT Request

```javascript
const actualizarAlumno = async (id, datos) => {
  try {
    const response = await apiClient.put(`/api/alumnos/${id}`, datos);
    toast.success('Alumno actualizado');
    return response.data;
  } catch (error) {
    console.error('Error al actualizar:', error);
    toast.error('Error al actualizar alumno');
  }
};
```

### DELETE Request

```javascript
const eliminarAlumno = async (id) => {
  try {
    await apiClient.delete(`/api/alumnos/${id}`);
    toast.success('Alumno eliminado');
  } catch (error) {
    console.error('Error al eliminar:', error);
    toast.error('Error al eliminar alumno');
  }
};
```

---

## Patrones Comunes

### Fetch con Paginacion

```javascript
const fetchAlumnosPaginados = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await apiClient.get('/api/alumnos/paginados', {
      params: { page, limit, search }
    });
    
    return {
      data: response.data.data,
      pagination: {
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalItems
      }
    };
  } catch (error) {
    console.error('Error en paginacion:', error);
    throw error;
  }
};
```

### Upload de Archivos

```javascript
const subirArchivo = async (file) => {
  const formData = new FormData();
  formData.append('csv', file);
  
  try {
    const response = await apiClient.post('/api/alumnos/subir-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    toast.success('Archivo subido exitosamente');
    return response.data;
  } catch (error) {
    console.error('Error al subir archivo:', error);
    toast.error('Error al subir archivo');
  }
};
```

### Download de Archivos

```javascript
const descargarCSV = async () => {
  try {
    const response = await apiClient.get('/api/alumnos/exportar-csv', {
      responseType: 'blob'
    });
    
    // Crear URL temporal y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'alumnos.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.success('CSV descargado');
  } catch (error) {
    console.error('Error al descargar:', error);
    toast.error('Error al descargar CSV');
  }
};
```

---

## Manejo de Errores

### Try-Catch Basico

```javascript
try {
  const response = await apiClient.get('/api/alumnos');
  // Manejar respuesta exitosa
} catch (error) {
  // Manejar error
  console.error('Error:', error);
}
```

### Error con Mensaje del Servidor

```javascript
try {
  const response = await apiClient.post('/api/alumnos', datos);
  toast.success('Operacion exitosa');
} catch (error) {
  const mensaje = error.response?.data?.mensaje || 'Error desconocido';
  toast.error(mensaje);
}
```

### Errores Especificos

```javascript
try {
  const response = await apiClient.post('/api/alumnos', datos);
} catch (error) {
  if (error.response) {
    // El servidor respondio con un codigo fuera del rango 2xx
    switch (error.response.status) {
      case 400:
        toast.error('Datos invalidos');
        break;
      case 401:
        toast.error('Sesion expirada');
        localStorage.clear();
        navigate('/login');
        break;
      case 404:
        toast.error('Recurso no encontrado');
        break;
      case 500:
        toast.error('Error del servidor');
        break;
      default:
        toast.error('Error desconocido');
    }
  } else if (error.request) {
    // La peticion se hizo pero no hubo respuesta
    toast.error('Sin respuesta del servidor');
  } else {
    // Error al configurar la peticion
    toast.error('Error en la peticion');
  }
}
```

---

## Mejores Practicas

### 1. Usar apiClient en lugar de axios directo

❌ **Incorrecto**:
```javascript
import axios from 'axios';
axios.get('http://localhost:5000/api/alumnos');
```

✅ **Correcto**:
```javascript
import apiClient from '../utils/axiosConfig';
apiClient.get('/api/alumnos');
```

### 2. Manejar errores siempre

❌ **Incorrecto**:
```javascript
const response = await apiClient.get('/api/alumnos');
setAlumnos(response.data);
```

✅ **Correcto**:
```javascript
try {
  const response = await apiClient.get('/api/alumnos');
  setAlumnos(response.data);
} catch (error) {
  console.error(error);
  toast.error('Error al cargar datos');
}
```

### 3. Mostrar feedback al usuario

```javascript
try {
  setLoading(true);
  const response = await apiClient.post('/api/alumnos', datos);
  toast.success('Alumno creado');
  navigate('/alumnos');
} catch (error) {
  toast.error(error.response?.data?.mensaje || 'Error');
} finally {
  setLoading(false);
}
```

---

## Configuracion Adicional

### Aumentar Timeout

Para operaciones largas:

```javascript
const response = await apiClient.post('/api/alumnos/subir-csv', formData, {
  timeout: 60000 // 60 segundos
});
```

### Headers Personalizados

```javascript
const response = await apiClient.get('/api/alumnos', {
  headers: {
    'X-Custom-Header': 'valor'
  }
});
```

### Cancelar Peticiones

```javascript
const source = axios.CancelToken.source();

apiClient.get('/api/alumnos', {
  cancelToken: source.token
});

// Cancelar
source.cancel('Operacion cancelada');
```

---

## Debugging

### Ver Peticiones en Console

```javascript
apiClient.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method.toUpperCase(), config.url);
    return config;
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  }
);
```

---

## Documentos Relacionados

- [Configuracion Frontend](./configuracion.md)
- [Endpoints API](../backend/endpoints/README.md)
- [Autenticacion JWT](../backend/autenticacion.md)
- [Componentes](./componentes/README.md)
