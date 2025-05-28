const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json()); // To parse JSON body

// Routes
const studentRoutes = require('./src/routes/studentRoutes');
const counselorRoutes = require('./src/routes/counselorPsychologistRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Route Mapping
app.use('/api/students', studentRoutes);
app.use('/api/counselors', counselorRoutes);
app.use('/api/admin', adminRoutes);

// Error Middleware
const errorHandler = require('./src/middlewares/errorMiddleware');
app.use(errorHandler);

module.exports = app;
