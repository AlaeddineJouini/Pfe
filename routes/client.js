var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

router.get('/Form', function (req, res, next) {
    res.render('Client');
});
module.exports = router;