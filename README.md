ChorusText
==========

What is ChorusText?
ChorusText is a text editor. But it's a special kind of text editor, the user doesn't need to have eyesight to do text editing using ChorusText. 

On the surface of the device, there are three physical sliders  that the user can reach out to at any time.

Changing the position of the slider would cause the system to pull out the corresponding part of the text and speaks the content out loud, using text-to-speech.

So changing the position of the line slider's knob from top to bottom will result in the system reading the text progressively line by line.

And changing the position of the word slider knob from left to right will result in the system reading the words in the current line, progressively word by word.

And likewise, changing the position of the character slider knob from left to right will result in the system spelling the letters of the current word, in the current line, progressively letter by letter.

This way, the user can read the text he's working on with ease, and can drill down to the level of characters effortlessly, for example, when spell-checking.

Furthermore, as the user types, the sliders continuously reposition themselves to physically manifest the latest state of the text and where the user is in the text.

If he adds two more characters to the current word, the character slider would move two steps to the right.
 If he adds three words to the line, the word slider would move three steps to the right.
Deleting the current line would make the line slider to move one step up, and so on.

The cursor is no longer an abstract blinking thing, that only lives inside the monitor, where the only way to locate its position is by means of eyesight. 

It is now physically manifested by the three sliders.

Simply reach out to the sliders with your hand and listen, the text is immediately accessible and navigable – no eyesight required.


Installing Node.js on pcDuino / Raspberry Pi
--------------------------------------------

1. On the pcDuino (or the Pi), open the terminal and execute:
$ wget http://nodejs.org/dist/v0.10.24/node-v0.10.24-linux-arm-pi.tar.gz
$ tar -xzvf node-v0.10.24-linux-arm-pi.tar-gz
$ sudo mv node-v0.10.24-linux-arm-pi /opt/node/

2. After that, test Node.js by:
$ /opt/node/bin/node
And if everything's okay, you'll get a ">" prompt. Simply hit Ctrl+C to quit.

Nodejs.org provides built binaries for the Raspberry Pi, which also works with pcDuino v1 or pcDuino3. There's no need to compile from source anymore, we simply need to download, extract and place it in a good location (in this case /opt/node/)
ChorusText is currently developed on Node version v0.10.24.


Chorus Text Client
------------------
1. Connect the pcDuino/Raspberry Pi to your wifi network and plug the Arduino to the pcDuino/Pi's USB port
2. SSH into the pcDuino/Pi, navigate to ChorusTextClient/ folder and execute: 
   $ sudo /opt/node/bin/node ChorusTextClient.js
3. Access the device by opening a web browser in any machine connected to the same wifi network as the pcDuino/Pi, and then go to it's hostname and at port 3000. For example: "http://pcduinobox:3000/" if the hostname for the SBC is pcduinobox ( or try its full IP if it doesnt work ).
4. To import text, go to http://pcduinobox:3000/import
5. To read text, go to http://pcduinobox:3000/read
6. To adjust settings, go to http://pcduinobox:3000/settings
7. To type, make sure the terminal window from which you launched the ChorusTextClient.js with node is in focus before you start typing. It is tied to the standard input on that terminal window so if the window is out of focus, ChorusTextClient can't pick up the keystrokes.



Repository Structure
--------------------

* Code for the Arduino is located in /arduino/
* Code for node client is located in /ChorusTextClient/
* Code for node server is located in /node-server/ (not yet)
* Hardware related items such as laser-cutting design files, wiring guide, list of components used, datasheets, etc are located in /hardware/



Got Questions?
--------------

Don't hesitate to email me :)
