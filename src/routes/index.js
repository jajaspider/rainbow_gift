const express = require('express');
const v0 = require('./v0');
const auth = require('./auth');

const router = express.Router();

router.use('/auth', auth);
router.use('/v0', (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/login');
    }
    next();
}, v0);


module.exports = router;