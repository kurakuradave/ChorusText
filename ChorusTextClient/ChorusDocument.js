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


var util = require( 'util' );
var EventEmitter = require('events').EventEmitter;

function ChorusDocument() {

var self = this;

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



self.setVisualText = function( someText ){
    var temp = "";
    if( someText != "" ) {
        temp = someText.replace( /\. /g, ".\n" );
    }
    visualText = temp;
    console.log( visualText );
};




self.resetCursor = function() {
    ctCursor.setLine( 0 );
    ctCursor.setWord( 0 );
    ctCursor.setChar( 0 );
};




self.parseToCTDocu = function() {
    if( visualText == "" ) {
        // blank document, throw an error
    } else {
        self.loadCTDocu( visualText );
    }
    self.resetCursor();
};




self.loadCTDocu = function( someText ) {
    lines = [];
    var tempLines = someText.split( "\n" );
    for( var i = 0; i < tempLines.length; i++ ) {
        var tline = tempLines[ i ];
        var aLineObj = self.buildLine( i, tline );
        lines[ i ] = aLineObj;
    }
};




self.buildLine = function( someIndex, someLine ) {
    var wordObjs = [];
    var tempWords = someLine.split( " " );
    for( var i = 0; i < tempWords.length; i++ ) {
        var tword = tempWords[ i ];
        var aWordObj = self.buildWord( i, tword );
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




self.buildWord = function( someIndex, someWord ) {
    var charObjs = [];
    var tempChars = someWord.split( '' );
    for( var i = 0; i < tempChars.length; i++ ) {
        var tchar = tempChars[ i ];
        var aCharObj = self.buildChar( i, tchar );
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




self.buildChar = function( someIndex, someChar ) {
    return { 'index' : someIndex, 
             'text' : someChar 
    };
};



self.buildVisualText = function() {
    this.visualText = "";
    for( i = 0; i < lines.length; i++ ) {
        lines[ i ].index = i;
        visualText += lines[ i ].text + "\n";
    }
    visualText = visualText.substring( 0, visualText.length - 2 );
};




self.updateCursor = function( tactileInputObj, callback ) {
    // determine which element to update: line/word/char
    if( tactileInputObj.hasOwnProperty( 'c' ) ){ // char
        console.log( "     tactileInputObj hasOwnProperty c" );
        if( self.getCursorLine() != -1 && self.getCursorWord() != -1 ) {
            self.setCursorChar( tactileInputObj.c, function( doRead ) {  
                if( doRead ) callback( true ); else callback();
            } ); // baseChar offset is done in setChar() within Chursor object
        } 
    } 

    if( tactileInputObj.hasOwnProperty( 'w' ) ){
        console.log( "     tactileInputObj hasOwnProperty w" );
        if( self.getCursorLine() != -1 ) {
            // reset dependant(s)
            self.setCursorBaseChar( "t" );
            self.setCursorWord( tactileInputObj.w, function( doRead ) {  
                if( doRead ) callback( true ); else callback();
            } );
        }
    }

    if( tactileInputObj.hasOwnProperty( 'l' ) ){ // line
        //console.log( "     tactileInputObj hasOwnProperty l" );
        // reset dependant(s) first, otherwise it will trip upon new cursorline that has no words or chars
        self.setCursorBaseWord( "t" );
        self.setCursorBaseChar( "t" );
        self.setCursorLine( tactileInputObj.l, function( doRead ) {  
                if( doRead ) callback( true ); else callback();
        } );
    }
};




self.updateCursorBase = function( tactileInputObj ) {
    if( tactileInputObj.hasOwnProperty( 'c' ) ) { // char
        self.setCursorBaseChar( tactileInputObj.c );
    }
    if( tactileInputObj.hasOwnProperty( 'w' ) ) { // word
        self.setCursorBaseWord( tactileInputObj.w );
    }
    if( tactileInputObj.hasOwnProperty( 'l' ) ) { // line
        self.setCursorBaseLine( tactileInputObj.l );
    }
};




self.setCursorBaseChar = function( textVal ) {
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




self.setCursorBaseWord = function( textVal ) {
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




self.setCursorBaseLine = function( textVal ) {
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




self.getTextForSpeech = function( tactileInputObj ) {
    var ret = "";
    if( tactileInputObj.hasOwnProperty( 'l' ) ) { // line  
        var lIndex = self.getCursorLine();
        if( lIndex != -1 ) {
            var theLineObj = lines[ lIndex ];
            ret = theLineObj.text;
        }
    } else if( tactileInputObj.hasOwnProperty( 'w' ) ) { // word
        var lIndex = self.getCursorLine();
        if( lIndex != -1 ) {
            var wIndex = self.getCursorWord();
            if( wIndex != -1 ) { 
                var theWordObj = lines[ lIndex ].words[ wIndex ];
                ret = theWordObj.text;
            }
        }
    } else if( tactileInputObj.hasOwnProperty( 'c' ) ) { // char
        var lIndex = self.getCursorLine();
        if( lIndex != -1 ) {
            var wIndex = self.getCursorWord();
            if( wIndex != -1 ) {
                var cIndex = self.getCursorChar();
                var theCharObj = lines[ lIndex ].words[ wIndex ].chars[ cIndex ];
                ret = theCharObj.text;
            }
        }
    }
    return ret;
};




self.getCursorLine = function() {
    return ctCursor.getLine();
};




self.getCursorWord = function() {
    return ctCursor.getWord();
};




self.getCursorChar = function() {
    return ctCursor.getChar();
};




self.setCursorLine = function( val, callback ) {
    val = parseInt( val );
    if( val >= 0 && val + ctCursor.getBaseLine() >= 0 && val + ctCursor.getBaseLine() < lines.length ) { 
        ctCursor.setLine( val );
        callback( true );
    } else
        callback();
};




self.setCursorWord = function( val, callback ) {
    val = parseInt( val );
    var tline = ctCursor.getLine();
    if( val >= 0 && val + ctCursor.getBaseWord() >= 0 && val + ctCursor.getBaseWord() < lines[ tline ].words.length ) {
        ctCursor.setWord( val );
        callback( true );
    } else
        callback();
};




self.setCursorChar = function( val, callback ) {
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




self.getLines = function() {
    return lines;
};




self.getCursor = function() {
    return { 'line' : self.getCursorLine(),
             'word' : self.getCursorWord(),
             'char' : self.getCursorChar() 
    };
}




self.getCursorArduino = function() {
// returns a "clean" cursor, safe to be fed to Arduino,
// offsets ctCursor .line .word and .char values with the baseLine baseWord baseChar
// range of .line .word and .char is ALWAYS WITHIN 0-9 ONLY!
    return { 'line' : self.getCursorLine() - ctCursor.getBaseLine(),
             'word' : self.getCursorWord() - ctCursor.getBaseWord(),
             'char' : self.getCursorChar() - ctCursor.getBaseChar()
           };
}




self.getCursorBases = function() {
    return { 'line' : ctCursor.getBaseLine(),
             'word' : ctCursor.getBaseWord(),
             'char' : ctCursor.getBaseChar()
    }
}




// deprecated
self.deleteChar = function( callback ) {
    var theCursor = self.getCursor();
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
    //console.log( "deleting char at theCharIndex " + theCharIndex );

    // delete the new char
    //console.log( "splicing theWord.chars" );
    theWord.chars.splice( (theCharIndex + 1 - 1 ), 1  );
   
    //console.log( "rebuilding theWord..." );
    theWord.rebuild();

    //console.log( "rebuilding theLine..." );
    theLine.rebuild();

    //console.log( "rebuilding visualText..." );
    self.buildVisualText();

    ctCursor.setChar( ctCursor.getChar() - 1 );
    ctCursor.setBaseChar( Math.floor( ctCursor.getChar() / 9 ) * 9 );

    // preparing callback for socket    
    var changedLines = [];
    changedLines.push( theLine );
    //console.log( "preparing data..." );
    var data = { 'changedLines': changedLines,'cursor': self.getCursor(), newCursor : self.getCursorArduino() };
    //console.log( "calling callback..." );
    callback( data );
}




self.insertChar = function( aKey, callback ) {
    var oldCursor = self.getCursor();
    var oldLine = lines[ oldCursor.line ];
    var oldWord = oldLine.words[ oldCursor.word ];
    var oldChar = oldLine.words[ oldCursor.word ].chars[ oldCursor.char ];
    //the line below ensures rightmost bracket is always not used. 
    //If any char is inserted here, it will placed at index 0, the leftmost one, 
    //this is equivalent with pressing the pagedown button once, and then insert the char on leftmost place.
    if( oldCursor.char >= 9 ) {
        oldCursor.char = oldCursor.char % 9; // 
    }
    var oldCharIndex = ctCursor.getBaseChar() + oldCursor.char;
    
    // determine the new char object
    var newChar = { 'index': oldCharIndex, 'text' : aKey.sequence }; // new char will be placed at the location of oldChar, and push old chars rightwards
    console.log( "           newChar is: " );
    console.log( newChar );
    // insert the new char
    oldWord.chars.splice( (oldCharIndex ), 0, newChar );
   
    oldWord.rebuild();

    oldLine.rebuild();

    self.buildVisualText();

    // update cursor, increment position by 1 coz of insertion of a new char
    var nextCharIndex = oldCharIndex + 1; // increment the position of cursor after insertion of 1 char
    ctCursor.setBaseChar( Math.floor( nextCharIndex / 9 ) * 9 );

    if( nextCharIndex >= 9 ) { // keep last slider position clear
        nextCharIndex = nextCharIndex % 9;
    }
    ctCursor.setChar( nextCharIndex );
    console.log( "ctCursor.getChar is " + ctCursor.getChar() );

    // do callback for socket
    //theCursor.char += 1; // not needed right?
    var changedLines = [];
    changedLines.push( oldLine );
    var data = { 'changedLines': changedLines,'cursor': self.getCursor(), 'newCursor' : self.getCursorArduino() };
    callback( data );
}





self.changedByChar = function( aKey, callback ) {
    // change the document according to the key pressed
    // calculate new position for the sliders
    // inform main app using emit
    if( aKey.name == "backspace" ) {
        self.deleteChar( function( data ) {  
            self.emit( 'cdUpdated', data );
            callback( data );
        } );
    } else {
        console.log( "aKey = " + aKey );
        self.insertChar( aKey, function( data ) {  
            self.emit( 'cdUpdated', data ); 
            callback( data );       
        } );
    }

}

}; // end function constructor






util.inherits( ChorusDocument, EventEmitter );

module.exports = ChorusDocument;
