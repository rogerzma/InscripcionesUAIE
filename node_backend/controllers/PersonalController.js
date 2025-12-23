const Personal = require('../models/Personal');
const Docentes = require('../models/Docentes');
const Tutores = require('../models/Tutores');
const Coordinadores = require('../models/Coordinadores');
const Administradores = require('../models/Administradores');
const CoordinadorGenMdl = require('../models/Coordinador_Gen');
const AdministradorGenMdl = require('../models/Administrador_Gen');
const Alumno = require('../models/Alumno');
const Materia = require('../models/Materia');
const bcrypt = require('bcryptjs');
const { Parser } = require('json2csv');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Configurar multer para manejar el archivo CSV
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Guardar archivos en "uploads"
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Nombrar el archivo con timestamp
    },
  });
  
  const upload = multer({ storage: storage });

  exports.upload = upload;

// Crear personal y sus documentos relacionados
exports.createPersonal = async (req, res) => {
    const { matricula, nombre, password, roles, correo, telefono, id_carrera } = req.body;
    try {

        // Validar si ya hay un usuario de personal relacionado a un coordinador de carrera
        if (roles === 'C' && matricula.match(/^C\d{4}$/)) {
            const coordinadorExistente = await Coordinadores.findOne({ id_carrera });
            if (coordinadorExistente) {
                return res.status(409).json({ message: 'Ya existe un coordinador registrado para esta carrera.' });
            }
        }
        
        // Hashear la contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(password, 10);
        const newPersonal = new Personal({ matricula, nombre, password: hashedPassword, roles, correo, telefono });
        const usuarioGuardado = await newPersonal.save();

        if (roles === 'D') {
            const newDocente = new Docentes({
                personalMatricula: usuarioGuardado.matricula,
                materias: [],
                alumnos: []
            });
            await newDocente.save();
        } else if (roles === 'T') {
            const nuevoTutor = new Tutores({
                personalMatricula: usuarioGuardado.matricula,
                alumnos: []
            });
            await nuevoTutor.save();
        } else if (roles === 'C' && matricula.match(/^C\d{4}$/)) {
            const nuevoCoordinador = new Coordinadores({
                id_carrera,
                personalMatricula: usuarioGuardado.matricula,
                alumnos: []
            });
            await nuevoCoordinador.save();
        } else if (roles.includes('A') && usuarioGuardado.matricula.match(/^A\d{4}$/)) {
            const nuevoAdministrador = new Administradores({
                id_carrera,
                personalMatricula: usuarioGuardado.matricula
            });
            await nuevoAdministrador.save();
        } else if (roles === 'CG' && matricula.match(/^CG\d{4}$/)) {
            const nuevoCoordinadorGen = new CoordinadorGenMdl({
                nombre,
                personalMatricula: usuarioGuardado.matricula,
                alumnos: []
            });
            await nuevoCoordinadorGen.save();
        } else if (roles === 'AG' && matricula.match(/^AG\d{4}$/)) {
            const nuevoAdministradorGen = new AdministradorGenMdl({
                nombre,
                personalMatricula: usuarioGuardado.matricula,
                password: hashedPassword
            });
            await nuevoAdministradorGen.save();
        } else {
            return res.status(400).json({ message: 'Rol o matrícula inválidos' });
        }

        res.status(201).json(usuarioGuardado);
    } catch (error) {
        console.error('Error al crear el personal y los documentos relacionados:', error);
        if (error.code === 11000) { // Error de duplicado en MongoDB
            const campoDuplicado = Object.keys(error.keyValue)[0];
            return res.status(409).json({ message: 'Error de duplicado', duplicado: campoDuplicado });
        }
        // Errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            const camposFaltantes = Object.keys(error.errors).map(campo => {
                switch(campo) {
                    case 'matricula': return 'matrícula';
                    case 'nombre': return 'nombre';
                    case 'password': return 'contraseña';
                    case 'correo': return 'correo electrónico';
                    case 'telefono': return 'teléfono';
                    case 'roles': return 'permisos';
                    default: return campo;
                }
            });
            return res.status(400).json({ 
                message: `Falta el campo: ${camposFaltantes.join(', ')}`,
                campos: camposFaltantes 
            });
        }
        res.status(500).json({ message: 'Error al crear el personal y los documentos relacionados', error });
    }
};

exports.getPersonal = async (req, res) => {
    try {
        const personal = await Personal.find({ roles: { $nin: ['CG', 'AG'] } });
        res.status(200).json(personal);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener personal', error });
    }
};

// Obtener solo administradores generales (AG)
exports.getAdministradoresGenerales = async (req, res) => {
    try {
        const administradoresGenerales = await Personal.find({ roles: 'AG' });
        res.status(200).json(administradoresGenerales);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener administradores generales', error });
    }
};

exports.getPersonalByCarrera = async (req, res) => {
  console.log("Obteniendo personal por carrera");
  try {
    const { matricula } = req.params;

    // Buscar el coordinador o administrador y obtener el id_carrera
    const coordinador = await Coordinadores.findOne({ personalMatricula: matricula }).select("id_carrera");
    const administrador = await Administradores.findOne({ personalMatricula: matricula }).select("id_carrera");

    if (!coordinador && !administrador) {
      return res.status(404).json({ message: "Coordinador o Administrador no encontrado" });
    }

    const id_carrera = coordinador ? coordinador.id_carrera : administrador.id_carrera;
    // Buscar docentes que tengan al menos una materia o alumno con id_carrera igual
    const docentes = await Docentes.find({
      $or: [
      { materias: { $exists: true, $not: { $size: 0 } } },
      { alumnos: { $exists: true, $not: { $size: 0 } } }
      ]
    }).select("personalMatricula materias alumnos");

    // Filtrar docentes por materias o alumnos de la carrera
    const docentesFiltrados = [];
    for (const docente of docentes) {
      let tieneMateriaCarrera = false;
      let tieneAlumnoCarrera = false;

      if (docente.materias && docente.materias.length > 0) {
      const materias = await Materia.find({ _id: { $in: docente.materias }, id_carrera });
      tieneMateriaCarrera = materias.length > 0;
      }
      if (docente.alumnos && docente.alumnos.length > 0) {
      const alumnos = await Alumno.find({ _id: { $in: docente.alumnos }, id_carrera });
      tieneAlumnoCarrera = alumnos.length > 0;
      }
      if (tieneMateriaCarrera || tieneAlumnoCarrera) {
      docentesFiltrados.push({ personalMatricula: docente.personalMatricula });
      }
    }

    // Buscar tutores que tengan al menos un alumno con id_carrera igual
    const tutores = await Tutores.find({
      alumnos: { $exists: true, $not: { $size: 0 } }
    }).select("personalMatricula alumnos");

    const tutoresFiltrados = [];
    for (const tutor of tutores) {
      if (tutor.alumnos && tutor.alumnos.length > 0) {
      const alumnos = await Alumno.find({ _id: { $in: tutor.alumnos }, id_carrera });
      if (alumnos.length > 0) {
        tutoresFiltrados.push({ personalMatricula: tutor.personalMatricula });
      }
      }
    }

    // Buscar coordinadores y administradores de la carrera
    const [coordinadores, administradores] = await Promise.all([
      Coordinadores.find({ id_carrera }).select("personalMatricula"),
      Administradores.find({ id_carrera }).select("personalMatricula")
    ]);


    // Unir todas las matrículas en un Set para evitar duplicados
    const personalMatriculasSet = new Set([
      ...docentes.map(d => d.personalMatricula),
      ...tutores.map(t => t.personalMatricula),
      ...coordinadores.map(c => c.personalMatricula),
      ...administradores.map(a => a.personalMatricula)
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

exports.getPersonalById = async (req, res) => {
    try {
        const personal = await Personal.findById(req.params.id);
        if (!personal) {
            return res.status(404).json({ message: 'Personal no encontrado' });
        }
        res.status(200).json(personal);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el personal', error });
    }
};

exports.updatePersonal = async (req, res) => {
  try {
      // Si se envía una contraseña, hashearla antes de guardar
      if (req.body.password) {
          req.body.password = await bcrypt.hash(req.body.password, 10);
      }
      const personal = await Personal.findByIdAndUpdate(
          req.params.id,
          { $set: req.body }, // Actualiza todos los campos enviados en la solicitud
          { new: true } // Devuelve el documento actualizado
      );
      if (!personal) {
          return res.status(404).json({ message: 'Personal no encontrado' });
      }

      // Si el personal es coordinador y se envía un nuevo id_carrera, actualizarlo en la colección Coordinadores
      if (personal.roles.includes('C') && req.body.id_carrera) {
          await Coordinadores.findOneAndUpdate(
          { personalMatricula: personal.matricula },
          { $set: { id_carrera: req.body.id_carrera } }
          );
      }
      res.status(200).json(personal);
  } catch (error) {
      // Errores de validación de Mongoose
      if (error.name === 'ValidationError') {
          const camposFaltantes = Object.keys(error.errors).map(campo => {
              switch(campo) {
                  case 'matricula': return 'matrícula';
                  case 'nombre': return 'nombre';
                  case 'password': return 'contraseña';
                  case 'correo': return 'correo electrónico';
                  case 'telefono': return 'teléfono';
                  case 'roles': return 'permisos';
                  default: return campo;
              }
          });
          return res.status(400).json({ 
              message: `Falta el campo: ${camposFaltantes.join(', ')}`,
              campos: camposFaltantes 
          });
      }
      res.status(500).json({ message: 'Error al actualizar el personal', error });
  }
};


exports.deletePersonal = async (req, res) => {

    try {
        const personal = await Personal.findById(req.params.id);
        if (!personal) {
            return res.status(404).json({ message: 'Personal no encontrado' });
        }

        // Eliminar el personal de los alumnos que lo tienen como tutor
    await Alumno.updateMany(
      { tutor: personal._id },
      { $unset: { tutor: "" } }
    );

    // Eliminar el personal de las colecciones específicas (Docentes, Tutores, Coordinadores, Administradores)
    if (personal.roles.includes('D')) {
      await Docentes.findOneAndDelete({ personalMatricula: personal.matricula });
    }
    if (personal.roles.includes('T')) {
      await Tutores.findOneAndDelete({ personalMatricula: personal.matricula });
    }
    if (personal.roles.includes('C')) {
      await Coordinadores.findOneAndDelete({ personalMatricula: personal.matricula });
    }
    if (personal.roles.includes('A')) {
      await Administradores.findOneAndDelete({ personalMatricula: personal.matricula });
    }

    //Eliminarlo tambien de la lista de los alumnos que lo tenga como tutor
    const personalId = personal._id;

    // Eliminarlo de los alumnos que lo tengan como docente
    await Materia.updateMany(
      { docente: personalId },
      { $unset: { docente: "" } }
    );

    // Eliminar el personal
    await Personal.findByIdAndDelete(req.params.id);
        res.status(204).json({ message: 'Personal eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el personal', error });
    }

};



exports.deletePersonalCord = async (req, res) => {
  const { usuarioAEliminar, idCarreraEsperada } = req.body;
  const id = usuarioAEliminar;
  
  try {
      const personal = await Personal.findById(id);
      if (!personal) {
          return res.status(404).json({ message: 'Personal no encontrado' });
      }

  // Eliminar el personal de las colecciones específicas (Docentes, Tutores, Coordinadores, Administradores)
  if (personal.roles.includes('D')) {
    const docente = await Docentes.findOne({ personalMatricula: personal.matricula })
      
    // Verificar si el docente tiene alumnos o materias con id_carrera diferente al del coordinador
    let alumnoInvalido = false;
    let materiaInvalida = false;

    if (docente && Array.isArray(docente.alumnos) && docente.alumnos.length > 0) {
      const alumnos = await Alumno.find({ _id: { $in: docente.alumnos } });
      alumnoInvalido = alumnos.some(alumno => alumno.id_carrera !== idCarreraEsperada);
    }

    if (docente && Array.isArray(docente.materias) && docente.materias.length > 0) {
      const materias = await Materia.find({ _id: { $in: docente.materias } });
      materiaInvalida = materias.some(materia => materia.id_carrera !== idCarreraEsperada);
    }

    if (!alumnoInvalido && materiaInvalida){
    
      await Docentes.findOneAndDelete({ personalMatricula: personal.matricula });
      }else{
        return res.status(404).json({ message: 'El docente tiene alumnos o materias en otra carrera existente' });
      }

      // Eliminarlo de los alumnos que lo tengan como docente
      await Alumno.updateMany(
      { tutor: personal._id },
      { $unset: { tutor: "" } }
    );

    await Materia.updateMany(
      { docente: docente._id },
      { $unset: { docente: "" } }
    );
  }
  if (personal.roles.includes('T')) {
    const tutor = await Tutores.findOne({ personalMatricula: personal.matricula })

    let alumnoInvalido = false;

    if (tutor && Array.isArray(tutor.alumnos) && tutor.alumnos.length > 0) {
      const alumnos = await Alumno.find({ _id: { $in: tutor.alumnos } });
      alumnoInvalido = alumnos.some(alumno => alumno.id_carrera !== idCarreraEsperada);
    }

    if (alumnoInvalido) {
    
    console.log("alumno Invalido:", alumnoInvalido.id_carrera);
    
    } else {

    console.log("no hay ningun alumno Invalido");
    }

    if (!alumnoInvalido){
    
      await Tutores.findOneAndDelete({ personalMatricula: personal.matricula });
    }else{
      return res.status(404).json({ message: 'El tutor tiene alumnos en otra carrera existente' });
    }

  
    // Eliminarlo de los alumnos que lo tengan como docente
    await Alumno.updateMany(
    { tutor: personal._id },
    { $unset: { tutor: "" } }
  );
  }
  if (personal.roles.includes('C')) {
    await Coordinadores.findOneAndDelete({ personalMatricula: personal.matricula });
    
      await Alumno.updateMany(
      { tutor: personal._id },
      { $unset: { tutor: "" } }
    );
  }
  if (personal.roles.includes('A')) {
    await Administradores.findOneAndDelete({ personalMatricula: personal.matricula });
  }





  // Eliminar el personal
  await Personal.findByIdAndDelete(personal.id);
      res.status(204).json({ message: 'Personal eliminado' });
  } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el personal', error });
  }

};

// Subir datos desde CSV
exports.subirPersonalCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha enviado ningún archivo CSV' });
  }

  const results = [];
  let columnasValidas = null;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('headers', (headers) => {
      // Validar columnas obligatorias
      const requeridas = ["matricula", "nombre", "password", "roles", "telefono", "correo"];
      columnasValidas = requeridas.every(col => headers.includes(col));
    })
    .on('data', (data) => {
      const cleanedData = {};
      Object.keys(data).forEach((key) => {
        cleanedData[key.replace(/"/g, "").trim()] = data[key];
      });
      results.push(cleanedData);
    })
    .on('end', async () => {
      try {
        if (!columnasValidas) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: "Error: formato de CSV no valido" });
        }
        const matriculasCSV = results.map((p) => p.matricula?.trim()).filter(Boolean);

        // Obtener al coordinador general actual para protegerlo completamente
        const coordinadorGeneral = await Personal.findOne({ roles: "CG" });

        for (const personalData of results) {
          let { matricula, nombre, password, roles, correo, telefono, id_carrera } = personalData;
          if (!matricula || !nombre || !password || !roles || !correo || !telefono) continue;

          matricula = matricula.trim();

          // Validar que no haya más de un coordinador por carrera
          if (roles.includes("C") && id_carrera && matricula.match(/^C\\d{4}$/)) {
            const coordinadorExistente = await Coordinadores.findOne({ id_carrera });
            if (coordinadorExistente && coordinadorExistente.personalMatricula !== matricula) {
              continue;
            }
          }

          // Si es el coordinador general, ignorar por completo
          if (coordinadorGeneral && matricula === coordinadorGeneral.matricula) {
            continue;
          }

          if (typeof roles === "string") {
            roles = roles.split(",").map(r => r.trim().toUpperCase());
          }

          // Buscar si ya existe el usuario
          const personalExistente = await Personal.findOne({ matricula });
          let passwordFinal = password;

          if (personalExistente) {
            if (!password || password.trim() === "") {
              passwordFinal = personalExistente.password;
            } else {
              if (password !== personalExistente.password) {
                if (
                  !password.startsWith("$2a$") &&
                  !password.startsWith("$2b$") &&
                  !password.startsWith("$2y$")
                ) {
                  passwordFinal = await bcrypt.hash(password, 10);
                } else {
                  passwordFinal = password;
                }
              } else {
                passwordFinal = personalExistente.password;
              }
            }
          } else {
            if (
              !password.startsWith("$2a$") &&
              !password.startsWith("$2b$") &&
              !password.startsWith("$2y$")
            ) {
              passwordFinal = await bcrypt.hash(password, 10);
            }
          }

          // Actualizar o crear personal
          await Personal.findOneAndUpdate(
            { matricula },
            { nombre, telefono, correo, roles, password: passwordFinal },
            { upsert: true, new: true }
          );

          // Crear documentos secundarios por rol SOLO si no existen
          if (roles.includes("D")) {
            const existeDocente = await Docentes.findOne({ personalMatricula: matricula });
            if (!existeDocente) {
              await Docentes.create({ personalMatricula: matricula, materias: [], alumnos: [] });
            }
          }
          if (roles.includes("T")) {
            const existeTutor = await Tutores.findOne({ personalMatricula: matricula });
            if (!existeTutor) {
              await Tutores.create({ personalMatricula: matricula, alumnos: [] });
            }
          }
          if (roles.includes("C") && id_carrera && id_carrera.trim()) {
            const existeCoord = await Coordinadores.findOne({ personalMatricula: matricula, id_carrera: id_carrera.trim() });
            if (!existeCoord) {
              await Coordinadores.create({ personalMatricula: matricula, id_carrera: id_carrera.trim(), alumnos: [] });
            }
          }
          if (roles.includes("A") && id_carrera && id_carrera.trim()) {
            const existeAdmin = await Administradores.findOne({ personalMatricula: matricula, id_carrera: id_carrera.trim() });
            if (!existeAdmin) {
              await Administradores.create({ personalMatricula: matricula, id_carrera: id_carrera.trim() });
            }
          }
        }

        // 🔐 Proteger CG, coordinadores generales y administradores generales
        const coordinadoresGenerales = await Coordinadores.find({ id_carrera: { $exists: false } }).select("personalMatricula");
        const administradoresGenerales = await Administradores.find({ id_carrera: { $exists: false } }).select("personalMatricula");

        const protegidos = new Set([
          ...(coordinadoresGenerales.map(c => c.personalMatricula)),
          ...(administradoresGenerales.map(a => a.personalMatricula)),
          ...(coordinadorGeneral ? [coordinadorGeneral.matricula] : [])
        ]);

        const personalAEliminar = await Personal.find({
          $and: [
            { matricula: { $nin: matriculasCSV } },
            { matricula: { $nin: Array.from(protegidos) } }
          ]
        });

        await Promise.all(
          personalAEliminar.map(async (p) => {
            const { matricula } = p;
            await Personal.findByIdAndDelete(p._id);
            await Promise.all([
              Docentes.findOneAndDelete({ personalMatricula: matricula }),
              Tutores.findOneAndDelete({ personalMatricula: matricula }),
              Coordinadores.findOneAndDelete({ personalMatricula: matricula }),
              Administradores.findOneAndDelete({ personalMatricula: matricula })
            ]);
          })
        );

        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: 'Base de datos de personal actualizada con éxito desde el archivo CSV' });

      } catch (error) {
        console.error('Error al procesar el CSV:', error);
        res.status(500).json({ message: 'Error al actualizar la base de datos desde el CSV', error });
      }
    })
    .on('error', (err) => {
      console.error('Error al leer el CSV:', err);
      res.status(500).json({ message: 'Error al procesar el archivo CSV', error: err });
    });
};


  
exports.exportarPersonalCSV = async (req, res) => {
  try {
    // 🔍 Buscar relaciones de carrera para coordinadores y administradores
    const [coordinadores, administradores] = await Promise.all([
      Coordinadores.find({}).select("personalMatricula id_carrera"),
      Administradores.find({}).select("personalMatricula id_carrera")
    ]);

    // 🔗 Mapeo de matrícula a conjunto de carreras
    const carreraPorMatricula = {};

    const agregarCarrera = (matricula, carrera) => {
      if (!carreraPorMatricula[matricula]) {
        carreraPorMatricula[matricula] = new Set();
      }
      carreraPorMatricula[matricula].add(carrera);
    };

    coordinadores.forEach(c => {
      if (c.personalMatricula && c.id_carrera) {
        agregarCarrera(c.personalMatricula, c.id_carrera);
      }
    });

    administradores.forEach(a => {
      if (a.personalMatricula && a.id_carrera) {
        agregarCarrera(a.personalMatricula, a.id_carrera);
      }
    });

    // 👤 Obtener personal que NO sea CG (Coordinador General)
    const personal = await Personal.find({
      $and: [
        { roles: { $in: ["D", "T", "C", "A", "AG"] } },
        { roles: { $ne: "CG" } }
      ]
    });

    const formattedData = personal.map(p => {
      const idCarreras = (p.roles.includes("C") || p.roles.includes("A"))
        ? Array.from(carreraPorMatricula[p.matricula] || []).join(", ")
        : "";

      return {
        matricula: p.matricula,
        nombre: p.nombre,
        password: p.password,
        roles: p.roles.join(""),
        id_carrera: idCarreras,
        telefono: p.telefono,
        correo: p.correo
      };
    });

    const fields = ["matricula", "nombre", "password", "roles", "id_carrera", "telefono", "correo"];
    const json2csvParser = new Parser({ fields });
    const csv = "\ufeff" + json2csvParser.parse(formattedData); // BOM para Excel

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment("personal.csv");
    res.send(csv);

  } catch (error) {
    console.error("❌ Error al exportar CSV:", error);
    res.status(500).json({ message: "Error al exportar a CSV", error });
  }
};

  
  // Exportar personal por carrera a CSV
  exports.exportarPersonalCSVPorCarrera = async (req, res) => {
    try {
      const { id_carrera } = req.params; // Obtener el id_carrera desde la URL
  
      if (!id_carrera) {
        return res.status(400).json({ message: "Se requiere el id_carrera" });
      }
  
      // Buscar docentes, tutores, administradores y coordinadores de la carrera
      const [docentes, tutores, administradores, coordinadores] = await Promise.all([
        Docentes.find().select("personalMatricula"),
        Tutores.find().select("personalMatricula"),
        Administradores.find({ id_carrera }).select("personalMatricula"),
        Coordinadores.find({ id_carrera }).select("personalMatricula"),
      ]);
  
      // Unificar todas las matrículas del personal de la carrera
      const personalMatriculas = new Set([
        ...docentes.map((d) => d.personalMatricula),
        ...tutores.map((t) => t.personalMatricula),
        ...administradores.map((a) => a.personalMatricula),
        ...coordinadores.map((c) => c.personalMatricula),
      ]);
  
  
      // Obtener la información completa del personal filtrado
      const personal = await Personal.find({ matricula: { $in: Array.from(personalMatriculas) } });
  
      if (personal.length === 0) {
        return res.status(404).json({ message: "No hay personal registrado para esta carrera" });
      }
  
      // Formatear datos para el CSV
      const formattedData = personal.map((p) => {
      const base = {
        matricula: p.matricula,
        nombre: p.nombre,
        password: p.password,
        roles: p.roles.join(""),
        telefono: p.telefono,
        correo: p.correo,
      };

      // Solo coordinadores y administradores deben incluir id_carrera
      if (p.roles.includes("C") || p.roles.includes("A")) {
        base.id_carrera = id_carrera;
      }

      return base;
    });

    const fields = ["matricula", "nombre", "password", "roles", "id_carrera", "telefono", "correo"];
      const json2csvParser = new Parser({ fields });
      let csv = json2csvParser.parse(formattedData);
  
      // Agregar BOM para compatibilidad con Excel y caracteres especiales
      csv = "\ufeff" + csv;
  
      res.header("Content-Type", "text/csv; charset=utf-8");
      res.attachment(`personal_carrera_${id_carrera}.csv`);
      res.send(csv);
    } catch (error) {
      console.error("Error en exportarCSVPorCarrera:", error);
      res.status(500).json({ message: "Error al exportar a CSV", error });
    }
  };

 

  // Exportar CSV de personal filtrado por carrera
  exports.exportarCSVPorCarreraFiltrado = async (req, res) => {
  try {
    const { id_carrera } = req.params;
    const { matriculas } = req.body; // Array de matrículas filtradas

    if (!id_carrera || !matriculas || !Array.isArray(matriculas) || matriculas.length === 0) {
      return res.status(400).json({ message: "Se requiere el id_carrera y un array de matrículas" });
    }

    const personal = await Personal.find({
      matricula: { $in: matriculas },
    });

    const formattedData = personal.map(p => ({
      matricula: p.matricula,
      nombre: p.nombre,
      password: p.password,
      roles: p.roles.join(""),
      telefono: p.telefono,
      correo: p.correo,
    }));

    const fields = ["matricula", "nombre", "password", "roles", "telefono", "correo"];
    const json2csvParser = new Parser({ fields });
    let csv = "\ufeff" + json2csvParser.parse(formattedData); // BOM para Excel

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`personal_filtrado_${id_carrera}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Error al exportar CSV filtrado de personal:", error);
    res.status(500).json({ message: "Error interno al exportar", error });
  }
};

  // Esporta el CSV filtrado
  exports.exportarCSVPersonalFiltrado = async (req, res) => {
    try {
      const { matriculas } = req.body;

      if (!matriculas || !Array.isArray(matriculas) || matriculas.length === 0) {
        return res.status(400).json({ message: "Se requiere un array de matrículas para exportar." });
      }

      const personal = await Personal.find({
        matricula: { $in: matriculas }
      });

      const formattedData = personal.map((p) => ({
        matricula: p.matricula,
        nombre: p.nombre,
        password: p.password,
        roles: p.roles.join(", "),
        telefono: p.telefono || "Sin teléfono",
        correo: p.correo || "Sin correo"
      }));

      const fields = ["matricula", "nombre", "password", "roles", "telefono", "correo"];
      const json2csvParser = new Parser({ fields });
      const csv = "\ufeff" + json2csvParser.parse(formattedData); // BOM para Excel

      res.header("Content-Type", "text/csv; charset=utf-8");
      res.attachment("personal_filtrado.csv");
      res.send(csv);
    } catch (error) {
      console.error("❌ Error al exportar CSV de personal filtrado:", error);
      res.status(500).json({ message: "Error interno al exportar", error });
    }
  };

// Subir datos desde CSV por carrera
  exports.subirPersonalCSVPorCarrera = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha enviado ningún archivo CSV" });
    }

    const { id_carrera } = req.params;
    if (!id_carrera) {
      return res.status(400).json({ message: "Se requiere el ID de la carrera en la URL" });
    }

    const matriculaActual = req.headers["x-matricula-coordinador"] || req.user?.matricula;

    const results = [];
    let columnasValidas = null;
    fs.createReadStream(req.file.path, { encoding: "utf-8" })
      .pipe(csv())
      .on("headers", (headers) => {
        // Validar columnas obligatorias
        const requeridas = ["matricula", "nombre", "password", "roles", "telefono", "correo"];
        columnasValidas = requeridas.every(col => headers.includes(col));
      })
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
          if (!columnasValidas) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Error: formato de CSV no valido" });
          }
          if (results.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "El archivo CSV está vacío" });
          }

          const matriculasCSV = results
            .map((p) => p.matricula?.toString().trim())
            .filter(Boolean);

          await Promise.all(
            results.map(async (personalData) => {
              let { matricula, nombre, password, roles, correo, telefono } = personalData;
              matricula = matricula ? matricula.toString().trim() : null;
              if (!matricula || !roles) return;

              if (typeof roles === "string") {
                roles = roles.split(",").map((r) => r.trim().toUpperCase());
              }

              // Buscar si ya existe el usuario
              const personalExistente = await Personal.findOne({ matricula });
              let passwordFinal = password;

              // Si existe y no se envió una nueva contraseña, mantener la actual
              if (personalExistente) {
                if (!password || password.trim() === "") {
                  passwordFinal = personalExistente.password;
                } else {
                  // Si la contraseña es diferente, verificar si ya está hasheada
                  if (password !== personalExistente.password) {
                    // Si la nueva contraseña no está hasheada, hashearla
                    if (!password.startsWith("$2a$") && !password.startsWith("$2b$") && !password.startsWith("$2y$")) {
                      passwordFinal = await bcrypt.hash(password, 10);
                    } else {
                      passwordFinal = password;
                    }
                  } else {
                    passwordFinal = personalExistente.password;
                  }
                }
              } else {
                // Si es nuevo usuario, hashear la contraseña si no está hasheada
                if (!password.startsWith("$2a$") && !password.startsWith("$2b$") && !password.startsWith("$2y$")) {
                  passwordFinal = await bcrypt.hash(password, 10);
                }
              }

              // Crear o actualizar Personal
              const personalActualizado = await Personal.findOneAndUpdate(
                { matricula },
                { nombre, telefono, correo, roles, password: passwordFinal },
                { upsert: true, new: true }
              );

              // Asignar roles SOLO si no existe el documento correspondiente
              if (roles.includes("D")) {
                const existeDocente = await Docentes.findOne({ personalMatricula: matricula });
                if (!existeDocente) {
                  await Docentes.create({ personalMatricula: matricula, materias: [], alumnos: [] });
                }
              }
              if (roles.includes("T")) {
                const existeTutor = await Tutores.findOne({ personalMatricula: matricula });
                if (!existeTutor) {
                  await Tutores.create({ personalMatricula: matricula, alumnos: [] });
                }
              }
              if (roles.includes("C")) {
                const existeCoord = await Coordinadores.findOne({ personalMatricula: matricula, id_carrera });
                if (!existeCoord) {
                  await Coordinadores.create({ personalMatricula: matricula, id_carrera, alumnos: [] });
                }
              }
              if (roles.includes("A")) {
                const existeAdmin = await Administradores.findOne({ personalMatricula: matricula, id_carrera });
                if (!existeAdmin) {
                  await Administradores.create({ personalMatricula: matricula, id_carrera });
                }
              }
            })
          );

          // Verificar y eliminar registros que ya no estén en el CSV
          const personalAEliminar = await Personal.find({ matricula: { $nin: matriculasCSV } });

          await Promise.all(
            personalAEliminar.map(async (personal) => {
              const { matricula } = personal;

              // No eliminar al coordinador actual
              if (matricula === matriculaActual) {
                return;
              }

              const esDocente = await Docentes.findOne({ personalMatricula: matricula });
              const esTutor = await Tutores.findOne({ personalMatricula: matricula });
              const esCoordinador = await Coordinadores.findOne({ personalMatricula: matricula, id_carrera });
              const esAdministrador = await Administradores.findOne({ personalMatricula: matricula, id_carrera });

              // Si es docente, verificar si tiene materias en otras carreras
              if (esDocente) {
                const materias = await Materia.find({ docente: esDocente._id });
                const tieneOtrasCarreras = materias.some(m => m.id_carrera !== id_carrera);
                if (tieneOtrasCarreras) {
                  return;
                }
              }

              // Si es tutor, verificar si tiene alumnos en otras carreras
              if (esTutor) {
                const alumnos = await Alumnos.find({ tutor: esTutor._id });
                const tieneOtrasCarreras = alumnos.some(a => a.id_carrera !== id_carrera);
                if (tieneOtrasCarreras) {
                  return;
                }
              }

              // Solo eliminar si pertenece a esta carrera
              if (esDocente || esTutor || esCoordinador || esAdministrador) {
                await Personal.findByIdAndDelete(personal._id);
                await Promise.all([
                  Docentes.findOneAndDelete({ personalMatricula: matricula }),
                  Tutores.findOneAndDelete({ personalMatricula: matricula }),
                  Coordinadores.findOneAndDelete({ personalMatricula: matricula, id_carrera }),
                  Administradores.findOneAndDelete({ personalMatricula: matricula, id_carrera })
                ]);
              }
            })
          );

          fs.unlinkSync(req.file.path);
          res.status(200).json({
            message: `Base de datos de personal de la carrera ${id_carrera} actualizada con éxito desde el CSV`
          });

        } catch (error) {
          console.error("❌ Error al procesar el CSV:", error);
          res.status(500).json({ message: "Error al actualizar la base de datos de personal desde el CSV", error });
        }
      })
      .on("error", (err) => {
        console.error("❌ Error al leer el CSV:", err);
        res.status(500).json({ message: "Error al procesar el archivo CSV", error: err });
      });
  };

// Ruta para recuperar la contraseña de un personal
exports.getPassword = async (req, res) => {
  const { matricula } = req.params;
  try {
    const personal = await Personal.findOne({ matricula });
    if (!personal) {
      return res.status(404).json({ message: 'Personal no encontrado' });
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
      user: 'stefanovaldez117@gmail.com', // Reemplaza con tu correo
      pass: 'wwjo ykiy ziyq ijte'  // Reemplaza con tu contraseña
      }
    });

    const mailOptions = {
      from: 'your-email@gmail.com', // Reemplaza con tu correo
      to: personal.correo,
      subject: 'Recuperación de contraseña',
      text: `Hola ${personal.nombre}, tu contraseña es: ${personal.password}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
      return res.status(500).json({ message: 'Error al enviar el correo', error });
      }
      res.status(200).json({ message: 'Correo enviado con la contraseña' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al recuperar la contraseña', error });
  }
  }

// Obtener personal paginado (para CG/AG)
exports.getPersonalPaginado = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const skip = (page - 1) * limit;

    // Construir filtro - excluir CG y AG
    let condiciones = [{ roles: { $nin: ['CG', 'AG'] } }];

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      condiciones.push({
        $or: [
          { matricula: searchRegex },
          { nombre: searchRegex },
          { correo: searchRegex },
          { roles: searchRegex }
        ]
      });
    }

    const filtro = { $and: condiciones };

    const total = await Personal.countDocuments(filtro);
    const totalPages = Math.ceil(total / limit);

    const personal = await Personal.find(filtro)
      .skip(skip)
      .limit(limit)
      .sort({ matricula: 1 });

    res.status(200).json({
      personal,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error al obtener personal paginado:', error);
    res.status(500).json({ message: 'Error al obtener personal paginado', error });
  }
};

// Obtener personal paginado por carrera (para Coordinador/Admin)
exports.getPersonalByCarreraPaginado = async (req, res) => {
  try {
    const { matricula } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const skip = (page - 1) * limit;

    // Buscar el coordinador o administrador y obtener el id_carrera
    const coordinador = await Coordinadores.findOne({ personalMatricula: matricula }).select("id_carrera");
    const administrador = await Administradores.findOne({ personalMatricula: matricula }).select("id_carrera");

    if (!coordinador && !administrador) {
      return res.status(404).json({ message: "Coordinador o Administrador no encontrado" });
    }

    const id_carrera = coordinador ? coordinador.id_carrera : administrador.id_carrera;

    // Buscar docentes, tutores, coordinadores y administradores de la carrera
    const docentes = await Docentes.find({
      $or: [
        { materias: { $exists: true, $not: { $size: 0 } } },
        { alumnos: { $exists: true, $not: { $size: 0 } } }
      ]
    }).select("personalMatricula materias alumnos");

    const docentesFiltrados = [];
    for (const docente of docentes) {
      let tieneMateriaCarrera = false;
      let tieneAlumnoCarrera = false;

      if (docente.materias && docente.materias.length > 0) {
        const materias = await Materia.find({ _id: { $in: docente.materias }, id_carrera });
        tieneMateriaCarrera = materias.length > 0;
      }
      if (docente.alumnos && docente.alumnos.length > 0) {
        const alumnos = await Alumno.find({ _id: { $in: docente.alumnos }, id_carrera });
        tieneAlumnoCarrera = alumnos.length > 0;
      }
      if (tieneMateriaCarrera || tieneAlumnoCarrera) {
        docentesFiltrados.push(docente.personalMatricula);
      }
    }

    const tutores = await Tutores.find({
      alumnos: { $exists: true, $not: { $size: 0 } }
    }).select("personalMatricula alumnos");

    const tutoresFiltrados = [];
    for (const tutor of tutores) {
      if (tutor.alumnos && tutor.alumnos.length > 0) {
        const alumnos = await Alumno.find({ _id: { $in: tutor.alumnos }, id_carrera });
        if (alumnos.length > 0) {
          tutoresFiltrados.push(tutor.personalMatricula);
        }
      }
    }

    const [coordinadores, administradores] = await Promise.all([
      Coordinadores.find({ id_carrera }).select("personalMatricula"),
      Administradores.find({ id_carrera }).select("personalMatricula")
    ]);

    const personalMatriculasSet = new Set([
      ...docentesFiltrados,
      ...tutoresFiltrados,
      ...coordinadores.map(c => c.personalMatricula),
      ...administradores.map(a => a.personalMatricula)
    ]);

    const personalMatriculas = Array.from(personalMatriculasSet);

    if (personalMatriculas.length === 0) {
      return res.status(200).json({
        personal: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
      });
    }

    // Construir filtro con búsqueda
    let condiciones = [{ matricula: { $in: personalMatriculas } }];

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      condiciones.push({
        $or: [
          { matricula: searchRegex },
          { nombre: searchRegex },
          { correo: searchRegex },
          { roles: searchRegex }
        ]
      });
    }

    const filtro = { $and: condiciones };

    const total = await Personal.countDocuments(filtro);
    const totalPages = Math.ceil(total / limit);

    const personal = await Personal.find(filtro)
      .skip(skip)
      .limit(limit)
      .sort({ matricula: 1 });

    res.status(200).json({
      personal,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error al obtener personal paginado por carrera:', error);
    res.status(500).json({ message: 'Error al obtener personal paginado', error });
  }
};