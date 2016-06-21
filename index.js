function createServicePack(execlib) {
  'use strict';

  return {
    service: {
      dependencies: ['.', 'allex:buffer:lib']
    },
    sinkmap: {
      dependencies: ['.']
    }
  };
}

module.exports = createServicePack;
