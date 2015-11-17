function createTcpStandaloneService(execlib, ParentServicePack, bufferlib) {
  'use strict';
  var ParentService = ParentServicePack.Service;

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service'), bufferlib),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) 
    };
  }

  function TcpStandaloneService(prophash) {
    ParentService.call(this, prophash);
    this.port = prophash.port;
    this.server = null;
  }
  
  ParentService.inherit(TcpStandaloneService, factoryCreator);
  
  TcpStandaloneService.prototype.__cleanUp = function() {
    if (this.server) {
      this.server.close();
    }
    this.server = null;
    this.port = null;
    ParentService.prototype.__cleanUp.call(this);
  };

  TcpStandaloneService.prototype.onSuperSink = function (supersink) {
    this.server = bufferlib.createTcpCallableStandalone(supersink);
    this.server.listen(this.port, console.log.bind(console, 'listening on', this.port));
  };

  TcpStandaloneService.prototype.propertyHashDescriptor = {
    port: {
      type: 'number'
    }
  };
  
  return TcpStandaloneService;
}

module.exports = createTcpStandaloneService;
