const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Personal = require('../models/Personal');
require('dotenv').config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
  console.log('Connected to MongoDB');
  fixUnhashedPasswords();
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

async function fixUnhashedPasswords() {
  try {
    // Buscar todos los personal
    const allPersonal = await Personal.find();
    let fixed = 0;
    let alreadyHashed = 0;

    for (const personal of allPersonal) {
      // Las contraseñas hasheadas con bcrypt empiezan con $2a$ o $2b$
      if (!personal.password.startsWith('$2')) {
        console.log(`Hasheando contraseña para: ${personal.matricula} - ${personal.nombre}`);
        
        // La contraseña actual es texto plano, hashearla
        const hashedPassword = await bcrypt.hash(personal.password, 10);
        await Personal.findByIdAndUpdate(personal._id, { password: hashedPassword });
        fixed++;
      } else {
        alreadyHashed++;
      }
    }

    console.log('\n--- Resumen ---');
    console.log(`Contraseñas corregidas: ${fixed}`);
    console.log(`Ya estaban hasheadas: ${alreadyHashed}`);
    console.log('¡Proceso completado!');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}
