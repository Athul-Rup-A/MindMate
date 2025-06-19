const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const permitRoles = require('../middlewares/roleMiddleware');
const CounselorPsychologistController = require('../controllers/counselorPsychologist/counselorPsychologistController');
const resourceController = require('../controllers/counselorPsychologist/resourceController')

// Only counselor and psychologist can access this
const CouncPsychoAuth = [auth, permitRoles('counselor', 'psychologist')];


// Auth
router.post('/signup', CounselorPsychologistController.signupCounselorPsychologist);
router.post('/login', CounselorPsychologistController.loginCounselorPsychologist);
router.post('/forgot-password', CounselorPsychologistController.forgotPasswordByPhone);
router.post('/forgot-aliasid', CounselorPsychologistController.forgotAliasIdByPhone);
router.put('/set-new-password', CounselorPsychologistController.setNewPassword);

// Profile
router.get('/profile', CouncPsychoAuth, CounselorPsychologistController.getProfile);
router.put('/change-profile-password', CouncPsychoAuth, CounselorPsychologistController.changePassword);
router.put('/profile', CouncPsychoAuth, CounselorPsychologistController.updateProfile);

// Appointment handling
router.get('/appointments', CouncPsychoAuth, CounselorPsychologistController.getAppointments);
router.put('/appointments/:appointmentId/status', CouncPsychoAuth, CounselorPsychologistController.updateAppointmentStatus);

// Availability slots
router.get('/availability', CouncPsychoAuth, CounselorPsychologistController.getAvailability);
router.put('/availability', CouncPsychoAuth, CounselorPsychologistController.updateAvailability);

// Feedback view
router.get('/feedback', CouncPsychoAuth, CounselorPsychologistController.getFeedbacks);

// SOS logs
router.get('/sos', CouncPsychoAuth, CounselorPsychologistController.getSOSLogs);
router.put('/sos/respond/:logId', CouncPsychoAuth, CounselorPsychologistController.respondSOS);

// Resource management
router.post('/resources', CouncPsychoAuth, resourceController.createResource);
router.get('/resources', CouncPsychoAuth, resourceController.getOwnResources);
router.put('/resources/:id', CouncPsychoAuth, resourceController.updateResource);
router.delete('/resources/:id', CouncPsychoAuth, resourceController.deleteResource);

module.exports = router;