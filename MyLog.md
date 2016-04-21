
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

18 April
========

So, today is largely UI stuff. We have indicator icon in the main map now.
Some layout changes in the MachinePage. Some layout change in MachineListItem.
The ReadingHistoryChart now looked better.

In addition to that, some arduino setting are now settable through wifi. Those
settings are mainly about the Motor and some variables for the PID controller used
for the line following algorithm.

Another addition is the addition of infrared obstacle sensor. It does not seems
to work on every surface, but I rather use it then an untrasonic one due to the
difficulty in programming it. Because of this, a new reading 'obstructed' is added.

Tomorrow, our main agenda is to once and for all fix the connection issue bugging
the serverside.

19 April
========

According to `git log`, there is about 25 commit today. Starting with the connection
handler now should be fixed. The issue seems to be that when arduino disconnect,
it does not have the chance to tell the server that it is now disconnected. So,
several days ago I made a 'ping' every second which now also double as the measurement
of response time between server and arduino. However, the cleanup of of the connection
for some reason is quite unpredictable. Likely that is just because of my incopetency.
But it probably have something to do with some stuff in nodejs not running syncronously
and the fact that after a call to `socket.end`, the connection can still receive data.
I soon realize that I need to use `socket.destroy` instead which the documentation said,
should only be used as a last resort.

Later commit is about refactor and finally the status tab of the machine page is now
using the ViewTime. Later on I integrated ViewTime with the ReadingHistoryChart which
basically allow replaying of chart of readings recorded before. Some significant amount
of time went modifying this thing.

Today the voltage sensor and temperature sensor arrived. Unfortunately the temperature
sensor is faulty. I can't get it to work. Some guy from the internet also have a similar
issue, which was solved by buying another sensor from another guy. Its something about
uncalibrated sensor. The voltage sensor (more like a board of resistor) works nicely.
We can now get a nice graph of voltage from the battery. However, the voltage reading
drops as soon as the AGV is turned on and drop further when it is moving. An
understandable, but sadly unpredicted phenomena. This means, predicting the battery life
from the voltage reading alone may not be a very good idea.

Several more UI change was implemented. The readings now can have `unit` assigned to
them. Meaning the response time is now marked as 'ms' for miliseconds. A nice touch.
The machine card header now change color depending on the status of the machine.
A class that complement ViewTime is added called FasterViewTime which aid with making
smoother animation. Unfortunately the map is now significantly more CPU taxing. A
proper animation approximation would be a better idea.

Aside from the occational bugfix, more UI changes was implemented in the MachinePage.
A map is now shown on the left side of the screen and will move to the top when the
screen width is too limited. A similar panel is also avalable in the manualMode tab,
The layout uses flex layout which may have some compatibility issue if I forget to
put polyfill. I actually tried to do this for a couple of hour not realizing that
dumping the JSON to a ListItem is the reason it behaves strangely.

As a sidenote, I checked the client response when disabling websocket or the websocket's
compression. With no websocket, the response time is about 50ms. Websocket with
no compression's response time is about 4 to 15ms, Websocket with compression is
about 4 to 10 ms. The different between Websocket compression or not is harder
to predict, but it seems to have a consistent advantage. Without websocket, it is
likely using HTTP long polling which shows a consistently worst performance.

20 April
========

This morning, I added a bigger curcuit map, the curcuit map of the curcuit similar
in the robotics lab. Just now I've moved the animation for the MachineView in the
map to use manual animation instead of relying in reactive call. Had to split the
component to two as ReactMeteorData is calling itself on every forceUpdate().
However, even after the animation, the cpu usage is still high. I suspect the
culprit is minimongo or the publish/subscribe cycle that runs every 200 milisecond.
The subscription already had been tuned to run every minute. So its probably an
issue minimongo. I guess realtime update came at a cost.

I've splitted each reading type into its own collection. With that, I can combine some
subscription. Unfortunately, no change in client cpu usage can be seen even with that.

It turns out, the major cause of the 28ms loop interval is the RFID reader having a
timeout of 25ms. Reduced that by half. Now the loop interval is 16ms.

Explicitly setting nodelay on the TCP socket on server and arduino did not improve
the response time.

In total for today, there is about 23 commit. There are various minor changes.
One of those is that the AGV icon will now blink when the status is not "normal".
Then, I finally removed the wifly_hq library. The connection status is detected
using a wire from the wifly module. The chart now have a reading range. The
selectable range are 1 minute, 10 minute and 1 hour. Be careful when selecting
1 hour as the reading that is updated every second will load about 3600 record.
So the browser will hang. Strangely, as I expect the Meteor developer to have
some thought on blocking user's UI. Another ui change is the addition of
alert if the reading value is too high or too low.

Finally after doing various stuff, the high CPU usage was resolved by animating
the icon direcly through DOM. Actual cause of high CPU usage is probably React's
internal mechanism acting up.

The response time has been improved by about 10 ms by specifying wifly to send
data when it found a newline character. I experimented with sending data directly
to the machine interface instead of into mongodb and then the interface picking
that up. The result is higher than expected difference of about 20ms.

Aside from that, I've added a bandwidth reading. Strangely there seems to be data
being sent from the server to the agv even if the agv is offline. Will check that
out tomorrow.

21 April
========

24 commit today. Mostly small commit though. But there are some significant changes.
The map can now show arbitrary svg. Basically I just load an svg image and put it
at the back of the map. Interestingly there is no way for meteor to embed it into
clientside code. So it needs to be loaded via HTTP. Does not really matter though...

A scale property has been added to MachineView. So the smaller map in the MachinePage
shows a bigger AGV icon.

The button in the manual mode tab will now vibrate on phones. I wonder why this is
not built in MaterialUI. For a UI library inspired from android, MaterialUI is
surprisingly not mobile friendly.

One big commit today is the inclusion of UDP interface. The arduino's protocol has
been modified to detect connection by itself by sending 'hello' packet every second.
It seems that its not arduino that skips the detection of new TCP connection, but
the wifly module itself. Checked by setting GPIO pin to HIGH when a TCP connection
is alive. When powering down arduino (with a connection to the server), and powering
it up quickly, the server detect a new incoming connection, but not wifly. So, the
protocol for UDP should make the TCP connection more robust. Unfortunately when using
UDP, which is the commit's original intention, the response time is far more
unpredictable, seems higher than TCP and a lot of loss packet. So I switched back
to TCP, now made more reliable with a protocol made for UDP.

Another change is better position prediction. Essentially when estimating the AGV's
location, it needs the speed of the AGV. Previously the speed is hardcoded and
specified beforehand on the map. Now it uses previously measured speed. So,
with enough data, the hardcoded speed is now merely a hint.

The manual tab now can use keyboard to control the AGV. Direction keys as expected
and space bar to toggle manual mode.

A 'master' settings has been added. The TCP/UDP/Machine interface will now only
start when the master flag is turned on.

The reading will not not add a new value if it the new value is the same as
previous two value. Instead the last reading will have a newer timestamp. this
should reduce reading logs and make things more efficient especially on clientside.
Unfortunately readings which change a lot like response time, would not
benefit much from this.

Speaking of readings, new temperature sensor just arrived today. I ordered a different
model from different store, but it sent the same LM35 sensor that I ordered before.
But this one worked fine. This confirm that the previous sensor is not working,
and it is not my fault. :-)

Other than that, most commit today is largely tweaks. I've added average to the chart,
the 'live' button will be disabled when the clientside is disconnected, cleanups, etc.

Right now I have effectively nothing to do. I was thinking about making an analog
manualMode, but that does not sounds necessary. The biggest problem about the
system right now is high client CPU usage. I'm not exactly sure what is the cause,
but it is either the MapView, both small and all machine or the chart. Likely,
it is both.

For the map, I'm not exactly sure what is the issue. Perhaps it is the point calculation
that is taking time. Or perhaps it is simply the StateCalculator. Or ReactJS is
acting up, probably due do development mode?. One thing I notice before about
animating the MachineView is that, animating with React is really CPU intensive.
Instead I translate the machineView manually through DOM. Far less CPU intensive.
Another thing I made is several React's higher order component that limits the rendering.
That seems to help, but sometimes the CPU usage still rise for no reason. Sometimes,
there seems to be no activity at all.

Regarding the ReadingHistoryChart. I don't think I can make much improvement there.
I'm even impressed by how fast d3 can render stuff. But the bottleneck does not seems
to be the rendering, but either the chart calculation, or minimongo. I'm thinking minimongo,
as the chart calculation uses a lot of it. Actually, not that much. Anyway, the point is,
for example, the responseTime from the arduino for some reason is send twice, sometimes.
That means, in 10 minutes, (I just checked before) there is about 940 record about it.
Loading 940 record to clientside does not sounds very clever. What happen when the range
is set to 1 hour? It will (and did) surely hang. A solution would be to use an aggregate
function to sample a maximum of... let say, 200 record. It won't look nice, but it
won't hang.

Considering I'm basically out of major development stuff to do, the next step would
be to measure stuff. This sunday, I'll try to arrange three robot at the same time with
the system. See the response time. How bad can it get.

Oh yea, I forgot. There has not been a response time between client to arduino
and back. I should make one. And we should also see the effect of using redis instead
of mongodb.
