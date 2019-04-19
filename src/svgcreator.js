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
