

function ImportCtrl($scope) {

    $scope.sendToBoard = function() {
	console.log( '>>>>>>>>>> Emitting importText: ');
        console.log( $scope.rawText );
        socket.emit( 'importText', { 'rawText': $scope.rawText } );
    };
}

