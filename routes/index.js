var express = require('express');
var router = express.Router();
const path = require('path');
const log = require('util').log;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

/* POST loaded files. */
router.post('/upload', function(req, res) {
    log('Recived a file');
    res.statusCode = 200;
    res.end();
});

module.exports = router;
