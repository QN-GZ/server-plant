// create a http server that response to any request with a random number
import http from 'http';
import { getDiscoveredPlants } from './bcast.js';
const MY_IP = '192.168.86.186';
const HTTP_PORT = 10032;

var discoveredPlants = [
  {
    id: 'myplant-test',
    app: 'my-plant-node',
    fw_version: '1.0',
    fw_id: '20231231-061644/2.13.0-ge44f822-dirty',
    mg_version: '202312302350',
    mg_id: '20231230-235004',
    mac: 'test',
    arch: 'esp32',
    uptime: 1168,
    public_key: null,
    ram_size: 288416,
    ram_free: 229332,
    ram_min_free: 224020,
    fs_size: 5177344,
    fs_free: 5132288,
    wifi: {
      sta_ip: '192.168.86.207',
      ap_ip: '',
      status: 'got ip',
      ssid: 'FamilyGuest'
    }
  }
]

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/plants') {
    console.log('GET /plants');
    var plants = getDiscoveredPlants();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Add this line for CORS support
    res.write(JSON.stringify(plants)); // Set plants as the response body
    res.end();
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
}).listen(HTTP_PORT);
