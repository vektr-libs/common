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
