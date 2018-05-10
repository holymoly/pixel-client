var net = require('net');                                                   
  2 
  3 var client = new net.Socket();
  4 client.connect(1234, '192.168.123.178', function() {
  5 »·console.log('Connected');
  6   while(true){
  7     writePixel();
  8   }
  9 });
 10 
 11 function writePixel(){
 12   client.write('PX 20 30 ff8800\n');
 13 };
 14 
 15 client.on('data', function(data) {
 16 »·console.log('Received: ' + data);
 17 »·client.destroy(); // kill client after server's response
 18 });
 19 
 20 client.on('close', function() {
 21 »·console.log('Connection closed');
 22 });
