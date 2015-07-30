var util = require( 'util' );
var EventEmitter = require('events').EventEmitter;
var Session = require( './Session.js' );


function SessionManager() {
    var self = this;
    self.sessions = [];
    
    self.userJoins = function( aCCDocuID, aUserID ) {
        var joinID = aCCDocuID + "#" + aUserID;
        var daSession = self.findSession( joinID, aCCDocuID, aUserID );
        // attach a one-time listener
        daSession.once( "UserAdded", function( data ) {  
            console.log( data.userID + " is added to " + data.sessionID + ". List of Users: " + data.users ); 
            self.emit( 'userJoinsDone', data );
        } );
        // add the user
        daSession.addUser( aUserID );
        
    };
    
    self.findSession = function( aSessionID, aCCDocuID, aUserID ) {
        var indexSessions = -1;
        for( var i = 0; i < self.sessions.length; i++ ){
            var head = self.sessions[ i ].sessionID.split( '#' )[0];
            if( head === aCCDocuID ) {
                indexSessions = i;
                break;
            }
        }
        if( indexSessions != -1 ) {
            return self.sessions[ indexSessions ];
        } else {
            // not in on-going sessions, create a new session
            var newSession = new Session( aCCDocuID, aUserID );;
            newSession.on( "SessionCreated", function( data ) { console.log( data.msg + " session created!" ); } );

            self.sessions.push( newSession );
            return newSession;
        }
    };
    
    console.log( "Session Manager Up!" );

}; // end constructor function

util.inherits( SessionManager, EventEmitter );

module.exports = SessionManager;
