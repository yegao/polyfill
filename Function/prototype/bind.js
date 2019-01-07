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
  var fn = this;
  var res = function(){
    fn.apply(ctx,args.concat(Array.prototype.slice(arguments)));
    //当new res()的时候ctx正常情况下应该是Animal.bind
  }
  var f = function(){};
  f.prototype = fn.prototype;
  res.prototype = new f();
  return res;
}

// 三、
// MDN上的polyfill写法
// 这个执行之后其实和native code还是有一些区别的
// 经过试验发现native版本的bind是不能够被一下polyfill覆盖掉的
// 有如下代码
// var Foo = function(){
//  	console.log('Foo------');
// }
// Foo.prototype = {
// 	 a:'a',
// 	 b:'b'
// }
// var x = new (Foo.bind())()
// native版本的bind在执行如下的过程的时候结果是：
// x{
//   __proto__:{
//     a:'a',
//     b:'b'
//   }
// }
//
// polyfill版本的bind在执行如下的过程的时候结果是：
// x{
//   __proto__:{
//     __proto__:{
//       a:'a',
//       b:'b'
//     }
//   }
// }

if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }
    //aArgs是传入Function.prototype.bind的实参(除去第一个参数)
    //也就是Foo.bind({},23,45)(67,89)或者new(Foo.bind({},23,45))(67,89),那么aArgs就是[23,45]
    var aArgs   = Array.prototype.slice.call(arguments, 1);
    var fToBind = this;//在Foo.bind() 和 new (Foo.bind())() 的时候，这个this指代的都是Foo
    var fNOP    = function() {}
    var fBound  = function() {
      //在new (Foo.bind())()的时候，最后就是new fBound() 
      //这里的this指代的是Function.prototype.bind函数构造出来的实例
      //也就是fBound函数构造出来的实例，即this.__proto__ === fBound.prototype === new fNOP();
      //也就是this instanceof fNOP
      //由于下面维护原型关系的代码，使得this.__proto__.__proto__ === fNOP.prototype === Foo.prototype
      return fToBind.apply(this instanceof fNOP ? this : oThis,
        //这个地方的arguments是传入fBound的实参
        //如果Foo.bind({},23,45)(67,89)或者new(Foo.bind({},23,45))(67,89)
        //那么arguments就是[67,89]
        aArgs.concat(Array.prototype.slice.call(arguments))
      );
    };

    // 维护原型关系
    if (this.prototype) {
      //在Foo.bind() 和 new (Foo.bind())() 的时候，这个this指代的都是Foo
      //Function.prototype是没有prototype属性的，但是Foo可能有
      fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();
    return fBound;
  };
}

// 注意：绑定函数自动适应于使用 new 操作符去构造一个由目标函数创建的新实例。当一个绑定函数是用来构建一个值的，原来提供的 this 就会被忽略。不过提供的参数列表仍然会插入到构造函数调用时的参数列表之前。