var util = require( 'util' );
var EventEmitter = require('events').EventEmitter;

function Session( aCCDocuID, aUserID ) {

    var self = this;
    self.sessionID = aCCDocuID + '#' + aUserID;
    self.ccdocuID = aCCDocuID;
    self.users = [];

    self.addUser = function( aUserID ) {
        if( self.users.indexOf( aUserID ) == -1 ) {          
            self.users.push( aUserID );
        }
        self.emit( "UserAdded", { "sessionID" : self.sessionID, "userID" : aUserID, "users" : self.users } );
    };
    
    console.log( "New Session Created: " + self.sessionID );

}; // end function constructor

util.inherits( Session, EventEmitter );
module.exports = Session;
