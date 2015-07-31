var util = require( 'util' );
var EventEmitter = require('events').EventEmitter;
var Session = require( './Session.js' );


function SessionManager() {
    var self = this;
    self.sessions = [];
    var ctSocket = []; // placeholder for linking socket
    
    self.linkSocket = function( aSocket ) {
        ctSocket = aSocket;
    };
    
    self.userJoins = function( aCCDocuID, aUserID, callback ) {
        var daSession = self.findSession( aCCDocuID, aUserID );
        daSession.addUser( aUserID, function( arg ) {  
            console.log( arg.userID + " is added to " + arg.sessionID + ". List of Users: " + arg.users ); 
            self.announceToSockRoom( daSession, arg );
            callback( arg );            
        } );
    };
    
    self.findSession = function( aCCDocuID, aUserID ) {
        var ssnIndex = -1;
        for( var i = 0; i < self.sessions.length; i++ ){
            var head = self.sessions[ i ].sessionID.split( '#' )[0];
            if( head === aCCDocuID ) {
                ssnIndex = i;
                break;
            }
        }
        if( ssnIndex != -1 ) {
            return self.sessions[ ssnIndex ];
        } else {
            // not in on-going sessions, create a new session
            var newSession = new Session( aCCDocuID, aUserID );
            self.sessions.push( newSession );
            return newSession;
        }
    };
    
    self.announceToSockRoom = function( aSession, msg ) {
        var daRoom = aSession.sessionID;
        ctSocket.to( daRoom ).emit( 'newUserJoined', msg );
    };
    
    console.log( "Session Manager Up!" );

}; // end constructor function

util.inherits( SessionManager, EventEmitter );

module.exports = SessionManager;
