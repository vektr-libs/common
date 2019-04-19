function createGet(mylib){
  'use strict';
  mylib.get = function(obj,propname){
    if('function' === typeof(obj.get)){
      return obj.get(propname);
    }else{
      if(typeof obj[propname] === 'undefined'){
        console.log('getting unexistent property',propname);
      }
      return obj[propname];
    }
  };
}

module.exports = createGet;

