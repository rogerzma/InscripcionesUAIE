// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const alumnoRoutes = require('./routes/alumnoRoutes');
const authRoutes = require('./routes/authRoutes'); 
const materiasRoutes = require('./routes/materiasRoutes');
const personalRoutes = require('./routes/personalRoutes');
const coordinadorRoutes = require('./routes/coordinadorRoutes');
const coordinadorGenRoutes = require('./routes/coordinadorGenRoutes');
const administradorRoutes = require('./routes/administradorRoutes');
const administradorGenRoutes = require('./routes/administradorGenRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const docenteRoutes = require('./routes/docenteRoutes');
const historialAcademicoRoutes = require('./routes/historialAcademicoRoutes');
const app = express();
const PORT = process.env.PORT || 5001;
const HistorialAcademico = require('./models/HistorialAcademico');
const Alumno = require('./models/Alumno');
const Personal = require('./models/Personal');
const Materia = require('./models/Materia');
const { generarHistorial, vaciarPersonalAut } = require('./controllers/historialAcademicoController');
// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/auth', authRoutes);  // Usa las rutas de autenticación
app.use('/api/materias', materiasRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/tutores', tutorRoutes);
app.use('/api/docentes', docenteRoutes);
app.use('/api/coordinadores', coordinadorRoutes);
app.use('/api/administradores', administradorRoutes);
app.use('/api/cordgen', coordinadorGenRoutes);
app.use('/api/admingen', administradorGenRoutes);
app.use('/api/historial', historialAcademicoRoutes);
app.use('/descargas', express.static(path.join(__dirname, 'exports')));
//Ruta para los comprobantes
app.use('/uploads/comprobantes', express.static('uploads/comprobantes'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {

}).then(async () => {
  console.log('Conectado a MongoDB');

}).catch(error => {
  console.error('Error al conectar a MongoDB:', error);
});

console.log('MONGO_URI:', process.env.MONGO_URI);

//Apartado para generar el historial académico automáticamente 
cron.schedule('53 11 * * *', async () => {
  try {
    const hoyStr = new Date().toISOString().split('T')[0];
    const semestreActual = obtenerSemestreActual();


    let historial = await HistorialAcademico.findOne({ semestre: semestreActual });

    const matriculaAdmin = 'CG0000';
    const personal = await Personal.findOne({ matricula: matriculaAdmin });
    if (!personal) {
      throw new Error(`Usuario con matrícula ${matriculaAdmin} no encontrado.`);
    }

    if (!historial) {
      // Crear historial nuevo con fecha_de_borrado calculada
      const fechaDeBorrado = calcularFechaDeBorrado(semestreActual);

      historial = new HistorialAcademico({
        semestre: semestreActual,
        fecha_generacion: new Date(),
        generado_por: personal._id,
        fecha_de_borrado: fechaDeBorrado,
        archivos: {
          alumnos: '',
          materias: '',
          personal: ''
        }
      });
      await historial.save();

     }

    if (historial.fecha_de_borrado) {
      const fechaBorradoStr = new Date(historial.fecha_de_borrado).toISOString().split('T')[0];

      if (fechaBorradoStr === hoyStr) {
        console.log('Hoy es fecha de borrado, generando historial y vaciando colecciones...');

        const folderPath = path.join(__dirname, '..', 'exports', semestreActual);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        const urlAlumnos = 'http://localhost:5000/api/alumnos/exportar-csv';
        const urlMaterias = 'http://localhost:5000/api/materias/exportar-csv';
        const urlPersonal = 'http://localhost:5000/api/personal/exportar-csv';

        const rutaAlumnos = path.join(folderPath, 'alumnos.csv');
        const rutaMaterias = path.join(folderPath, 'materias.csv');
        const rutaPersonal = path.join(folderPath, 'personal.csv');

        await Promise.all([
          descargarYGuardar(urlAlumnos, rutaAlumnos),
          descargarYGuardar(urlMaterias, rutaMaterias),
          descargarYGuardar(urlPersonal, rutaPersonal),
        ]);

        historial.fecha_generacion = new Date();
        historial.generado_por = personal._id;
        historial.archivos = {
          alumnos: `/descargas/${semestreActual}/alumnos.csv`,
          materias: `/descargas/${semestreActual}/materias.csv`,
          personal: `/descargas/${semestreActual}/personal.csv`
        };
        await historial.save();

        await Promise.all([
          Alumno.deleteMany({}),
          vaciarPersonalAut(),
          Materia.deleteMany({})
        ]);

        console.log('Historial generado y base de datos vaciada correctamente.');
      } else {
        console.log('Hoy no es la fecha de borrado, no se hace nada.');
      }
    } else {
      console.log('No hay fecha_de_borrado configurada, actualizarla.');
    }
  } catch (error) {
    console.error('Error en cron job de historial:', error);
  }
});


// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});


// Funciones auxiliares
function obtenerSemestreActual() {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = hoy.getMonth() + 1;
  const periodo = mes >= 1 && mes <= 6 ? '1' : '2';
  return `${año}-${periodo}`;
}

function calcularFechaDeBorrado(semestre) {
  // semestre es string tipo "2025-1" o "2025-2"
  const [anioStr, periodo] = semestre.split('-');
  const anio = parseInt(anioStr, 10);
  if (periodo === '1') {
    return new Date(anio, 5, 1); // 1 Junio (mes 5 porque Enero=0)
  } else if (periodo === '2') {
    return new Date(anio, 11, 1); // 1 Diciembre (mes 11)
  }
  return null;
}

async function descargarYGuardar(url, outputPath) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(outputPath, response.data);
}
