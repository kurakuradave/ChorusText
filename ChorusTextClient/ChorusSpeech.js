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

var spawn = require('child_process').spawn;
var util = require( 'util' );
var EventEmitter = require('events').EventEmitter;

function ChorusSpeech() {
    var self = this;
    var espeak;
    var speechRate = 350;
    var speechRateChar = 100; // for slower char by char spelling
    var language = "en";
    var speechText = "";
    var speechPID;
    var langIndex = 0;
    var supportedLanguages = [ "English", "Indonesian", "Chinese" ]
    var ipAddress = "";


    self.setRate = function( kind, val ) {
        val = parseInt( val );
        // boundary check
        if( val > 500 )
            val = 500;
        if( val < 25 )
            val = 25;
        // assignment
        if( kind == "char" ) 
            speechRateChar = val;
        else
            speechRate = val;
    };




    self.setLanguage = function( val ) {
        val = val.toLowerCase();
        if( val == "chinese" ) {
            language = "zh";
            langIndex = 2;
        } else if( val == "indonesian" ) {
            language = "id";
            langIndex = 1;
        } else {
            language = "en";
            langIndex = 0;
        }
        this.sys_say( "language_set" ) ;
    };




    self.getLanguage = function() {
        return supportedLanguages[ langIndex ];
    };




    self.cycleLang = function( dir ) {
        if( dir == "u" || dir == "c") {
            langIndex ++;
            if( langIndex > 2 ) langIndex = 0;
        } else if( dir == "d" ) {
            langIndex --;
            if( langIndex < 0 ) langIndex = 2;
        }
        this.setLanguage( supportedLanguages[ langIndex ] );
    };




    self.getSettings = function() {
        return { rate: speechRate,
                 lang: language
               };
    };




    self.getRate = function( kind ) {
        var ret = speechRate;
        if( kind == "char" )
            ret = speechRateChar;
        return ret;
    };




    self.say = function( theText, withPunctuation, callback ) {
        // kill all ongoing speeches
        if( speechPID ) {
            self.killSpeech( speechPID );
        }
    
        // spawn espeak
        speechText = theText;
        if( withPunctuation )
            espeak = spawn( 'espeak', [ '--punct', '-s'+speechRateChar, '-v'+language, speechText ] );
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
    
        if( callback )
            callback;
    };




    self.findIPAddress = function( callback ) {
        var daAddress = spawn( './findIPAddress.sh' );  
    
        daAddress.stdout.on('data', function (data) {
            ipAddress = data;
            self.emit( 'ipFound', ipAddress );
            callback( null );
        });
    };




    self.sayIPAddress = function(){
        self.say( "IP Address is " + ipAddress, true );
    };    




    self.killSpeech = function() {
        if( speechPID ) {
            var kill = spawn( 'kill', [ speechPID ] );
            speechPID = null;
        }
    };




    self.getSupportedLanguages = function() {
        return supportedLanguages;
    };




    self.sys_say = function( sys_msg_code ) {
        var sys_msg_full = "";
        switch( sys_msg_code ) {
            case "settings" :
                sys_msg_full = "Settings - press the left or right button to cycle through available languages. More setting options will be available here in future versions."
                if( language == "id" ) {
                   sys_msg_full = "Pengaturan ChorusText - Tekan tombol kiri atau kanan untuk mengganti bahasa yang sedang aktif. Pada versi berikutnya, akan ada lebih banyak pilihan pengaturan di sini.";
                } else if ( language == "zh" ) {
                   sys_msg_full = ""; 
                }            
            break;
            case "location" :
                sys_msg_full = "Location - this feature is currently under development."
                if( language == "id" ) {
                   sys_msg_full = "Lokasi - Fitur ini sedang dalam pengembangan.";
                } else if ( language == "zh" ) {
                   sys_msg_full = ""; 
                }            
            break;
            case "main" :
                sys_msg_full = "Main - This is the main text area. Explore the text by moving the three sliders on the device."
                if( language == "id" ) {
                   sys_msg_full = "Utama - Ini adalah bagian teks utama. Jelajahi teks ini dengan cara menggeser tiga knob yang tersedia pada permukaan alat ini.";
                } else if ( language == "zh" ) {
                   sys_msg_full = ""; 
                }            
            break;
            case "chat" :
                 sys_msg_full = "Chat - This feature is still under development";
                if( language == "id" ) {
                   sys_msg_full = "Obrolan - Fitur ini sedang dalam pengembangan.";
                } else if ( language == "zh" ) {
                   sys_msg_full = ""; 
                }            
            break;
            case "find" :
                sys_msg_full = "Find - This feature is currently under development";
                 if( language == "id" ) {
                   sys_msg_full = "Pencarian - Fitur ini sedang dalam pengembangan.";
                } else if ( language == "zh" ) {
                   sys_msg_full = ""; 
                }            
            break;
            case "speechrate_adjusted" :
                sys_msg_full = "Speech rate adjusted to: " + speechRate + ".";
                if( language == "id" ) {
                   sys_msg_full = "Kecepatan pengucapan di-stel ke: " + speechRate + ".";
                } else if ( language == "zh" ) {
                   sys_msg_full = "语言速度调整为：" + speechRate + "."; 
                }
            break;
            case "speechrateChar_adjusted" :
                sys_msg_full = "Spelling rate adjusted to: " + speechRateChar + ".";
                if( language == "id" ) {
                   sys_msg_full = "Kecepatan pengejaan di-stel ke: " + speechRateChar + ".";
                } else if ( language == "zh" ) {
                   sys_msg_full = "语言速度调整为：" + speechRateChar + "."; 
                }
            break;
            case "text_imported" :
                sys_msg_full = "New text is available.";
                if( language == "id" ) {
                    sys_msg_full = "Ada teks baru.";
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
                sys_msg_full = "English.";
                if( language == "id" ) {
                    sys_msg_full = "Bahasa Indonesia.";
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


};




util.inherits( ChorusSpeech, EventEmitter );

module.exports = ChorusSpeech;
