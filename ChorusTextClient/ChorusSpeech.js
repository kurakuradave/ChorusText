var spawn = require('child_process').spawn;
var espeak;
var speechRate = 350;
var language = "en";
var speechText = "";
var speechPID;
var supportedLanguages = [ "English", "Indonesian", "Chinese" ]




var setRate = function( val ) {
        if( val == "inc" ) { // coming from tactile input
            speechRate += 10;
        } else if ( val == "dec" ) {
            speechRate -= 10;
        } else { // coming from web interface
            speechRate = parseInt( val );
        }
    // boundary check
    if( val > 500 )
        val = 500;
    if( val < 25 )
        val = 25;
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




getRate = function() {
    return speechRate;
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




var getSupportedLanguages = function() {
    return supportedLanguages;
};




var sys_say = function( sys_msg_code ) {
    var sys_msg_full = "";
    switch( sys_msg_code ) {
        case "speechrate_adjusted" :
            sys_msg_full = "Speech rate adjusted to: " + speechRate + ".";
            if( language == "id" ) {
               sys_msg_full = "Kecepatan pengucapan di-stel ke: " + speechRate + ".";
            } else if ( language == "zh" ) {
               sys_msg_full = "语言速度调整为：" + speechRate + "."; 
            }
        break;
        case "text_imported" :
            sys_msg_full = "New text imported successfully.";
            if( language == "id" ) {
                sys_msg_full = "Import text baru telah berhasil.";
            } else if ( language == "zh" ) {
                sys_msg_full = "新文本导入成功。";
            }
        break;
        case "client_ready" :
            sys_msg_full = "Device is ready.";
            if( language == "id" ) {
                sys_msg_full = "Perangkat siap beroperasi.";
            } else if( language == "zh" ) {
                sys_msg_full = "设备已准备就绪。";
            }
        break;
        case "language_set" : 
            sys_msg_full = "Language is set to: English.";
            if( language == "id" ) {
                sys_msg_full = "Sekarang menggunakan Bahasa Indonesia.";
            } else if( language == "zh" ) {
                sys_msg_full = "语言设置为：中文";
            }
        break;
        case "no_more_text" :
            sys_msg_full = "No more text to read.";
            if ( language == "id" ) {
                sys_msg_full = "Tidak ada lagi teks untuk dibacakan.";
            } else if( language == "zh" ) {
                sys_msg_full = "没有文字阅读了。";
            }
        break;
    }
    this.say( sys_msg_full );
};



module.exports.getSupportedLanguages = getSupportedLanguages;
module.exports.getSettings = getSettings;
module.exports.setRate = setRate;
module.exports.getRate = getRate;
module.exports.setLanguage = setLanguage;
module.exports.say = say;
module.exports.sys_say = sys_say;
module.exports.killSpeech = killSpeech;
