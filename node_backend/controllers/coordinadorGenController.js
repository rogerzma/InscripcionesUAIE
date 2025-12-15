// Ruta para obtener el id_carrera de coordinadores, administradores y personal
const Coordinadores = require('../models/Coordinadores');
const Alumnos = require('../models/Alumno');
const Administradores = require('../models/Administradores');
const Personal = require('../models/Personal');
const Tutores = require('../models/Tutores');
const Docentes = require('../models/Docentes');
const CoordinadorGen = require('../models/Coordinador_Gen');


// obtener el id_carrera del personal
module.exports.getIdCarrera = async (req, res) => {
    const { matricula } = req.params;
    try {
        const coordinador = await Coordinadores.findOne({ personalMatricula: matricula });
        if (coordinador) {
            return res.json({ id_carrera: coordinador.id_carrera });
        }

        const administrador = await Administradores.findOne({ personalMatricula: matricula });
        if (administrador) {
            return res.json({ id_carrera: administrador.id_carrera });
        }

        const personal = await Personal.findOne({ matricula });
        if (personal) {
            return res.json({ id_carrera: personal.id_carrera });
        }

        return res.status(404).json({ message: "No se encontró el usuario" });
    } catch (error) {
        return res.status(500).json({ message: "Error del servidor", error });
    }
};

// Función para asignar un alumno a un tutor
const asignarAlumnoATutor = async (tutorId, alumnoId) => {
  try {
    const tutorAsignado = await Personal.findById(tutorId);
    if (!tutorAsignado) {
    return;
    }

  
    const TutorModel = await Tutores.findOne({ personalMatricula: tutorAsignado.matricula });
    const DocenteModel = await Docentes.findOne({ personalMatricula: tutorAsignado.matricula });
    const CoordinadorModel = await Coordinadores.findOne({ personalMatricula: tutorAsignado.matricula });
    const AdministradorModel = await Administradores.findOne({ personalMatricula: tutorAsignado.matricula });
    const CoordinadorGenModel = await CoordinadorGen.findOne({ personalMatricula: tutorAsignado.matricula });
  
    if (TutorModel) {
    TutorModel.alumnos.push(alumnoId);
    await TutorModel.save();
    }
    if (DocenteModel) {
    DocenteModel.alumnos.push(alumnoId);
    await DocenteModel.save();
    }
    if (CoordinadorModel) {
    CoordinadorModel.alumnos.push(alumnoId);
    await CoordinadorModel.save();
    }
    if (AdministradorModel) {
    AdministradorModel.alumnos.push(alumnoId);
    await AdministradorModel.save();
    }
    if (CoordinadorGenModel) {
    CoordinadorGenModel.alumnos.push(alumnoId);
    await CoordinadorGenModel.save();
    }
  } catch (error) {
    console.error('Error al asignar el alumno al tutor:', error);
  }
};

// Ruta para crear un alumno 
module.exports.createAlumno = async (req, res) => {
    const { matricula, nombre, correo, telefono, tutor, id_carrera } = req.body;
    try {
        // Crear el alumno
        const alumno = new Alumnos({ matricula, nombre, correo, telefono, tutor, id_carrera });
        await alumno.save();

        // Asignar el alumno al tutor
        await asignarAlumnoATutor(tutor, alumno._id);

        return res.status(201).json({ message: "Alumno creado", alumno });
    } catch (error) {
        console.error("Error al crear el alumno:", error);
        return res.status(500).json({ message: "Error del servidor", error });
    }
};

// Actualizar un alumno
exports.updateAlumno = async (req, res) => {
  const { matricula, nombre, correo, telefono, materiasSeleccionadas, tutor, id_carrera } = req.body;
  try {
    let horarioGuardado = null;

    let alumno = await Alumnos.findById(req.params.id);
    if (!alumno) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }

    // Eliminar al alumno del tutor anterior
    if (alumno && alumno.tutor) {
      const tutorAnteriorAsignado = await Personal.findById(alumno.tutor);
      if (tutorAnteriorAsignado) {
        const TutorModel = await Tutores.findOne({ personalMatricula: tutorAnteriorAsignado.matricula });
        const DocenteModel = await Docentes.findOne({ personalMatricula: tutorAnteriorAsignado.matricula });
        const CoordinadorModel = await Coordinadores.findOne({ personalMatricula: tutorAnteriorAsignado.matricula });
        const AdministradorModel = await Administradores.findOne({ personalMatricula: tutorAnteriorAsignado.matricula });
        const CoordinadorGenModel = await CoordinadorGen.findOne({ personalMatricula: tutorAnteriorAsignado.matricula });

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
        if (CoordinadorGenModel) {
          CoordinadorGenModel.alumnos = CoordinadorGenModel.alumnos.filter(alumnoId => alumnoId.toString() !== alumno._id.toString());
          await CoordinadorGenModel.save();
        }
      }
    }

    // Solo procesar nuevo tutor si se proporciona un ID válido
    if (tutor && tutor !== '') {
      // Buscar el nuevo tutor
      const tutorAsignado = await Personal.findById(tutor);
      if (!tutorAsignado) {
        return res.status(404).json({ message: 'Tutor no encontrado' });
      }

      // Buscar el tutor en las colecciones Tutor, Docente, Coordinador, Administrador y Coordinador General
      const TutorModel = await Tutores.findOne({ personalMatricula: tutorAsignado.matricula });
      const DocenteModel = await Docentes.findOne({ personalMatricula: tutorAsignado.matricula });
      const CoordinadorModel = await Coordinadores.findOne({ personalMatricula: tutorAsignado.matricula });
      const AdministradorModel = await Administradores.findOne({ personalMatricula: tutorAsignado.matricula });
      const CoordinadorGenModel = await CoordinadorGen.findOne({ personalMatricula: tutorAsignado.matricula });

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
      if (CoordinadorGenModel) {
        CoordinadorGenModel.alumnos.push(alumno._id);
        await CoordinadorGenModel.save();
      }
    }

    // Actualizar el alumno con los nuevos datos
    const updateData = {
      matricula,
      id_carrera,
      nombre,
      correo,
      telefono,
      ...(horarioGuardado ? { horario: horarioGuardado._id } : {}),
    };
    
    // Solo agregar tutor si es un valor válido
    if (tutor && tutor !== '') {
      updateData.tutor = tutor;
    }

    const alumnoActualizado = await Alumnos.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!alumnoActualizado) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }

    return res.status(200).json(alumnoActualizado);
  } catch (error) {
    console.error('Error al actualizar el alumno:', error);
    return res.status(500).json({ message: 'Error al actualizar el alumno', error });
  }
};

// Ruta para obtener tutores
module.exports.getTutores = async (req, res) => {
  try {
    const personal = await Personal.find({});
    
    // Filtrar los perfiles que solo tengan roles T (Tutores), D (Directores), C (Coordinadores) o CG (Coordinadores Generales)
    const filteredTutors = personal.filter(p => 
      p.roles.some(role => ['T', 'D', 'C', 'CG'].includes(role))
    );
    
    return res.json({ tutors: filteredTutors }); // Devolver un objeto con la propiedad 'tutors'
  } catch (error) {
    console.error("Error al obtener tutores:", error);
    return res.status(500).json({ message: "Error del servidor", error });
  }
};

