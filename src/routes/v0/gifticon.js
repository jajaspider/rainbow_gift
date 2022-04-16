var express = require('express');

const gifticonRouter = express.Router();

/* GET users listing. */
gifticonRouter.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

module.exports = gifticonRouter;