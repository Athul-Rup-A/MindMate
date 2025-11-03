const express = require('express');
const auth = require('../middlewares/authMiddleware');
const permitRoles = require('../middlewares/roleMiddleware');
const CounselorPsychologistController = require('../controllers/counselorPsychologist/counselorPsychologistController');
const resourceController = require('../controllers/counselorPsychologist/resourceController')
const upload = require('../utils/upload')

const router = express.Router();

// Only counselor and psychologist can access this
const CouncPsychoAuth = [auth, permitRoles('counselor', 'psychologist')];

// Auth
router.post('/signup', CounselorPsychologistController.signupCounselorPsychologist);

// Profile
router.get('/profile', CouncPsychoAuth, CounselorPsychologistController.getProfile);
router.put(
  '/profile-image',
  CouncPsychoAuth,
  upload.single('ProfileImage'),
  CounselorPsychologistController.updateProfileImage
);
router.post('/request-profile-update', CouncPsychoAuth, CounselorPsychologistController.updateProfileRequest);
router.get('/verify-profile-update/:token', CounselorPsychologistController.verifyProfileUpdate);
router.post('/request-password-change', CouncPsychoAuth, CounselorPsychologistController.requestPasswordChange);
router.get('/verify-password-change/:token', CounselorPsychologistController.verifyPasswordChange);

// Appointment handling
router.get('/appointments', CouncPsychoAuth, CounselorPsychologistController.getAppointments);
router.put('/appointments/:appointmentId/status', CouncPsychoAuth, CounselorPsychologistController.updateAppointmentStatus);

// Availability slots
router.get('/availability', CouncPsychoAuth, CounselorPsychologistController.getAvailability);
router.put('/availability', CouncPsychoAuth, CounselorPsychologistController.updateAvailability);

// Feedback view
router.get('/feedback', CouncPsychoAuth, CounselorPsychologistController.getFeedbacks);

// Resource management
router.post('/resources', CouncPsychoAuth, resourceController.createResource);
router.get('/resources', CouncPsychoAuth, resourceController.getOwnResources);
router.put('/resources/:id', CouncPsychoAuth, resourceController.updateResource);
router.delete('/resources/:id', CouncPsychoAuth, resourceController.deleteResource);

// Student-Section
router.get('/students/:id', CouncPsychoAuth, CounselorPsychologistController.getStudentInfo);
router.get('/my-students', CouncPsychoAuth, CounselorPsychologistController.getMyStudents);

// Own-Statistics
router.get('/stats', CouncPsychoAuth, CounselorPsychologistController.getStats);

module.exports = router;