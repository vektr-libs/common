function createSet(mylib){
  'use strict';
  mylib.set = function(obj,propname,propval){
    var m = obj.set,mn;
    if('function' === typeof(m)){
      m.call(obj,propname,propval);
    }else{
      mn = 'set_'+propname;
      m = obj[mn];
      if('function' === typeof m){
        m.call(obj,propval);
      }else{
        if('undefined' !== typeof obj[propname]){
          obj[propname] = propval;
        }else{
          console.trace();
          console.log(obj);
          throw 'No property named '+propname+' on object';
        }
      }
    }
  };
}

module.exports = createSet;
