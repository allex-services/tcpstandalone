function createServicePack(execlib) {
  'use strict';

  return {
    service: {
      dependencies: ['.', 'allex_bufferlib']
    },
    sinkmap: {
      dependencies: ['.']
    }
  };
}

module.exports = createServicePack;
