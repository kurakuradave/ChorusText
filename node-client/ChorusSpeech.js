var spawn = require('child_process').spawn;
var espeak;
var speechRate = 350;
var speechText = "";
var speechPID;




var setRate = function( val ) {
    if( val > 200 )
        val = 200;
    if( val < 50 )
        val = 50;
    speechRate = val;
};




var say = function( theText ) {
    // kill all ongoing speeches
    if( speechPID ) {
        this.killSpeech( speechPID );
    }
    
    // spawn espeak
    speechText = theText;
    espeak = spawn( 'espeak', [ '-s'+speechRate, speechText ] );
    
    // store its PID
    speechPID = espeak.pid;
    console.log( speechPID + " : " + speechText );




    // handlers
    espeak.stdout.on('data', function (data) {
    // do nothing
    });

    espeak.stderr.on( 'data', function( data ) {
    // do nothing
    } );

    espeak.on( 'exit', function( code ) {  
        //speechPID = null;
    } );
};




var killSpeech = function() {
    if( speechPID ) {
        var kill = spawn( 'kill', [ speechPID ] );
        speechPID = null;
    }
};


module.exports.setRate =setRate;
module.exports.say = say;
module.exports.killSpeech = killSpeech;
