function createServiceUser(execlib, ParentUser) {
  'use strict';
  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function ServiceUser(prophash) {
    ParentUser.call(this, prophash);
  }
  
  ParentUser.inherit(ServiceUser, require('../methoddescriptors/serviceuser'), [/*visible state fields here*/]/*or a ctor for StateStream filter*/);
  ServiceUser.prototype.__cleanUp = function () {
    ParentUser.prototype.__cleanUp.call(this);
  };

  ServiceUser.prototype.c = function (username, password, defer) {
    this.__service.authenticate(username, password).then(
      console.log.bind(console,'ok'),
      console.error.bind(console,'nok')
    );
  };

  return ServiceUser;
}

module.exports = createServiceUser;
