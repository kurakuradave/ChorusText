// takes a Server object, returns a Socket object.
function CTSocket( daServer ) {
    var self = this;
    self = require( 'socket.io' )( daServer );
    self.sm = {} // placeholder for linking Session Manager
    
    // attach socket listeners    
    self.sockets.on( 'connection', function( socket ) {  
        socket.on( 'connect', function( data ) {  
            console.log( "incoming socket connection received:" );
            console.log( data );
            self.sm.userJoins( data.ccdocuID, data.userID );
            self.sm.once( 'userJoinsDone', function( data ) {  
                var daMsg = data.userID + " is added to " + data.sessionID + ". List of Users: " + data.users; 
                socket.emit( 'connect', { "msg" : daMsg } );
            } );
        } );
        socket.on( 'cursorUpdate', function( data ) {  
            console.log( "socketUpdate received from client device." );
        } );
    } );
    
    self.linkSM = function( anSM ) {
        self.sm = anSM;
        console.log( "io now linked to sm " );
        console.log( self.sm );
        console.log( "----- from io" );
    };
    
    return self;
};

module.exports = CTSocket;
