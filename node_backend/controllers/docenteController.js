const nodemailer = require("nodemailer");
const Alumno = require('../models/Alumno');
const Docentes = require('../models/Docentes');
const Tutores = require('../models/Tutores');
const Personal = require('../models/Personal');
const Horario = require('../models/Horario');
const Materia = require('../models/Materia');

// Ruta para obtener los alumnos de un tutor específico
exports.getAlumnosAsignados = async (req, res) => {
    
    try {
        const { matricula } = req.params;
        

        // Buscar al tutor directamente por matrícula
        const docente = await Docentes.findOne({ personalMatricula: matricula }).populate('alumnos');

        if (!docente) {
            return res.status(404).json({ message: "Docente no encontrado" });
        }

        
        // Devolver la lista de alumnos asociados al tutor
        res.status(200).json({ alumnos: docente.alumnos });
    } catch (error) {
        console.error("Error al obtener los alumnos del docente:", error);
        res.status(500).json({ message: "Error al obtener los alumnos del docente" });
    }
};

// Ruta para obtener los tutores de un coordinador específico
exports.getDocentes = async (req, res) => {
    try {
        const docentes = await Docentes.find();
        const docentesConNombre = await Promise.all(docentes.map(async (docente) => {
            const personal = await Personal.findOne({ matricula: docente.personalMatricula });
            return {
                ...docente.toObject(),
                nombre: personal ? personal.nombre : "Sin asignar"
            };
        }));

        res.status(200).json(docentesConNombre);
    } catch (error) {
        console.error("Error al obtener docentes:", error);
        res.status(500).json({ message: "Error al obtener docentes", error });
    }
};


// Ruta para obtener los tutores de un coordinador específico
exports.getDocenteById = async (req, res) => {
    try {
        const docente = await Docentes.findById(req.params.id);
        if (!docente) {
            return res.status(404).json({ message: 'docente no encontrado' });
        }
        res.status(200).json(docente);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el personal', error });
    }
};

// Ruta para obtener las materias asignadas al docente
exports.getMateriasAsignadas = async (req, res) => {
    try {
        const { matricula } = req.params;

        // Buscar al tutor directamente por matrícula
        const docente = await Docentes.findOne({ personalMatricula: matricula }).populate('materias');

        if (!docente) {
            return res.status(404).json({ message: "Docente no encontrado" });
        }

        // Devolver la lista de alumnos asociados al tutor
        res.status(200).json({ materias: docente.materias });
    } catch (error) {
        console.error("Error al obtener las materias del docente:", error);
        res.status(500).json({ message: "Error al obtener las materias del docente" });
    }
};

// Ruta para obtener el horario completo de un alumno por matrícula
exports.getHorarioAlumno = async (req, res) => {
    try {
        const { matricula } = req.params;

        // Buscar al alumno y poblar el horario con las materias
        const alumno = await Alumno.findOne({ matricula }).populate({
            path: 'horario',
            populate: {
                path: 'materias',
                model: 'Materia'
            }
        });

        if (!alumno) {
            return res.status(404).json({ message: 'Alumno no encontrado' });
        }

        if (!alumno.horario) {
            // Devolver horario vacío en lugar de error
            return res.status(200).json({
                alumno: {
                    nombre: alumno.nombre,
                    matricula: alumno.matricula,
                    id_carrera: alumno.id_carrera
                },
                horario: []
            });
        }

        // Formatear la respuesta para enviarla a la interfaz
        const horarioFormateado = alumno.horario.materias.map(materia => ({
            grupo: materia.grupo,
            salon: materia.salon,
            materia: materia.nombre,
            horarios: materia.horarios
        }));

        res.status(200).json({
            alumno: {
                nombre: alumno.nombre,
                matricula: alumno.matricula,
                id_carrera: alumno.id_carrera
            },
            horario: horarioFormateado
        });
    } catch (error) {
        console.error('Error al obtener el horario del alumno:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Ruta para obtener los alumnos inscritos en una materia
exports.getAlumnosInscritosEnMateria = async (req, res) => {
    try {
        const { materiaId } = req.params;

        // Buscar alumnos que tengan la materia en su horario
        const alumnos = await Alumno.find().populate({
            path: 'horario',
            populate: {
                path: 'materias',
                match: { _id: materiaId }
            }
        });

        // Filtrar alumnos que tienen la materia en su horario
        const alumnosInscritos = alumnos.filter(alumno => 
            alumno.horario && alumno.horario.materias.some(materia => materia._id.toString() === materiaId)
        );

        // Devolver la lista de alumnos inscritos en la materia (puede estar vacía)
        res.status(200).json({ alumnos: alumnosInscritos });
    } catch (error) {
        console.error('Error al obtener los alumnos inscritos en la materia:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

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


// Ruta para actualizar el estatus del horario por matrícula
exports.updateEstatusHorario = async (req, res) => {
    try {
      const { matricula } = req.params;
      const { estatus, comentario } = req.body; // Extraer el comentario junto con el estatus
  
      // Buscar al alumno por su matrícula
      const alumno = await Alumno.findOne({ matricula });
  
      if (!alumno) {
        return res.status(404).json({ message: "Alumno no encontrado" });
      }
  
      // Obtener el ID del horario
      const horarioId = alumno.horario;
  
      if (!horarioId) {
        return res.status(400).json({ message: "El alumno no tiene un horario asignado" });
      }
  
      // Actualizar el estatus y el comentario del horario
      const horarioActualizado = await Horario.findByIdAndUpdate(
        horarioId,
        { 
          estatus,
          comentario // Guardar el comentario en el campo correspondiente
        },
        { new: true }
      );
  
      if (!horarioActualizado) {
        return res.status(404).json({ message: "Horario no encontrado" });
      }
  
      res.json({ message: "Estatus y comentario actualizados correctamente", horario: horarioActualizado });
    

    
        // Envio de correo al alumno
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "stimpabo27@gmail.com", // Cambia esto con tu correo
                pass: "tucontraseña" // Usa variables de entorno en producción
            }
        });

        const mailOptions = {
            from: "stimpabo27@gmail.com",
            to: alumno.correo, // Asegúrate de que el modelo Alumno tiene un campo 'email'
            subject: "Actualización de estatus de horario",
            text: `Hola ${alumno.nombre},\n\nTu horario ha sido actualizado con el siguiente estatus: "${estatus}".\nComentario: "${comentario}".\n\nSaludos.`
        };

    } catch (error) {
        console.error("Error al actualizar el estatus del horario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
  

// Ruta para eliminar un horario de un alumno y de la base de datos
exports.deleteHorarioAlumno = async (req, res) => {
    try {
        const { matricula } = req.params;

        // Buscar al alumno por su matrícula
        const alumno = await Alumno.findOne({ matricula: matricula }); 
        
        // Obtener el ID del horario del alumno
        const horarioId = alumno.horario;

        // Eliminar el horario de la colección Horario
        await Horario.findByIdAndDelete(horarioId);

        // Establecer el campo 'horario' del alumno en null
        alumno.horario = null;
        await alumno.save();
        res.status(200).json({ message: "Horario eliminado correctamente" });

    } catch (error) {
        console.error('Error al eliminar el horario:', error);
        res.status(500).json({ message: "Error en el servidor", error });
    }
};

// Ruta para enviar comentarios por correo al alumno
exports.enviarComentarioAlumno = async (req, res) => {
    try {
        const { alumnoId } = req.params;
        const { comentario } = req.body;

        // Buscar al alumno
        const alumno = await Alumno.findById(alumnoId);
        if (!alumno) {
            return res.status(404).json({ message: "Alumno no encontrado" });
        }

        // Configurar el transporte de nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "tuemail@gmail.com", // Cambia esto con tu correo
                pass: "tucontraseña" // Usa variables de entorno en producción
            }
        });

        // Configurar el correo
        const mailOptions = {
            from: "tuemail@gmail.com",
            to: alumno.email, // Asegúrate de que el modelo Alumno tiene un campo 'email'
            subject: "Nuevo comentario recibido",
            text: `Hola ${alumno.nombre},\n\nHas recibido un nuevo comentario:\n"${comentario}"\n\nSaludos.`
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        res.json({ message: "Comentario enviado por correo al alumno" });
    } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).json({ message: "Error al enviar correo", error });
    }
};