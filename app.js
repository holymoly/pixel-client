var net = require('net');
var Jimp = require("jimp");
const fs = require('fs');

var clients = new Array;

var data = [];
var picture = '';

// print process.argv
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
  
function start(clientN){
  clientN.connect(1234,process.argv[3] , function() {
    console.log('Connected');
    
    writePixel(picture, clientN);
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


function parsePicture(cb){
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

      //if(red != 255 && green != 255 && blue != 255){
        data.push('PX ' + xoffset + ' ' + yoffset + ' ' + red.toString(16) + green.toString(16) + blue.toString(16)+ alpha.toString(16));
      //}
      
      if(x == image.bitmap.width-1 &&
          y == image.bitmap.height-1) {
          console.log("Parsing picture");
          //store result
          picture = shuffle(data).join('\n') + '\n';
          //writeToFile(picture);
          cb();
      }
    });
  }).catch(function (err) {
      console.error(err);
  });
}

//var client = new net.Socket();
/*
function writeToFile(data){
  console.log('Write to file');
  fs.writeFile('image.px', data, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
};
*/

function writePixel(picture, clientN){
  //console.log("Flut pixel with client: " + clientN);
  //console.log(picture);
  clientN.write(picture);
};

var i=0;
parsePicture(init);

function init(){
  while(i < parseInt(process.argv[6], 10)){
    var client = new net.Socket();

    client.on('drain', function() {
      //console.log("Flut pixel finished");

      writePixel(picture, this);
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
      start(this);
    });

    clients.push(client);

    start(client);
    i++;
  }
};
  