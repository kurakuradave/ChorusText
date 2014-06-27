angular.module( 'ctpi.directive', [] )
    .directive('helloWorld', function() {
        return {
            restrict: 'AE',
            replace: 'true',
            template: '<h3><strong>Hello World!!</strong></h3>'
        };
    });

function ReadCtrl($scope) {

    $scope.lines = [ {"text":"try"}, {"text":"it"}, {'text':'baby'} ];

    $scope.sendToBoard = function() {
	console.log( '>>>>>>>>>> Emitting importText: ');
        console.log( $scope.rawText );
        socket.emit( 'importText', { 'rawText': $scope.rawText } );
    };

    socket.on( 'initForRead', function( ifrObj ) {  
        $scope.$apply( function() {
            $scope.lines = [];
            var tempLines = ifrObj.rawText.split( '\n' );
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
}

