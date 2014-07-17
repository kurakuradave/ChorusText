var spawn = require('child_process').spawn;
var espeak;
var speechRate = 350;
var language = "en";
var speechText = "";
var speechPID;




var setRate = function( val ) {
    if( val > 200 )
        val = 200;
    if( val < 25 )
        val = 25;
    speechRate = val;
};




var setLanguage = function( val ) {
    val = val.toLowerCase();
    if( val == "chinese" ) {
        language = "zh";
    } else if( val == "indonesian" ) {
        language = "id";
    } else {
        language = "en";
    }
}




var getSettings = function() {
    return { rate: speechRate,
             lang: language
           };
}




var say = function( theText, withPunctuation ) {
    // kill all ongoing speeches
    if( speechPID ) {
        this.killSpeech( speechPID );
    }
    
    // spawn espeak
    speechText = theText;
    if( withPunctuation )
        espeak = spawn( 'espeak', [ '--punct', '-s'+speechRate, '-v'+language, speechText ] );
    else
        espeak = spawn( 'espeak', [ '-s'+speechRate, '-v'+language, speechText ] );    

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


module.exports.getSettings = getSettings;
module.exports.setRate = setRate;
module.exports.setLanguage = setLanguage;
module.exports.say = say;
module.exports.killSpeech = killSpeech;
