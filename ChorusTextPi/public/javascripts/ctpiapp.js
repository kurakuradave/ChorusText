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
        $scope.lines = [ {"text":"try"}, {"text":"it"}, {'text':'baby'} ];

        $scope.render = function(e) {
            return $(e).html();
        }

        $scope.sendToBoard = function() {
            console.log( '>>>>>>>>>> Emitting importText: ');
            console.log( $scope.rawText );
            socket.emit( 'importText', { 'rawText': $scope.rawText } );
        };

        socket.on( 'initForRead', function( ifrObj ) {  
            $scope.$apply( function() {
                $scope.lines = [];
                var tempLines = ifrObj.rawText.split( '\n' );
                
                var focusedLine= 1;
                var focusedWord = 5;
                var focusedChar = 2;

                // get the focused lwc
                var newLine = tempLines[ focusedLine ];
                var tempWords = newLine.split( " " );
                var newWord = tempWords[ focusedWord ];
                var newChar = newWord.slice( focusedChar, focusedChar + 1 );

                // inject new lwc
                newChar = "<span class='focusc'>" + newChar + "</span>";
                newWord = newWord.slice( 0, focusedChar) + newChar + newWord.slice( focusedChar + 1, newWord.length );

                newWord = "<span class='focusw'>" + newWord + "</span>";
                tempWords[ focusedWord ] = newWord;
                tempLine = "";
                for( i=0; i<tempWords.length; i++ ) {
                    tempLine += tempWords[ i ] + " ";
                }

                newLine = "<span class='focusl'><strong>" + tempLine + "</strong></span>";
                tempLines[ focusedLine ] = newLine;
                

                tempLines.forEach( function( i ) {  
                    var tempL = { 'text' : i };
                    $scope.lines.push( tempL );    
                } );

                console.log( 'rawText split, total lines: ' + $scope.lines.length );
                console.log( $scope.lines );
            } );
        } );

        $scope.init = function() {
            socket.emit( 'initForRead' );
        };

        $scope.init();
    } ) // end controller( 'ReadCtrl' )



    
