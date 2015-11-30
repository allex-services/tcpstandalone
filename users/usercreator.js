function createUser(execlib, ParentUser) {
  'use strict';
  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  var lib = execlib.lib,
    q = lib.q,
    UserSession = ParentUser.prototype.getSessionCtor('.');

  function TcpStandaloneUserSession(user, session, gate, server) {
    UserSession.call(this, user, session, gate);
    this.server = server;
  }
  lib.inherit(TcpStandaloneUserSession, UserSession);
  TcpStandaloneUserSession.prototype.__cleanUp = function () {
    this.server = null;
    UserSession.prototype.__cleanUp.call(this);
  };
  TcpStandaloneUserSession.prototype.send = function (data) {
    this.gate.sendData(data);
  };


  function User(prophash) {
    ParentUser.call(this, prophash);
  }
  
  ParentUser.inherit(User, require('../methoddescriptors/user'), [/*visible state fields here*/]/*or a ctor for StateStream filter*/);
  User.prototype.__cleanUp = function () {
    ParentUser.prototype.__cleanUp.call(this);
  };

  User.prototype.getSessionCtor = function(communicationtype) {
    console.log('communicationtype?', communicationtype);
    if (communicationtype === 'tcpstandalone') {
      return TcpStandaloneUserSession;
    }
    return ParentUser.prototype.getSessionCtor(communicationtype);
  };

  return User;
}

module.exports = createUser;
