var express = require('express');
var router = express.Router();
var cd = {};

/*hookup instance of ChorusDocument*/
router.setCD = function( acd ) {
    cd = acd;
    console.log( cd );
};

/* test */
router.get( '/', function(req, res) {  
    res.send( 'This is Gnome test text import (use HTTP POST) and export (use HTTP GET). The url you should call is /gnome/text.' );
} );

/* GET text */
router.get( '/text', function( req, res ) {  
    var daText = cd.getVisualText();
    res.send( daText );
} );

/* POST text from Gnome desktop*/
router.post('/text', function(req, res) {
    console.log( req.body.text );
    if( req.body.text.indexOf( "\\n" ) != -1 ){
        console.log( "got double backslashes" );
    }
    cd.setVisualText( req.body.text );
    cd.parseToCTDocu();
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Text received successfully!');
    res.end();
});

module.exports = router;
