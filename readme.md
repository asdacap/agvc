Realtime Web-Based Autonomous Guided Vehicle Fleet Management System
====================================================================

This is my FYP project. Its basically a management system for a fleet
of AGV, where the AGV fleet communicate with the system through Wifi
and TCP. See `Final Report.docx` for the report and `MyLog.md` for a
more 'journal'-like overview+.

The directory is organized into several directory. These are more like 
a research project rather than a production software, so some unused 
code is left for reference.

Arduino
-------

The `arduino` directory contain the arduino code used to program the AGV.
It communicate with the server through wifi and a simple custom TCP 
protocol. 

Configurations
--------------

The `configurations` directroy contain some shell script and json file
that is used to run various configuration of the servers. Multiple
server instance can be started depending on loads.

Resources
---------

The `resources` directory contain non-code file such as the track of the
AGV.

Server
------

The `server` directroy contain the actual meteor server which is basically
the bulk of the project.

Simulator
---------

The `simulator` directory contains the simulator code that is used to 
to stress test the server.

Licenses
========

The resources in this repository is licensed under the term of MIT license. 
See `LICENSES.txt` for more information.