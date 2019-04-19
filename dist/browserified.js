(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var lr = ALLEX.execSuite.libRegistry;
lr.register('vektr_commonlib',
  require('./index')(
    ALLEX,
    lr.get('vektr_mathlib')
  )
);

},{"./index":2}],2:[function(require,module,exports){
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

},{"./src/3daccelerationcreator":3,"./src/contentswitchercreator":4,"./src/getcreator":5,"./src/lazylistenercreator":6,"./src/matrixstackcreator":7,"./src/setcreator":8,"./src/stackedpropertycreator":9,"./src/svgcreator":10,"./src/traversaldestroyercreator":11}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
function createContentSwitcher(lib, mylib) {
  'use strict';
  function ContentSwitcher () {
    lib.Map.call(this);
  }
  lib.inherit(ContentSwitcher, lib.Map);
  ContentSwitcher.prototype.destroy = function () {
    this.drop();
    lib.Map.prototype.destroy.call(this);
  };

  ContentSwitcher.prototype.destroyAll = function () {
    lib.containerDestroyAll(this);
  };

  ContentSwitcher.prototype.drop = function () {
    this.keys().forEach(this.remove.bind(this));
  };

  ContentSwitcher.prototype.hideAll = function () {
    this.traverse(lib.doMethod.bind(null, 'hide', null));
  };

  ContentSwitcher.prototype.show = function (s) {
    this.hideAll();
    var sc = this.get(s);
    if (!sc) return;
    sc.show();
    return sc;
  };

  mylib.ContentSwitcher = ContentSwitcher;
}

module.exports = createContentSwitcher;

},{}],5:[function(require,module,exports){
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


},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
function createMatrixStack(lib,mylib,mathlib){
  'use strict';
  function MatrixStack(stack){
    mylib.LazyDynamicStackedProperty.call(this,'transformMatrix',stack);
  }
  lib.inherit(MatrixStack,mylib.LazyDynamicStackedProperty);
  MatrixStack.prototype.updateFromStack = function(m){
    m.toLocalSpace(this.value);
  };
  MatrixStack.prototype.initialValue = function(){
    return [1,0,0,1,0,0];
  };
  MatrixStack.prototype.toLocalSpace = function(m){
    mathlib.matrixToSpace(m,this.get());
  };
  MatrixStack.prototype.pointToLocalSpace = function(p){
    mathlib.pointToSpace(p,this.get());
  };
  mylib.MatrixStack = MatrixStack;
}

module.exports = createMatrixStack;

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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


},{}],10:[function(require,module,exports){
function createSvgUtils(lib,mylib){
  'use strict';
  function svgCtor(mylib,el){
    var tn = ('function' === typeof el.tagName) ? el.tagName() : el.tagName;
    if (tn && tn.indexOf(':')>=0) {
      tn = tn.split(':');
      tn = tn[tn.length-1];
    }
    switch(tn){
      case 'g':
        return mylib.Group;
      case 'path':
        return mylib.Path;
      case 'defs':
        return mylib.Defs;
      case 'image':
        return mylib.Sprite;
      case 'rect':
        return mylib.Rect;
      case 'polyline':
        return mylib.PolyLine;
      case 'text':
        return mylib.Text;
      case 'use':
        return mylib.Use;
      case 'linearGradient':
        return mylib.LinearGradient;
      case 'radialGradient':
        return mylib.RadialGradient;
      case 'clipPath':
        return mylib.ClipPath;
      case 'circle':
        return mylib.Circle;
      case 'polygon':
        return mylib.Polygon;
      case 'line':
        return mylib.Line;
      /*
      case 'ellipse':
      */
      default:
				/*
        if(tn){
          console.log('unsupported',tn);
          console.log(el);
        }
				*/
    }
  }
  function ResolveNeed(need){
    this.needs = [need];
  }
  ResolveNeed.prototype.addNeed = function(need){
    this.needs.push(need);
  };
  function resolveNeed(need){
    mylib.set(need[0],need[1],this);
  }
  ResolveNeed.prototype.resolve = function(resolver){
    this.needs.forEach(resolveNeed.bind(resolver));
    this.needs = null;
  };
  function SvgBase(){
  }
  SvgBase.prototype.registerObject = function(el){
    var ri = this.__elementsById.find({name:el.id});
    if(ri===null){
      this.__elementsById.add(el.id,el);
    }else{
      var r = ri.content.content;
      if(r instanceof ResolveNeed){
        r.resolve(el);
        ri.content.content = el;
        //this.__elementsById.add(el.id,el);
      }else{
        throw 'Duplicate object at '+el.id;
      }
    }
    /*
    switch(typeof r){
      case 'undefined':
        this.__elementsById.add(el.id,el);
        break;
      case 'object':
        if(r instanceof ResolveNeed){
          r.resolve(el);
          this.__elementsById.add(el.id,el);
        }else{
          throw 'Duplicate object at '+el.id;
        }
    }
    */
  };
  SvgBase.prototype.onResolveNeeded = function(child,needtype,needname){
    //console.log('resolve',needtype,needname,'?');
    var r = this.__elementsById.get(needname);
    if(lib.isUndef(r)){
      this.__elementsById.add(needname,new ResolveNeed([child,needtype]));
    }else{
      if(r instanceof ResolveNeed){
        r.addNeed([child,needtype]);
      }else{
        mylib.set(child,needtype,r);
      }
    }
    /*
    switch(typeof r){
      case 'undefined':
        this.__elementsById.add(needname,new ResolveNeed([child,needtype]));
        break;
      case 'object':
        if(r instanceof ResolveNeed){
          r.addNeed([child,needtype]);
        }else{
          mylib.set(child,needtype,r); //what's the deal with 'mylib'?!
          //mylib.set(child,needtype,r);
          //console.log(needname,'resolved');
        }
        break;
    }
    */
  };
  SvgBase.prototype.checkElementById = function(eids,el,elid){
    if(el instanceof ResolveNeed){
      console.log(eids);
      throw elid+' not resolved finally';
    }
    delete eids[elid];
  };
  mylib.SvgBase = SvgBase;
  mylib.svg = {
    ctorFor: svgCtor
  };
}

module.exports = createSvgUtils;

},{}],11:[function(require,module,exports){
function createTraversalDestroyer(mylib){
  'use strict';
  mylib.destroyDestroyable = function(d){
    d.destroy();
  };
}

module.exports = createTraversalDestroyer;

},{}]},{},[1]);
