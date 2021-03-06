var visualText = "";
var ctDocu = "";
var lines = [];
var ctCursor = { 'line' : 0,
                 'word' : 0,
                 'char' : 0,
                 'getLine' : function() { return this.line; },
                 'setLine' : function( val ) { this.line = parseInt( val ); },
                 'getWord' : function() { return this.word; },
                 'setWord' : function( val ) { this.word = parseInt( val ); },
                 'getChar' : function() { return this.char; },
                 'setChar' : function( val ) { this.char = parseInt( val ); } 
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
    // determine which element to update: line/word/char
    if( tactileInputObj.hasOwnProperty( 'char' ) ){
        if( getCursorLine() != -1 && getCursorWord() != -1 ) {
            setCursorChar( tactileInputObj.char );
        } else {
            setCursorChar( -1 );
        }
    } 

    if( tactileInputObj.hasOwnProperty( 'word' ) ){
        if( getCursorLine() != -1 ) {
            setCursorWord( tactileInputObj.word );
            // reset dependant(s)
            setCursorChar( 0 );
        } else {
            setCursorWord( -1 );
        }
    }

    if( tactileInputObj.hasOwnProperty( 'line' ) ){
        setCursorLine( tactileInputObj.line );  
        // reset dependant(s)
        setCursorWord( 0 );
        setCursorChar( 0 );
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
    if( val >= 0 && val < lines.length ) { 
        ctCursor.setLine( val );
    }
};




var setCursorWord = function( val ) {
    var tline = ctCursor.getLine();
    if( val >= 0 && val < lines[ tline ].words.length ) {
        ctCursor.setWord( val );
    }
};




var setCursorChar = function( val ) {
    var tword = lines[ getCursorLine() ].words[ getCursorWord() ];
    if( val >= 0 && val < tword.text.length ) {
        ctCursor.setChar( val );
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
module.exports.getTextForSpeech = getTextForSpeech;
module.exports.getCursorLine = getCursorLine;
module.exports.getCursorWord = getCursorWord;
module.exports.getCursorChar = getCursorChar;
module.exports.getCursor = getCursor;
module.exports.getLines = getLines;
