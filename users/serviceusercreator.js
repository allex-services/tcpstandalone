function createServiceUser(execlib, ParentUser, bufferlib) {
  'use strict';
  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  var lib = execlib.lib,
    q = lib.q;

  function ServiceUser(prophash) {
    ParentUser.call(this, prophash);
    this.needToSend = null;
    this.gate = new lib.Map();
  }
  
  ParentUser.inherit(ServiceUser, require('../methoddescriptors/serviceuser'), [/*visible state fields here*/]/*or a ctor for StateStream filter*/);
  ServiceUser.prototype.__cleanUp = function () {
    this.needToSend = null;
    ParentUser.prototype.__cleanUp.call(this);
  };

  ServiceUser.prototype.startStandalone = function (defer) {
    if (this.__service.server) {
      defer.reject(new lib.Error('STANDALONE_ALREADY_STARTED', this.__service.port));
      return;
    }
    this.__service.server = bufferlib.createTcpCallableStandalone(this);
    this.__service.server.listen(this.__service.port, onStarted.bind(null, this.__service.port, defer));
  };

  function onStarted(port, defer, error) {
    if (error) {
      defer.reject(error);
    } else {
      defer.resolve(port);
    }
  }

  ServiceUser.prototype.login = function (username, password, defer) {
    console.log('authenticate?', username, password);
    this.__service.authenticate(username, password).then(
      this.doLogin.bind(this, defer),
      defer.reject.bind(defer)
    );
  };

  ServiceUser.prototype.doLogin = function (defer, identity) {
    var user = this.__service.introduceUser(identity);
    if(user){
      if ('function' === typeof user.done) {
        user.done(
          this.onUserIntroduced.bind(this, defer)
        );
      } else {
        this.onUserIntroduced(defer, user);
      }
    } else {
      defer.resolve(false);
    }
  };

  ServiceUser.prototype.onUserIntroduced = function (defer, user) {
    try {
      console.log('user role', user.role);
    var session = lib.uid(),
      usersession = user.createSession(this,session,this.gate);
    this.gate.add(usersession.session,usersession);
    defer.resolve(session);
    } catch(e) {
      console.error(e.stack);
      console.error(e);
    }
  };

  ServiceUser.prototype.userInvoke = function (sessionid, methodname, paramarry, defer) {
    var usersession = this.gate.get(sessionid), user;
    if (!usersession) {
      defer.reject(new lib.Error('NO_SESSION', sessionid));
      return;
    }
    user = usersession.user;
    if (!user) {
      defer.reject(new lib.Error('NO_USER', sessionid));
      return;
    }
    user.exec([methodname, paramarry]).then(
      defer.resolve.bind(defer),
      defer.reject.bind(defer)
    );
  };

  ServiceUser.prototype.communicationType = 'tcpstandalone';

  return ServiceUser;
}

module.exports = createServiceUser;
