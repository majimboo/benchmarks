'use strict';

var Benchmark  = require('benchmark');
var suite      = new Benchmark.Suite();

var net = require('net');

var server = net.createServer().listen(4141);
var socket = new net.Socket();
socket.connect(4141);

function strToInt(string) {
  var len = string.length;
  var arr = [];
  for (var i = 0; i < len; i++) {
    arr[i] = string.charCodeAt(i);
  }
  return arr;
}

function intToStr(arr) {
  var str = '';
  var i;
  while ( i = arr.shift() ) {
    str += String.fromCharCode(i);
  }
  return str;
}

function intToStrN(arr) {
  var len = arr.length;
  var str = '';
  for (var i = 0; i < len; i++) {
    str += String.fromCharCode(arr[i]);
  }
  return str;
}

function bufToInt(buf) {
  var len = buf.length;
  var arr = [];
  for (var i = 0; i < len; i++) {
    arr[i] = buf[i];
  }
  return arr;
}

var someArr = [];
for (var i = 0; i < 200; i++) {
  someArr.push(i);
}
var recv_buf = new Buffer(someArr);

// add tests
suite

.add('buffer', function() {
  var buf = recv_buf;
  var result = [];
  var len = buf.length;

  // prepend size
  result.push(len + 1);
  for (var i = 0; i < len; i++) {
    result.push(buf[i] ^ 0x0A);
  }

  // send with prepended size
  socket.write(new Buffer(result));
})

.add('string+', function() {
  // treat recv buffer as int arr
  var buf = bufToInt(recv_buf);
  // var buf = recv_buf.toJSON().data;
  var len = buf.length;

  for (var i = 0; i < len; i++) {
    buf[i] ^= 0x0A;
  }

  // prepend size
  buf.unshift(len + 1);

  var mockbuf = intToStr(buf);
  socket.write(mockbuf);
})

// .add('string', function() {
//   var str = '\x00\x01\x02\x03\x04\x05';
//   var arr = strToInt(str);

//   for (var i = 0; i < arr.length; i++) {
//     arr[i] ^= 0x80;
//   }

//   var mockbuf = intToStrN(arr);
//   socket.write(mockbuf, 'utf8');
// })

// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  socket.destroy();
  server.close();
  socket.unref();
  server.unref();
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
// run async
.run({ 'async': true });
