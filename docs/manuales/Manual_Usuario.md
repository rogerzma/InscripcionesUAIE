# Manual de Usuario
## Sistema Web de Reinscripcion - Facultad de Ingenieria Electronica UAZ

---

## Contenido

1. [Introduccion](#1-introduccion)
2. [Acceso al Sistema](#2-acceso-al-sistema)
3. [Manual del Alumno](#3-manual-del-alumno)
4. [Manual del Tutor](#4-manual-del-tutor)
5. [Manual del Docente](#5-manual-del-docente)
6. [Manual del Coordinador](#6-manual-del-coordinador)
7. [Manual del Coordinador General](#7-manual-del-coordinador-general)
8. [Manual del Administrador General](#8-manual-del-administrador-general)
9. [Preguntas Frecuentes](#9-preguntas-frecuentes)

---

## 1. Introduccion

### 1.1 Proposito del Sistema

El Sistema Web de Reinscripcion permite a los estudiantes de la Facultad de Ingenieria Electronica de la UAZ realizar su proceso de inscripcion/reinscripcion de manera digital, seleccionando sus materias y generando su horario de clases sin traslapes.

### 1.2 Beneficios

- Generacion automatica de horarios sin conflictos
- Validacion en tiempo real por tutores
- Notificaciones por correo electronico
- Seguimiento del estado de inscripcion
- Gestion centralizada de datos academicos

### 1.3 Requisitos del Sistema

- Navegador web actualizado (Chrome, Firefox, Edge, Safari)
- Conexion a Internet
- Correo electronico activo
- Matricula de estudiante o credenciales de personal

---

## 2. Acceso al Sistema

### 2.1 Pagina de Inicio de Sesion

Al acceder al sistema, vera la pantalla de inicio de sesion con dos opciones:

1. **Acceso para Alumnos** - Solo requiere matricula
2. **Acceso para Personal** - Requiere matricula y contrasena

### 2.2 Inicio de Sesion como Alumno

1. Seleccione la opcion "Alumno"
2. Ingrese su **matricula** (8 digitos)
3. Seleccione su **carrera** del menu desplegable
4. Haga clic en "Iniciar Sesion"

> **Nota:** Los alumnos no requieren contrasena. El sistema valida que la matricula corresponda a la carrera seleccionada.

### 2.3 Inicio de Sesion como Personal

1. Seleccione la opcion "Personal"
2. Ingrese su **matricula**
3. Ingrese su **contrasena**
4. Haga clic en "Iniciar Sesion"

> **Nota:** Si olvido su contrasena, contacte al Administrador General para recuperarla.

### 2.4 Cerrar Sesion

Para cerrar sesion de manera segura:

1. Haga clic en el boton "Cerrar Sesion" en la esquina superior derecha
2. Sera redirigido a la pagina de inicio de sesion

---

## 3. Manual del Alumno

### 3.1 Panel Principal

Al iniciar sesion, el alumno vera su panel con las siguientes opciones:

- **Seleccionar Materias** - Crear horario
- **Ver Horario** - Consultar horario generado
- **Estado de Inscripcion** - Ver validacion y comprobante

### 3.2 Seleccion de Materias

#### Paso 1: Acceder a Seleccion de Materias

1. Haga clic en "Seleccionar Materias" o acceda a `/horario-seleccion`

#### Paso 2: Visualizar Materias Disponibles

El sistema mostrara las materias disponibles para su carrera, organizadas por:

- Nombre de la materia
- Horario (dias y horas)
- Salon
- Grupo
- Docente asignado
- Cupo disponible

#### Paso 3: Seleccionar Materias

1. Revise las materias disponibles
2. Haga clic en el boton "Agregar" junto a cada materia que desea inscribir
3. El sistema validara automaticamente que no existan traslapes de horario
4. Si hay conflicto, se mostrara un mensaje de error

#### Paso 4: Revisar Seleccion

- En la parte derecha/inferior vera un resumen de las materias seleccionadas
- Puede eliminar materias haciendo clic en "Quitar"
- Verifique el total de horas seleccionadas (maximo segun configuracion del coordinador)

#### Paso 5: Guardar Horario

1. Una vez satisfecho con su seleccion, haga clic en "Guardar Horario"
2. El sistema generara un PDF con su horario provisional
3. Recibira un correo electronico con el PDF adjunto

> **Importante:** El horario guardado es PROVISIONAL hasta que su tutor lo apruebe.

### 3.3 Consultar Horario

1. Acceda a "Ver Horario" o `/validacion`
2. Vera su horario en formato de tabla semanal
3. Se muestra el estado actual de validacion:
   - **Pendiente** - Esperando revision del tutor
   - **Aprobado** - Tutor aprobo el horario
   - **Rechazado** - Tutor rechazo el horario (ver comentarios)

### 3.4 Estado de Validacion

#### Ver Estado

1. Acceda a "Estado de Inscripcion" o `/validacion-estatus`
2. Vera:
   - Estado del horario (Pendiente/Aprobado/Rechazado)
   - Comentarios del tutor (si los hay)
   - Estado del comprobante de pago

#### Si el Horario fue Rechazado

1. Lea los comentarios del tutor
2. Regrese a "Seleccionar Materias"
3. Modifique su seleccion segun las indicaciones
4. Guarde el nuevo horario

### 3.5 Subir Comprobante de Pago

Una vez que su horario sea aprobado (si esta habilitado por el coordinador):

#### Paso 1: Acceder a Comprobante

1. Vaya a "Estado de Inscripcion"
2. Busque la seccion "Comprobante de Pago"

#### Paso 2: Subir Archivo

1. Haga clic en "Seleccionar Archivo"
2. Elija su comprobante de pago en formato **PDF**
3. Haga clic en "Subir Comprobante"

#### Paso 3: Esperar Validacion

- El estado cambiara a "Pendiente de Validacion"
- Su tutor o coordinador revisara el comprobante
- Recibira notificacion cuando sea aceptado o rechazado

### 3.6 Estados del Comprobante

| Estado | Descripcion |
|--------|-------------|
| Sin subir | No ha subido comprobante |
| Pendiente | Comprobante subido, esperando validacion |
| Aceptado | Comprobante validado correctamente |
| Rechazado | Comprobante rechazado, debe subir otro |

---

## 4. Manual del Tutor

### 4.1 Panel Principal

Al iniciar sesion como tutor, vera:

- Lista de alumnos tutorados
- Horarios pendientes de validacion
- Comprobantes pendientes de revision

### 4.2 Ver Alumnos Asignados

1. En el panel principal vera la lista de sus tutorados
2. Por cada alumno se muestra:
   - Nombre
   - Matricula
   - Estado del horario
   - Estado del comprobante
3. Use los botones de accion para revisar cada alumno

### 4.3 Revisar Horario de Alumno

#### Paso 1: Seleccionar Alumno

1. Haga clic en "Revisar Horario" junto al alumno
2. Se abrira la vista de revision

#### Paso 2: Analizar Horario

Vera el horario del alumno con:

- Tabla semanal con materias y horarios
- Lista de materias seleccionadas
- Total de horas
- Informacion del alumno

#### Paso 3: Tomar Decision

**Para Aprobar:**
1. Verifique que el horario sea adecuado
2. Opcionalmente agregue un comentario
3. Haga clic en "Aprobar Horario"

**Para Rechazar:**
1. Escriba un comentario explicando el motivo del rechazo
2. Haga clic en "Rechazar Horario"
3. El alumno recibira notificacion con sus comentarios

### 4.4 Validar Comprobante de Pago

1. Haga clic en "Validar Pago" junto al alumno
2. Vera el comprobante PDF subido
3. Verifique que el comprobante sea valido
4. Haga clic en "Aceptar" o "Rechazar"

### 4.5 Enviar Retroalimentacion

Para comunicarse con un alumno:

1. Haga clic en "Enviar Correo" junto al alumno
2. Escriba su mensaje
3. Haga clic en "Enviar"
4. El alumno recibira el correo en su cuenta registrada

### 4.6 Boton de Actualizar

- Use el boton "Actualizar" para refrescar la lista de alumnos
- Util para ver cambios recientes sin recargar la pagina

---

## 5. Manual del Docente

### 5.1 Panel Principal

El docente tiene acceso a dos secciones principales:

- **Mis Alumnos** - Alumnos asignados (si es tutor)
- **Mis Materias** - Materias que imparte

### 5.2 Ver Mis Materias

1. Acceda a "Mis Materias" o `/docente/materias`
2. Vera una lista de las materias que le fueron asignadas
3. Por cada materia se muestra:
   - Nombre de la materia
   - Horario semanal
   - Salon asignado
   - Grupo
   - Cantidad de alumnos inscritos

### 5.3 Ver Lista de Alumnos por Materia

1. Haga clic en "Ver Alumnos" junto a una materia
2. Vera la lista completa de alumnos inscritos con:
   - Nombre
   - Matricula
   - Correo electronico
   - Telefono

### 5.4 Funciones de Tutor (si aplica)

Si el docente tambien tiene rol de tutor, tendra acceso a:

- Ver alumnos tutorados
- Revisar y validar horarios
- Validar comprobantes de pago

Consulte la seccion [Manual del Tutor](#4-manual-del-tutor) para estas funciones.

---

## 6. Manual del Coordinador

### 6.1 Panel Principal

El coordinador gestiona una carrera especifica. Su panel incluye:

- Gestion de Alumnos
- Gestion de Personal
- Gestion de Materias
- Configuracion de Tutores
- Validacion de Horarios

### 6.2 Gestion de Alumnos

#### Ver Lista de Alumnos

1. Acceda a "Alumnos" o `/coordinador/alumnos`
2. Vera todos los alumnos de su carrera
3. Puede filtrar por nombre, matricula o estado

#### Crear Alumno

1. Haga clic en "Crear Alumno"
2. Complete el formulario:
   - Matricula (obligatorio, unico)
   - Nombre completo
   - Correo electronico
   - Telefono
3. Haga clic en "Guardar"

#### Modificar Alumno

1. Haga clic en "Editar" junto al alumno
2. Modifique los campos necesarios
3. Haga clic en "Guardar Cambios"

#### Eliminar Alumno

1. Haga clic en "Eliminar" junto al alumno
2. Confirme la accion en el dialogo

#### Importar Alumnos (CSV)

1. Haga clic en "Importar CSV"
2. Seleccione un archivo CSV con el formato:
   ```
   matricula,nombre,correo,telefono
   12345678,Juan Perez,juan@email.com,4921234567
   ```
3. Haga clic en "Subir"

#### Exportar Alumnos (CSV)

1. Haga clic en "Exportar CSV"
2. Se descargara un archivo con todos los alumnos

### 6.3 Gestion de Personal

#### Ver Lista de Personal

1. Acceda a "Personal" o `/coordinador/personal`
2. Vera docentes, tutores y administradores de su carrera

#### Crear Personal

1. Haga clic en "Crear Personal"
2. Complete el formulario:
   - Matricula
   - Nombre
   - Contrasena
   - Roles (D=Docente, T=Tutor, A=Admin)
   - Correo
   - Telefono
3. Haga clic en "Guardar"

#### Asignar Roles

Un personal puede tener multiples roles:

- **D** - Docente (puede ver materias y alumnos)
- **T** - Tutor (puede validar horarios)
- **A** - Administrador (solo lectura)

### 6.4 Gestion de Materias

#### Ver Materias

1. Acceda a "Materias" o `/coordinador/materias`
2. Vera todas las materias de su carrera

#### Crear Materia

1. Haga clic en "Crear Materia"
2. Complete el formulario:
   - ID de materia
   - Nombre
   - Semestre
   - Horarios (por dia de la semana)
   - Salon
   - Grupo
   - Cupo maximo
   - Es laboratorio (Si/No)
   - Docente asignado
3. Haga clic en "Guardar"

#### Modificar Materia

1. Haga clic en "Editar" junto a la materia
2. Modifique los campos necesarios
3. Haga clic en "Guardar"

#### Importar/Exportar Materias

Similar a alumnos, puede importar y exportar materias en formato CSV.

### 6.5 Asignacion de Tutores

#### Acceder a Gestion de Tutores

1. Vaya a "Administrar Tutores" o `/coordinador/admin-tutor`

#### Asignar Tutor a Alumno

1. Seleccione un alumno de la lista
2. En el menu desplegable, seleccione el tutor
3. Haga clic en "Asignar"
4. El tutor recibira notificacion por correo

#### Cambiar Tutor

1. Busque el alumno en la lista
2. Seleccione un nuevo tutor
3. Haga clic en "Actualizar"

### 6.6 Configuracion de Carrera

#### Configurar Horas Maximas

1. En el panel de configuracion
2. Modifique el campo "Horas maximas de inscripcion"
3. Valor por defecto: 40 horas

#### Habilitar/Deshabilitar Comprobante de Pago

1. Active o desactive la opcion "Requerir comprobante de pago"
2. Si esta desactivado, los alumnos no necesitan subir comprobante

### 6.7 Validacion de Horarios

El coordinador puede validar horarios de cualquier alumno de su carrera:

1. Acceda a la lista de alumnos
2. Filtre por "Estado: Pendiente"
3. Haga clic en "Revisar Horario"
4. Apruebe o rechace segun corresponda

---

## 7. Manual del Coordinador General

### 7.1 Descripcion del Rol

El Coordinador General tiene acceso a **TODAS las carreras** de la facultad. Puede realizar todas las funciones de un coordinador regular pero sin restriccion de carrera.

### 7.2 Panel Principal

Su panel incluye:

- Selector de carrera (para filtrar)
- Gestion de Alumnos (todas las carreras)
- Gestion de Personal (todas las carreras)
- Gestion de Materias (todas las carreras)
- Historial Academico

### 7.3 Filtrar por Carrera

1. Use el selector de carrera en la parte superior
2. Seleccione la carrera que desea gestionar
3. La lista se filtrara automaticamente

### 7.4 Gestion de Historial Academico

#### Acceder al Historial

1. Vaya a "Historial Academico" o `/coord-gen/historial-academico`

#### Ver Historiales Anteriores

1. Vera una lista de semestres archivados
2. Cada entrada muestra:
   - Semestre (ej: "2025-1")
   - Fecha de generacion
   - Archivos disponibles

#### Descargar Archivos

1. Haga clic en "Descargar" junto al archivo deseado:
   - Alumnos (CSV)
   - Materias (CSV)
   - Personal (CSV)

#### Configurar Fecha de Borrado

1. En la seccion "Configuracion"
2. Seleccione la fecha de borrado del semestre actual
3. Haga clic en "Guardar"

> **Importante:** En la fecha configurada, el sistema automaticamente:
> - Exportara todos los datos a CSV
> - Borrara alumnos, materias y personal (excepto CG y AG)
> - Creara un registro en el historial

#### Generar Historial Manualmente

1. Haga clic en "Generar Historial"
2. Ingrese el nombre del semestre (ej: "2025-2")
3. Confirme la accion

### 7.5 Operaciones Masivas

El Coordinador General puede:

- Vaciar base de datos de alumnos
- Vaciar base de datos de materias
- Vaciar base de datos de personal

> **Advertencia:** Estas acciones son irreversibles. Siempre genere un historial antes de vaciar datos.

---

## 8. Manual del Administrador General

### 8.1 Descripcion del Rol

El Administrador General tiene acceso de **solo lectura** a todos los datos de todas las carreras. No puede modificar datos, pero si puede:

- Visualizar toda la informacion
- Descargar reportes en CSV
- Recuperar contrasenas de usuarios

### 8.2 Panel Principal

Su panel incluye:

- Vista de Alumnos (todas las carreras)
- Vista de Personal (todas las carreras)
- Vista de Materias (todas las carreras)
- Recuperacion de Contrasenas

### 8.3 Consultar Datos

#### Ver Alumnos

1. Acceda a "Alumnos" o `/admin-gen/alumnos`
2. Vera todos los alumnos de todas las carreras
3. Puede filtrar por carrera, nombre o matricula
4. Use "Exportar CSV" para descargar la informacion

#### Ver Personal

1. Acceda a "Personal" o `/admin-gen/personal`
2. Vera todo el personal de todas las carreras
3. Puede filtrar y exportar

#### Ver Materias

1. Acceda a "Materias" o `/admin-gen/materias`
2. Vera todas las materias de todas las carreras
3. Puede filtrar y exportar

### 8.4 Recuperacion de Contrasenas

Cuando un usuario olvida su contrasena:

1. El usuario debe contactar al Administrador General
2. Acceda a la seccion de Personal
3. Busque al usuario por matricula
4. Haga clic en "Recuperar Contrasena"
5. El sistema enviara la contrasena al correo registrado

> **Nota:** Por seguridad, las contrasenas estan encriptadas. El sistema genera una nueva contrasena temporal.

### 8.5 Reportes

El Administrador General puede generar reportes de:

- Alumnos por carrera
- Personal por carrera
- Materias por carrera
- Alumnos con horario pendiente
- Alumnos con comprobante pendiente

Para generar un reporte:

1. Aplique los filtros deseados
2. Haga clic en "Exportar CSV"
3. El archivo se descargara automaticamente

---

## 9. Preguntas Frecuentes

### General

**P: El sistema no carga o muestra errores**
R: Intente las siguientes soluciones:
1. Recargue la pagina (F5)
2. Limpie la cache del navegador
3. Intente con otro navegador
4. Verifique su conexion a Internet

**P: Mi sesion expiro**
R: Las sesiones tienen una duracion limitada por seguridad:
- Alumnos: 30 minutos
- Personal: 1 hora
Simplemente vuelva a iniciar sesion.

### Alumnos

**P: No puedo seleccionar una materia**
R: Puede deberse a:
- La materia no tiene cupo disponible
- Hay conflicto de horario con otra materia seleccionada
- La materia no corresponde a su carrera

**P: Mi horario fue rechazado, que hago?**
R:
1. Revise los comentarios del tutor
2. Vaya a "Seleccionar Materias"
3. Modifique su horario segun las indicaciones
4. Guarde el nuevo horario

**P: No puedo subir mi comprobante de pago**
R: Verifique que:
- El archivo sea formato PDF
- El tamano no exceda el limite
- Su horario este aprobado primero

**P: No recibo el correo con mi horario**
R:
1. Revise su carpeta de spam/correo no deseado
2. Verifique que su correo este correctamente registrado
3. Contacte a su coordinador

### Personal

**P: Olvide mi contrasena**
R: Contacte al Administrador General para recuperarla.

**P: No veo todos mis alumnos/materias**
R: Verifique que:
- Esta viendo la carrera correcta
- Los alumnos/materias estan registrados en el sistema
- Use el boton "Actualizar" para refrescar la lista

**P: Un alumno no aparece en mi lista de tutorados**
R: El coordinador debe asignarle el alumno como tutorado.

### Coordinadores

**P: Como asigno un docente a una materia?**
R:
1. Vaya a "Materias"
2. Edite la materia deseada
3. Seleccione el docente del menu
4. Guarde los cambios

**P: El archivo CSV no se importa correctamente**
R: Verifique que:
- El formato sea CSV (separado por comas)
- Los encabezados coincidan con los esperados
- No haya caracteres especiales en los datos
- El archivo use codificacion UTF-8

---

## Soporte Tecnico

Si tiene problemas que no puede resolver:

1. Contacte a su coordinador de carrera
2. Si es coordinador, contacte al Coordinador General
3. Para problemas tecnicos, contacte al area de sistemas

**Informacion de contacto:**
- Facultad de Ingenieria Electronica
- Universidad Autonoma de Zacatecas

---

*Manual de Usuario - Version 2.0*
*Ultima actualizacion: Enero 2026*
