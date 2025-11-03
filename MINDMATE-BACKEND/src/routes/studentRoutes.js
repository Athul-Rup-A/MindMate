const express = require('express');
const auth = require('../middlewares/authMiddleware');
const permitRoles = require('../middlewares/roleMiddleware');
const StudentController = require('../controllers/student/studentController');

const router = express.Router();

// Only student can access this
const studentAuth = [auth, permitRoles('student')];

// Auth
router.post('/signup', StudentController.signupStudent);

// CounselorPsychologist-Section
router.get('/counselorPsychologist', studentAuth, StudentController.getAvailableCounselorPsychologist);
router.get('/counselorPsychologist/:id', studentAuth, StudentController.getCounselorPsychologistById);
router.get('/my-counselors', studentAuth, StudentController.getMyAppointmentCounselorPsychologists);

// Profile
router.get('/profile', studentAuth, StudentController.getProfile);
router.post('/request-profile-update', studentAuth, StudentController.updateProfileRequest);
router.get('/verify-profile-update/:token', StudentController.verifyProfileUpdate);
router.post('/request-password-change', studentAuth, StudentController.requestPasswordChange);
router.get('/verify-password-change/:token', StudentController.verifyPasswordChange);

// Appointments
router.post('/appointments', studentAuth, StudentController.createAppointment);
router.get('/appointments', studentAuth, StudentController.getMyAppointments);
router.put('/appointments/:id', studentAuth, StudentController.updateAppointment);
router.delete('/appointments/:id', studentAuth, StudentController.cancelAppointment);

// Vents
router.post('/vents', studentAuth, StudentController.createVent);
router.get('/vents', studentAuth, StudentController.getMyVents);
router.get('/vents/all', studentAuth, StudentController.getAllVents); // for community wall
router.put('/vents/:id/like', studentAuth, StudentController.likeVent);
router.put('/vents/:id/report', studentAuth, StudentController.reportVent);
router.put('/vents/:id', studentAuth, StudentController.updateVent);
router.delete('/vents/:id', studentAuth, StudentController.deleteVent);

// Feedbacks
router.post('/feedbacks', studentAuth, StudentController.createFeedback);
router.get('/feedbacks', studentAuth, StudentController.getMyFeedbacks);
router.get('/feedbacks/ratings', studentAuth, StudentController.getCounPsychRatings);
router.put('/feedbacks/:id', studentAuth, StudentController.updateFeedback);
router.delete('/feedbacks/:id', studentAuth, StudentController.deleteFeedback);

// Resources (View only)
router.get('/resources', studentAuth, StudentController.getResources);
router.get('/resources/:id', studentAuth, StudentController.getResourceById);

// Reports
router.post('/reports', studentAuth, StudentController.createReport);
router.get('/reports', studentAuth, StudentController.getMyReports);
router.delete('/reports/:id', studentAuth, StudentController.deleteReport);

module.exports = router;