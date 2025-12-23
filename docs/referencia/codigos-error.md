# Codigos de Error

## Vision General

Documentacion de los codigos de error HTTP y mensajes utilizados en InscripcionesUAIE.

---

## Codigos HTTP Estandar

### 2xx - Exito

| Codigo | Nombre | Uso en el Sistema |
|--------|--------|-------------------|
| 200 | OK | Operacion exitosa (GET, PUT, DELETE) |
| 201 | Created | Recurso creado exitosamente (POST) |

### 4xx - Errores del Cliente

| Codigo | Nombre | Uso en el Sistema |
|--------|--------|-------------------|
| 400 | Bad Request | Datos invalidos o faltantes |
| 401 | Unauthorized | Token invalido o expirado |
| 403 | Forbidden | Sin permisos para la operacion |
| 404 | Not Found | Recurso no encontrado |

### 5xx - Errores del Servidor

| Codigo | Nombre | Uso en el Sistema |
|--------|--------|-------------------|
| 500 | Internal Server Error | Error interno del servidor |
| 503 | Service Unavailable | Servicio temporalmente no disponible |

---

## Errores de Autenticacion

### 400 - Bad Request

```json
{
  "mensaje": "Alumno no encontrado"
}
```

**Causa**: Matricula no existe en la base de datos

**Solucion**: Verificar que la matricula sea correcta

---

```json
{
  "mensaje": "Matricula y contraseña son obligatorias"
}
```

**Causa**: Faltan campos requeridos en login de personal

**Solucion**: Proporcionar matricula y password

---

### 401 - Unauthorized

```json
{
  "mensaje": "Contraseña incorrecta"
}
```

**Causa**: Password no coincide con el almacenado

**Solucion**: Verificar password o usar recuperacion de contraseña

---

```json
{
  "mensaje": "Token no proporcionado"
}
```

**Causa**: No se envio token en el header Authorization

**Solucion**: Incluir header `Authorization: Bearer <token>`

---

```json
{
  "mensaje": "Token invalido o expirado"
}
```

**Causa**: Token JWT invalido o pasó su tiempo de expiracion

**Solucion**: Iniciar sesion nuevamente

---

### 404 - Not Found

```json
{
  "mensaje": "Usuario no encontrado"
}
```

**Causa**: La matricula no existe en el sistema

**Solucion**: Verificar matricula o contactar administrador

---

## Errores de Operaciones CRUD

### 400 - Bad Request

```json
{
  "mensaje": "Datos incompletos",
  "faltantes": ["nombre", "correo"]
}
```

**Causa**: Faltan campos requeridos

**Solucion**: Proporcionar todos los campos obligatorios

---

```json
{
  "mensaje": "Formato de correo invalido"
}
```

**Causa**: Email no cumple formato valido

**Solucion**: Usar formato name@domain.com

---

```json
{
  "mensaje": "La matricula ya existe"
}
```

**Causa**: Se intenta crear usuario con matricula duplicada

**Solucion**: Usar matricula diferente o actualizar usuario existente

---

### 404 - Not Found

```json
{
  "mensaje": "Alumno no encontrado"
}
```

**Causa**: ID o matricula no existe

**Solucion**: Verificar que el recurso exista antes de operar

---

```json
{
  "mensaje": "Materia no encontrada"
}
```

**Causa**: ID de materia invalido

**Solucion**: Verificar ID de materia

---

## Errores de Horarios

### 400 - Bad Request

```json
{
  "mensaje": "Cupo lleno"
}
```

**Causa**: La materia alcanzo su cupo maximo

**Solucion**: Seleccionar otro grupo o materia

---

```json
{
  "mensaje": "Conflicto de horarios"
}
```

**Causa**: Traslape de horarios entre materias

**Solucion**: Seleccionar materias con horarios compatibles

---

```json
{
  "mensaje": "Horario no aprobado por el tutor"
}
```

**Causa**: El tutor no ha validado el horario

**Solucion**: Esperar aprobacion del tutor

---

## Errores de Archivos

### 400 - Bad Request

```json
{
  "mensaje": "Formato de archivo no valido"
}
```

**Causa**: Archivo no es CSV o PDF segun se requiera

**Solucion**: Convertir archivo al formato correcto

---

```json
{
  "mensaje": "Archivo CSV con formato incorrecto"
}
```

**Causa**: Las columnas del CSV no coinciden con lo esperado

**Solucion**: Usar plantilla CSV proporcionada

---

```json
{
  "mensaje": "Archivo demasiado grande"
}
```

**Causa**: El archivo excede el limite de tamaño

**Solucion**: Reducir tamaño del archivo

---

## Errores de Permisos

### 403 - Forbidden

```json
{
  "mensaje": "No tienes permisos para esta operacion"
}
```

**Causa**: El rol del usuario no permite la accion

**Solucion**: Contactar coordinador o usar cuenta con permisos adecuados

---

```json
{
  "mensaje": "Solo coordinadores pueden realizar esta accion"
}
```

**Causa**: Accion restringida a rol coordinador

**Solucion**: Solicitar a un coordinador

---

## Errores del Servidor

### 500 - Internal Server Error

```json
{
  "mensaje": "Error al iniciar sesion",
  "error": "Error details (solo en desarrollo)"
}
```

**Causa**: Error interno en el servidor

**Solucion**: 
- Revisar logs del servidor
- Verificar conexion a base de datos
- Contactar soporte tecnico

---

```json
{
  "mensaje": "Error al conectar con la base de datos"
}
```

**Causa**: MongoDB no esta disponible

**Solucion**:
- Verificar que MongoDB este corriendo
- Verificar cadena de conexion
- Revisar permisos de red

---

## Formato de Respuesta de Error

### Backend (Express)

```javascript
// Error simple
res.status(400).json({ 
  mensaje: 'Descripcion del error' 
});

// Error con detalles (desarrollo)
res.status(500).json({ 
  mensaje: 'Error al procesar',
  error: error.message 
});

// Error con datos adicionales
res.status(400).json({ 
  mensaje: 'Datos invalidos',
  faltantes: ['campo1', 'campo2']
});
```

### Frontend (React)

```javascript
try {
  const response = await apiClient.post('/api/endpoint', data);
} catch (error) {
  // Extraer mensaje del servidor
  const mensaje = error.response?.data?.mensaje || 'Error desconocido';
  
  // Mostrar al usuario
  toast.error(mensaje);
  
  // Log para debugging
  console.error('Error completo:', error);
}
```

---

## Manejo de Errores Frontend

### Errores de Red

```javascript
if (error.response) {
  // Servidor respondio con codigo fuera de 2xx
  console.error('Status:', error.response.status);
  console.error('Data:', error.response.data);
} else if (error.request) {
  // Peticion enviada pero sin respuesta
  toast.error('Sin respuesta del servidor. Verifica tu conexion.');
} else {
  // Error al configurar peticion
  console.error('Error:', error.message);
}
```

### Reintento Automatico

```javascript
const fetchConReintento = async (url, intentos = 3) => {
  for (let i = 0; i < intentos; i++) {
    try {
      return await apiClient.get(url);
    } catch (error) {
      if (i === intentos - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

---

## Logs y Debugging

### Backend

```javascript
// Middleware de logging
app.use((err, req, res, next) => {
  console.error('Error:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack
  });
  
  res.status(500).json({ 
    mensaje: 'Error interno del servidor' 
  });
});
```

### Frontend

```javascript
// Interceptor de logging
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.mensaje
    });
    
    return Promise.reject(error);
  }
);
```

---

## Mejores Practicas

1. **Siempre incluir mensaje descriptivo** en respuestas de error
2. **No exponer stack traces** en produccion
3. **Usar codigos HTTP apropiados** para cada tipo de error
4. **Loggear errores** del servidor para debugging
5. **Mostrar mensajes amigables** al usuario final
6. **Validar datos** en backend aunque se validen en frontend

---

## Documentos Relacionados

- [Endpoints API](../backend/endpoints/README.md)
- [Autenticacion JWT](../backend/autenticacion.md)
- [Utilidades Frontend](../frontend/utilidades.md)
