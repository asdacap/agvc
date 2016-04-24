#!/bin/sh

(cd ../server && meteor build --directory ../configurations)
(cd bundle/programs/server/ && npm install)
