#!/bin/bash

#node agv_tcp_client.js ABC >> out.log 2>&1  &

for i in {1..9}
do
sleep 0.4
echo AGV0$i
node agv_tcp_client.js AGV0$i >> out.log 2>&1  &
done

for i in {10..30}
do
sleep 0.4
echo AGV$i
node agv_tcp_client.js AGV$i >> out.log 2>&1  &
done

wait
