import dgram from 'dgram';
const socket = dgram.createSocket('udp4');
import player from 'play-sound';
const AUDIO_FILE = 'Na_lipsync.m4a';

const UDP_COM_PORT = 10001;
const DISCOVERY_INTERVAL = 5;
const BASE_DRYNESS = 1000; // 0% dryness
const PLAYBACK_DURATION = 8000;
const PLANT_MAX_DRYNESS = 2350;
const PLANT_READ_INTERVAL = 5000;
const STATE = {
  discoveryJson : {
    "id": 1234,
    "method": "Plant.Discovery",
    "params": {
      "server_ip": "192.168.86.186"
    }
  },
  plantGetJson : {
    "id": 1234,
    "method": "Plant.Get",
  },
  run: {
    discoveredDevice: {
      id: 'myplant-782184F89DF0',
      app: 'my-plant-node',
      fw_version: '1.0',
      fw_id: '20231231-061644/2.13.0-ge44f822-dirty',
      mg_version: '202312302350',
      mg_id: '20231230-235004',
      mac: '782184F89DF0',
      arch: 'esp32',
      uptime: 1168,
      public_key: null,
      ram_size: 288416,
      ram_free: 229332,
      ram_min_free: 224020,
      fs_size: 5177344,
      fs_free: 5132288,
      dryness_pct: 0,
      dryness: BASE_DRYNESS,
      max_dryness: PLANT_MAX_DRYNESS,
      wifi: {
        sta_ip: '192.168.86.207',
        ap_ip: '',
        status: 'got ip',
        ssid: 'FamilyGuest'
      }
    },
    plantGetResponse: {
      src: 'plant',
      result: {
        dryness: 0,
        max_dryness: 1000,
      }
    },
    isDiscoveryRunning: false,
    isSoundPlaying: false,
    isDiscoveryTimer_2s: 0,
    discoveredPlants: []
  }
}

var state = STATE;
export function getDiscoveredPlants() {
  return state.run.discoveredPlants;
}

const startDiscovery = async (state = {}) => {
  const { discoveryJson } = state;
  const discoveryJsonBuffer = Buffer.from(JSON.stringify(discoveryJson));
  
  socket.on('message', function (msg, remote) {
    const msgJson = JSON.parse(msg);
    if (state.run.isDiscoveryRunning && msgJson.method !== 'Plant.Discovery') {
      console.log(`Received '${msgJson.method}' response from: `, remote.address);
      console.log(msgJson);
      state.run.discoveredPlants.push(msgJson.result);
    } else if (state.run.isDiscoveryRunning && msgJson.method === 'Plant.Discovery' && ++state.run.isDiscoveryTimer_2s > DISCOVERY_INTERVAL) {
      console.log('Done with discovery - stopping');
      socket.setBroadcast(false);
      state.run.isDiscoveryRunning = false;
      state.run.isDiscoveryTimer_2s = 0;
      state.run.discoveredPlants = state.run.discoveredPlants.filter((device, index, devices) => {
        const duplicateIndex = devices.findIndex(d => d.id === device.id);
        return duplicateIndex === index;
      });
    } else {
      console.log(`Received response from: `, remote.address);
      console.log(`response: `, msgJson);
      state.run.plantGetResponse = msgJson;
      if (state.run.plantGetResponse.result?.dryness !== undefined) {
        // if (state.run.plantGetResponse.result.dryness > PLANT_MAX_DRYNESS && !state.run.isSoundPlaying) {
        //   state.run.isSoundPlaying = true;
        //   console.log('Playing sound...');
        //   // access the node child_process in case you need to kill it on demand
        //   var audio = player.play(AUDIO_FILE, function(err){
        //     if (err && !err.killed) throw err
        //   })
        //   // timer to end the music after 5 seconds
        //   setTimeout(function () {
        //     audio.kill();
        //     state.run.isSoundPlaying = false;
        //   }, PLAYBACK_DURATION);
        // }

        // Set plant dryness and max_dryness if msgJson.src equals discoveredPlants.id
        state.run.discoveredPlants.forEach(plant => {
          if (msgJson.src === plant.id) {
            plant.dryness = state.run.plantGetResponse.result.dryness;
            plant.max_dryness = state.run.plantGetResponse.result.max_dryness;
            plant.dryness_pct = Math.round(((plant.dryness - BASE_DRYNESS)/ (PLANT_MAX_DRYNESS - BASE_DRYNESS)) * 100);
          }
        });
      }
    }
  });
  socket.bind(UDP_COM_PORT, function () {
    socket.setBroadcast(true);
    state.run.isDiscoveryRunning = true;
    setInterval(() => {
      console.log('Sending requests...');
      if (state.run.isDiscoveryRunning) {
        socket.send(discoveryJsonBuffer, 0, discoveryJsonBuffer.length, UDP_COM_PORT, '255.255.255.255');
      } else {
        const plantGetBuffer = Buffer.from(JSON.stringify(state.plantGetJson));
        state.run.discoveredPlants.forEach(device => {
          socket.send(plantGetBuffer, 0, plantGetBuffer.length, UDP_COM_PORT, device.wifi.sta_ip);
        });
      }
    }, PLANT_READ_INTERVAL);
  });
}

startDiscovery(state);

export default getDiscoveredPlants;
