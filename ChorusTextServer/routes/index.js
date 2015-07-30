var express = require('express');
var router = express.Router();
var sm = {}; // placeholder, to be completed with linkSM() below

router.linkSM = function( anSM ) {
    sm = anSM;
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get( '/ccd/:name', function( req, res ) {  
    var aCCDocuID = req.params.name;
    var aUserID = req.body.userID;
    sm.userJoins( aCCDocuID, aUserID );
    res.sendStatus( 200 );
} );

module.exports = router;
