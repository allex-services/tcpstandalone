function createServicePack(execlib) {
  'use strict';

  return  {
    service : {
      dependencies : ['allex:buffer:lib']
    },
    sinkmap : {
      dependencies : ['allex:buffer:lib']
    }
  };
}

module.exports = createServicePack;
