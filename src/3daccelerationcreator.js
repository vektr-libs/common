function createEnable3DAcceleration(mylib){
  'use strict';
  function enable3DAcceleration(obj){
    if(typeof obj.style.webkitTransform !== 'undefined'){
      obj.style.webkitTransform = "translate3D(0,0,0)";
    }
    if(typeof obj.style.MozTransform !== 'undefined'){
      obj.style.MozTransform = "translate3D(0,0,0)";
    }
    if(typeof obj.style.MsTransform !== 'undefined'){
      obj.style.MsTransform = "translate3D(0,0,0)";
    }
    console.log('3d accelerated');
  }
  mylib.enable3DAcceleration = enable3DAcceleration;
}

module.exports = createEnable3DAcceleration;
