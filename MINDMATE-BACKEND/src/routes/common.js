const express = require('express');
const auth = require('../middlewares/authMiddleware');
const loginController = require('../controllers/login/loginController')

const router = express.Router();

// To resolve conflict b/w authenticated routes acessing authenticated routes
router.get('/whoami', auth, (req, res) => {
    res.status(200).json({
        id: req.user._id,
        role: req.user.role,
    });
});

// Unified login route for all roles
router.post('/login', loginController.login);

// Unified forgot password route for all roles
router.post('/login/forgot-password', loginController.forgotPasswordByPhone);

// Unified forgot Username route for all roles
router.post('/login/forgot-username', loginController.forgotUsernameByPhone);

// Unified set new password route for all roles
router.put('/login/set-new-password', loginController.setNewPassword);

module.exports = router;