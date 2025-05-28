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

module.exports = router;
