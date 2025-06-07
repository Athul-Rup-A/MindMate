const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const permitRoles = require('../middlewares/roleMiddleware');
const StudentController = require('../controllers/student/studentController');

// Only student can access this
const studentAuth = [auth, permitRoles('student')];


// Auth
router.post('/signup', StudentController.signupStudent);
router.post('/login', StudentController.loginStudent);
router.post('/forgot-password', StudentController.forgotPasswordByPhone);
router.post('/forgot-aliasid', StudentController.forgotAliasIdByPhone);
router.put('/set-new-password', StudentController.setNewPassword);

// CounselorPsychologist-Dash
router.get('/counselorPsychologist', studentAuth, StudentController.getAvailableCounselorPsychologist);

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
router.get('/vents/all', studentAuth, StudentController.getAllVents); // for community wall
router.put('/vents/:id/like', studentAuth, StudentController.likeVent);
router.put('/vents/:id/report', studentAuth, StudentController.reportVent);
router.put('/vents/:id', studentAuth, StudentController.updateVent);
router.delete('/vents/:id', studentAuth, StudentController.deleteVent);

// Feedbacks
router.post('/feedbacks', studentAuth, StudentController.createFeedback);
router.get('/feedbacks', studentAuth, StudentController.getMyFeedbacks);
router.put('/feedbacks/:id', studentAuth, StudentController.updateFeedback);
router.delete('/feedbacks/:id', studentAuth, StudentController.deleteFeedback);

// SOS
router.post('/sos', studentAuth, StudentController.triggerSOS);
router.get('/sos', studentAuth, StudentController.getMySOSLogs);
router.delete('/sos/:id', studentAuth, StudentController.deleteSOSLog);

// Wellness (Mood & Habits)
router.post('/mood', studentAuth, StudentController.addMoodEntry);
router.get('/mood', studentAuth, StudentController.getMoodEntries);
router.put('/mood/:index', studentAuth, StudentController.updateMoodEntry);
router.delete('/mood/:index', studentAuth, StudentController.deleteMoodEntry);

router.post('/habits', studentAuth, StudentController.addHabitLog);
router.get('/habits', studentAuth, StudentController.getHabitLogs);
router.put('/habits/:index', studentAuth, StudentController.updateHabitLog);
router.delete('/habits/:index', studentAuth, StudentController.deleteHabitLog);

// Resources (View only)
router.get('/resources', studentAuth, StudentController.getResources);
router.get('/resources/:id', studentAuth, StudentController.getResourceById);

// Reports
router.post('/reports', studentAuth, StudentController.createReport);
router.get('/reports', studentAuth, StudentController.getMyReports);
router.delete('/reports/:id', studentAuth, StudentController.deleteReport);

module.exports = router;
