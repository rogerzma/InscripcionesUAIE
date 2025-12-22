const { Parser } = require('json2csv');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Alumno = require('../models/Alumno');
const Horario = require('../models/Horario');
const Materia = require('../models/Materia');
const Personal = require('../models/Personal');
const Tutor = require('../models/Tutores');
const Docente = require('../models/Docentes');
const Coordinador = require('../models/Coordinadores');
const Administrador = require('../models/Administradores');
const generarPDFHorario = require('../utils/pdfHorario');
const { enviarCorreoConPDF, notificarAlumnoConTutorAsignado } = require('../utils/email');


// Configurar multer para manejar el archivo CSV
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // El archivo se guardará en la carpeta "uploads"
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombrar el archivo con el timestamp
  },
});

const upload = multer({ storage: storage });

exports.upload = upload;


// Función para asignar un alumno a un tutor
const asignarAlumnoATutor = async (tutorId, alumnoId) => {
  try {
    const tutorAsignado = await Personal.findById(tutorId);
    if (!tutorAsignado) {
      return;
    }

    const TutorModel = await Tutor.findOne({ personalMatricula: tutorAsignado.matricula });
    const DocenteModel = await Docente.findOne({ personalMatricula: tutorAsignado.matricula });
    const CoordinadorModel = await Coordinador.findOne({ personalMatricula: tutorAsignado.matricula });
    const AdministradorModel = await Administrador.findOne({ personalMatricula: tutorAsignado.matricula });

    if (TutorModel && !TutorModel.alumnos.includes(alumnoId)) { // verifica si el alumno ya está en la lista
      TutorModel.alumnos.push(alumnoId);
      await TutorModel.save();
    }
    if (DocenteModel && !DocenteModel.alumnos.includes(alumnoId)) { // verifica si el alumno ya está en la lista
      DocenteModel.alumnos.push(alumnoId);
      await DocenteModel.save();
    }
    if (CoordinadorModel && !CoordinadorModel.alumnos.includes(alumnoId)) { // verifica si el alumno ya está en la lista
      CoordinadorModel.alumnos.push(alumnoId);
      await CoordinadorModel.save();
    }
    if (AdministradorModel && !AdministradorModel.alumnos.includes(alumnoId)) { // verifica si el alumno ya está en la lista
      AdministradorModel.alumnos.push(alumnoId);
      await AdministradorModel.save();
    }
  } catch (error) {
    console.error('Error al asignar el alumno al tutor:', error);
  }
};


// Crear un nuevo alumno
exports.createAlumno = async (req, res) => {
  const { matricula, nombre, telefono, correo, tutor, matriculaCord } = req.body;

  try {
    // Validar formato de matrícula (1 letra mayúscula + 4 dígitos)
    if (!matricula || !/^[A-Z]\d{4}$/.test(matricula)) {
      return res.status(400).json({ 
        message: 'La matrícula debe tener el formato: 1 letra mayúscula seguida de 4 dígitos (Ej: A1234)' 
      });
    }

    // Buscar al coordinador por su id
    const coordinador = await Coordinador.findOne({ personalMatricula: matriculaCord });
    if (!coordinador) {
      return res.status(404).json({ message: 'Coordinador no encontrado' });
    }

    // Crear un nuevo alumno
    const id_carrera = coordinador.id_carrera;
    const horario = null; // El horario se asignará después
    // Solo asignar tutor si fue proporcionado
    const alumnoData = { id_carrera, matricula, nombre, telefono, correo, horario };
    if (tutor) {
      alumnoData.tutor = tutor;
    }
    const newAlumno = new Alumno(alumnoData);
    await newAlumno.save();

      
    // Asignar el alumno al tutor solo si hay un tutor
    if (tutor) {
      await asignarAlumnoATutor(tutor, newAlumno._id);
      
      //Enviar correo al alumno
      const tutorInfo = await Personal.findById(tutor);
      if (tutorInfo && correo) {
        await notificarAlumnoConTutorAsignado(
          correo,
          nombre,
          tutorInfo.nombre,
          tutorInfo.correo
        );
      }
    }

    res.status(201).json(newAlumno);
  } catch (error) {
    console.error('Error al crear el alumno:', error);
    
    // Errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const camposFaltantes = Object.keys(error.errors).map(campo => {
        switch(campo) {
          case 'matricula': return 'matrícula';
          case 'nombre': return 'nombre';
          case 'correo': return 'correo electrónico';
          case 'telefono': return 'teléfono';
          case 'id_carrera': return 'carrera';
          default: return campo;
        }
      });
      return res.status(400).json({ 
        message: `Falta el campo: ${camposFaltantes.join(', ')}`,
        campos: camposFaltantes 
      });
    }
    
    // Error de duplicado
    if (error.code === 11000) {
      const campoDuplicado = Object.keys(error.keyValue)[0];
      const nombreCampo = campoDuplicado === 'matricula' ? 'matrícula' : campoDuplicado;
      return res.status(409).json({ 
        message: `El ${nombreCampo} ya existe en el sistema`,
        duplicado: campoDuplicado 
      });
    }
    
    res.status(500).json({ message: 'Error al crear el alumno', error });
  }
};

// Obtener todos los alumnos
exports.getAlumnos = async (req, res) => {
  try {
    const alumnos = await Alumno.find();
    res.status(200).json(alumnos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener alumnos', error });
  }
};
// Obtener los alumnos de una carrera específica (administradores)
exports.getAlumnosCarreraAdmin = async (req, res) => {

  try {
    const { matricula } = req.params;


      const personal = await Administrador.findOne({ personalMatricula: matricula });
      if (personal) {
      } else {
        return res.status(404).json({ message: 'No se encontró un administrador con esa matrícula.' });
      }
    

      // Obtener el id_carrera del personal encontrado
      const carrera = personal.id_carrera;

      // Buscar alumnos por la carrera obtenida
      const alumnos = await Alumno.find({ id_carrera: carrera });

      res.status(200).json(alumnos);

    } catch (error) {
      console.error('Error al obtener alumnos de la carrera:', error);
      res.status(500).json({ message: 'Error al obtener alumnos de la carrera', error });
    }
  };

  // Obtener los alumnos de una carrera específica
exports.getAlumnosCarrera = async (req, res) => {

  try {
    const { matricula } = req.params;


      const personal = await Coordinador.findOne({ personalMatricula: matricula });
      if (personal) {
      } else {
        return res.status(404).json({ message: 'No se encontró un coordinador con esa matrícula.' });
      }
    
    

      // Obtener el id_carrera del personal encontrado
      const carrera = personal.id_carrera;

      // Buscar alumnos por la carrera obtenida
      const alumnos = await Alumno.find({ id_carrera: carrera });

      res.status(200).json(alumnos);

    } catch (error) {
      console.error('Error al obtener alumnos de la carrera:', error);
      res.status(500).json({ message: 'Error al obtener alumnos de la carrera', error });
    }
  };


// Ruta para obtener los alumnos de un tutor específico
exports.getAlumnosAsignados = async (req, res) => {
  const { matricula } = req.params;
  try {

    // Buscar al tutor directamente por matrícula
    const personal = await Personal.findOne({ matricula: matricula });

    if (!personal) {
      return res.status(404).json({ message: "personal no encontrado" });
    }

    let alumnosIds = [];

    if (personal.roles == 'T') {
      const tutor = await Tutor.findOne({ personalMatricula: matricula });
      if (!tutor) {
        return res.status(404).json({ message: "Tutor no encontrado" });
      }
      alumnosIds = tutor.alumnos;

    } else if (personal.roles == 'D') {
      const docente = await Docente.findOne({ personal: matricula });
      if (!docente) {
        return res.status(404).json({ message: "Docente no encontrado" });
      }
      alumnosIds = docente.alumnos;

    } else if (personal.roles == 'C') {
      const coordinador = await Coordinador.findOne({ personalMatricula: matricula });
      if (!coordinador) {
        return res.status(404).json({ message: "Coordinador no encontrado" });
      }
      alumnosIds = coordinador.alumnos;

    } else {
      return res.status(400).json({ message: "Rol no válido" });
    }

    // Obtener los detalles completos de los alumnos
    const alumnos = await Alumno.find({ _id: { $in: alumnosIds } });

    res.status(200).json(alumnos);
  } catch (error) {
    console.error("Error al obtener los alumnos del tutor:", error);
    res.status(500).json({ message: "Error al obtener los alumnos del tutor" });
  }
};


// Obtener un alumno por ID
exports.getAlumnoById = async (req, res) => {
  try {
    const alumno = await Alumno.findById(req.params.id);
    if (!alumno) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }
    res.status(200).json(alumno);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el alumno', error });
  }
};

// Obtener un alumno por matrícula
exports.getAlumnoByMatricula = async (req, res) => {
  try {
    const { matricula } = req.params;
    const alumno = await Alumno.findOne({ matricula });
    if (!alumno) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }
    res.status(200).json(alumno);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el alumno', error });
  }
};

// Obtener los datos de un alumno, incluyendo su horario
exports.getAlumnoByIdWithHorario = async (req, res) => {
  try {
    const alumno = await Alumno.findById(req.params.id).populate('horario');
    if (!alumno) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }
    res.json(alumno);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el alumno con horario', error });
  }
};

// Actualizar un alumno
exports.updateAlumno = async (req, res) => {
  const { matricula, nombre, correo, telefono, materiasSeleccionadas, tutor } = req.body;

  try {
    let horarioGuardado = null;

    let alumno = await Alumno.findById(req.params.id);
    if (!alumno) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }

    // Eliminar al alumno del tutor anterior
    if (alumno && alumno.tutor) {
      const tutorAnteriorAsignado = await Personal.findById(alumno.tutor);
      if (tutorAnteriorAsignado) {
        const TutorModel = await Tutor.findOne({ personalMatricula: tutorAnteriorAsignado.matricula });
        const DocenteModel = await Docente.findOne({ personalMatricula: tutorAnteriorAsignado.matricula });
        const CoordinadorModel = await Coordinador.findOne({ personalMatricula: tutorAnteriorAsignado.matricula });
        const AdministradorModel = await Administrador.findOne({ personalMatricula: tutorAnteriorAsignado.matricula });

        if (TutorModel) {
          TutorModel.alumnos = TutorModel.alumnos.filter(alumnoId => alumnoId.toString() !== alumno._id.toString());
          await TutorModel.save();
        }
        if (DocenteModel) {
          DocenteModel.alumnos = DocenteModel.alumnos.filter(alumnoId => alumnoId.toString() !== alumno._id.toString());
          await DocenteModel.save();
        }
        if (CoordinadorModel) {
          CoordinadorModel.alumnos = CoordinadorModel.alumnos.filter(alumnoId => alumnoId.toString() !== alumno._id.toString());
          await CoordinadorModel.save();
        }
        if (AdministradorModel) {
          AdministradorModel.alumnos = AdministradorModel.alumnos.filter(alumnoId => alumnoId.toString() !== alumno._id.toString());
          await AdministradorModel.save();
        }
      }
    }

    // Solo procesar nuevo tutor si se proporciona un ID válido
    let tutorAsignado = null;
    if (tutor && tutor !== '') {
      // Buscar el nuevo tutor
      tutorAsignado = await Personal.findById(tutor);
      if (!tutorAsignado) {
        return res.status(404).json({ message: 'Tutor no encontrado' });
      }

      // Buscar el tutor en las colecciones Tutor, Docente y Coordinador
      const TutorModel = await Tutor.findOne({ personalMatricula: tutorAsignado.matricula });
      const DocenteModel = await Docente.findOne({ personalMatricula: tutorAsignado.matricula });
      const CoordinadorModel = await Coordinador.findOne({ personalMatricula: tutorAsignado.matricula });
      const AdministradorModel = await Administrador.findOne({ personalMatricula: tutorAsignado.matricula });

      // Agregar el alumno al nuevo tutor
      if (TutorModel) {
        TutorModel.alumnos.push(alumno._id);
        await TutorModel.save();
      }
      if (DocenteModel) {
        DocenteModel.alumnos.push(alumno._id);
        await DocenteModel.save();
      }
      if (CoordinadorModel) {
        CoordinadorModel.alumnos.push(alumno._id);
        await CoordinadorModel.save();
      }
      if (AdministradorModel) {
        AdministradorModel.alumnos.push(alumno._id);
        await AdministradorModel.save();
      }
    }

    // Actualizar el alumno con los nuevos datos
    const updateData = {
      matricula,
      nombre,
      correo,
      telefono,
      ...(horarioGuardado ? { horario: horarioGuardado._id } : {}),
    };
    
    // Solo agregar tutor si es un valor válido
    if (tutor && tutor !== '') {
      updateData.tutor = tutor;
    } else {
      updateData.tutor = null;
    }

    const alumnoActualizado = await Alumno.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!alumnoActualizado) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }

    if (tutorAsignado && correo) {
      await notificarAlumnoConTutorAsignado(
        correo,
        nombre,
        tutorAsignado.nombre,
        tutorAsignado.correo
      );
    }

    return res.status(200).json(alumnoActualizado);
  } catch (error) {
    console.error('Error al actualizar el alumno:', error);
    
    // Errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const camposFaltantes = Object.keys(error.errors).map(campo => {
        switch(campo) {
          case 'matricula': return 'matrícula';
          case 'nombre': return 'nombre';
          case 'correo': return 'correo electrónico';
          case 'telefono': return 'teléfono';
          default: return campo;
        }
      });
      return res.status(400).json({ 
        message: `Falta el campo: ${camposFaltantes.join(', ')}`,
        campos: camposFaltantes 
      });
    }
    
    return res.status(500).json({ message: 'Error al actualizar el alumno', error });
  }
};

// Actualizar un alumno con horario
exports.updateAlumnoHorario = async (req, res) => {
  const { correo, telefono, materiasSeleccionadas } = req.body;

  try {
    let alumno = await Alumno.findById(req.params.id);
    if (!alumno) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }

    // Crear un nuevo horario con la lista de materias seleccionadas
    const nuevoHorario = new Horario({
      materias: materiasSeleccionadas
    });


    for (const materiaId of materiasSeleccionadas) {
      // Buscar la materia por su ID
      const materia = await Materia.findById(materiaId);
    
      // Verificar si la materia existe
      if (materia) {
        // Asegurarse de que el campo 'alumnos' esté inicializado como un array
        if (!Array.isArray(materia.alumnos)) {
          materia.alumnos = []; // Inicializar como un array vacío si no existe
        }
    
        if(materia.cupo > 0){
        // Agregar el ID del alumno al array de alumnos de la materia
        materia.alumnos.push(alumno._id);
        }

        //Quitar 1 del cupo de la materia de cada materia
        if (materia.cupo > 0) {
          materia.cupo = materia.cupo - 1;
        } else {
          console.warn(`Materia con ID ${materiaId} sin cupo`);
          return res.status(500).json({ message: 'Materia sin cupo', error });
        }
        await materia.save(); // Guardar los cambios en la base de datos
      } else {
        console.warn(`Materia con ID ${materiaId} no encontrada`);
      }
    }

    // Guardar el nuevo horario en la base de datos
    const horarioGuardado = await nuevoHorario.save();

    // Actualizar el alumno con los nuevos datos
    alumno.correo = correo || alumno.correo;
    alumno.telefono = telefono || alumno.telefono;
    alumno.horario = horarioGuardado._id;

    const alumnoActualizado = await alumno.save();

    const carrerasPermitidas = {
      ISftw: "Ing. en Software",
      IDsr: "Ing. en Desarrollo",
      IEInd: "Ing. Electrónica Industrial",
      ICmp: "Ing. Computación",
      IRMca: "Ing. Robótica y Mecatrónica",
      IElec: "Ing. Electricista",
      ISftwS: "Ing. en Software (Semiescolarizado)",
      IDsrS: "Ing. en Desarrollo (Semiescolarizado)",
      IEIndS: "Ing. Electrónica Industrial (Semiescolarizado)",
      ICmpS: "Ing. Computación (Semiescolarizado)",
      IRMcaS: "Ing. Robótica y Mecatrónica (Semiescolarizado)",
      IElecS: "Ing. Electricista (Semiescolarizado)",
    };

    // Obtener datos detallados de las materias
    const materias = await Materia.find({ _id: { $in: materiasSeleccionadas } });

    const carreraNombre = carrerasPermitidas[alumno.id_carrera] || 'Carrera no encontrada';
    // Generar PDF y enviar por correo
    const pdfBuffer = await generarPDFHorario(alumno.nombre, carreraNombre, materias);
    await enviarCorreoConPDF(alumno.correo, pdfBuffer, alumno.nombre);

    return res.status(200).json(alumnoActualizado);
  } catch (error) {
    console.error('Error al actualizar el alumno con horario:', error);
    return res.status(500).json({ message: 'Error al actualizar el alumno con horario', error });
  }
};

// Eliminar un alumno
exports.deleteAlumno = async (req, res) => {
  try {
    const alumno = await Alumno.findById(req.params.id);
    if (!alumno) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }
    // Eliminar el horario del alumno si no es nulo
    if (alumno.horario) {
      await Horario.findByIdAndDelete(alumno.horario);
    }

    // Eliminar el ID del alumno de la lista de alumnos del tutor asignado
    if (alumno.tutor) {
      const tutorAsignado = await Personal.findById(alumno.tutor);
      if (tutorAsignado) {
        const TutorModel = await Tutor.findOne({ personalMatricula: tutorAsignado.matricula });
        const DocenteModel = await Docente.findOne({ personalMatricula: tutorAsignado.matricula });
        const CoordinadorModel = await Coordinador.findOne({ personalMatricula: tutorAsignado.matricula });
        const AdministradorModel = await Administrador.findOne({ personalMatricula: tutorAsignado.matricula });

        if (TutorModel) {
          TutorModel.alumnos = TutorModel.alumnos.filter(alumnoId => alumnoId.toString() !== alumno._id.toString());
          await TutorModel.save();
        }
        if (DocenteModel) {
          DocenteModel.alumnos = DocenteModel.alumnos.filter(alumnoId => alumnoId.toString() !== alumno._id.toString());
          await DocenteModel.save();
        }
        if (CoordinadorModel) {
          CoordinadorModel.alumnos = CoordinadorModel.alumnos.filter(alumnoId => alumnoId.toString() !== alumno._id.toString());
          await CoordinadorModel.save();
        }
        if (AdministradorModel) {
          AdministradorModel.alumnos = AdministradorModel.alumnos.filter(alumnoId => alumnoId.toString() !== alumno._id.toString());
          await AdministradorModel.save();
        }
      }
    }

    //Eliminar el id del alumno de las materias que lo tienen en su array de alumnos
    const materias = await Materia.find({ alumnos: alumno._id });
    for (const materia of materias) {
      materia.alumnos = materia.alumnos.filter(alumnoId => alumnoId.toString() !== alumno._id.toString());
      //Aumentar en 1 el cupo de la materia
      materia.cupo = materia.cupo + 1;
      await materia.save();
    }

    // Eliminar el alumno
    await Alumno.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: 'Alumno eliminado' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error al eliminar el alumno', error });
  }
};

// Función para eliminar al alumno del tutor anterior si este se cambia
const eliminarAlumnoDeTutor = async (tutorId, alumnoId) => {
  try {
    const tutor = await Personal.findById(tutorId);
    if (!tutor) return;

    const roles = ["Tutor", "Docente", "Coordinador", "Administrador"];
    const modelos = [Tutor, Docente, Coordinador, Administrador];

    for (let i = 0; i < modelos.length; i++) {
      const modelo = modelos[i];
      const instancia = await modelo.findOne({ personalMatricula: tutor.matricula });
      if (instancia && instancia.alumnos.includes(alumnoId)) {
        instancia.alumnos = instancia.alumnos.filter(id => id.toString() !== alumnoId.toString());
        await instancia.save();
      }
    }
  } catch (error) {
    console.error('Error al eliminar el alumno del tutor anterior:', error);
  }
};

// Subir CSV de alumnos (coordinador general)
exports.subirAlumnosCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha enviado ningún archivo CSV' });
  }

  const results = [];
  const alumnosRechazados = [];

  // Carreras válidas (debe coincidir con las permitidas en frontend)
  const carrerasPermitidas = {
    ISftw: "Ing. en Software",
    IDsr: "Ing. en Desarrollo",
    IEInd: "Ing. Electrónica Industrial",
    ICmp: "Ing. Computación",
    IRMca: "Ing. Robótica y Mecatrónica",
    IElec: "Ing. Electricista",
    ISftwS: "Ing. en Software (Semiescolarizado)",
    IDsrS: "Ing. en Desarrollo (Semiescolarizado)",
    IEIndS: "Ing. Electrónica Industrial (Semiescolarizado)",
    ICmpS: "Ing. Computación (Semiescolarizado)",
    IRMcaS: "Ing. Robótica y Mecatrónica (Semiescolarizado)",
    IElecS: "Ing. Electricista (Semiescolarizado)",
  };

  fs.createReadStream(req.file.path, { encoding: "utf-8" })
    .pipe(csv())
    .on("data", (data) => {
      const cleanedData = {};
      Object.keys(data).forEach((key) => {
        cleanedData[key.replace(/"/g, "").trim()] = data[key];
      });
      results.push(cleanedData);
    })
    .on("end", async () => {
      try {
        if (results.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: "El archivo CSV está vacío" });
        }

        // Solo considerar matrículas válidas para eliminar
        const matriculasCSV = results.map(a => a.matricula?.toString().trim()).filter(Boolean);

        for (const alumnoData of results) {
          let { id_carrera, matricula, nombre, telefono, correo, matricula_tutor } = alumnoData;

          matricula = matricula?.toString().trim();
          id_carrera = id_carrera?.toString().trim();

          // Validar datos obligatorios
          if (!matricula || !id_carrera) {
            alumnosRechazados.push({ matricula, motivo: "Faltan datos obligatorios" });
            continue;
          }

          // Validar carrera permitida
          if (!carrerasPermitidas[id_carrera]) {
            alumnosRechazados.push({ matricula, motivo: `id_carrera inválido (${id_carrera})` });
            continue;
          }

          const alumnoExistente = await Alumno.findOne({ matricula });

          // No permitir cambio de carrera
          if (alumnoExistente && alumnoExistente.id_carrera !== id_carrera) {
            alumnosRechazados.push({
              matricula,
              motivo: `No se permite cambiar id_carrera (${alumnoExistente.id_carrera} → ${id_carrera})`
            });
            continue;
          }

          // Buscar nuevo tutor
          let nuevoTutorId = null;
          if (matricula_tutor) {
            const nuevoTutor = await Personal.findOne({ matricula: matricula_tutor.trim() });
            if (nuevoTutor) {
              nuevoTutorId = nuevoTutor._id;
            }
          }

          // Si existe, comparar campos y solo actualizar si hay cambios
          if (alumnoExistente) {
            const cambios = [];
            if (alumnoExistente.nombre !== nombre) cambios.push('nombre');
            if (alumnoExistente.telefono !== telefono) cambios.push('telefono');
            if (alumnoExistente.correo !== correo) cambios.push('correo');
            if ((alumnoExistente.tutor?.toString() || null) !== (nuevoTutorId?.toString() || null)) cambios.push('tutor');

            if (cambios.length > 0) {
              // Eliminar del tutor anterior si es distinto
              if (alumnoExistente.tutor && alumnoExistente.tutor.toString() !== (nuevoTutorId?.toString() || null)) {
                await eliminarAlumnoDeTutor(alumnoExistente.tutor, alumnoExistente._id);
              }
              // Actualizar solo si hay cambios
              await Alumno.findOneAndUpdate(
                { matricula },
                { nombre, telefono, correo, id_carrera, tutor: nuevoTutorId },
                { new: true }
              );
              // Asignar alumno al nuevo tutor
              if (nuevoTutorId && alumnoExistente._id) {
                await asignarAlumnoATutor(nuevoTutorId, alumnoExistente._id);
              }
            }
            // Si no hay cambios, no hacer nada
            continue;
          }

          // Si no existe, crear nuevo
          const alumnoNuevo = await Alumno.findOneAndUpdate(
            { matricula },
            { nombre, telefono, correo, id_carrera, tutor: nuevoTutorId },
            { upsert: true, new: true }
          );
          if (nuevoTutorId && alumnoNuevo?._id) {
            await asignarAlumnoATutor(nuevoTutorId, alumnoNuevo._id);
          }
        }

        // Eliminar alumnos que ya no están en el CSV
        await Alumno.deleteMany({ matricula: { $nin: matriculasCSV } });

        fs.unlinkSync(req.file.path);
        res.status(200).json({
          message: 'Base de datos de alumnos actualizada con éxito desde el archivo CSV',
          rechazados: alumnosRechazados
        });

      } catch (error) {
        console.error('❌ Error al procesar el CSV:', error);
        res.status(500).json({ message: 'Error al actualizar la base de datos desde el CSV', error });
      }
    })
    .on("error", (err) => {
      console.error("❌ Error al leer el CSV:", err);
      res.status(500).json({ message: "Error al procesar el archivo CSV", error: err });
    });
};


exports.exportarAlumnosCSV = async (req, res) => {
  try {
    const alumnos = await Alumno.find();

    if (alumnos.length === 0) {
      return res.status(404).json({ message: "No hay alumnos registrados" });
    }

    // Obtener IDs de tutores únicos
    const tutoresIds = alumnos.map(a => a.tutor).filter(Boolean);
    const tutores = await Personal.find({ _id: { $in: tutoresIds } });

    // Crear mapa tutorId => matricula
    const mapTutorMatricula = {};
    tutores.forEach(t => {
      mapTutorMatricula[t._id] = t.matricula;
    });

    const formattedData = alumnos.map(a => ({
      id_carrera: a.id_carrera,
      matricula: a.matricula,
      nombre: a.nombre,
      telefono: a.telefono,
      correo: a.correo,
      matricula_tutor: mapTutorMatricula[a.tutor] || ""
    }));

    const fields = ['id_carrera', 'matricula', 'nombre', 'matricula_tutor', 'telefono', 'correo'];
    const json2csvParser = new Parser({ fields });
    let csv = json2csvParser.parse(formattedData);

    // Añadir BOM para Excel
    csv = "\ufeff" + csv;

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment("alumnos.csv");
    res.send(csv);
  } catch (error) {
    console.error("Error al exportar CSV general:", error);
    res.status(500).json({ message: "Error al exportar a CSV", error });
  }
};

//Obtener el estatus del horario del alumno
exports.getEstatusHorario = async (req, res) => {
  try {
    const { matricula } = req.params;
    const alumno = await Alumno.findOne({ matricula }); 
    if (!alumno) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }
    const horario = await Horario.findById(alumno.horario);
    if (!horario) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }
    res.status(200).json(horario.estatus);
  }
  catch (error) {
    console.error('Error al obtener el estatus del horario:', error);
    res.status(500).json({ message: 'Error al obtener el estatus del horario', error });
  }
}

exports.exportarAlumnosCSVPorCarrera = async (req, res) => {
  try {
    const { id_carrera } = req.params;
    if (!id_carrera) return res.status(400).json({ message: "Se requiere el id_carrera" });

    const alumnos = await Alumno.find({ id_carrera });

    if (alumnos.length === 0) {
      return res.status(404).json({ message: "No hay alumnos registrados para esta carrera" });
    }

    // Obtener tutores para incluir la matrícula del tutor
    const tutoresIds = alumnos.map(a => a.tutor).filter(Boolean);
    const tutores = await Personal.find({ _id: { $in: tutoresIds } });
    const mapTutorMatricula = {};
    tutores.forEach(t => {
      mapTutorMatricula[t._id] = t.matricula;
    });

    const formattedData = alumnos.map((a) => ({
      matricula: a.matricula,
      nombre: a.nombre,
      telefono: a.telefono,
      correo: a.correo,
      matricula_tutor: mapTutorMatricula[a.tutor] || "" // incluir solo la matrícula
    }));

    const fields = ["matricula", "nombre", "matricula_tutor", "telefono", "correo"];
    const json2csvParser = new Parser({ fields });
    let csv = json2csvParser.parse(formattedData);

    csv = "\ufeff" + csv; // BOM para Excel

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`alumnos_carrera_${id_carrera}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Error al exportar CSV por carrera:", error);
    res.status(500).json({ message: "Error al exportar CSV", error });
  }
};

 
 // Exportar CSV con filtros aplicados
  exports.exportarAlumnosCSVFiltrado = async (req, res) => {
    try {
      const { matriculas } = req.body;

      if (!matriculas || !Array.isArray(matriculas) || matriculas.length === 0) {
        return res.status(400).json({ message: "Se requiere un array de matrículas para exportar." });
      }

      const alumnos = await require("../models/Alumno").find({
        matricula: { $in: matriculas }
      }).populate("tutor");

      if (alumnos.length === 0) {
        return res.status(404).json({ message: "No se encontraron alumnos para exportar." });
      }

      const formattedData = alumnos.map((alumno) => ({
        matricula: alumno.matricula,
        nombre: alumno.nombre,
        id_carrera: alumno.id_carrera,
        grupo: alumno.grupo,
        correo: alumno.correo || "Sin correo",
        telefono: alumno.telefono || "Sin teléfono",
        tutor: alumno.tutor?.nombre || "Sin asignar",
        estatusHorario: alumno.estatusHorario || "Sin estatus",
        estatusComprobante: alumno.estatusComprobante || "Sin comprobante"
      }));

      const fields = [
        "matricula", "nombre", "id_carrera", "grupo",
        "correo", "telefono", "tutor",
        "estatusHorario", "estatusComprobante"
      ];

      const json2csvParser = new Parser({ fields });
      const csv = "\ufeff" + json2csvParser.parse(formattedData);

      res.header("Content-Type", "text/csv; charset=utf-8");
      res.attachment("alumnos_filtrados.csv");
      res.send(csv);
    } catch (error) {
      console.error("❌ Error al exportar alumnos filtrados:", error);
      res.status(500).json({ message: "Error al exportar CSV de alumnos filtrados", error });
    }
  };

exports.exportarAlumnosCSVPorCarreraFiltrados = async (req, res) => {
  try {
    const { id_carrera } = req.params;
    const { ids } = req.body; // Array de IDs de alumnos filtrados

    if (!id_carrera || !ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Se requiere el id_carrera y un array de IDs" });
    }

    const alumnos = await Alumno.find({ id_carrera, _id: { $in: ids } });

    if (alumnos.length === 0) {
      return res.status(404).json({ message: "No hay alumnos registrados para esta carrera con esos filtros" });
    }

    const formattedData = alumnos.map((a) => ({
      matricula: a.matricula,
      nombre: a.nombre,
      telefono: a.telefono,
      correo: a.correo,
      id_carrera: a.id_carrera
    }));

    const fields = ["matricula", "nombre", "telefono", "correo", "id_carrera"];
    const json2csvParser = new Parser({ fields });
    let csv = json2csvParser.parse(formattedData);

    // Agregar BOM para compatibilidad con Excel
    csv = "\ufeff" + csv;

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`alumnos_carrera_${id_carrera}_filtrados.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Error al exportar CSV filtrado:", error);
    res.status(500).json({ message: "Error al exportar CSV", error });
  }
};

//Subir csv de alumnos por carrera
exports.subirAlumnosCSVPorCarrera = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha enviado ningún archivo CSV" });
  }

  const { id_carrera } = req.params;
  if (!id_carrera) return res.status(400).json({ message: "Se requiere el ID de la carrera en la URL" });

  const results = [];

  fs.createReadStream(req.file.path, { encoding: "utf-8" })
    .pipe(csv())
    .on("data", (data) => {
      const cleanedData = {};
      Object.keys(data).forEach((key) => {
        const cleanKey = key.replace(/"/g, "").trim();
        cleanedData[cleanKey] = data[key];
      });
      results.push(cleanedData);
    })
    .on("end", async () => {
      try {
        if (results.length === 0) return res.status(400).json({ message: "El archivo CSV está vacío" });


        const matriculasCSV = results.map((alumno) => alumno.matricula?.toString().trim()).filter(Boolean);

        await Promise.all(results.map(async (alumnoData) => {
          let { matricula, nombre, telefono, correo, matricula_tutor } = alumnoData;
          matricula = matricula ? matricula.toString().trim() : null;

          if (!matricula) {
            console.warn("⚠ Alumno sin matrícula:", alumnoData);
            return;
          }

          // 🟡 Buscar alumno actual (si existe)
          const alumnoActual = await Alumno.findOne({ matricula, id_carrera });

          // 🟡 Tutor nuevo (por CSV)
          let nuevoTutorId = null;
          if (matricula_tutor) {
            const nuevoTutor = await Personal.findOne({ matricula: matricula_tutor.toString().trim() });
            if (nuevoTutor) {
              nuevoTutorId = nuevoTutor._id;
            } else {
              console.warn(`⚠ Tutor con matrícula ${matricula_tutor} no encontrado`);
            }
          }

          // 🔁 Si existe alumno y tenía tutor anterior distinto, eliminarlo de su lista
          if (alumnoActual && alumnoActual.tutor && alumnoActual.tutor.toString() !== nuevoTutorId?.toString()) {
            await eliminarAlumnoDeTutor(alumnoActual.tutor, alumnoActual._id);
          }

          // 🆕 Actualizar o insertar alumno con nuevo tutor
          const alumno = await Alumno.findOneAndUpdate(
            { matricula, id_carrera },
            { nombre, telefono, correo, id_carrera, tutor: nuevoTutorId },
            { upsert: true, new: true }
          );

          // ➕ Agregar alumno al nuevo tutor
          if (nuevoTutorId && alumno?._id) {
            await asignarAlumnoATutor(nuevoTutorId, alumno._id);
          }
        }));

        // Eliminar los alumnos no incluidos
        if (matriculasCSV.length > 0) {
          await Alumno.deleteMany({ id_carrera, matricula: { $nin: matriculasCSV } });
        }

        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: `Base de datos de alumnos de la carrera ${id_carrera} actualizada con éxito desde el CSV` });

      } catch (error) {
        console.error("Error al procesar el CSV:", error);
        res.status(500).json({ message: "Error al actualizar la base de datos de alumnos desde el CSV", error });
      }
    })
    .on("error", (err) => {
      console.error("Error al leer el CSV:", err);
      res.status(500).json({ message: "Error al procesar el archivo CSV", error: err });
    });
};


// Subir comprobante de pago del alumno
exports.subirComprobantePago = async (req, res) => {
  try {
    const matricula = req.params.matricula;
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }
    // Actualiza el estatus del comprobante a "Pendiente"
    await Alumno.findOneAndUpdate(
      { matricula },
      { estatusComprobante: "Pendiente" }
    );
    res.status(200).json({ message: 'Comprobante subido correctamente', filePath: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'Error al subir el comprobante', error });
  }
};

// Validar el comprobante de pago del alumno
exports.validarComprobantePago = async (req, res) => {
  try {
    const { matricula } = req.params;
    const { estatus } = req.body; // "Revisado" o "Rechazado"
    if (!["Aceptado", "Rechazado"].includes(estatus)) {
      return res.status(400).json({ message: "Estatus inválido" });
    }
    const alumno = await Alumno.findOneAndUpdate(
      { matricula },
      { estatusComprobante: estatus },
      { new: true }
    );
    if (!alumno) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }
    res.status(200).json({ message: "Estatus del comprobante actualizado", alumno });
  } catch (error) {
    res.status(500).json({ message: "Error al validar comprobante", error });
  }
};

// Obtener el comprobante de pago del alumno
exports.existeComprobantePago = async (req, res) => {
  try {
    const { matricula } = req.params;
    const comprobantePath = path.join(__dirname, '..', 'uploads', 'comprobantes', `Pago_${matricula}.pdf`);
    const existe = fs.existsSync(comprobantePath);

    // Opcional: también puedes devolver el estatus actual del comprobante
    let estatus = null;
    if (existe) {
      const alumno = await Alumno.findOne({ matricula });
      estatus = alumno ? alumno.estatusComprobante : null;
    }

    res.status(200).json({ existe, estatus });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar comprobante', error });
  }
};