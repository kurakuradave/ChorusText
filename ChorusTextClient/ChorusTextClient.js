/*-----------------------------------------------------------------------------\
|                                                                              |
|    ChorusTextClient - Client program for ChorusText Open Assistive Device    |
|    Copyright (C) 2014  David Effendi                                         |
|    email: kurakuradave@gmail.com                                             |
|                                                                              |
|    This program is free software: you can redistribute it and/or modify      |
|    it under the terms of the GNU General Public License as published by      |
|    the Free Software Foundation, either version 3 of the License, or         |
|    (at your option) any later version.                                       |
|                                                                              |
|    This program is distributed in the hope that it will be useful,           |
|    but WITHOUT ANY WARRANTY; without even the implied warranty of            |
|    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the             |
|    GNU General Public License for more details.                              |
|                                                                              |
|    You should have received a copy of the GNU General Public License         |
|    along with this program.  If not, see <http://www.gnu.org/licenses/>.     |
|                                                                              |
\-----------------------------------------------------------------------------*/


// ==================================================
// setup for Arduino communication
// ==================================================
var serialPort = require("serialport");
var cFocus = 2;
var ChorusSpeech = require( './ChorusSpeech.js' );
var cs = new ChorusSpeech();
var CD = require( './ChorusDocument.js' );
var cd = new CD();
var SerialPort = serialPort.SerialPort; // localize object constructor




// ========================================================
// setup for the Web Interface Server - Express & Socket.io
// ========================================================
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

var arduino = { comName : "", pnpId : "usb-Arduino" };

var detectArduino = function( callback ) {
    // list serial ports available
    serialPort.list(function (err, ports) {
      if( err ){
          var msg = "Error opening Serial port: " + err.msg + " Terminating.";
          console.log( msg );
          cs.say( msg );
          process.exit();
      }
      ports.forEach(function(port) {
        console.log(port.comName);
        console.log(port.pnpId);
        console.log(port.manufacturer);
        // find arduino on usb serial
        if( port.pnpId.indexOf( arduino.pnpId ) != -1 ) { 
            arduino.comName = port.comName;
            console.log( arduino  );
        }
      });
      // if arduino NOT found
      if( arduino.comName == "" ) {
        var msg = "Error. Can not find Arduino, is it plugged in to USB? Terminating now";
        console.log( msg );
        cs.say( msg );
        process.exit()
      } else {
          setTimeout( function() {
              callback( arduino.comName );
          }, 12000 );
      }
  });
};

var connectArduino = function( daPath ) {
    console.log( "connecting to Arduino" );
    console.log( daPath );
    // init serial port at daPath
    sp = new SerialPort(daPath, {
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
                    var obj = {};
                    try{
                        obj = JSON.parse( data );
                    } catch( e ) {
                        console.log( "ERROR - Invalid JSON received from Arduino!" );
                        cs.say( "Error" ); // should use cs.sys_say here
                    }
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
                                    var theCursor = cd.getCursor();
                                    console.log( theCursor );
                                    io.to( "read" ).emit( 'cursorUpdate', { 'cursor' : theCursor } );
                                    var theCursorBases = cd.getCursorBases();
                                    var msg = "MS-" + ( theCursor.line - theCursorBases.line ) + "-" + ( theCursor.word - theCursorBases.word ) + "-" + ( theCursor.char - theCursorBases.char ) + "\n" ;
                                    console.log( msg );
                                    //sp.write( msg );
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
                    if( obj.hasOwnProperty( 'v' ) ){ // verify current line/word/char
                        if( cFocus == 2 ) {
                            cd.updateCursor( obj.v, function( doRead ) {
                                if( doRead ) { 
                                console.log( ">>>>>>>>>> emitting cursorUpdate" );
                                    var theCursor = cd.getCursor();
                                    console.log( theCursor );
                                    io.to( "read" ).emit( 'cursorUpdate', { 'cursor' : theCursor } );
                                    var theCursorBases = cd.getCursorBases();
                                    var msg = "MS-" + ( theCursor.line - theCursorBases.line ) + "-" + ( theCursor.word - theCursorBases.word ) + "-" + ( theCursor.char - theCursorBases.char ) + "\n" ;
                                    console.log( msg );
                                    sp.write( msg ); // this is the only line that differs from a "read" see above
                                    var tfs = cd.getTextForSpeech( obj.v );
                                    if( tfs != "" ) {
                                        if( obj.v.hasOwnProperty( 'c' ) ) // char
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
                //sp.flush();
            } );  // end sp.on( 'data' )
        }
    });
};


var announceIPAddress = function( callback ) {
    cs.findIPAddress( function( err ) {
        if( err ) {
            cs.say( "ERROR! Can't find IP Address, terminating!" );
            process.exit();
        } else {
            callback;
        }
    } );
};




cs.on( 'ipFound', function( data ) {  
    console.log( "IP address is: " + data );
    cs.sayIPAddress();
} );




cs.say( "ChorusText Starting..." );
setTimeout( function() {
    announceIPAddress( detectArduino( connectArduino ) );
}, 3000 );





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
      cd.changedByChar( key, function( data ){
          data.dor = "lalalalalalallaalalalalalalalallalalalalalalala";
          console.log( data );
      } ); // experimental
      /*
      if( key.name == "backspace" ){
          cd.deleteChar( function( data ) {
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
      } else {
          cd.insertChar( key, function( data ) {  
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
                  }, 1000 );
                      arduinoSliderPromise = null;
              }
          } );
      }
      */
      //setTimeout( function() { 
      //    process.stdin.resume();
      //}, 1000 );
  }
})
  // disable mouse
  //keypress.disableMouse(process.stdin)

process.stdin.resume()



var toArd = "";

// listener for new target positions for the sliders to move to
cd.on( 'cdUpdated', function( data ) {  
    var ulObj = data;
    console.log( ">>>>>>>>>> emitting updateLines" );
    io.to( "read" ).emit( 'updateLines', ulObj );

    toArd = "MS-" + data.newCursor.line + "-" + data.newCursor.word + "-" + data.newCursor.char + "\n";
    console.log( "pushing: " + toArd );
} );

// digest cycle for outgoing slider movement ("MS" for "MoveSliders") messages to Arduino, as a result of keystrokes (typing)
// incoming messages from Arduino are processed directly, and doesn't go through digest
var digest = function() {
    if( toArd != "" ) {
        console.log( ">>> going to Arduino >>> " + toArd );
        sp.write( toArd );
        toArd = "";
    }
};

setInterval( function(){
    digest();
}, 1000 );



// ==================================================
// Exports
// ==================================================
module.exports = app;
