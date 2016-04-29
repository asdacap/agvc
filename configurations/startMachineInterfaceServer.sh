#!/bin/bash

source setEnv.sh
export PORT=${1:-3010}
export TCP_LISTEN_PORT=${2:-10000}
export UDP_LISTEN_PORT=${TCP_LISTEN_PORT:-10000}
export METEOR_SETTINGS=$(cat machineInterfaceServer.json)
node bundle/main.js
