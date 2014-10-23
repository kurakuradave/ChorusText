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
                 'setLine' : function( val ) { this.line = this.baseLine + parseInt( val ); if( this.line>=lines.length ) this.line = lines.length - 1; },
                 'getWord' : function() { return this.word; },
                 'setWord' : function( val ) { this.word = this.baseWord + parseInt( val ); if( this.word>=lines[ this.line ].words.length ) this.word = lines[ this.line ].words.length - 1; if( this.word < 0 ) this.word = 0; },
                 'getChar' : function() { return this.char; },
                 'setChar' : function( val ) { 
                                 this.char = this.baseChar + parseInt( val ); 
                                 if( this.char>=lines[ this.line ].words[ this.word ].chars.length ) this.char = lines[ this.line ].words[ this.word ].chars.length - 1; if( this.char < 0 ) this.char = 0; },
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
                                     if( this.line < lines.length ) {
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
                                     } else { 
                                         this.baseWord = 0; // line out of range, set baseWord to 0
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
    ctCursor.setLine( 0 );
    ctCursor.setWord( 0 );
    ctCursor.setChar( 0 );
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
             'words' : wordObjs,
             'rebuild' : function() {
                 this.text = "";
                 for( var i = 0; i < this.words.length; i++ ) {
                     this.words[ i ].index = i;
                     this.text += this.words[ i ].text + " ";
                 }
                 this.text.substring( 0, this.text.length - 1 );
                 console.log( "line rebuilt!" );
                 console.log( this );
             }
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
             'chars' : charObjs,
             'rebuild' : function() {
                 //console.log( "rebuilding characters..." );
                 this.text = "";
                 for( var i = 0; i < this.chars.length; i++ ) {
                     this.chars[ i ].index = i;
                     this.text += this.chars[ i ].text;
                 }
             }
    };
};




var buildChar = function( someIndex, someChar ) {
    return { 'index' : someIndex, 
             'text' : someChar 
    };
};



var buildVisualText = function() {
    this.visualText = "";
    for( i = 0; i < lines.length; i++ ) {
        lines[ i ].index = i;
        visualText += lines[ i ].text + "\n";
    }
    visualText = visualText.substring( 0, visualText.length - 2 );
};




var updateCursor = function( tactileInputObj, callback ) {
    // determine which element to update: line/word/char
    if( tactileInputObj.hasOwnProperty( 'c' ) ){ // char
        console.log( "     tactileInputObj hasOwnProperty c" );
        if( getCursorLine() != -1 && getCursorWord() != -1 ) {
            setCursorChar( tactileInputObj.c, function( doRead ) {  
                if( doRead ) callback( true ); else callback();
            } ); // baseChar offset is done in setChar() within Chursor object
        } 
    } 

    if( tactileInputObj.hasOwnProperty( 'w' ) ){
        console.log( "     tactileInputObj hasOwnProperty w" );
        if( getCursorLine() != -1 ) {
            // reset dependant(s)
            setCursorBaseChar( "t" );
            setCursorWord( tactileInputObj.w, function( doRead ) {  
                if( doRead ) callback( true ); else callback();
            } );
        }
    }

    if( tactileInputObj.hasOwnProperty( 'l' ) ){ // line
        //console.log( "     tactileInputObj hasOwnProperty l" );
        // reset dependant(s) first, otherwise it will trip upon new cursorline that has no words or chars
        setCursorBaseWord( "t" );
        setCursorBaseChar( "t" );
        setCursorLine( tactileInputObj.l, function( doRead ) {  
                if( doRead ) callback( true ); else callback();
        } );
    }
};




updateCursorBase = function( tactileInputObj ) {
    if( tactileInputObj.hasOwnProperty( 'c' ) ) { // char
        setCursorBaseChar( tactileInputObj.c );
    }
    if( tactileInputObj.hasOwnProperty( 'w' ) ) { // word
        setCursorBaseWord( tactileInputObj.w );
    }
    if( tactileInputObj.hasOwnProperty( 'l' ) ) { // line
        setCursorBaseLine( tactileInputObj.l );
    }
};




setCursorBaseChar = function( textVal ) {
    // textVal is one of: "t" / "u" / "d" / "b"
    if( textVal == "t" ){ //top
        ctCursor.setBaseChar( 0 );
        ctCursor.setChar( 0 );
    }
    if( textVal == "u" ) { // scrollup
        ctCursor.setBaseChar( ctCursor.getChar() - 9 );
    }
    if( textVal == "d" ) { // scrolldown
        ctCursor.setBaseChar( ctCursor.getChar() );
    }
    if( textVal == "b" ) { // bottom
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
    // textVal is one of: "t" / "u" / "d" / "b"
    if( textVal == "t" ){ //top
        ctCursor.setBaseWord( 0 );
        ctCursor.setWord( 0 );
    }
    if( textVal == "u" ) { // scrollup
        ctCursor.setBaseWord( ctCursor.getWord() - 9 );
    }
    if( textVal == "d" ) { // scrolldown
        ctCursor.setBaseWord( ctCursor.getWord() );
    }
    if( textVal == "b" ) { // bottom
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
    // textVal is one of: "t" / "u" / "d" / "b"
    if( textVal == "t" ){ //top
        ctCursor.setBaseLine( 0 );
        ctCursor.setLine( 0 );
    }
    if( textVal == "u" ) { //scrollup
        ctCursor.setBaseLine( ctCursor.getLine() - 9 );
    }
    if( textVal == "d" ) { // scrolldown
        ctCursor.setBaseLine( ctCursor.getLine() );
    }
    if( textVal == "b" ) { // bottom
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
    if( tactileInputObj.hasOwnProperty( 'l' ) ) { // line  
        var lIndex = getCursorLine();
        if( lIndex != -1 ) {
            var theLineObj = lines[ lIndex ];
            ret = theLineObj.text;
        }
    } else if( tactileInputObj.hasOwnProperty( 'w' ) ) { // word
        var lIndex = getCursorLine();
        if( lIndex != -1 ) {
            var wIndex = getCursorWord();
            if( wIndex != -1 ) { 
                var theWordObj = lines[ lIndex ].words[ wIndex ];
                ret = theWordObj.text;
            }
        }
    } else if( tactileInputObj.hasOwnProperty( 'c' ) ) { // char
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




var setCursorLine = function( val, callback ) {
    val = parseInt( val );
    if( val >= 0 && val + ctCursor.getBaseLine() >= 0 && val + ctCursor.getBaseLine() < lines.length ) { 
        ctCursor.setLine( val );
        callback( true );
    } else
        callback();
};




var setCursorWord = function( val, callback ) {
    val = parseInt( val );
    var tline = ctCursor.getLine();
    if( val >= 0 && val + ctCursor.getBaseWord() >= 0 && val + ctCursor.getBaseWord() < lines[ tline ].words.length ) {
        ctCursor.setWord( val );
        callback( true );
    } else
        callback();
};




var setCursorChar = function( val, callback ) {
    val = parseInt(val);
    var theWord = lines[ ctCursor.getLine() ].words[ ctCursor.getWord() ];
    if( typeof theWord == "object" && theWord.chars ) {
        var tchar = theWord.chars.length;
        if( val >= 0 && val + ctCursor.getBaseChar() >= 0 && val + ctCursor.getBaseChar() < tchar ) {
            ctCursor.setChar( val );
            callback( true );
        } else
            callback();
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




var getCursorBases = function() {
    return { 'line' : ctCursor.getBaseLine(),
             'word' : ctCursor.getBaseWord(),
             'char' : ctCursor.getBaseChar()
    }
}




var insert = function( aKey, callback ) {
    var theCursor = this.getCursor();
    //console.log( theCursor );
    var theLine = lines[ theCursor.line ];
    //console.log( theLine );
    var theWord = theLine.words[ theCursor.word ];
    //console.log( theWord );
    var theChar = theLine.words[ theCursor.word ].chars[ theCursor.char ];
    //console.log( theChar );
    if( theCursor.char >= 9 ) {
        theCursor.char = theCursor.char % 9;
    }
    //console.log( "ctCursor.getBaseChar()" + ctCursor.getBaseChar() );
    var theCharIndex = ctCursor.getBaseChar() + theCursor.char;
    //console.log( "inserting char at theCharIndex " + theCharIndex );
    
    // determine the new char object
    var newChar = { 'index': theCharIndex + 1, 'text' : aKey.sequence };

    // insert the new char
    //console.log( "splicing theWord.chars" );
    theWord.chars.splice( (theCharIndex + 1 ), 0, newChar );
   
    //console.log( "rebuilding theWord..." );
    theWord.rebuild();

    //console.log( "rebuilding theLine..." );
    theLine.rebuild();

    //console.log( "rebuilding visualText..." );
    this.buildVisualText();

    // update cursor
    //console.log( "incrementing ctCursor.char... theCursor.char,newCharVal" );
    //console.log( theCursor.char );
    var newCharVal = ( ctCursor.getBaseChar() + theCursor.char ) + 1;
    //console.log( newCharVal );
    //console.log( "setting ctCursor.BaseChar to " + " floor of newCharVal / 9 " + ( newCharVal / 9 ) + Math.floor( newCharVal / 9 ) * 9  );
    ctCursor.setBaseChar( Math.floor( newCharVal / 9 ) * 9 );

    if( newCharVal >= 9 ) { // increment base offset
        newCharVal = newCharVal % 9;
    }
    //console.log( "setting ctCursor.char to newCharVal, which is " + newCharVal );
    ctCursor.setChar( newCharVal );
    //console.log( "ctCursor.getChar is " + ctCursor.getChar() );
    //console.log( "now ctCursor.char is ctCursor.base-ctCursor.char-theCharindex++" + ctCursor.getBaseChar() + " " + ctCursor.getChar() + " " + ( theCharIndex + 1 ) );

    // do callback for socket
    //console.log( "incrementing theCursor.char" );
    theCursor.char += 1;
    var changedLines = [];
    changedLines.push( theLine );
    //console.log( "preparing data..." );
    var data = { 'changedLines': changedLines,'cursor': this.getCursor() };
    //console.log( "calling callback..." );
    callback( data );
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
module.exports.getCursorBases = getCursorBases;
module.exports.getLines = getLines;
module.exports.insert = insert;
