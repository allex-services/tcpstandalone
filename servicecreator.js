function createTcpStandaloneService(execlib, ParentServicePack, bufferlib) {
  'use strict';
  var execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry,
    ParentService = ParentServicePack.Service,
    RemoteServiceListenerServiceMixin = execSuite.RemoteServiceListenerServiceMixin;

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service'), bufferlib),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) 
    };
  }

  function TcpStandaloneService(prophash) {
    ParentService.call(this, prophash);
    RemoteServiceListenerServiceMixin.call(this);
    this.resolver = null;
    this.port = prophash.port;
    this.server = null;
    this.findRemote(prophash.resolver, null, 'resolver');
  }
  
  ParentService.inherit(TcpStandaloneService, factoryCreator);
  RemoteServiceListenerServiceMixin.addMethods(TcpStandaloneService);
  
  TcpStandaloneService.prototype.__cleanUp = function() {
    if (this.server) {
      this.server.close();
    }
    this.server = null;
    this.port = null;
    if (this.resolver) {
      this.resolver.destroy();
    }
    this.resolver = null;
    RemoteServiceListenerServiceMixin.prototype.destroy.call(this);
    ParentService.prototype.__cleanUp.call(this);
  };

  TcpStandaloneService.prototype.authenticate = execSuite.dependentServiceMethod([], ['resolver'], function (resolver, username, password, defer) {
    resolver.call('resolveUser', {username: username, password: password}).then(
      defer.resolve.bind(defer),
      defer.reject.bind(defer)
    );
  });

  TcpStandaloneService.prototype.onSuperSink = function (supersink) {
    supersink.call('startStandalone').then(
      console.log.bind(console, 'ok'),
      console.error.bind(console, 'nok')
    );
  };

  TcpStandaloneService.prototype.propertyHashDescriptor = {
    port: {
      type: 'number'
    }/*,
    resolver: {
      type: 'string|object'
    }*/
  };
  
  return TcpStandaloneService;
}

module.exports = createTcpStandaloneService;
