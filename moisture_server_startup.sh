#!/bin/bash
node /home/pi/projects/server-plant/index.js > /home/pi/projects/server-plant/moist_server.log 2>&1 &

serve -s /home/pi/projects/plant-sensor-react-server/build &