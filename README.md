ChorusText
==========


Installing Node.js on pcDuino / Raspberry Pi
--------------------------------------------

On the Pi, or pcDuino, open the terminal and execute:
$ wget http://nodejs.org/dist/v0.10.24/node-v0.10.24-linux-arm-pi.tar.gz
$ tar -xzvf node-v0.10.24-linux-arm-pi.tar-gz
$ sudo mv node-v0.10.24-linux-arm-pi /opt/node/

After that, test Node.js by:
$ /opt/node/bin/node
And if everything's okay, you'll get a ">" prompt. Simply hit Ctrl+C to quit.

Nodejs.org provides built binaries for the Raspberry Pi, which also works with pcDuino v1 or pcDuino3. There's no need to compile from source anymore, we simply need to download, extract and place it in a good location (in this case /opt/node/)
ChorusText is currently developed on Node version v0.10.24.


Chorus Text Reader
------------------
1. Connect the pcDuino/Raspberry Pi to your wifi network and plug the Arduino to the pcDuino/Pi's USB port
2. SSH into the pcDuino/Pi, navigate to ChorusTextPi/ folder and execute: 
   $ sudo /opt/node/bin/node ChorusClient.js
3. Access the device by opening a web browser in any machine connected to the same wifi network as the pcDuino/Pi, and then go to it's hostname and at port 3000. For example: "http://pcduinobox:3000/" if the hostname for the SBC is pcduinobox ( or try its full IP if it doesnt work ).
4. To import text, go to http://pcduinobox:3000/import
5. To read text, go to http://pcduinobox:3000/read
6. To adjust settings, go to http://pcduinobox:3000/settings



Repository Structure
--------------------

* Code for the Arduino is located in /arduino/
* Code for node client is located in /ChorusTextPi/
* Code for node server is located in /node-server/ (not yet)
* Hardware related items such as laser-cutting design files, wiring guide, list of components used, datasheets, etc are located in /hardware/
