function createTraversalDestroyer(mylib){
  'use strict';
  mylib.destroyDestroyable = function(d){
    d.destroy();
  };
}

module.exports = createTraversalDestroyer;
