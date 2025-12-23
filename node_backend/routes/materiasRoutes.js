const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materiaController');
const verificarToken = require('../middlewares/authMiddleware');

// Middleware para verificar el token antes de acceder a las rutas
router.use(verificarToken);

// Rutas para importar/exportar CSV
router.post('/subir-csv', materiaController.upload.single('csv'), materiaController.subirMateriasCSV);
router.get('/exportar-csv', materiaController.exportarMateriasCSV);

// NUEVAS RUTAS: Importar/exportar CSV POR CARRERA
router.post('/subir-csv-por-carrera', materiaController.upload.single('csv'), materiaController.subirMateriasCSVPorCarrera);
router.get('/exportar-csv-por-carrera', materiaController.exportarMateriasCSVPorCarrera);
router.post('/exportar-csv/carrera-filtrados/:id_carrera', materiaController.exportarCSVPorCarreraFiltrado);
router.post("/exportar-csv/filtrados", materiaController.exportarCSVMateriasFiltrado);

// Ruta para crear una nueva materia
router.post('/', materiaController.createMateria);

// Ruta para obtener todas las materias
router.get('/', materiaController.getMaterias);

// Rutas paginadas (ANTES de las rutas con parámetros dinámicos)
router.get('/paginadas', materiaController.getMateriasPaginadas);
router.get('/carrera-paginadas/:id_carrera', materiaController.getMateriasByCarreraPaginadas);

// Ruta para obtener una materia por su ID
router.get('/:id', materiaController.getMateriaById);

// Ruta para obtener materias por id_carrera
router.get('/carrera/:id_carrera', materiaController.getMateriasByCarreraId);

// Ruta para actualizar una materia
router.put('/:id', materiaController.updateMateria);

// Ruta para eliminar una materia
router.delete('/:id', materiaController.deleteMateria);

module.exports = router;
