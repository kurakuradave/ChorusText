var serialPort = require("serialport");
var cs = require( './ChorusSpeech.js' );
var SerialPort = serialPort.SerialPort; // localize object constructor
var sp;
var myParagraph = "";
var rate = 100;
var ipLine = 0;
var ipWord = 0;
var ipChar = 0;




// test paragraph
myParagraph += "\nMary had a little lamb\n";
myParagraph += "Little lamb, little land\n";
myParagraph += "Mary had a little lamb\n";
myParagraph += "It's fleas was white as snow";

// test lines
var myLines = myParagraph.split( "\n" );
console.log( myLines );

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
  }
});
