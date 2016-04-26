#!/bin/sh

node agv_tcp_client.js ABC >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV01 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV02 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV03 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV04 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV05 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV06 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV07 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV08 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV09 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV10 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV11 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV12 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV13 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV14 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV15 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV16 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV17 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV18 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV19 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV20 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV21 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV22 >> out.log 2>&1  &
sleep 0.3
node agv_tcp_client.js AGV23 >> out.log 2>&1  &
sleep 0.3

wait
