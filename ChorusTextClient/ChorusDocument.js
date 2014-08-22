var visualText = "";
var ctDocu = "";
var lines = [];
var ctCursor = { 'line' : 0,
                 'word' : 0,
                 'char' : 0,
                 'baseLine' : 0,
                 'baseWord' : 0,
                 'baseChar' : 0,
                 'getLine' : function() { return this.line; },
                 'setLine' : function( val ) { this.line = this.baseLine + parseInt( val ); },
                 'getWord' : function() { return this.word; },
                 'setWord' : function( val ) { this.word = this.baseWord + parseInt( val ); },
                 'getChar' : function() { return this.char; },
                 'setChar' : function( val ) { this.char = this.baseChar + parseInt( val ); },
                 'getBaseLine' : function() { return this.baseLine; },
                 'setBaseLine' : function( val ) { 
                                     var tlines = lines.length;
                                     if( tlines <= 0 ) {
                                         //console.log( "tlines is an empty array, setting baseLine to 0" );
                                         this.baseLine = 0;
                                     } else {
                                         var pVal = parseInt( val ); 
                                         this.baseLine = pVal; 
                                         if( this.baseLine < 0 ) 
                                             this.baseLine = 0; 
                                         else if( this.baseLine > lines.length - 1 ) 
                                             this.baseLine = lines.length - 1; 
                                     }
                                 },
                 'getBaseWord' : function() { return this.baseWord; },
                 'setBaseWord' : function( val ) { 
                                     var twords = lines[this.line].words.length;
                                     if( twords <= 0 ) {
                                         //console.log( "twords is an empty array, setting baseWord to 0" );
                                         this.baseWord = 0;
                                     } else {
                                         var pVal = parseInt( val ); 
                                         this.baseWord = pVal; 
                                         if( this.baseWord < 0 ) 
                                             this.baseWord = 0; 
                                         else if( this.baseWord > lines[ this.line ].words.length - 1 ) 
                                             this.baseWord = lines[this.line].words.length - 1; 
                                     }
                                 },
                 'getBaseChar' : function() { return this.baseChar; },
                 'setBaseChar' : function( val ) { 
                                     var tchars = lines[this.line].words[this.word].chars.length;
                                     if( tchars <= 0 ) {
                                         //console.log( "tchars is an empty array, setting baseChar to 0" );
                                         this.baseChar = 0;
                                     } else {
                                         var pVal = parseInt( val ); 
                                         this.baseChar = pVal; 
                                         if( this.baseChar < 0 ) 
                                             this.baseChar = 0; 
                                         else if( this.baseChar > lines[this.line].words[this.word].chars.length - 1 ) {
                                             this.baseChar = lines[this.line].words[this.word].chars.length - 1; 
                                         }
                                     }
                                 } 
               };
var activeLines = [];



var setVisualText = function( someText ){
    var temp = "";
    if( someText != "" ) {
        temp = someText.replace( /\. /g, ".\n" );
    }
    visualText = temp;
    console.log( visualText );
};




var resetCursor = function() {
    setCursorLine( 0 );
    setCursorWord( 0 );
    setCursorChar( 0 );
};




var parseToCTDocu = function() {
    if( visualText == "" ) {
        // blank document, throw an error
    } else {
        loadCTDocu( visualText );
    }
    resetCursor();
};




var loadCTDocu = function( someText ) {
    lines = [];
    var tempLines = someText.split( "\n" );
    for( var i = 0; i < tempLines.length; i++ ) {
        var tline = tempLines[ i ];
        var aLineObj = buildLine( i, tline );
        lines[ i ] = aLineObj;
    }
};




var buildLine = function( someIndex, someLine ) {
    var wordObjs = [];
    var tempWords = someLine.split( " " );
    for( var i = 0; i < tempWords.length; i++ ) {
        var tword = tempWords[ i ];
        var aWordObj = buildWord( i, tword );
        wordObjs[ i ] = aWordObj;
    }

    return { 'index' : someIndex, 
             'text' : someLine, 
             'words' : wordObjs
    };
};




var buildWord = function( someIndex, someWord ) {
    var charObjs = [];
    var tempChars = someWord.split( '' );
    for( var i = 0; i < tempChars.length; i++ ) {
        var tchar = tempChars[ i ];
        var aCharObj = buildChar( i, tchar );
        charObjs[ i ] = aCharObj;
    }

    return { 'index' : someIndex, 
             'text' : someWord, 
             'chars' : charObjs
    };
};




var buildChar = function( someIndex, someChar ) {
    return { 'index' : someIndex, 
             'text' : someChar 
    };
};



var buildVisualText = function() {
  // later
};




var updateCursor = function( tactileInputObj ) {
console.log( tactileInputObj );
    // determine which element to update: line/word/char
    if( tactileInputObj.hasOwnProperty( 'char' ) ){
        console.log( "     tactileInputObj hasOwnProperty char" );
        if( getCursorLine() != -1 && getCursorWord() != -1 ) {
            setCursorChar( tactileInputObj.char ); // baseChar offset is done in setChar() within Chursor object
        } 
    } 

    if( tactileInputObj.hasOwnProperty( 'word' ) ){
        console.log( "     tactileInputObj hasOwnProperty word" );
        if( getCursorLine() != -1 ) {
            // reset dependant(s)
            //setCursorChar( 0 );
            setCursorBaseChar( "top" );
            setCursorWord( tactileInputObj.word );
        }
    }

    if( tactileInputObj.hasOwnProperty( 'line' ) ){
        console.log( "     tactileInputObj hasOwnProperty line" );
        // reset dependant(s) first, otherwise it will trip upon new cursorline that has no words or chars
        //setCursorWord( 0 );
        setCursorBaseWord( "top" );
        //setCursorChar( 0 );
        setCursorBaseChar( "top" );
        setCursorLine( tactileInputObj.line );  
    }
};




updateCursorBase = function( tactileInputObj ) {
    if( tactileInputObj.hasOwnProperty( 'char' ) ) {
        setCursorBaseChar( tactileInputObj.char );
    }
    if( tactileInputObj.hasOwnProperty( 'word' ) ) {
        setCursorBaseWord( tactileInputObj.word );
    }
    if( tactileInputObj.hasOwnProperty( 'line' ) ) {
        setCursorBaseLine( tactileInputObj.line );
    }
};




setCursorBaseChar = function( textVal ) {
    // textVal is one of: "top" / "scrollup" / "scrolldown" / "bottom"
    if( textVal == "top" ){
        console.log( "        inside setCursorBaseChar()... setting baseChar to 0" );
        ctCursor.setBaseChar( 0 );
        ctCursor.setChar( 0 );
    }
    if( textVal == "scrollup" ) {
        ctCursor.setBaseChar( ctCursor.getChar() - 9 );
    }
    if( textVal == "scrolldown" ) {
        ctCursor.setBaseChar( ctCursor.getChar() );
    }
    if( textVal == "bottom" ) {
        var posLastChar = lines[ ctCursor.getLine() ].words[ ctCursor.getWord() ].chars.length - 1;
        ctCursor.setChar( posLastChar );
        ctCursor.setBaseChar( posLastChar - 9 );
    }
    // boundary check
    if( ctCursor.getBaseChar() < 0 ) {
        ctCursor.setBaseChar( 0 );
    }
    if( ctCursor.getBaseChar() > lines[ ctCursor.getLine() ].words[ ctCursor.getWord() ].chars.length - 1 ) {
        ctCursor.setBaseChar( lines[ ctCursor.getLine() ].words[ ctCursor.getWord() ].chars.length - 1  );
    }
};




setCursorBaseWord = function( textVal ) {
    // textVal is one of: "top" / "scrollup" / "scrolldown" / "bottom"
    if( textVal == "top" ){
        ctCursor.setBaseWord( 0 );
        ctCursor.setWord( 0 );
    }
    if( textVal == "scrollup" ) {
        ctCursor.setBaseWord( ctCursor.getWord() - 9 );
    }
    if( textVal == "scrolldown" ) {
        ctCursor.setBaseWord( ctCursor.getWord() );
    }
    if( textVal == "bottom" ) {
        var posLastWord = lines[ ctCursor.getLine() ].words.length - 1;
        ctCursor.setWord( posLastWord );
        ctCursor.setBaseWord( posLastWord - 9 );
    }
    // boundary check
    if( ctCursor.getBaseWord() < 0 )
        ctCursor.setBaseWord( 0 );
    else if( ctCursor.getBaseWord() > lines[ ctCursor.getLine() ].words.length - 1 )
        ctCursor.setBaseWord( lines[ ctCursor.getLine() ].words.length - 1 );
};




setCursorBaseLine = function( textVal ) {
    // textVal is one of: "top" / "scrollup" / "scrolldown" / "bottom"
    if( textVal == "top" ){
        ctCursor.setBaseLine( 0 );
        ctCursor.setLine( 0 );
    }
    if( textVal == "scrollup" ) {
        ctCursor.setBaseLine( ctCursor.getLine() - 9 );
    }
    if( textVal == "scrolldown" ) {
        ctCursor.setBaseLine( ctCursor.getLine() );
    }
    if( textVal == "bottom" ) {
        var posLastLine = lines.length - 1;
        ctCursor.setLine( posLastLine );
        ctCursor.setBaseLine( posLastLine - 9 );
    }
    // boundary check
    if( ctCursor.getBaseLine() < 0 ) {
        ctCursor.setBaseLine( 0 );
    } else if( ctCursor.getBaseLine() > lines.length - 1 ) {
        ctCursor.setBaseLine( lines.length - 1 );
    }
};




var getTextForSpeech = function( tactileInputObj ) {
    var ret = "";
    if( tactileInputObj.hasOwnProperty( 'line' ) ) {  
        var lIndex = getCursorLine();
        if( lIndex != -1 ) {
            var theLineObj = lines[ lIndex ];
            ret = theLineObj.text;
        }
    } else if( tactileInputObj.hasOwnProperty( 'word' ) ) {
        var lIndex = getCursorLine();
        if( lIndex != -1 ) {
            var wIndex = getCursorWord();
            if( wIndex != -1 ) { 
                var theWordObj = lines[ lIndex ].words[ wIndex ];
                ret = theWordObj.text;
            }
        }
    } else if( tactileInputObj.hasOwnProperty( 'char' ) ) {
        var lIndex = getCursorLine();
        if( lIndex != -1 ) {
            var wIndex = getCursorWord();
            if( wIndex != -1 ) {
                var cIndex = getCursorChar();
                var theCharObj = lines[ lIndex ].words[ wIndex ].chars[ cIndex ];
                ret = theCharObj.text;
            }
        }
    }
    return ret;
};




var getCursorLine = function() {
    return ctCursor.getLine();
};




var getCursorWord = function() {
    return ctCursor.getWord();
};




var getCursorChar = function() {
    return ctCursor.getChar();
};




var setCursorLine = function( val ) {
    val = parseInt( val );
    if( val >= 0 && val + ctCursor.getBaseLine() >= 0 && val + ctCursor.getBaseLine() < lines.length ) { 
        ctCursor.setLine( val );
    }
};




var setCursorWord = function( val ) {
    val = parseInt( val );
    var tline = ctCursor.getLine();
    if( val >= 0 && val + ctCursor.getBaseWord() >= 0 && val + ctCursor.getBaseWord() < lines[ tline ].words.length ) {
        ctCursor.setWord( val );
    }
};




var setCursorChar = function( val ) {
    val = parseInt(val);
    var theWord = lines[ ctCursor.getLine() ].words[ ctCursor.getWord() ];
    if( typeof theWord == "object" && theWord.chars ) {
        var tchar = theWord.chars.length;
        if( val >= 0 && val + ctCursor.getBaseChar() >= 0 && val + ctCursor.getBaseChar() < tchar ) {
            ctCursor.setChar( val );
        }
    }
};




var getLines = function() {
    return lines;
};




var getCursor = function() {
    return { 'line' : getCursorLine(),
             'word' : getCursorWord(),
             'char' : getCursorChar() 
    };
}




module.exports.setVisualText = setVisualText;
module.exports.parseToCTDocu = parseToCTDocu;
module.exports.buildVisualText = buildVisualText;
module.exports.updateCursor = updateCursor;
module.exports.updateCursorBase = updateCursorBase;
module.exports.getTextForSpeech = getTextForSpeech;
module.exports.getCursorLine = getCursorLine;
module.exports.getCursorWord = getCursorWord;
module.exports.getCursorChar = getCursorChar;
module.exports.getCursor = getCursor;
module.exports.getLines = getLines;