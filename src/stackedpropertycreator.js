function createStackedProperty(lib,mylib){
  'use strict';
  function StackedProperty(propname,stack,skipinitialtraverse){
    lib.Destroyable.call(this);
    lib.Gettable.call(this);
    this.propname = propname;
    this.value = this.initialValue();
    this.stack = stack;
    if(skipinitialtraverse!==true){
      this.traverseStack();
    }
  }
  StackedProperty.prototype.destroy = lib.Destroyable.prototype.destroy;
  StackedProperty.prototype.get = function(propname){
    //propname is totally irrelevant, but for clarity
    if(typeof propname === 'undefined'){return this.value;}
    return this.propname === propname ? this.value : null;
  };
  StackedProperty.prototype.squash = function(){
    this.value = this.get();
    this.stack = [];
  };
  StackedProperty.prototype.__cleanUp = function(){
    this.stack = null;
    this.value = null;
    this.propname = null;
    lib.Gettable.prototype.__cleanUp.call(this);
    lib.Destroyable.prototype.__cleanUp.call(this);
  };
  StackedProperty.prototype.initialValue = null; //abstract method
  StackedProperty.prototype.updateFromStack = null; //abstract method, returns !undefined to stop update traversal
  StackedProperty.prototype.traverseStack = function(){
    this.value = this.initialValue();
    //lib.traverseArrayConditionally(this.stack,this.updateFromStack.bind(this));
    lib.traverseConditionally(this.stack, this.updateFromStack.bind(this));
  };
  StackedProperty.prototype.append = function(el){
    this.stack.push(el);
    this.traverseStack();
  };
  mylib.StackedProperty = StackedProperty;

  function AbstractDynamicStackedProperty(propname,stack,skipinitialtraverse){
    lib.Changeable.call(this);
    this.__stackListeners = [];
    StackedProperty.call(this,propname,stack,skipinitialtraverse);
    this.stack.forEach(this.attachStackListener.bind(this));
  }
  AbstractDynamicStackedProperty.prototype.attachStackListener = function(se){
    this.__stackListeners.push(se.attachListener('changed',this.propname,this.stackElementChanged.bind(this,se)));
  };
  AbstractDynamicStackedProperty.prototype.set = lib.Changeable.prototype.set;
  AbstractDynamicStackedProperty.prototype.fireEvent = lib.Changeable.prototype.fireEvent;
  AbstractDynamicStackedProperty.prototype.destroy = StackedProperty.prototype.destroy;
  AbstractDynamicStackedProperty.prototype.get = StackedProperty.prototype.get;
  AbstractDynamicStackedProperty.prototype.traverseStack = StackedProperty.prototype.traverseStack;
  AbstractDynamicStackedProperty.prototype.detachStackListeners = function(){
    while(this.__stackListeners.length){
      this.__stackListeners.pop().destroy();
    }
  };
  AbstractDynamicStackedProperty.prototype.squash = function(){
    this.detachStackListeners();
    StackedProperty.prototype.squash.call(this);
  };
  AbstractDynamicStackedProperty.prototype.append = function(el){
    StackedProperty.prototype.append.call(this,el);
    this.attachStackListener(el);
  };
  AbstractDynamicStackedProperty.prototype.__cleanUp = function(){
    this.detachStackListeners();
    this.__stackListeners = null;
    StackedProperty.prototype.__cleanUp.call(this);
    lib.Changeable.prototype.__cleanUp.call(this);
  };
  mylib.AbstractDynamicStackedProperty = AbstractDynamicStackedProperty;

  function PlainDynamicStackedProperty(propname,stack){
    AbstractDynamicStackedProperty.call(this,propname,stack);
  }
  lib.inherit(PlainDynamicStackedProperty,AbstractDynamicStackedProperty);
  PlainDynamicStackedProperty.prototype.traverseStackWithResult = function(){
    var oldval = this.value;
    StackedProperty.prototype.traverseStack.call(this);
    if(this.value!==oldval){
      return true;
    }
    return false;
  };
  PlainDynamicStackedProperty.prototype.traverseStack = function(){
    if(this.traverseStackWithResult()){
      this.changed.fire(this.propname,this.value);
    }
  };
  mylib.PlainDynamicStackedProperty = PlainDynamicStackedProperty;

  function ANDStackedProperty(propname,stack){
    PlainDynamicStackedProperty.call(this,propname,stack);
  }
  lib.inherit(ANDStackedProperty,PlainDynamicStackedProperty);
  ANDStackedProperty.prototype.updateFromElement = function(el){
    var v = el.get(this.propname);
    if(!v){
      this.value = v;
      return true;//stop traversal
    }
  }; 
  ANDStackedProperty.prototype.updateFromStack = ANDStackedProperty.prototype.updateFromElement;
  ANDStackedProperty.prototype.stackElementChanged = function(el){  //ANDStackedProperty.prototype.updateFromStack;
    var oldval = this.value;
    if(!this.updateFromElement(el)){// && !oldval){
      //console.log(el.id,'is visible, will re-traverse');
      this.traverseStack();
    }else if(oldval !== this.value){
      this.changed.fire(this.propname,this.value);
    }
  };
  ANDStackedProperty.prototype.initialValue = function(){
    return true;
  };
  mylib.ANDStackedProperty = ANDStackedProperty;

  function ORStackedProperty(propname,stack){
    PlainDynamicStackedProperty.call(this,propname,stack);
  }
  lib.inherit(ORStackedProperty,PlainDynamicStackedProperty);
  ORStackedProperty.prototype.updateFromElement = function(el){
    var v = el.get(this.propname);
    if(v){
      this.value = v;
      return true;//stop traversal
    }
  };
  ORStackedProperty.prototype.updateFromStack = ORStackedProperty.prototype.updateFromElement;
  ORStackedProperty.prototype.stackElementChanged = function(el){
    var oldval = this.value;
    if(!this.updateFromElement(el)){
      this.traverseStack();
    }else if(oldval !== this.value){
      this.changed.fire(this.propname,this.value);
    }
  };
  ORStackedProperty.prototype.initialValue = function(){
    return false;
  };
  mylib.ORStackedProperty = ORStackedProperty;

  function LazyDynamicStackedProperty(propname,stack){
    this.dirty = true;
    AbstractDynamicStackedProperty.call(this,propname,stack,true); //skip initial traversal
  }
  lib.inherit(LazyDynamicStackedProperty,AbstractDynamicStackedProperty);
  LazyDynamicStackedProperty.prototype.__cleanUp = function(){
    this.dirty = null;
    AbstractDynamicStackedProperty.prototype.__cleanUp.call(this);
  };
  LazyDynamicStackedProperty.prototype.stackElementChanged = function(){
    this.dirty = true;
    this.changed.fire(this.propname,this.value);
  };
  LazyDynamicStackedProperty.prototype.traverseStack = function(){
    AbstractDynamicStackedProperty.prototype.traverseStack.call(this);
    //this.changed.fire(this.propname,this.value);
  };
  LazyDynamicStackedProperty.prototype.get = function(propname){
    if(this.dirty){
      this.dirty = false;
      this.traverseStack();
    }
    return AbstractDynamicStackedProperty.prototype.get.call(this,propname);
  };
  mylib.LazyDynamicStackedProperty = LazyDynamicStackedProperty;
}

module.exports = createStackedProperty;

