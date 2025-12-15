const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const CoordinadorGen = require('../models/Coordinador_Gen');
require('dotenv').config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

async function createGeneralCoordinator() {
  try {
    const email = 'stimpabo27@gmail.com';
    const password = 'segura123';

    // Check if the coordinator already exists
    const existingCoordinator = await CoordinadorGen.findOne({ personalMatricula: email });
    if (existingCoordinator) {
      console.log('General Coordinator already exists:', email);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the general coordinator
    const newCoordinator = new CoordinadorGen({
      personalMatricula: email,
      alumnos: [],
    });

    await newCoordinator.save();

    console.log('General Coordinator created successfully:', email);
  } catch (error) {
    console.error('Error creating General Coordinator:', error);
  } finally {
    mongoose.connection.close();
  }
}

createGeneralCoordinator();