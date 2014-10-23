// ==================================================
// setup for Arduino communication
// ==================================================
var serialPort = require("serialport");
var cFocus = 2;
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
          cs.setRate( "general", asObj.rate );
          cs.setLanguage( asObj.lang );        
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
cs.setRate( "general", rate );



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
  baudrate : 9600
}, false);



sp.open( function( error ) {
    if( error ) {
        console.log( "ERROR - Can't Opent Serial Port!" );
    } else {
        console.log( "SUCCESS - Serial Port Opened Successfully!" );
        cs.sys_say( "client_ready" );
        sp.on("data", function (data) {
            console.log("here: "+data);
            if( data.indexOf( "{" ) == 0 ) {
               var obj = JSON.parse( data );
                if( obj.hasOwnProperty( 'q' ) ) { // query
                    var theCursor = cd.getCursor();
                    switch( obj.q ) {
                        case "l" : // line
                            var target = 10;
                            var cLine = theCursor.line;
                            if( cLine < 10 ) {
                                target = cLine;
                                sp.write( target + "\n" );

                            }
                        break;
                        case "w" : // word
                            var target = 10;
                            var cWord = theCursor.word;
                            if( cWord < 10 ) {
                                target = cWord;
                                sp.write( target + "\n" );
                            }
                        break;
                        case "c" : // char
                            var target = 10;
                            var cChar = theCursor.char;
                            if( cChar < 10 ) {
                                target = cChar;
                                sp.write( target + "\n" );
                            }
                        break;
                    }
                }
                if( obj.hasOwnProperty( 't' ) ) { // turn
                    console.log( obj );
                    cFocus = parseInt(obj.t.d); // obj.turn.dial
                    console.log( cFocus );
                    switch( cFocus ) {
                        case 0 :
                            cs.sys_say( "settings" );
                        break;
                        case 1 :
                            cs.sys_say( "location" );
                        break;
                        case 2 :
                            cs.sys_say( "main" );
                        break;
                        case 3 :
                            cs.sys_say( "chat" );
                        break;
                        case 4 :
                            cs.sys_say( "find" );
                        break;
                    }
                }
                if( obj.hasOwnProperty( 'l' ) ) {
                    cs.cycleLang( obj.l );
                    var lObj = { "lang" : cs.getLanguage()  };
                    io.to( "settings" ).emit( 'langAdjusted', lObj );
                }
                
                if( obj.hasOwnProperty( 'm' ) ) { // menu
                    // TEMPORARILY, this cycles through available languages
                    cs.cycleLang( obj.m );
                    var lObj = { "lang" : cs.getLanguage()  };
                    io.to( "settings" ).emit( 'langAdjusted', lObj );
                }
                if( obj.hasOwnProperty( 'j' ) ){ // jump
                    if( cFocus == 2 ) {
                        cd.updateCursorBase( obj.j );
                    }
                }
                if( obj.hasOwnProperty( 'r' ) ){ // read
                    if( cFocus == 2 ) {
                        cd.updateCursor( obj.r, function( doRead ) {
                            if( doRead ) { 
                            console.log( ">>>>>>>>>> emitting cursorUpdate" );
                                console.log( cd.getCursor() );
                                io.to( "read" ).emit( 'cursorUpdate', { 'cursor' : cd.getCursor() } );
                                var tfs = cd.getTextForSpeech( obj.r );
                                if( tfs != "" ) {
                                    if( obj.r.hasOwnProperty( 'c' ) ) // char
                                        cs.say( tfs, "punctuation" );
                                    else
                                        cs.say( tfs );
                                }
                            } else {
                                cs.sys_say( "no_more_text" );
                            }
                        } );
                    }
                }
                if( obj.hasOwnProperty( 'sg' ) ){
                    cs.setRate( "general", obj.sg );
                    var rObj = { "rate" : cs.getRate( "general" ) };
                    io.to( "settings" ).emit( 'rateAdjusted', rObj );
                    cs.sys_say( "speechrate_adjusted" );
                }
                if( obj.hasOwnProperty( 'sc' ) ){
                    cs.setRate( "char", obj.sc );
                    // web-interface - NOT YET
                    //var rObj = { "rate" : cs.getRate( "char" ) };
                    //io.to( "settings" ).emit( 'rateAdjusted', rObj );
                    cs.sys_say( "speechrateChar_adjusted" );
                }
            }
        } );
    }

});




// keypress code
var arduinoSliderPromise = {};
var keypress = require('keypress')
keypress(process.stdin)

if (process.stdin.setRawMode)
  process.stdin.setRawMode(true)
else
  require('tty').setRawMode(true)

process.stdin.on('keypress', function (c, key) {

  console.log(0, c, key)
  if (key && key.ctrl && key.name == 'c') {
      // do nothing
      //process.stdin.pause()
  } else {
      //process.stdin.pause();
      cd.insert( key, function( data ) {  
          if( data ) { 
              // send socket to update client display
              var ulObj = data;
              console.log( ">>>>>>>>>> emitting updateLines" );
              io.to( "read" ).emit( 'updateLines', ulObj );
              if( arduinoSliderPromise ) {
                  clearTimeout( arduinoSliderPromise );                  
              }
              arduinoSliderPromise = setTimeout( function(){  
                  // send "MoveSliders" signal to Arduino
                  var cursorNow = cd.getCursor();
                  var cursorBases = cd.getCursorBases();
                  cursorNow.line = cursorNow.line - cursorBases.line;
                  cursorNow.word = cursorNow.word - cursorBases.word;
                  cursorNow.char = cursorNow.char - cursorBases.char;
                  var msg = "MS-" + cursorNow.line + "-" + cursorNow.word + "-" + cursorNow.char + "\n";
                  console.log( msg );
                  var iseng = cd.getCursor();
                  console.log( iseng );
                  sp.write( msg ); 
                  arduinoSliderPromise = null;
              }, 1000 );
          }
      } );
      //setTimeout( function() { 
      //    process.stdin.resume();
      //}, 1000 );
  }
})
  // disable mouse
  //keypress.disableMouse(process.stdin)

process.stdin.resume()




// ==================================================
// Exports
// ==================================================
module.exports = app;
