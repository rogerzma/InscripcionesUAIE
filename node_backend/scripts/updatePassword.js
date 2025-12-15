const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Personal = require('../models/Personal');
require('dotenv').config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

async function updatePassword() {
  try {
    const matricula = 'CG0000';
    const newPassword = 'segura123';

    // Find the user
    const personal = await Personal.findOne({ matricula });
    if (!personal) {
      console.log('Usuario no encontrado con matrícula:', matricula);
      return;
    }

    console.log('Usuario encontrado:', personal.nombre);
    console.log('Contraseña actual:', personal.password);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    personal.password = hashedPassword;
    await personal.save();

    console.log('Contraseña actualizada exitosamente');
    console.log('Nueva contraseña hasheada:', hashedPassword);
    
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    mongoose.connection.close();
  }
}

updatePassword();
