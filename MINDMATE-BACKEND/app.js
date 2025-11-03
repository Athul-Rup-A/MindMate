require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./src/middlewares/errorMiddleware');
const path = require('path');

// Routes
const commonRoute = require('./src/routes/common');
const studentRoutes = require('./src/routes/studentRoutes');
const counselorPsychologistRoutes = require('./src/routes/counselorPsychologistRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const chatRoutes = require('./src/routes/chatRoutes')

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json()); // To parse JSON body

// Route Mapping
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', commonRoute);
app.use('/api/students', studentRoutes);
app.use('/api/counselorPsychologist', counselorPsychologistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Error Middleware
app.use(errorHandler);

module.exports = app;