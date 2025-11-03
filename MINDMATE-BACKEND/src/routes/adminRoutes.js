const express = require('express');
const auth = require('../middlewares/authMiddleware');
const permitRoles = require('../middlewares/roleMiddleware');
const AdminController = require('../controllers/admin/adminController');

const router = express.Router();

// Only admin and moderator can access this
const AdminModeAuth = [auth, permitRoles('admin', 'moderator')];
const StrictAdminAuth = [auth, permitRoles('admin')];

// Auth
router.post('/signup', AdminController.signupAdmin);

// Profile
router.get('/profile', AdminModeAuth, AdminController.getProfile);
router.post('/request-profile-update', AdminModeAuth, AdminController.updateProfileRequest);
router.get('/verify-profile-update/:token', AdminController.verifyProfileUpdate);
router.post('/request-password-change', AdminModeAuth, AdminController.requestPasswordChange);
router.get('/verify-password-change/:token', AdminController.verifyPasswordChange);

// Counselor/Psychologist Approval and Management
router.get('/pending-approvals', StrictAdminAuth, AdminController.getPendingApprovals);
router.put('/approve/:id', StrictAdminAuth, AdminController.approveCounselorPsychologist);
router.put('/reject/:id', StrictAdminAuth, AdminController.rejectCounselorPsychologist);
router.delete('/counselorpsychologist/:id', StrictAdminAuth, AdminController.deleteCounselorPsychologistAccount);

// Report Moderation
router.get('/reports', AdminModeAuth, AdminController.getAllReports);
router.put('/reports/:reportId/review', AdminModeAuth, AdminController.reviewReport);
router.put('/reports/:reportId/resolve', AdminModeAuth, AdminController.resolveReport);

// Content Moderation
router.get('/resources', AdminModeAuth, AdminController.getAllResources)
router.get('/feedbacks', AdminModeAuth, AdminController.getAllFeedbacks);
router.delete('/vents/:ventId', AdminModeAuth, AdminController.deleteVentPost);
router.delete('/resources/:resourceId', AdminModeAuth, AdminController.deleteResource);
router.delete('/feedbacks/:feedbackId', AdminModeAuth, AdminController.deleteFeedback);

// Admin/Moderator Management
router.get('/users', StrictAdminAuth, AdminController.getAllAdmins);
router.post('/create', StrictAdminAuth, AdminController.createAdmin);
router.post('/resend-temp-password/:id', StrictAdminAuth, AdminController.resendTempPassword);
router.put('/:adminId', StrictAdminAuth, AdminController.updateAdmin);
router.delete('/:adminId', StrictAdminAuth, AdminController.deleteAdmin);

// Platform Stats
router.get('/stats', AdminModeAuth, AdminController.getDashboardStats);
router.get('/counselorPsychologist', AdminModeAuth, AdminController.getAllCounselorPsychologists);
router.get('/students', AdminModeAuth, AdminController.getAllStudents);
router.get('/vents', AdminModeAuth, AdminController.getAllVents);
router.get('/appointments', AdminModeAuth, AdminController.getAllAppointments);

// Status Update
router.put('/student/:studentId/status', StrictAdminAuth, AdminController.updateStudentStatus);
router.put('/counselorPsychologist/:id/status', StrictAdminAuth, AdminController.updateCounselorPsychologistStatus);

module.exports = router;