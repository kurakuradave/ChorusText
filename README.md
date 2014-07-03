ChorusText
==========



Chorus Text Reader
------------------
1. Connect the Raspberry Pi to your wifi network and plug the Arduino to the Pi's USB port
2. On the Raspberry Pi run: $> node ChorusClient.js (may need to SSH into the Pi)
3. Access the device by opening a web browser in any machine connected to the same wifi network as the Pi, and then go to the Pi's hostname and at port 3000. For example: "http://choruspi:3000/" if the hostname for the Pi is chrouspi.



* Code for the Arduino is located in /arduino/
* Code for node client is located in /ChorusTextPi/
* Code for node server is located in /node-server/
* Hardware related items such as laser-cutting design files, wiring guide, list of components used, datasheets, etc are located in /hardware/
