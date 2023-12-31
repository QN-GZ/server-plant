const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const UDP_COM_PORT = 10001;

const STATE = {
  messageJson : {
    "id": 1234,
    "method": "Plant.Discovery",
    "params": {
      "server_ip": "192.168.86.186"
    }
  },
  run: {
    isDiscoveryRunning: false,
    isDiscoveryTimer_2s: 0,
    discoveredDevices: []
  }
}

const startDiscovery = async (state = {}) => {
  const { messageJson } = state;
  const bcastMessage = Buffer.from(JSON.stringify(messageJson));
  
  socket.on('message', function (msg, remote) {
    const msgJson = JSON.parse(msg);
    if (state.run.isDiscoveryRunning && msgJson.method !== 'Plant.Discovery') {
      console.log('Received Plant.Discovery response from: ', remote.address);
      console.log(msgJson);
      state.run.discoveredDevices.push(msgJson.result);
    } else if (state.run.isDiscoveryRunning && msgJson.method === 'Plant.Discovery' && ++state.run.isDiscoveryTimer_2s > 5) {
      console.log('Done with discovery - stopping');
      socket.setBroadcast(false);
      state.run.isDiscoveryRunning = false;
      state.run.isDiscoveryTimer_2s = 0;
    } else {
      console.log('Received Plant.Discovery from: ', remote.address);
      console.log(msgJson);
    }
  });
  socket.bind(UDP_COM_PORT, function () {
    socket.setBroadcast(true);
    state.run.isDiscoveryRunning = true;
    setInterval(() => {
      socket.send(bcastMessage, 0, bcastMessage.length, UDP_COM_PORT, '255.255.255.255');
    }, 2000);
  });
}

startDiscovery(STATE);