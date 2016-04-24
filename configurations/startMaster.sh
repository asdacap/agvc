#!/bin/bash

source setEnv.sh
PORT=${1:-3000}
node bundle/main.js
