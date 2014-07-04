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
        $scope.renderedLines = [];
        $scope.cursor = {};




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
        };




        $scope.render = function( lines, cursor ) {
            var ret = [];
            var focusedLine= cursor.line;
            var focusedWord = cursor.word;
            var focusedChar = cursor.char;

            // get the focused lwc object
            $scope.newLine = {};

            if( focusedLine >= 0 ) {
                $scope.newLine = $scope.clone( lines[ focusedLine ] );
                    
                // inject highlighting text on focused lwc
                if( focusedChar >= 0 ) {
                    if( focusedWord >= 0 ) {
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
 
            // populate ret
            for( var i = 0; i < lines.length; i ++ ) {
                if( i == focusedLine ) {
                    ret[ i ] = $scope.newLine;
                } else {
                    ret[ i ] = lines[ i ];
                }
            }

            return ret;
        };




        socket.on( 'initForRead', function( ifrObj ) {  
            $scope.$apply( function() {
                $scope.lines = ifrObj.lines;
                $scope.cursor = ifrObj.cursor;
                $scope.renderedLines = $scope.render( $scope.lines, $scope.cursor );
            } );
        } );




        socket.on( 'cursorUpdate', function( cuObj ) {  
            $scope.$apply( function() {
                console.log( "<<<<<<<<<< cursorUpdate reeived:" );
                console.log( cuObj );
                $scope.cursor = cuObj.cursor;
                console.log( "updated $scope.cursor:" );
                console.log( $scope.cursor );
                $scope.renderedLines = $scope.render( $scope.lines, $scope.cursor );
            } );
        } );




        $scope.init = function() {
            socket.emit( 'initForRead' );
        };

        $scope.init();
    } ) // end controller( 'ReadCtrl' )



    
