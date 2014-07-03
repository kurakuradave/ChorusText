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
// Socket.io application logic
// ==================================================

var importedRawText = "";

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on( 'importText', function( itObj ) {
    console.log( "<<<<<<<<<< Received new text: " );
    console.log( itObj.rawText );
    importedRawText = itObj.rawText;
    cd.setVisualText( itObj.rawText );
    cd.parseToCTDocu();
  } );

  socket.on( 'initForRead', function( data ) { 
    var ifrObj = { 'lines' : cd.getLines(), 
                   'cursor' : cd.getCursor()
    }; 
    socket.emit( 'initForRead', ifrObj );
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

cd.setVisualText( "This is just a dummy text.\nThat acts as a plaeeholder for the text.\nIt will be replaced as osoon as the user import some text." );
cd.parseToCTDocu();

cs.setLanguage( "indonesian" );


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
  parser: serialPort.parsers.readline("\n")
});




sp.on("data", function (data) {
  console.log("here: "+data);
  if( data.indexOf( "{" ) == 0 ) {
    var obj = JSON.parse( data );
    if( obj.hasOwnProperty( 'read' ) ){
        cd.updateCursor( obj.read );
        var tfs = cd.getTextForSpeech( obj.read );
        if( tfs != "" ) {
          if( obj.read.hasOwnProperty( 'char' ) )
            cs.say( tfs, "punctuation" );
          else
            cs.say( tfs );
        }
    }
  

/*
    if( obj.read ) {
        console.log( obj.read );
        if( obj.read.line ) {
            ipLine = obj.read.line;
            ipWord = 0;
            ipChar = 0;
            if( myLines[ obj.read.line ] ) {
                console.log( myLines[ obj.read.line ] );
                cs.say( myLines[ obj.read.line ] );
            }
        }
        else if( obj.read.word ) {
            ipWord = obj.read.word;
            ipChar = 0;
            if( myLines[ ipLine ] ) {
                var theWords =( " " + myLines[ ipLine ] ).split( " " );
                if( theWords[ ipWord ] ) {
                    console.log( theWords[ ipWord ] );
                    cs.say( theWords [ ipWord ]  );
                }
            }
        } else if( obj.read.char ) {
            ipChar = obj.read.char;
            if( myLines[ ipLine ] ) {
                var theWords = ( " " + myLines[ ipLine ] ).split( " " );
                var theWord = " " + theWords[ ipWord ];
                if( theWord[ ipChar ] ) {
                    console.log( theWord[ ipChar ] );
                    cs.say( theWord[ ipChar ] );
                }
            }
        }
    }
*/
  }
});




// ==================================================
// Exports
// ==================================================
module.exports = app;
