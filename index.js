function createServicePack(execlib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    libRegistry = execSuite.libRegistry,
    d = q.defer();

  libRegistry.register('allex_bufferlib').then(
    realCreator.bind(null, d),
    d.reject.bind(d)
  );


  function realCreator (defer, bufferlib) {
    try {
    var ret = require('./clientside')(execlib),
      ParentServicePack = execSuite.registry.get('.');

    ret.Service = require('./servicecreator')(execlib, ParentServicePack, bufferlib);
    defer.resolve(ret);
    } catch(e) {
      console.error(e.stack);
      console.error(e);
    }
  }

  return d.promise;
}

module.exports = createServicePack;
