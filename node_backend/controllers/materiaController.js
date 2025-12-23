const Materia = require('../models/Materia');
const Docentes = require('../models/Docentes');
const Horario = require('../models/Horario');
const Personal = require('../models/Personal');
const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const carrerasPermitidas = ["ISftw", "IDsr", "IEInd", "ICmp", "IRMca", "IElec", "ISftwS","IDsrS", "IEIndS", "ICmpS", "IRMcaS", "IElecS"];


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

// Crear una nueva materia
exports.createMateria = async (req, res) => {
  const { id_materia, id_carrera, nombre, semi, horarios, salon, grupo, cupo, laboratorio, docente } = req.body;

  try {
    if (!id_carrera) {
      return res.status(400).json({ message: "El campo id_carrera es obligatorio." });
    }

    let docenteObjectId = null;

    if (docente) {
      // Buscar el docente por matrícula en la colección 'Docentes'
      const docenteEncontrado = await Docentes.findOne({ personalMatricula: docente });

      if (!docenteEncontrado) {
        return res.status(400).json({ message: "Docente no encontrado" });
      }

      docenteObjectId = docenteEncontrado._id;  // Usar el ObjectId del docente

    } else {
      console.error('Docente no encontrado:', docenteObjectId);
    }

    // Crear la materia con la matrícula del docente
    const newMateria = new Materia({ 
      id_materia, 
      id_carrera, 
      nombre, 
      horarios,
      semi,
      salon, 
      grupo, 
      cupo, 
      laboratorio: laboratorio || false, // Aseguramos que laboratorio tenga un valor booleano
      docente: docenteObjectId  // Guardamos la matrícula en lugar de ObjectId
    });

    await newMateria.save();

    if (docenteObjectId) {
      await Docentes.findByIdAndUpdate(
        docenteObjectId,
        { $addToSet: { materias: newMateria._id } }, // Evita duplicados
        { new: true }
      );
    }

    res.status(201).json(newMateria);
  } catch (error) {
    console.error('Error al crear la materia:', error);
    
    // Errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const camposFaltantes = Object.keys(error.errors).map(campo => {
        switch(campo) {
          case 'id_materia': return 'ID de materia';
          case 'nombre': return 'nombre';
          case 'id_carrera': return 'carrera';
          case 'horarios': return 'horarios';
          case 'salon': return 'salón';
          case 'grupo': return 'grupo';
          case 'cupo': return 'cupo';
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
      return res.status(409).json({ 
        message: `Ya existe una materia con ese ${campoDuplicado}`,
        duplicado: campoDuplicado 
      });
    }
    
    res.status(500).json({ message: 'Error al crear la materia', error: error.message });
  }
};



// Obtener todas las materias
exports.getMaterias = async (req, res) => {
  try {
    const materias = await Materia.find();
    const materiasConDocente = await Promise.all(
      materias.map(async (materia) => {
        if (!materia.docente) {
          return { ...materia.toObject(), docenteNombre: "Sin asignar" };
        }

        // Buscar el docente en la colección Docentes usando el ObjectId
        const docente = await Docentes.findById(materia.docente);

        if (!docente) {
          return { ...materia.toObject(), docenteNombre: "Sin asignar" };
        }

        // Buscar el nombre del personal en la colección Personal usando personalMatricula
        const personal = await Personal.findOne({ matricula: docente.personalMatricula });

        return {
          ...materia.toObject(),
          docenteNombre: personal ? personal.nombre : "Sin asignar",
        };
      })
    );

    
    res.status(200).json(materiasConDocente);
  } catch (error) {
    console.error("Error al obtener materias:", error);
    res.status(500).json({ message: "Error al obtener materias", error });
  }
};

// Obtener materias por id_carrera e incluir el nombre del docente
exports.getMateriasByCarreraId = async (req, res) => {
  const { id_carrera } = req.params;

  // Verificar si el id_carrera está en la lista permitida
  if (!carrerasPermitidas.includes(id_carrera)) {
    return res.status(400).json({ message: "ID de carrera no válido" });
  }

  try {
    // Filtra las materias por id_carrera en la base de datos
    const materias = await Materia.find({ id_carrera: id_carrera });

    if (!materias.length) {
      return res.status(404).json({ mensaje: "No se encontraron materias para esta carrera" });
    }

    // Obtener el nombre del docente asociado a cada materia
    const materiasConDocente = await Promise.all(
      materias.map(async (materia) => {
        if (!materia.docente) {
          return { ...materia.toObject(), docenteNombre: "Sin asignar" };
        }

        // Buscar el docente en la colección Docentes usando el ObjectId
        const docente = await Docentes.findById(materia.docente);

        if (!docente) {
          return { ...materia.toObject(), docenteNombre: "Sin asignar" };
        }

        // Buscar el nombre del personal en la colección Personal usando personalMatricula
        const personal = await Personal.findOne({ matricula: docente.personalMatricula });

        return {
          ...materia.toObject(),
          docenteNombre: personal ? personal.nombre : "Sin asignar",
        };
      })
    );

    res.status(200).json(materiasConDocente);
  } catch (error) {
    console.error("Error al obtener materias:", error);
    res.status(500).json({ mensaje: "Error interno al obtener materias", error });
    
  }
};


// Obtener una materia por ID
exports.getMateriaById = async (req, res) => {
  try {
    const materia = await Materia.findById(req.params.id).populate('docente');
    if (!materia) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }
    res.status(200).json(materia);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la materia', error });
  }
};


// Actualizar materia con validación de empalme de horarios
exports.updateMateria = async (req, res) => {
  const { nombre, horarios, salon, semi, grupo, cupo, docente, laboratorio, id_materia, id_carrera } = req.body;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de materia no válido" });
  }

  try {
    // Obtener materia previa
    const materiaAnterior = await Materia.findById(id);
    if (!materiaAnterior) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    let docenteObjectId = null;

    if (docente) {
      // Buscar el nuevo docente por personalMatricula o _id
      const docenteEncontrado = await Docentes.findById(docente) ||
                                 await Docentes.findOne({ personalMatricula: docente });

      if (!docenteEncontrado) {
        return res.status(400).json({ message: "Docente no encontrado" });
      }

      docenteObjectId = docenteEncontrado._id;

      // Validar que los nuevos horarios no empalmen con otras materias del mismo docente
      if (horarios && typeof horarios === "object") {
        const horariosEntrada = Object.entries(horarios).filter(
          ([dia, hora]) => hora && hora !== "-"
        );

        const materiasDocente = await Materia.find({
          docente: docenteObjectId,
          _id: { $ne: id } // Excluir la materia que estamos actualizando
        });

        for (const materia of materiasDocente) {
          const horariosExistentes = Object.entries(materia.horarios || {}).filter(
            ([dia, hora]) => hora && hora !== "-"
          );

          for (const [diaNuevo, horaNueva] of horariosEntrada) {
            for (const [diaExistente, horaExistente] of horariosExistentes) {
              if (diaNuevo === diaExistente && horaNueva === horaExistente) {
                return res.status(400).json({
                  message: `Error: el docente ya tiene una materia asignada el ${diaNuevo} a las ${horaNueva}.`
                });
              }
            }
          }
        }
      }
    }

    // Actualizar la materia
    const materia = await Materia.findByIdAndUpdate(id,
      {
        id_materia,
        id_carrera,
        nombre,
        horarios,
        salon,
        semi,
        grupo,
        cupo,
        laboratorio: laboratorio === true || laboratorio === "true",
        docente: docenteObjectId
      },
      { new: true }
    );

    if (!materia) {
      return res.status(404).json({ message: "Materia no encontrada después de actualizar." });
    }

    // Remover materia del docente anterior si fue reasignado
    if (materiaAnterior.docente &&
        (!docenteObjectId || !materiaAnterior.docente.equals(docenteObjectId))) {
      await Docentes.findByIdAndUpdate(
        materiaAnterior.docente,
        { $pull: { materias: materiaAnterior._id } }
      );
    }

    // Asignar materia al nuevo docente si corresponde
    if (docenteObjectId) {
      await Docentes.findByIdAndUpdate(
        docenteObjectId,
        { $addToSet: { materias: materia._id } },
        { new: true }
      );
    }

    res.status(200).json(materia);
  } catch (error) {
    console.error("Error en updateMateria:", error);
    
    // Errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const camposFaltantes = Object.keys(error.errors).map(campo => {
        switch(campo) {
          case 'id_materia': return 'ID de materia';
          case 'nombre': return 'nombre';
          case 'id_carrera': return 'carrera';
          case 'horarios': return 'horarios';
          case 'salon': return 'salón';
          case 'grupo': return 'grupo';
          case 'cupo': return 'cupo';
          default: return campo;
        }
      });
      return res.status(400).json({ 
        message: `Falta el campo: ${camposFaltantes.join(', ')}`,
        campos: camposFaltantes 
      });
    }
    
    res.status(500).json({ message: "Error al actualizar la materia", error });
  }
};


// Eliminar una materia
exports.deleteMateria = async (req, res) => {
  
  try {
    const materia = await Materia.findById(req.params.id);
    if (!materia) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }
    // Eliminar la materia de los horarios
    await Horario.updateMany(
      { materias: materia._id },
      { $pull: { materias: materia._id } }
    );

    // Eliminar la materia de la lista de materias de los docentes
    await Docentes.updateMany(
      { materias: materia._id },
      { $pull: { materias: materia._id } }
    );

    // Eliminar la materia
    await Materia.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: 'Materia eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la materia', error });
  }
};

//Subir csv
exports.subirMateriasCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha enviado ningún archivo CSV" });
  }

  const results = [];
        let columnasValidas = null;
        
        fs.createReadStream(req.file.path, { encoding: "utf-8" })
          .pipe(csv())
          .on("headers", (headers) => {
            // Validar columnas obligatorias
            const requeridas = ["id_materia", "id_carrera", "nombre", "salon", "grupo", "cupo", "docente", "laboratorio"];
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
                return res.status(400).json({ message: "El archivo CSV está vacío" });
              }
              const idsCSV = results.map((materia) => materia.id_materia?.toString().trim()).filter(Boolean);
        
              await Promise.all(
                results.map(async (materiaData) => {
            let {
              id_materia, id_carrera, nombre, salon, grupo, cupo, docente,
              laboratorio, lunes, martes, miercoles, jueves, viernes, sabado,
              semiescolarizada, paridad, semi
            } = materiaData;

            id_materia = id_materia ? id_materia.toString().trim() : null;
            id_carrera = id_carrera ? id_carrera.trim() : null;

            if (!id_materia) {
              console.warn("⚠ Materia sin id_materia:", materiaData);
              return;
            }

            const esSemiescolarizada = [
              "ISftwS", "IDsrS", "IEIndS", "ICmpS", "IRMcaS", "IElecS"
            ].includes(id_carrera);

            // Procesar paridad solo si es semiescolarizada
            let semiFinal = "";
            if (esSemiescolarizada) {
              semiFinal = (paridad || semi || "").toLowerCase();
              if (semiFinal === "par" || semiFinal === "impar") {
                semiFinal = semiFinal.charAt(0).toUpperCase() + semiFinal.slice(1);
              } else {
                semiFinal = "";
              }
            } else {
              semiFinal = "";
            }

            const materiaActual = await Materia.findOne({ id_materia });

            let docenteObjectId = null;
            if (docente && docente !== "Sin asignar") {
              const docenteEncontrado = await Docentes.findOne({ personalMatricula: docente.trim() });
              if (docenteEncontrado) {
                docenteObjectId = docenteEncontrado._id;
              }
            }

            const horariosFinal = {
              lunes: lunes !== "-" ? lunes : null,
              martes: martes !== "-" ? martes : null,
              miercoles: miercoles !== "-" ? miercoles : null,
              jueves: jueves !== "-" ? jueves : null,
              viernes: viernes !== "-" ? viernes : null,
              sabado: sabado !== "-" ? sabado : null
            };

            let laboratorioBool = false;
            if (typeof laboratorio === "string") {
              laboratorioBool = laboratorio.trim().toLowerCase() === "sí" || laboratorio.trim().toLowerCase() === "si";
            }

            const materiaActualizada = await Materia.findOneAndUpdate(
              { id_materia },
              {
                id_materia, id_carrera, nombre,
                horarios: horariosFinal, salon, grupo, cupo,
                docente: docenteObjectId, laboratorio: laboratorioBool,
                semi: semiFinal
              },
              { upsert: true, new: true }
            );

            if (materiaActual && materiaActual.docente &&
                (!docenteObjectId || !materiaActual.docente.equals(docenteObjectId))) {
              await Docentes.findByIdAndUpdate(
                materiaActual.docente,
                { $pull: { materias: materiaActual._id } }
              );
            }

            if (docenteObjectId) {
              await Docentes.findByIdAndUpdate(
                docenteObjectId,
                { $addToSet: { materias: materiaActualizada._id } },
                { new: true }
              );
            }
          })
        );

        if (idsCSV.length > 0) {
          await Materia.deleteMany({ id_materia: { $nin: idsCSV } });
        }

        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: "Base de datos de materias actualizada con éxito desde el archivo CSV" });

      } catch (error) {
        console.error("❌ Error al procesar el CSV:", error);
        res.status(500).json({ message: "Error al actualizar la base de datos de materias desde el CSV", error });
      }
    })
    .on("error", (err) => {
      console.error("❌ Error al leer el CSV:", err);
      res.status(500).json({ message: "Error al procesar el archivo CSV", error: err });
    });
};

// Exportar materias a CSV
exports.exportarMateriasCSV = async (req, res) => {
  try {
    const materias = await Materia.find().populate('docente'); // Obtén todas las materias y popula el campo docente

    const formattedData = materias.map((m) => {
      // Determinar si es semiescolarizada
      const semiescolarizada = [
        "ISftwS", "IDsrS", "IEIndS", "ICmpS", "IRMcaS", "IElecS"
      ].includes(m.id_carrera);
      return {
        id_materia: m.id_materia,
        id_carrera: m.id_carrera,
        nombre: m.nombre,
        salon: m.salon,
        grupo: m.grupo,
        cupo: m.cupo,
        docente: m.docente ? m.docente.personalMatricula : "Sin asignar",
        laboratorio: m.laboratorio ? "Si" : "No",
        semiescolarizada: semiescolarizada ? "Sí" : "No",
        paridad: semiescolarizada ? (m.semi || "") : "",
        lunes: m.horarios.lunes || "-",
        martes: m.horarios.martes || "-",
        miercoles: m.horarios.miercoles || "-",
        jueves: m.horarios.jueves || "-",
        viernes: m.horarios.viernes || "-",
        sabado: m.horarios.sabado || "-"
      };
    });

    const fields = [
      "id_materia", "id_carrera", "nombre", "salon", "grupo", "cupo", "docente",
      "laboratorio", "semiescolarizada", "paridad",
      "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"
    ];
    const json2csvParser = new Parser({ fields });
    let csv = json2csvParser.parse(formattedData);
    csv = '\ufeff' + csv;
    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment("materias.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Error al exportar a CSV", error });
  }
};

//FUNCIONES DE CSV POR CARRERA
// Exportar CSV por carrera

exports.exportarMateriasCSVPorCarrera = async (req, res) => {
  try {
    const { id_carrera } = req.query; // Obtener el id_carrera desde la URL

    if (!id_carrera) {
      return res.status(400).json({ message: "Se requiere el id_carrera" });
    }

    const materias = await Materia.find({ id_carrera }).populate("docente"); // Filtrar solo por la carrera

    if (materias.length === 0) {
      return res.status(404).json({ message: "No hay materias registradas para esta carrera" });
    }

    const formattedData = materias.map((m) => ({
      id_materia: m.id_materia,
      id_carrera: m.id_carrera,
      nombre: m.nombre,
      salon: m.salon,
      grupo: m.grupo,
      cupo: m.cupo,
      docente: m.docente ? m.docente.personalMatricula : "Sin asignar", // Guardar matrícula del docente
      laboratorio: m.laboratorio ? "Si" : "No", // <-- Aquí el cambio
      lunes: m.horarios.lunes || "-",
      martes: m.horarios.martes || "-",
      miercoles: m.horarios.miercoles || "-",
      jueves: m.horarios.jueves || "-",
      viernes: m.horarios.viernes || "-",
      sabado: m.horarios.sabado || "-",
    }));

    const fields = ["id_materia", "id_carrera", "nombre", "salon", "grupo", "cupo", "docente",
                    "laboratorio", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

    const json2csvParser = new Parser({ fields });
    let csv = json2csvParser.parse(formattedData);

    // Agregar BOM para compatibilidad con Excel
    csv = "\ufeff" + csv;

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`materias_carrera_${id_carrera}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("❌ Error al exportar CSV por carrera:", error);
    res.status(500).json({ message: "Error al exportar CSV", error });
  }
};

exports.exportarCSVMateriasFiltrado = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Se requiere un array de IDs de materias para exportar." });
    }

    const materias = await Materia.find({ _id: { $in: ids } }).populate("docente");

    const formattedData = materias.map((m) => ({
      id_materia: m.id_materia,
      id_carrera: m.id_carrera,
      nombre: m.nombre,
      salon: m.salon,
      grupo: m.grupo,
      cupo: m.cupo,
      docente: m.docente ? m.docente.personalMatricula : "Sin asignar",
      laboratorio: m.laboratorio ? "Sí" : "No",
      lunes: m.horarios.lunes || "-",
      martes: m.horarios.martes || "-",
      miercoles: m.horarios.miercoles || "-",
      jueves: m.horarios.jueves || "-",
      viernes: m.horarios.viernes || "-",
      sabado: m.horarios.sabado || "-"
    }));

    const fields = [
      "id_materia", "id_carrera", "nombre", "salon", "grupo", "cupo", "docente",
      "laboratorio", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"
    ];

    const json2csvParser = new Parser({ fields });
    const csv = "\ufeff" + json2csvParser.parse(formattedData);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment("materias_filtradas.csv");
    res.send(csv);
  } catch (error) {
    console.error("❌ Error al exportar CSV filtrado de materias:", error);
    res.status(500).json({ message: "Error al exportar", error });
  }
};

//Exportar CSV por carrera filtrado
exports.exportarCSVPorCarreraFiltrado = async (req, res) => {
  try {
    const { id_carrera } = req.params;
    const { ids } = req.body; // IDs de materias filtradas

    if (!id_carrera || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Se requiere el id_carrera y un array de IDs de materias" });
    }

    const materias = await Materia.find({ _id: { $in: ids }, id_carrera }).populate("docente");

    const formattedData = materias.map((m) => ({
      id_materia: m.id_materia,
      id_carrera: m.id_carrera,
      nombre: m.nombre,
      salon: m.salon,
      grupo: m.grupo,
      cupo: m.cupo,
      docente: m.docente ? m.docente.personalMatricula : "Sin asignar",
      laboratorio: m.laboratorio ? "Sí" : "No",
      lunes: m.horarios.lunes || "-",
      martes: m.horarios.martes || "-",
      miercoles: m.horarios.miercoles || "-",
      jueves: m.horarios.jueves || "-",
      viernes: m.horarios.viernes || "-",
      sabado: m.horarios.sabado || "-",
    }));

    const fields = [
      "id_materia", "id_carrera", "nombre", "salon", "grupo", "cupo", "docente",
      "laboratorio", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"
    ];

    const json2csvParser = new Parser({ fields });
    let csv = "\ufeff" + json2csvParser.parse(formattedData);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`materias_filtradas_${id_carrera}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("❌ Error al exportar CSV filtrado de materias:", error);
    res.status(500).json({ message: "Error al exportar", error });
  }
};

// Obtener materias paginadas (para CG/AG)
exports.getMateriasPaginadas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const tipoCarrera = req.query.tipoCarrera || 'todas'; // 'todas', 'escolarizada', 'semiescolarizada'

    const skip = (page - 1) * limit;

    // Carreras semiescolarizadas
    const carrerasSemiescolarizadas = ['ISftwS', 'IDsrS', 'IEIndS', 'ICmpS', 'IRMcaS', 'IElecS'];

    // Construir filtro
    let condiciones = [];

    // Filtro por tipo de carrera
    if (tipoCarrera === 'escolarizada') {
      condiciones.push({ id_carrera: { $nin: carrerasSemiescolarizadas } });
    } else if (tipoCarrera === 'semiescolarizada') {
      condiciones.push({ id_carrera: { $in: carrerasSemiescolarizadas } });
    }

    // Filtro de búsqueda
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      condiciones.push({
        $or: [
          { nombre: searchRegex },
          { grupo: searchRegex },
          { salon: searchRegex },
          { id_carrera: searchRegex }
        ]
      });
    }

    const filtro = condiciones.length > 0 ? { $and: condiciones } : {};

    const total = await Materia.countDocuments(filtro);
    const totalPages = Math.ceil(total / limit);

    const materias = await Materia.find(filtro)
      .skip(skip)
      .limit(limit)
      .sort({ id_carrera: 1, nombre: 1 });

    // Agregar nombre del docente
    const materiasConDocente = await Promise.all(
      materias.map(async (materia) => {
        if (!materia.docente) {
          return { ...materia.toObject(), docenteNombre: "Sin asignar" };
        }
        const docente = await Docentes.findById(materia.docente);
        if (!docente) {
          return { ...materia.toObject(), docenteNombre: "Sin asignar" };
        }
        const personal = await Personal.findOne({ matricula: docente.personalMatricula });
        return {
          ...materia.toObject(),
          docenteNombre: personal ? personal.nombre : "Sin asignar",
        };
      })
    );

    res.status(200).json({
      materias: materiasConDocente,
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
    console.error('Error al obtener materias paginadas:', error);
    res.status(500).json({ message: 'Error al obtener materias paginadas', error });
  }
};

// Obtener materias paginadas por carrera (para Coordinador/Admin)
exports.getMateriasByCarreraPaginadas = async (req, res) => {
  try {
    const { id_carrera } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const skip = (page - 1) * limit;

    if (!carrerasPermitidas.includes(id_carrera)) {
      return res.status(400).json({ message: "ID de carrera no válido" });
    }

    // Construir filtro
    let condiciones = [{ id_carrera: id_carrera }];

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      condiciones.push({
        $or: [
          { nombre: searchRegex },
          { grupo: searchRegex },
          { salon: searchRegex }
        ]
      });
    }

    const filtro = { $and: condiciones };

    const total = await Materia.countDocuments(filtro);
    const totalPages = Math.ceil(total / limit);

    const materias = await Materia.find(filtro)
      .skip(skip)
      .limit(limit)
      .sort({ nombre: 1 });

    // Agregar nombre del docente
    const materiasConDocente = await Promise.all(
      materias.map(async (materia) => {
        if (!materia.docente) {
          return { ...materia.toObject(), docenteNombre: "Sin asignar" };
        }
        const docente = await Docentes.findById(materia.docente);
        if (!docente) {
          return { ...materia.toObject(), docenteNombre: "Sin asignar" };
        }
        const personal = await Personal.findOne({ matricula: docente.personalMatricula });
        return {
          ...materia.toObject(),
          docenteNombre: personal ? personal.nombre : "Sin asignar",
        };
      })
    );

    res.status(200).json({
      materias: materiasConDocente,
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
    console.error('Error al obtener materias paginadas por carrera:', error);
    res.status(500).json({ message: 'Error al obtener materias paginadas', error });
  }
};

//Subir CSV por carrera
exports.subirMateriasCSVPorCarrera = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha enviado ningún archivo CSV" });
  }

  const results = [];
        let columnasValidas = null;
        
        fs.createReadStream(req.file.path, { encoding: "utf-8" })
          .pipe(csv())
          .on("headers", (headers) => {
            // Validar columnas obligatorias
            const requeridas = ["id_materia", "id_carrera", "nombre", "salon", "grupo", "cupo", "docente", "laboratorio"];
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
                return res.status(400).json({ message: "El archivo CSV está vacío" });
              }
              const carreraPermitida = req.user?.id_carrera || req.query.id_carrera;
              if (!carreraPermitida) {
                return res.status(403).json({ message: "No se pudo determinar la carrera del usuario." });
              }


        const carrerasUnicasCSV = [...new Set(results.map(m => m.id_carrera?.trim()))];
        const materiasPorCarrera = {};

        results.forEach((materia) => {
          const carrera = materia.id_carrera?.trim();
          const id_materia = materia.id_materia?.toString().trim();
          if (!carrera || !id_materia) return;
          if (!materiasPorCarrera[carrera]) materiasPorCarrera[carrera] = new Set();
          materiasPorCarrera[carrera].add(id_materia);
        });

        // Filtrar solo materias con la carrera autorizada
        const materiasFiltradas = results.filter((materia) => {
          const carreraCSV = materia.id_carrera?.trim();
          if (carreraCSV !== carreraPermitida) {
            console.warn(`❌ Materia ignorada por carrera inválida: ${materia.id_materia}, carrera en CSV: ${carreraCSV}`);
            return false;
          }
          return true;
        });

        await Promise.all(
          materiasFiltradas.map(async (materiaData) => {
            let {
              id_materia, id_carrera, nombre, salon, grupo, cupo, docente,
              lunes, martes, miercoles, jueves, viernes, sabado, laboratorio
            } = materiaData;

            id_materia = id_materia ? id_materia.toString().trim() : null;
            id_carrera = id_carrera ? id_carrera.trim() : null;

            if (!id_materia || !id_carrera) {
              console.warn("⚠ Materia sin id_materia o id_carrera:", materiaData);
              return;
            }

            const materiaExistente = await Materia.findOne({ id_materia });

            // Si ya existe pero con otra carrera, no se modifica
            if (materiaExistente && materiaExistente.id_carrera !== carreraPermitida) {
              return;
            }

            const carreraFinal = materiaExistente ? materiaExistente.id_carrera : carreraPermitida;

            const materiaActual = await Materia.findOne({ id_materia, id_carrera: carreraFinal });

            let docenteObjectId = null;
            if (docente && docente !== "Sin asignar") {
              const docenteEncontrado = await Docentes.findOne({ personalMatricula: docente.trim() });
              if (docenteEncontrado) {
                docenteObjectId = docenteEncontrado._id;
              }
            }

            const horariosFinal = {
              lunes: lunes !== "-" ? lunes : null,
              martes: martes !== "-" ? martes : null,
              miercoles: miercoles !== "-" ? miercoles : null,
              jueves: jueves !== "-" ? jueves : null,
              viernes: viernes !== "-" ? viernes : null,
              sabado: sabado !== "-" ? sabado : null
            };

            let laboratorioBool = false;
            if (typeof laboratorio === "string") {
              laboratorioBool = laboratorio.trim().toLowerCase() === "sí" || laboratorio.trim().toLowerCase() === "si";
            }

            const materiaActualizada = await Materia.findOneAndUpdate(
              { id_materia, id_carrera: carreraFinal },
              {
                id_materia, id_carrera: carreraFinal, nombre,
                horarios: horariosFinal, salon, grupo, cupo,
                docente: docenteObjectId, laboratorio: laboratorioBool
              },
              { upsert: true, new: true }
            );

            if (materiaActual && materiaActual.docente &&
              (!docenteObjectId || !materiaActual.docente.equals(docenteObjectId))) {
              await Docentes.findByIdAndUpdate(
                materiaActual.docente,
                { $pull: { materias: materiaActual._id } }
              );
            }

            if (docenteObjectId) {
              await Docentes.findByIdAndUpdate(
                docenteObjectId,
                { $addToSet: { materias: materiaActualizada._id } },
                { new: true }
              );
            }
          })
        );

        // 🔐 Limpieza: solo si el CSV contiene una sola carrera y es la permitida
        if (carrerasUnicasCSV.length === 1 && carrerasUnicasCSV[0] === carreraPermitida) {
          const carrera = carrerasUnicasCSV[0];
          const idsCSV = Array.from(materiasPorCarrera[carrera]);
          await Materia.deleteMany({
            id_carrera: carrera,
            id_materia: { $nin: idsCSV }
          });
        } 

        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: "Base de datos actualizada con éxito desde el CSV" });

      } catch (error) {
        console.error("❌ Error al procesar el CSV:", error);
        res.status(500).json({ message: "Error al actualizar materias desde el CSV", error });
      }
    })
    .on("error", (err) => {
      console.error("❌ Error al leer el CSV:", err);
      res.status(500).json({ message: "Error al procesar el archivo CSV", error: err });
    });
};
