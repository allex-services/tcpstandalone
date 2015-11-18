function createTcpStandaloneService(execlib, ParentServicePack, bufferlib) {
  'use strict';
  var execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry,
    ParentService = ParentServicePack.Service;

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service'), bufferlib),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) 
    };
  }

  function TcpStandaloneService(prophash) {
    ParentService.call(this, prophash);
    this.resolvername = prophash.resolver;
    this.resolver = null;
    this.port = prophash.port;
    this.server = null;
    this.findResolver();
  }
  
  ParentService.inherit(TcpStandaloneService, factoryCreator);
  
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
    this.resolvername = null;
    ParentService.prototype.__cleanUp.call(this);
  };

  TcpStandaloneService.prototype.findResolver = function () {
    var rtaskobj = {task: null};
    rtaskobj.task = taskRegistry.run('findSink', {
      sinkname: this.resolvername,
      identity: {name: 'user', role: 'user'},
      onSink: this.onResolver.bind(this, rtaskobj)
    });
  };

  TcpStandaloneService.prototype.onResolver = function (rtaskobj, sink) {
    rtaskobj.task.destroy();
    if (!sink) {
      this.findResolver();
      return;
    }
    sink.destroyed.attach(this.findResolver.bind(this));
    this.resolver = sink;
    this.state.set('resolver', sink);
  };

  TcpStandaloneService.prototype.authenticate = execSuite.dependentServiceMethod([], ['resolver'], function (resolver, username, password, defer) {
    resolver.call('resolve', {username: username, password: password}).then(
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
    },
    resolver: {
      type: 'string'
    }
  };
  
  return TcpStandaloneService;
}

module.exports = createTcpStandaloneService;
