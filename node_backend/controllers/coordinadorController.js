const Docentes = require('../models/Docentes');
const Tutores = require('../models/Tutores');
const Coordinadores = require('../models/Coordinadores');
const Personal = require('../models/Personal');
const Administradores = require('../models/Administradores');
const Alumno = require('../models/Alumno');
const Materia = require('../models/Materia');
const CoordinadorGeneral = require('../models/Coordinador_Gen');

// Ruta para obtener los alumnos de un tutor específico
exports.getAlumnosAsignados = async (req, res) => {
  const { id } = req.params;
  try {
    // Buscar en la colección de Coordinadores
    const persona = await Personal.findOne({ _id: id });
    if (persona) {
      return res.json({ nombre: persona.nombre });
    }

    // Si no se encuentra en ninguna colección
    res.status(404).json({ message: 'ID no encontrado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el ID', error: error.message });
  }
};

//Ruta para obtener los alumnos asignados a un coordinador o coordinador general
exports.getAlumnosAsignadosCord = async (req, res) => {
  const { matricula } = req.params;
  try {
    let alumnos = [];
    if (matricula.startsWith("CG")) {
      // Buscar en la colección de Coordinador General
      const coordinadorGeneral = await CoordinadorGeneral.findOne({ personalMatricula: matricula });
      if (!coordinadorGeneral) {
        return res.status(404).json({ message: "Coordinador general no encontrado" });
      }
      alumnos = coordinadorGeneral.alumnos || [];
    } else {
      // Buscar en la colección de Coordinadores
      const coordinador = await Coordinadores.findOne({ personalMatricula: matricula });
      if (!coordinador) {
        return res.status(404).json({ message: "Coordinador no encontrado" });
      }
      alumnos = coordinador.alumnos || [];
    }
    res.status(200).json({ alumnos });
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    res.status(500).json({ message: "Error al obtener alumnos", error: error.message });
  }
};

// Ruta para obtener todos los coordinadores
exports.getCoordinadores = async (req, res) => {
    try {
        const coordinadores = await Coordinadores.find();
        const coordinadoresConNombre = await Promise.all(coordinadores.map(async (coordinador) => {
            const personal = await Personal.findOne({ matricula: coordinador.personalMatricula });
            return {
                ...coordinador.toObject(),
                nombre: personal ? personal.nombre : "Sin asignar"
            };
        }));

        res.status(200).json(coordinadoresConNombre);
    } catch (error) {
        console.error("Error al obtener coordinadores:", error);
        res.status(500).json({ message: "Error al obtener coordinadores", error });
    }
};


// Ruta para obtener el estatus del horario
exports.getEstatusHorario = async (req, res) => {
    try {
        const { matricula } = req.params;

        // Buscar al alumno por su matrícula
        const alumno = await Alumno.findOne({ matricula }).populate('horario');

        if (!alumno) {
            return res.status(404).json({ message: "Alumno no encontrado" });
        }

        // Si no tiene horario, el estatus es "En espera"
        if (!alumno.horario) {
            return res.json({ estatus: "En espera" });
        }

        // Obtener el estatus del horario
        const estatusHorario = alumno.horario.estatus;

        // Mapear el número del estatus a su significado
        let estatusTexto = "Desconocido";
        switch (estatusHorario) {
            case 0:
                estatusTexto = "Falta de revisar";
                break;
            case 1:
                estatusTexto = "Revisado";
                break;
        }

        res.json({ estatus: estatusTexto });

    } catch (error) {
        console.error("Error al obtener el estatus del horario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Ruta para traer lista de tutores disponibles
exports.getTutores = async (req, res) => {
    
  try {
    const { matricula } = req.params;

    // Buscar el coordinador y obtener el id_carrera
    const coordinador = await Coordinadores.findOne({ personalMatricula: matricula }).select("id_carrera");
    if (!coordinador) {
      return res.status(404).json({ message: "Coordinador no encontrado" });
    }


    // Obtener alumnos de la carrera
    const alumnos = await Alumno.find({ id_carrera: coordinador.id_carrera }).select("_id");
    const alumnosIds = alumnos.map(alumno => alumno._id);


    // Obtener materias de la carrera
    const materias = await Materia.find({ id_carrera: coordinador.id_carrera }).select("_id");
    const materiasIds = materias.map(materia => materia._id);


    // Buscar todos los docentes
    const docentes = await Docentes.find().select("personalMatricula");

    // Buscar todos los tutores
    const tutores = await Tutores.find().select("personalMatricula");

    // Buscar coordinadores de la carrera
    const coordinadores = await Coordinadores.find({ id_carrera: coordinador.id_carrera }).select("personalMatricula");

    // Unir todas las matrículas en un Set para evitar duplicados, excluyendo administradores
    const personalMatriculasSet = new Set([
      ...docentes.map(d => d.personalMatricula),
      ...tutores.map(t => t.personalMatricula),
      ...coordinadores.map(c => c.personalMatricula)
    ]);

    // Convertir el Set a Array y buscar los datos completos del personal
    const personalMatriculas = Array.from(personalMatriculasSet);

    if (personalMatriculas.length === 0) {
      return res.status(404).json({ message: "No hay personal en esta carrera" });
    }


    const personal = await Personal.find({ matricula: { $in: personalMatriculas } });

    res.status(200).json(personal);
  } catch (error) {
    console.error("Error en getPersonalByCarrera:", error);
    res.status(500).json({ message: "Error al obtener personal", error: error.message });
  }
};

  // Obtener las horas de un coordinador
exports.getHorasCoordinador = async (req, res) => {
  const { id_carrera } = req.params;
  try {
    // Buscar al coordinador por su matrícula
    const coordinador = await Coordinadores.findOne({ id_carrera: id_carrera });

    if (!coordinador) {
      return res.status(404).json({ message: "Coordinador no encontrado" });
    }

    // Obtener las horas del coordinador
    const horas = coordinador.horas || []; // Evitar que sea undefined

    // Enviar como objeto con la clave "horas"
    res.status(200).json({ horas });
  } catch (error) {
    console.error("Error al obtener horas del coordinador:", error);
    res.status(500).json({ message: "Error al obtener horas", error: error.message });
  }   
};


// Actualizar las horas de un coordinador

exports.updateHorasCoordinador = async (req, res) => {
  const { matricula } = req.params;
  const { horas } = req.body; // Espera un array de horas en el cuerpo de la solicitud

  try {
    // Buscar al coordinador por su matrícula
    const coordinador = await Coordinadores.findOne({ personalMatricula: matricula });

    if (!coordinador) {
      return res.status(404).json({ message: "Coordinador no encontrado" });
    }

    // Actualizar las horas del coordinador
    coordinador.horas = horas;
    await coordinador.save();

    res.status(200).json({ message: "Horas actualizadas correctamente", horas: coordinador.horas });
  } catch (error) {
    console.error("Error al actualizar horas del coordinador:", error);
    res.status(500).json({ message: "Error al actualizar horas", error: error.message });
  }

};

// Obtener si el comprobante está habilitado
exports.getComprobantePagoHabilitado = async (req, res) => {
  const { id_carrera } = req.params;
  try {
    const coordinador = await Coordinadores.findOne({ id_carrera });
    if (!coordinador) {
      // Si no existe el coordinador, devolver valor por defecto (habilitado)
      console.log(`Coordinador no encontrado para carrera ${id_carrera}, usando valor por defecto: true`);
      return res.json({ comprobantePagoHabilitado: true });
    }
    res.json({ comprobantePagoHabilitado: coordinador.comprobantePagoHabilitado });
  } catch (error) {
    res.status(500).json({ message: "Error al consultar comprobantePagoHabilitado", error: error.message });
  }
};

// Actualizar si el comprobante está habilitado
exports.setComprobantePagoHabilitado = async (req, res) => {
  const { id_carrera } = req.params;
  const { comprobantePagoHabilitado } = req.body;
  try {
    const coordinador = await Coordinadores.findOneAndUpdate(
      { id_carrera },
      { comprobantePagoHabilitado },
      { new: true }
    );
    if (!coordinador) {
      return res.status(404).json({ message: "Coordinador no encontrado" });
    }
    res.json({ comprobantePagoHabilitado: coordinador.comprobantePagoHabilitado });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar comprobantePagoHabilitado", error: error.message });
  }
};