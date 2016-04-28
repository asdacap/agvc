#!/bin/bash

source setEnv.sh
export PORT=${1:-3000}
export TCP_LISTEN_PORT=${2:-10000}
export UDP_LISTEN_PORT=${TCP_LISTEN_PORT:-10000}
node bundle/main.js
