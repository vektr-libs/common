function createLib (execlib, mathlib) {
  'use strict';

  var lib = execlib.lib;
  var ret = {};

  require('./src/setcreator')(ret);
  require('./src/getcreator')(ret);
  require('./src/svgcreator')(lib, ret);
  require('./src/stackedpropertycreator')(lib, ret);
  require('./src/lazylistenercreator')(lib, ret);
  require('./src/matrixstackcreator')(lib, ret, mathlib);
  require('./src/3daccelerationcreator')(ret);
  require('./src/traversaldestroyercreator')(ret);
  require('./src/contentswitchercreator')(lib, ret);

  return ret;
}

module.exports = createLib;
