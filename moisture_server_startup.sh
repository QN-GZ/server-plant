#!/bin/bash
USER_PROJECT=/home/quang-nguyen/projects
USER_NVM_BIN=/home/quang-nguyen/.nvm/versions/node/v20.17.0/bin

screen -d -m $USER_NVM_BIN/node $USER_PROJECT/server-plant/index.js 

screen -d -m $USER_NVM_BIN/node $USER_NVM_BIN/serve -s $USER_PROJECT/plant-sensor-react-server/build
