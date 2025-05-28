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

// Vents
router.post('/vents', studentAuth, StudentController.createVent);
router.get('/vents', studentAuth, StudentController.getMyVents);
router.put('/vents/:id', studentAuth, StudentController.updateVent);
router.delete('/vents/:id', studentAuth, StudentController.deleteVent);

// Feedbacks
router.post('/feedbacks', studentAuth, StudentController.submitFeedback);
router.get('/feedbacks', studentAuth, StudentController.getMyFeedbacks);
router.put('/feedbacks/:id', studentAuth, StudentController.updateFeedback);
router.delete('/feedbacks/:id', studentAuth, StudentController.deleteFeedback);

// SOS
router.post('/sos', studentAuth, StudentController.triggerSOS);
router.get('/sos', studentAuth, StudentController.getMySOSLogs);
router.delete('/sos/:id', studentAuth, StudentController.deleteSOSLog);

module.exports = router;
