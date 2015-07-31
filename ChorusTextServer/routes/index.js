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
    if( req.body.hasOwnProperty( 'devNum' ) ) {  // from device
        var testdocu = { 'lines' : [ "this is a test document", "for testing collaborative document editing", "With every new feature, comes all kinds of new bugs" ] };
        res.send( JSON.stringify( testdocu ) );
    } else { // from web browser
        var aCCDocuID = req.params.name;
        var aUserID = req.body.userID;
        sm.userJoins( aCCDocuID, aUserID, function( arg )  {  
            res.sendStatus( 200 );    
        } );
    }
} );

module.exports = router;
