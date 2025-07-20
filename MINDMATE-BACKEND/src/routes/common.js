const express = require('express');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

// To resolve conflict b/w authenticated routes acessing authenticated routes
router.get('/whoami', auth, (req, res) => {
    res.status(200).json({
        id: req.user._id,
        role: req.user.role,
    });
});

module.exports = router;