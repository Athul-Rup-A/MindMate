const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const permitRoles = require('../middlewares/roleMiddleware');
const StudentController = require('../controllers/student/studentController');

// Only student can access this
const studentAuth = [auth, permitRoles('student')];


//Auth
router.post('/signup', StudentController.signupStudent);
router.post('/login', StudentController.loginStudent);

// Profile
router.get('/profile', studentAuth, StudentController.getProfile);
router.put('/change-profile-password', studentAuth, StudentController.changePassword);
router.put('/profile', studentAuth, StudentController.updateProfile);

// Appointments
router.post('/appointments', studentAuth, StudentController.createAppointment);
router.get('/appointments', studentAuth, StudentController.getMyAppointments);
router.put('/appointments/:id', studentAuth, StudentController.updateAppointment);
router.delete('/appointments/:id', studentAuth, StudentController.cancelAppointment);

module.exports = router;
