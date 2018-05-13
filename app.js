var net = require('net');
var Jimp = require("jimp");
const fs = require('fs');

var data = [];
var picture = '';

// print process.argv
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

  
function start(){
  Jimp.read(process.argv[2]).then(function (image) {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      // x, y is the position of this pixel on the image
      // idx is the position start position of this rgba tuple in the bitmap Buffer
      // this is the image

      var red   = this.bitmap.data[ idx + 0 ];
      var green = this.bitmap.data[ idx + 1 ];
      var blue  = this.bitmap.data[ idx + 2 ];
      var alpha = this.bitmap.data[ idx + 3 ];

      var xoffset = x + parseInt(process.argv[4], 10);
      var yoffset = y + parseInt(process.argv[5], 10);

      //console.log('Pixel x: ' + x + ' y: ' + y + ' R: ' + red + ' G: ' + green + ' B: ' + blue + ' Alpha: ' + alpha);
      // rgba values run from 0 - 255
      // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel
      //
      //if(red != 255 && green != 255 && blue != 255){
        data.push('PX ' + xoffset + ' ' + yoffset + ' ' + red.toString(16) + green.toString(16) + blue.toString(16)+ alpha.toString(16));
      //}
      
      if(x == image.bitmap.width-1 &&
          y == image.bitmap.height-1) {
          picture = shuffle(data).join('\n') + '\n';
          writeToFile(picture);

          console.log('IS IPV6:' + net.isIPv6(process.argv[3]));
          client.connect(1234,process.argv[3] , function() {
            console.log('Connected');
            
            writePixel(picture);
          });
      }
    });
  }).catch(function (err) {
      console.error(err);
  });
};

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

var client = new net.Socket();

function writeToFile(data){
  console.log('Write to file');
  fs.writeFile('image.px', data, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
};

function writePixel(picture){
  client.write(picture);
};

client.on('drain', function() {
  writePixel(picture);
});

client.on('error', function(ex) {
  console.log(ex);
});

client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
  start();
});

var i=0;
while(i<parseInt(process.argv[6], 10)){
  start();
  i++;
}

