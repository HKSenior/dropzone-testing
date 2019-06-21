var express = require('express');
var router = express.Router();
const path = require('path');
const log = require('util').log;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

router.get('/testing', function(req, res, next) {
    res.sendFile(path.join(__dirname, '..', 'public', 'testing.html'));
});

/* POST loaded files. */
router.post('/upload', function(req, res) {
    log('Recived a file');
    res.statusCode = 200;
    res.end();
});

router.post('/form', function(req, res) {
    log('Recieved form data');
    console.log(req.body);
    res.statusCode = 200;
    res.redirect('/testing');
});

module.exports = router;
