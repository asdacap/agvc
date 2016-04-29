#!/bin/bash

source setEnv.sh
export PORT=${1:-3010}
export METEOR_SETTINGS=$(cat webServer.json)
node bundle/main.js
