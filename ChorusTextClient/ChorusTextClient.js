// ==================================================
// setup for Arduino communication
// ==================================================
var serialPort = require("serialport");
var cs = require( './ChorusSpeech.js' );
var cd = require( './ChorusDocument.js' );
var SerialPort = serialPort.SerialPort; // localize object constructor




// ==================================================
// setup for the PiServer - Express & Socket.io
// ==================================================
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// mounting socket.io
var http = require('http').createServer(app).listen(3000);
var io = require( 'socket.io' )( http );

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});




// ==================================================
// socket.io application logic
// ==================================================

var importedRawText = "";
io.on('connection', function(socket){
      console.log('a user connected');

      socket.on( 'initForImport', function( data ) {  
          console.log( "<<<<<<<<<< received initForImport" );
          console.log( "joining room import" );
          socket.join( "import" );
      } );

      socket.on( 'importText', function( itObj ) {
        console.log( "<<<<<<<<<< Received new text: " );
        console.log( itObj.rawText );
        importedRawText = itObj.rawText;
        cd.setVisualText( itObj.rawText );
        cd.parseToCTDocu();
        cs.sys_say( "text_imported" );
        //send update to sockets in room import
        var ifrObj = { 'lines' : cd.getLines(), 
                       'cursor' : cd.getCursor()
        }; 
        console.log( ">>>>>>>>>> emitting initForRead" );
        io.to( "read" ).emit( 'initForRead', ifrObj );
      } );

      socket.on( 'initForRead', function( data ) { 
          console.log( "<<<<<<<<<< received initForRead" );
          console.log( "joining room read" );
        socket.join( "read" );
        var ifrObj = { 'lines' : cd.getLines(), 
                       'cursor' : cd.getCursor()
        }; 
        console.log( ">>>>>>>>>> emitting initForRead" );
        io.to( "read" ).emit( 'initForRead', ifrObj );
      } ); 

      socket.on( 'initForSettings', function( data ) {  
          console.log( "<<<<<<<<<< received initForSettings" );
          console.log( "joining room settings" );
        socket.join( 'settings' );
        var ifsObj = { 'espeakSettings': cs.getSettings(), 'supportedLanguages' : cs.getSupportedLanguages() };
        console.log( ">>>>>>>>>> emitting initForSettings" );
        io.to( "settings" ).emit( 'initForSettings', ifsObj );
      } );  

      socket.on( 'applySettings', function( asObj ) { 
          console.log( "<<<<<<<<<< received applySettings" );
          console.log( "applying new settings" );
          cs.setRate( asObj.rate );
          cs.setLanguage( asObj.lang );
          cs.sys_say( "language_set" );
        
      } );

});




// ==================================================
// Arduino application logic
// ==================================================
var sp;
var myParagraph = "";
var rate = 200;
var ipLine = 0;
var ipWord = 0;
var ipChar = 0;

cd.setVisualText( "This is just a dummy text.\nThat acts as a placeholder for the text.\nIt will be replaced as soon as the user import some text." );
cd.parseToCTDocu();

cs.setLanguage( "english" );


// set rate
cs.setRate( rate );



// list serial ports available
serialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});




// init serial port at /dev/ttyACM0
sp = new SerialPort("/dev/ttyACM0", {
  parser: serialPort.parsers.readline("\n"), 
  baudrate : 9600,
  false
});



sp.open( function( error ) {
    if( error ) {
        console.log( "ERROR - Can't Opent Serial Port!" );
    } else {
        console.log( "SUCCESS - Serial Port Opened Successfully!" );
        cs.sys_say( "client_ready" );
        sp.on("data", function (data) {
            console.log("here: "+data);
            if( data.indexOf( "{" ) == 0 && data.indexOf( "}" ) == data.length - 1 ) {
                var obj = JSON.parse( data );
                if( obj.hasOwnProperty( 'query' ) ) {
                    var theCursor = cd.getCursor();
                    switch( obj.query ) {
                        case "line" :
                            var target = 10;
                            var cLine = theCursor.line;
                            if( cLine < 10 ) {
                                target = cLine;
                                sp.write( target + "\n" );
                            }
                        break;
                        case "word" :
                            var target = 10;
                            var cWord = theCursor.word;
                            if( cWord < 10 ) {
                                target = cWord;
                                sp.write( target + "\n" );
                            }
                        break;
                        case "char" :
                            var target = 10;
                            var cChar = theCursor.char;
                            if( cChar < 10 ) {
                                target = cChar;
                                sp.write( target + "\n" );
                            }
                        break;
                    }
                }
            
                if( obj.hasOwnProperty( 'jump' ) ){
                    cd.updateCursorBase( obj.jump );
                    console.log( "" );
                }
                if( obj.hasOwnProperty( 'read' ) ){
                    cd.updateCursor( obj.read, function( doRead ) {
                        if( doRead ) { 
                            console.log( ">>>>>>>>>> emitting cursorUpdate" );
                            console.log( cd.getCursor() );
                            io.to( "read" ).emit( 'cursorUpdate', { 'cursor' : cd.getCursor() } );
                            var tfs = cd.getTextForSpeech( obj.read );
                            if( tfs != "" ) {
                                if( obj.read.hasOwnProperty( 'char' ) )
                                    cs.say( tfs, "punctuation" );
                                else
                                    cs.say( tfs );
                            }
                        } else {
                            cs.sys_say( "no_more_text" );
                        }
                    } );
                }
                if( obj.hasOwnProperty( 'speechrate' ) ){
                    cs.setRate( obj.speechrate );
                    cs.sys_say( "speechrate_adjusted" );
                }
            }
        } );
    }

});





// ==================================================
// Exports
// ==================================================
module.exports = app;
