// create a http server that response to any request with a random number
const http = require('http');
const dns = require('dns'); 
var fs = require('fs');

const MY_IP = '192.168.86.186';

// create a server object
const server = http.createServer((req, res) => {
  // set the response header

  // check if the request is GET or POST
  if (req.method === 'GET') {
    fs.readFile('wifi.html',function (err, data){
      res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
      res.write(data);
      console.log(req.url);
      console.log(req.socket.remoteAddress); // this is the client's IP address
      return res.end();
    });
  } else if (req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    console.log(req.url);
    console.log(req.socket.address().address);
    // send a response to the client
    return res.end('POST request');
  } else if (req.method === 'PATCH') {
    // send a response to the client
    return res.end('PATCH request');
  }
}).listen(3232);

