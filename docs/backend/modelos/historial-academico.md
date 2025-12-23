# Modelo: HistorialAcademico

## Descripcion

Representa el historico de semestres academicos. Almacena exportaciones de datos (alumnos, personal, materias) de semestres anteriores para mantener un registro historico del sistema.

---

## Coleccion

**Nombre**: `historialacademicos`

---

## Esquema

| Campo | Tipo | Requerido | Unico | Default | Descripcion |
|-------|------|-----------|-------|---------|-------------|
| `semestre` | String | Si | No | - | Identificador del semestre (ej: "2024-1") |
| `fecha_generacion` | Date | No | No | Date.now | Fecha de creacion del registro |
| `archivos` | Object | No | No | - | Rutas de archivos exportados |
| `archivos.personal` | String | No | No | - | Ruta del CSV de personal |
| `archivos.alumnos` | String | No | No | - | Ruta del CSV de alumnos |
| `archivos.materias` | String | No | No | - | Ruta del CSV de materias |
| `generado_por` | ObjectId | No | No | - | Usuario que genero el registro (ref: 'Usuario') |
| `fecha_de_borrado` | Date | No | No | null | Fecha programada para eliminacion |

---

## Ejemplo de Documento

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "semestre": "2024-1",
  "fecha_generacion": "2024-06-30T23:59:59.000Z",
  "archivos": {
    "personal": "exports/2024-1/personal.csv",
    "alumnos": "exports/2024-1/alumnos.csv",
    "materias": "exports/2024-1/materias.csv"
  },
  "generado_por": "64a1b2c3d4e5f6g7h8i9j0k2",
  "fecha_de_borrado": "2025-06-30T23:59:59.000Z"
}
```

---

## Uso en Codigo

### Crear Registro Historico

```javascript
const HistorialAcademico = require('../models/HistorialAcademico');

const nuevoHistorial = new HistorialAcademico({
  semestre: '2024-1',
  archivos: {
    personal: 'exports/2024-1/personal.csv',
    alumnos: 'exports/2024-1/alumnos.csv',
    materias: 'exports/2024-1/materias.csv'
  },
  generado_por: coordinadorId,
  fecha_de_borrado: new Date('2025-06-30')
});

await nuevoHistorial.save();
```

### Buscar por Semestre

```javascript
const historial = await HistorialAcademico.findOne({ semestre: '2024-1' });
```

### Listar Historiales

```javascript
const historiales = await HistorialAcademico.find()
  .sort({ fecha_generacion: -1 })
  .populate('generado_por');
```

### Obtener Semestre Actual

```javascript
const actual = await HistorialAcademico.findOne()
  .sort({ fecha_generacion: -1 })
  .limit(1);
```

---

## Relaciones

### generado_por → Usuario

Relacion con el usuario (Personal) que genero el registro:

```javascript
const historial = await HistorialAcademico.findById(id)
  .populate('generado_por');
// historial.generado_por contiene objeto Usuario
```

---

## Consultas Comunes

### Historiales Recientes

```javascript
const recientes = await HistorialAcademico.find()
  .sort({ fecha_generacion: -1 })
  .limit(5);
```

### Historiales Proximos a Borrar

```javascript
const proximosBorrado = await HistorialAcademico.find({
  fecha_de_borrado: {
    $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
  }
});
```

### Historiales de un Año

```javascript
const año = '2024';
const historiales = await HistorialAcademico.find({
  semestre: new RegExp(`^${año}`)
});
```

---

## Formato de Semestre

### Convencion

El campo `semestre` sigue el formato: `YYYY-S`

- `YYYY`: Año (4 digitos)
- `S`: Numero de semestre (1 o 2)

Ejemplos:
- `"2024-1"` - Primer semestre de 2024 (Enero-Junio)
- `"2024-2"` - Segundo semestre de 2024 (Agosto-Diciembre)

---

## Gestion de Archivos

### Estructura de Directorios

```
exports/
├── 2024-1/
│   ├── personal.csv
│   ├── alumnos.csv
│   └── materias.csv
├── 2024-2/
│   ├── personal.csv
│   ├── alumnos.csv
│   └── materias.csv
```

### Generar Exportaciones

```javascript
const fs = require('fs');
const path = require('path');

async function exportarSemestre(semestre) {
  const dir = path.join('exports', semestre);
  
  // Crear directorio
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Exportar datos
  const personal = await Personal.find();
  const alumnos = await Alumno.find();
  const materias = await Materia.find();
  
  // Guardar CSVs
  // ... logica de conversion a CSV
  
  // Crear registro historico
  const historial = new HistorialAcademico({
    semestre: semestre,
    archivos: {
      personal: `${dir}/personal.csv`,
      alumnos: `${dir}/alumnos.csv`,
      materias: `${dir}/materias.csv`
    },
    generado_por: userId
  });
  
  await historial.save();
}
```

---

## Limpieza Automatica

### Eliminar Registros Antiguos

Implementar un job programado para eliminar registros cuya `fecha_de_borrado` haya pasado:

```javascript
const cron = require('node-cron');

// Ejecutar diariamente a medianoche
cron.schedule('0 0 * * *', async () => {
  const ahora = new Date();
  
  const aBorrar = await HistorialAcademico.find({
    fecha_de_borrado: { $lte: ahora }
  });
  
  for (const historial of aBorrar) {
    // Eliminar archivos fisicos
    if (fs.existsSync(historial.archivos.personal)) {
      fs.unlinkSync(historial.archivos.personal);
    }
    // ... eliminar otros archivos
    
    // Eliminar registro
    await HistorialAcademico.findByIdAndDelete(historial._id);
  }
});
```

---

## Notas

- Los archivos CSV contienen snapshot de los datos al final del semestre
- La `fecha_de_borrado` es opcional y puede ser null (mantener indefinidamente)
- Es responsabilidad del sistema eliminar tanto el registro como los archivos fisicos
- Solo usuarios con rol `CG` (Coordinador General) deberian poder generar historiales

---

## Ubicacion del Archivo

`node_backend/models/HistorialAcademico.js`

---

## Documentos Relacionados

- [Endpoints Coordinador General](../endpoints/coordinador.md)
- [Exportacion de Datos](../../guias/despliegue.md#exportacion)
- [Roles y Permisos](../../referencia/roles-permisos.md)
