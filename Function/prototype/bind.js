// 一、
// 这种方式没有考虑new Animal.bind这种情况
Function.prototype.bind = function(){
  var args = Array.prototype.slice.call(arguments);
  var ctx = args.splice(0,1)[0];
  var self = this;
  return function(){
    self.apply(ctx,args.concat(Array.prototype.slice(arguments)));
  }
}

// 二、
// new (Animal.bind(ctx,2,3,4))(5,6,7) 相当于
// new (Animal.bind(null,2,3,4))(5,6,7) 相当于
// new Animal(2,3,4,5,6,7)
// 因为prototype的值没有被还原
Function.prototype.bind = function(){
  var args = Array.prototype.slice.call(arguments);
  var ctx = args.splice(0,1)[0];
  //当是Animal.bind(ctx,2,3,4)(5,6,7)的时候,相当于Animal.apply(ctx,[2,3,4,5,6,7])
  //当是new (Animal.bind(ctx,2,3,4))(5,6,7)的时候,相当于new Animal(2,3,4,5,6,7)
  var self = this;
  var res = function(){
    self.apply(ctx,args.concat(Array.prototype.slice(arguments)));
    //当new res()的时候ctx正常情况下应该是Animal.bind
  }
  var f = function(){};
  f.prototype = self.prototype;
  res.prototype = new f();
  return res;
}

// 三、
// MDN上的polyfill写法
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 // 获取调用时(fBound)的传参.bind 返回的函数入参往往是这么传递的
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    // 维护原型关系
    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}
