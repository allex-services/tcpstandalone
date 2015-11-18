function createServiceUser(execlib, ParentUser, bufferlib) {
  'use strict';
  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  var lib = execlib.lib,
    q = lib.q;

  function ServiceUser(prophash) {
    ParentUser.call(this, prophash);
  }
  
  ParentUser.inherit(ServiceUser, require('../methoddescriptors/serviceuser'), [/*visible state fields here*/]/*or a ctor for StateStream filter*/);
  ServiceUser.prototype.__cleanUp = function () {
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

  ServiceUser.prototype.c = function (username, password, defer) {
    this.__service.authenticate(username, password).then(
      console.log.bind(console,'ok'),
      console.error.bind(console,'nok')
    );
  };

  return ServiceUser;
}

module.exports = createServiceUser;
