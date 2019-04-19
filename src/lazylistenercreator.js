function createLazyListener(lib,mylib){
  'use strict';
  function LazyListenerTarget(lazylistener,prop,propname){
    this.__parent = lazylistener;
    this.changedHandler = null;
    this.prop = prop;
    this.propname = propname;
    if(this.propname){
      this.changedHandler = prop.attachListener('changed',propname,this.onChanged.bind(this));
    }else{
      this.changedHandler = prop.changed.attach(this.onChanged.bind(this));
    }
    this.onChanged();
  }
  LazyListenerTarget.prototype.get = function(){
    return this.prop.get();
  };
  LazyListenerTarget.prototype.onChanged = function(){
    this.__parent.targetChanged(this);
  };
  LazyListenerTarget.prototype.destroy = function(){
    if(this.changedHandler){
      this.changedHandler.destroy();
    }
    this.changedHandler = null;
    this.propname = null;
    this.prop = null;
    this.__parent = null;
  };


  function initTargetsToNull(targetname){
    this[targetname] = null;
  }
  function LazyListener(neededtargetnames){
    lib.Changeable.call(this);
    lib.Gettable.call(this);
    this.targets = {};
    neededtargetnames.forEach (initTargetsToNull.bind(this.targets));
    this.dirty = false;
    this.value = null;
  }
  lib.inherit(LazyListener,lib.Changeable);
  function checkForNullTarget(elem,elemname){
    if(elem===null){
      return true;
    }
  }
  LazyListener.prototype.targetsReady = function(){
    return !!!lib.traverseConditionally(this.targets,checkForNullTarget);
  };
  LazyListener.prototype.get = function(){
    if(!this.dirty){
      return this.value;
    }
    if(!this.targetsReady()){
      return this.value;
    }
    this.value = this.calculateValue();
    this.dirty = false;
    return this.value;
  };
  LazyListener.prototype.calculateValue = function(){
    throw "LazyListener needs an overriden calculateValue method";
  };
  LazyListener.prototype.add = function(alias,prop,propname){
    if(this.targets[alias]!==null){
      throw "Cannot add LazyListenerTarget to alias "+alias+" because of "+this.targets[alias];
    }
    this.targets[alias] = new LazyListenerTarget(this,prop,propname);
  };
  LazyListener.prototype.targetChanged = function(/*target*/){
    this.set('dirty',true);
  };
  function destroyAndRemoveTarget(target,targetname){
    target.destroy();
    this[targetname] = null;
  }
  LazyListener.prototype.destroy = function(){
    this.value = null;
    this.dirty = null;
    lib.traverse(this.targets,destroyAndRemoveTarget.bind(this.targets));
    this.targets = null;
    lib.Gettable.prototype.__cleanUp.call(this);
    lib.Changeable.prototype.__cleanUp.call(this);
  };
  mylib.LazyListener = LazyListener;
}

module.exports = createLazyListener;
