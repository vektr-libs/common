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
