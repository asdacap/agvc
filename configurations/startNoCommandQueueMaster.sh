#!/bin/bash

source setEnv.sh
export PORT=${1:-3000}
export METEOR_SETTINGS=$(cat noCommandQueueMaster.json)
node bundle/main.js
