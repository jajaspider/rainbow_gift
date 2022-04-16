const express = require('express');

const gifticonRouter = require('./gifticon');

const router = express.Router();

router.use('/gifticon', gifticonRouter);

module.exports = router;