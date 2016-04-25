#!/bin/bash

source setEnv.sh
export PORT=${1:-3000}
node bundle/main.js
