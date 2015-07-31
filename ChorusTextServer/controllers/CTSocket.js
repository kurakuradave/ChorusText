// takes a Server object, returns a Socket object.
function CTSocket( daServer ) {
    var self = this;
    self = require( 'socket.io' )( daServer );
    var sm = {} // placeholder for linking Session Manager
    
    // attach socket listeners    
    self.sockets.on( 'connection', function( socket ) {  
        socket.on( 'konek', function( data ) {
            self.emit( 'konek', { "msg" : "Hello from server!" } );
        } );
        socket.on( 'cnect2ssn', function( data ) {  
            debugger;
            sm.userJoins( data.ccdocuID, data.userID, function( arg ) {  
                socket.join( arg.sessionID );
                var daMsg = arg.userID + " is added to " + arg.sessionID + ". List of Users: " + arg.users; 
                self.to( arg.sessionID ).emit( 'cnected2ssn', { "msg" : daMsg } );
            } );
        } );
        socket.on( 'cursorUpdate', function( data ) {  
            console.log( "socketUpdate received from client device." );
        } );
    } );
    
    self.linkSM = function( anSM ) {
        sm = anSM;
        sm.linkSocket( self );
        console.log( "io now linked to sm " );
        console.log( sm );
        console.log( "----- from io" );
    };
    
    return self;
};

module.exports = CTSocket;
