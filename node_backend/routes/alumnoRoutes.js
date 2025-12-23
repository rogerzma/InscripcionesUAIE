const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnoController'); // Asegúrate de que esta ruta es válida
const upload = alumnoController.upload;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verificarToken = require('../middlewares/authMiddleware'); // Ruta para el middleware de autenticación


const storageComprobantes = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/comprobantes/';
    // Verifica si la carpeta existe, si no, la crea
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const matricula = req.params.matricula || 'sinmatricula';
    const nombreArchivo = `Pago_${matricula}.pdf`;
    const rutaArchivo = `uploads/comprobantes/${nombreArchivo}`;
    // Si ya existe, elimínalo antes de guardar el nuevo
    if (fs.existsSync(rutaArchivo)) {
      try {
        fs.unlinkSync(rutaArchivo);
      } catch (err) {
        console.error(`Error al eliminar archivo anterior: ${rutaArchivo}`, err);
      }
    }
    cb(null, nombreArchivo);
  }
});
const uploadComprobante = multer({ storage: storageComprobantes });


// Middleware para verificar el token antes de acceder a las rutas
router.use(verificarToken);

// Ruta para exportar a CSV (debe ir antes de las rutas dinámicas)
router.get('/exportar-csv', alumnoController.exportarAlumnosCSV);

router.post('/subir-csv', upload.single('csv'), alumnoController.subirAlumnosCSV);

// Ruta para exportar alumnos por carrera a CSV
router.get('/exportar-csv/carrera/:id_carrera', alumnoController.exportarAlumnosCSVPorCarrera);

// Ruta para subir alumnos por carrera desde CSV
router.post('/subir-csv/carrera/:id_carrera', upload.single('csv'), alumnoController.subirAlumnosCSVPorCarrera);

//Ruta para exportar alumnos filtrados en general a CSV
router.post('/exportar-csv/filtrados', alumnoController.exportarAlumnosCSVFiltrado);

// Ruta para exportar alumnos por carrera filtrados a CSV
router.post('/exportar-csv/carrera-filtrados/:id_carrera', alumnoController.exportarAlumnosCSVPorCarreraFiltrados);

// Ruta para subir comprobante de pago
router.post('/subir-comprobante/:matricula', uploadComprobante.single('comprobante'), alumnoController.subirComprobantePago);

// Rutas para las operaciones CRUD
router.post('/', alumnoController.createAlumno);
router.get('/', alumnoController.getAlumnos);
router.get('/paginados', alumnoController.getAlumnosPaginados);
router.get('/carrera-paginados/:matricula', alumnoController.getAlumnosCarreraPaginados);
router.get('/carrera-admin-paginados/:matricula', alumnoController.getAlumnosCarreraAdminPaginados);

// Rutas específicas ANTES de las genéricas
router.get('/matricula/:matricula', alumnoController.getAlumnoByMatricula); // Obtener alumno por matrícula
router.get('/asignados/:matricula', alumnoController.getAlumnosAsignados); // Obtener alumnos asignados a un personal
router.get('/carrera/:matricula', alumnoController.getAlumnosCarrera);
router.get('/carrera-admin/:matricula', alumnoController.getAlumnosCarreraAdmin);
router.get('/horario/:id', alumnoController.getAlumnoByIdWithHorario);
router.get('/estatus/:matricula', alumnoController.getEstatusHorario);

// Rutas genéricas al FINAL
router.get('/:id', alumnoController.getAlumnoById);
router.put('/:id', alumnoController.updateAlumno);
router.put('/horario/:id', alumnoController.updateAlumnoHorario);
router.delete('/:id', alumnoController.deleteAlumno);


// Importar comprobantes de pago
router.get('/comprobantes/lista', (req, res) => {
  const comprobantesDir = 'uploads/comprobantes';
  fs.readdir(comprobantesDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer la carpeta de comprobantes', error: err });
    }
    res.json(files); // Devuelve un array de nombres de archivos
  });
});

router.put('/validar-comprobante/:matricula', alumnoController.validarComprobantePago);
router.get('/comprobante/:matricula', alumnoController.existeComprobantePago);


module.exports = router;

