
17 April 2016: Introduction
===========================

Autonomous Guided Vehicle (AGV) Web-Based Central Monitoring System
-------------------------------------------------------------------

The purpose of this document is to document the story behind this project.
This project is my FYP (Final Year Project). The purpose of this project
is actually to create a prototype for a central Monitoring system for a fleet
of AGV that will be used by Proton. In this prototype, the central Web-Based
monitoring system communicate with a fleet of arduino-based miniature robot.
The system should be able to obtain data from the robots.

Overview of the system
----------------------

The system mainly consist of the arduino programming and a web based central system.
The web-based arduino system is based on Meteor, a nodejs framework. The central system
also use ReactJS as its client frontend. Currently the system communicate with the
AGV through a TCP connection through wifi.

Current Capability
------------------

The system can:

- Send and receive message from arduino
- Log message from arduino
- Approximate location of the AGV from the rfid message sent by the arduino.
- Graph various reading (mosly not implemented) from the arduino.
- Detect online status
- Detect if it is out of curcuit
- Calculate and log response time
  - the time a message took to go to arduino and sent back to server.
- Log loop interval (the time between `loop()` call in the arduino).
- See the command queue
  - the message that has been queued to be send to arduino.
- Manual Mode
  - control the arduino remotely through wifi like a toy car.
- Replay the readings/location/status of the AGV at a particular time.
  - seems to have a performance problem right now. Not exactly sure what.
- Detect the client response time
  - the time a message from the server is detected by the client and sent back to the server.
- Configure the arduino's setting.
  - The arduno store its machineId, server host, ip and such it its eeprom.
  - The system has an interface that connect to the serial port which allow
    configuration of arduino through the web interface.

The Arduino Thing
-----------------

The arduino robot is an Arduino Mega. Together with it is a RN-XV Wifly module, a
Cytron 2Amp Motor Driver Shield connected to an Auto-Calibrating Line Sensor (LSS05)
and a RFID-RC522 rfid detector strapped next to the line sensor to detect rfid on
the circuit. The arduino robot follows line on normal mode, and wait for command
from the server in manual mode. The programming of the arduino is splitted into a
bunch of header files. And most module have its own namespace. This is mainly to
reduce my headache on how to organize this bunch of code, in which during programming
I have to be careful not to do anything too much as the arduino is quite weak
compared to a full computer, which is a big problem. The arduino mega have 8 kb
or RAM and 4 KB or EEPROM. Which means, I can't really store much.

The Wifly module in particular is a big problem. One issue with arduino is that, it
is strictly a single threaded cpu. At least, that's the only thing I know about.
So, if we need to do some protocol handshake that require waiting, either the arduino
will hang, or we need to do some cooperative multitasking. The Wifly module have a
command and data mode. Switching between them involve a 500ms latency. That means, I
cannot simply explicitly tell the wifly module to 'connect' to the wifi or some server
in the middle of the robot's operation. It will hang. And it can fail to enter command
mode. In theory I could figurout a way to overcome this, but that is no easy task.
The good thing is, the wifly module have some sort of auto mode where it will automatically
connect to the wifi or to a host. That is why, at its current form, during the startup,
the arduino will configure the wifly before the AGV can do anything. During the operation,
the arduino will only need to detect if a new connection is there or not.

Unfortunately that is also not as simple as it sound. Currently the arduino is using
a modified wifly_hq library which does the detection of new connection or not.
One day, I'm going to remove it and make a customized one. It has been modified so
that the call to 'is connected' does not switch to command mode and back. Even so,
there are some behaviour where it seems to be connected, but marked as not connected.
And sometimes it could get disconnected and reconnected rapidly that the arduino
did not realize that it has been reconnected, so no data will be sent. Previously,
I tried to do a websocket connection. Unfortunately because of the websocket handshake,
together with the inconsistencies of the module means, there is a significant amount
of failed handshake. Because of this, I switched back to a tcp based connection.
Bafore, after a connection has been detected, the arduino will send its machineId as
a form of registration to the server. But as mentioned before, it may not recognize
that it has been reconnected, leaving the server waiting for registration. Now,
the server will send an 'identify' command, which will ask the arduino to register
its machineId. Which work better, unfortunately there have been some issue with
the arduino does not seems to send any data to the server. Likely, it does not
know that it has been connected.

The wifly module also seems to use a good chunk of power. Previously, with the wifly
module attached, the serial connection to the USB will randomly drop. Turning on
the battery at the same time seems to fix the problem. Or, remove the wifly module
during the programming. After switching to a new USB cable, the problem seems to be
resolved.

The following is a breakdown what each file do:

- `ConnectionManager.h` store the namespace that handles the tcp connection, handshake
  and ping
- `debounce.h` store a class Debounce which reduce the number of call to a function
  if the function has been called before.
- `GlobalListener.h` a single namespace that contains only declaration of mothods. The
  method is implemented at the end of `machine.ino`. Used to overcome circular dependency
  and act as a central 'hook' where event from other module is handled by other module.
- `lineFollowing.h` a namespace that contain the code that handle the line following.
- `machine.ino` mainpoint of the arduino. Calls other module's setup and loops and such.
- `ManualMode.h` contains the programming of manual mode.
- `MotorControl.h` a file that control the motor. Used by lineFollowing and ManualMode.
- `RateLimiter.h` contain a class RateLimiter that helps limits a rate at which a
  particular thing can happen.
- `rfid.h` contain programmings for the RFID detector.
- `settings.h` contain the programming for the EEPROM stored Settings.
- `wiflyConfigurator.h` contain the programming that configure the wifly during setup.

The Server Thing
----------------

The server thing is a Meteor server. Meteor is a nodejs based framework. Unlike most
web framework with a significantly different code between server and client, Meteor
tries to make them the same. That means, most code are shared between server and client.
Although, in practice code that suppose to work in client, only will run on client
and vice versa. Bottomly, client and server have the same codebase. The project use
ReactJS as its View component instead of the default Meteor's blaze.

Meteor is chosen, because I want the server to be based on nodejs. Nodejs is chosen
because it is known to be able support large amount of concurrent user, with an excellent
response time. This means, building a more 'realtime' web application should be
easier or at least more straightforward with Nodejs. Instead of using raw Nodejs,
which would require large amount of boilerplate coding, I search for a suitable
framework and found Meteor. Well, it may not be the most suitable as we still need
to do some custom tuning due to the interface with the machine, but it works.
Meteor uses mongodb as its database by default. Which is the reason why this project
is using it. Personally I think the architecture of Meteor is quite interesting and
very fun. The 'reactivity' of the framework means, data could be made realtime easily.
Readings from arduino recorded by the server should shows instantly (or near instant)
at the server.

However, like most framework, it is not very flexible. During the start of the project,
the version of Meteor used is 1.2. Meteor 1.2 do not natively support NPM package
in the application code, which is an issue. During the development, Meteor 1.3 came
out with support for NPM package. This makes everything a whole lot easier. Another issue
with Meteor is its performance. I'm not exactly sure why, by currently with the replay
feature, I'm seing a very high CPU usage by both, the client and mongodb. The
exact reason is still being investigated. Other page seems to show good response time.

ReactJS is a javascript View framework made by Facebook. It is raising popularity these
days and a signifiant competitor with AngularJS. What makes ReactJS special is that,
it challenges the convention used in common Web-Development. Instead of a clearly
separated Model-View-Controller, ReactJS separate codes by domain, embed HTML in
javascript, and encourage inline CSS, also specified in the same javascript file.
This creates a self enclosed "component" that helps with large project as it 'enclosed'
from the outside world. ReactJS is chosen mainly because I'm familiar with it. :-).
But that does not mean it does not have its own merit. Together with ReactJS is the
use of MaterialUI library, which are collection of react component that adhere to
google's Material UI guidelines.

The TCP server is embedded inside the Meteor server. At the start of the server,
a TCP server is started at port 10000. The server also listen for any new command
from mongodb.

17 April 2016 3:30 PM: Fixed Performance issue in preview
=========================================================

Fixed performance issue with the preview. The problem is wrong index definition.