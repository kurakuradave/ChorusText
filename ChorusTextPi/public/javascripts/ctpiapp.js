angular.module( 'ctpiapp', ['ctpidirective', 'ngSanitize'] )
    .config(function($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        'http://localhost:3000/**',
        // Allow loading from our assets domain.  Notice the difference between * and **.
       'http://cobuhapi:3000/**']);
     })

    .controller( 'ImportCtrl', function( $scope ) {
        $scope.sendToBoard = function() {
	    console.log( '>>>>>>>>>> Emitting importText: ');
            console.log( $scope.rawText );
            socket.emit( 'importText', { 'rawText': $scope.rawText } );
        };
    } ) // end controller( 'ImportCtrl' )

    .controller( 'ReadCtrl', function( $scope ) {  
        $scope.lines = [];
        $scope.renderLines = [];
        $scope.cursor = {};

        $scope.render = function(e) {
            return $(e).html();
        }

        $scope.sendToBoard = function() {
            console.log( '>>>>>>>>>> Emitting importText: ');
            console.log( $scope.rawText );
            socket.emit( 'importText', { 'rawText': $scope.rawText } );
        };

        $scope.clone = function(obj) {
            // Handle the 3 simple types, and null or undefined
            if (null == obj || "object" != typeof obj) return obj;

            // Handle Date
            if (obj instanceof Date) {
                var copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            // Handle Array
            if (obj instanceof Array) {
                var copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = $scope.clone(obj[i]);
                }
                return copy;
            }

            // Handle Object
            if (obj instanceof Object) {
                var copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = $scope.clone(obj[attr]);
                }
                return copy;
            }

            throw new Error("Unable to copy obj! Its type isn't supported.");
        }




        socket.on( 'initForRead', function( ifrObj ) {  
            $scope.$apply( function() {
                $scope.lines = ifrObj.lines;
                $scope.cursor = ifrObj.cursor;
                console.log( $scope.cursor );
   
                var focusedLine= $scope.cursor.line;
                var focusedWord = $scope.cursor.word;
                var focusedChar = $scope.cursor.char;

                // get the focused lwc object
                $scope.newLine = {};

                if( focusedLine >= 0 ) {
                    $scope.newLine = $scope.clone( $scope.lines[ focusedLine ] );
                    console.log( "check clone: " );
                    console.log( $scope.newLine );
                    
                    // inject highlighting text on focused lwc
                    console.log( "focusedChar is: " + focusedChar  );
                    if( focusedChar >= 0 ) {
                        if( focusedWord >= 0 ) {
                            console.log( "injecting newChar" );
                            newCharText = $scope.newLine.words[ focusedWord ].chars[ focusedChar ].text;
                            newCharText = "<span class='focusc'>"+ newCharText + "</span>";
                        }
                        $scope.newLine.words[ focusedWord ].chars[ focusedChar ].text = newCharText;
                    }
            
                    if( focusedWord >= 0 ) {
                        newCharWordText = "<span class='focusw'>";
                        for( var i = 0; i < $scope.newLine.words[ focusedWord ].chars.length; i++ ) {
                            newCharWordText += $scope.newLine.words[focusedWord].chars[ i ].text;
                        }
                        newCharWordText += "</span>";
                        $scope.newLine.words[ focusedWord ].text = newCharWordText;
                    }

                    var newCharWordLineText = "<span class='focusl'><strong>";
                    for( var j = 0; j < $scope.newLine.words.length; j++ ) {
                        newCharWordLineText += $scope.newLine.words[ j ].text + " ";
                    }
                    newCharWordLineText.substring( newCharWordLineText.length - 2 );
                    newCharWordLineText += "</strong></span>";
                    $scope.newLine.text = newCharWordLineText;
                }
 
                // update renderLines
                for( var i = 0; i < $scope.lines.length; i ++ ) {
                    if( i == focusedLine ) {
                        $scope.renderLines[ i ] = $scope.newLine;
                    } else {
                        $scope.renderLines[ i ] = $scope.lines[ i ];
                    }
                }

            } );
        } );

        $scope.init = function() {
            socket.emit( 'initForRead' );
        };

        $scope.init();
    } ) // end controller( 'ReadCtrl' )



    
