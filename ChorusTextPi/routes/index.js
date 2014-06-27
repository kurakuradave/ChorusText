var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Welcome' });
});

router.get('/import', function(req, res) {
  res.render('import', { title: 'Import Text' });
});

router.get('/read', function(req, res) {
  res.render('read', { title: 'Read Text' });
});

router.get('/settings', function(req, res) {
  res.render('settings', { title: 'Settings' });
});

router.get('/help', function(req, res) {
  res.render('help', { title: 'How To Use' });
});

router.get('/about', function(req, res) {
  res.render('about', { title: 'About ChorusText' });
});


module.exports = router;
