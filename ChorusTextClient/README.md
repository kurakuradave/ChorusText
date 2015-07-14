# ChorusTextClient

ChorusTextClient is the app to launch on the device. It is a Node.js application that handles communication with the Arduino, listens for keyboard keypresses, initiates text-to-speech, and serves the web-interface ( for text import, reading and settings ).

To run:
$ sudo /opt/node/bin/node ChorusTextClient.js

Replace the path to node according to your system, sudo is needed for the Arduino communication.

## Diagram
```

+-------------------------------------------------------------------+         +-------------------+
| ChorusText Device ( Client )                                      |         | ChorusText Server | 
|                                                                   |         |                   |
|               +-------------------------------------------------+ |         |  ( Coming Soon )  |
|               |  pcDuino                                        | |         |                   |
|               |                                                 | |         +-------------------+
|               |  +-----------------+                            | |
|               |  | ChorusSpeech.js |                            | |
|               |  |                 |                            | |
|               |  | spawn Text-to-  |                            | |
|               |  | speech child    |                            | |          
|               |  | processes       |                            | |          
|               |  +-----------------+                            | |          
|               |           |                                     | |         
|   /-------\   |  +-------------------+       +---------------+  | |          
|   |Arduino|   |  |ChorusTextClient.js|-------| Web Interface |  | |          
|   |       <---+-->                   |       |               |  | |
|   |sensors|   |  | main app          |___    | serves pages: |  | |     +------------------------+
|   |motors |   |  +-------------------+   \   | import, read, <--+-+--+  |  Tablet/Phone/Desktop  |
|   \-------/   |           |              |   | settings      |  | |  |  |                        | 
|               |  +-------------------+   |   +---------------+  | |  +--> Web-browser            |
|               |  | ChorusDocument.js |   |                      | |     |                        |
|               |  |                   |   |  +-----------------+ | |  +--> Other apps (Orca/iBus) |
|               |  | updates:          |   \__| API for Text    <-+-+--+  +------------------------+
|               |  | text content      |      | Import / Export | | |
|               |  | cursor position   |      +-----------------+ | |
|               |  +-------------------+                          | |
|               |                                                 | |
|               +-------------------------------------------------+ |
|                                                                   |
+-------------------------------------------------------------------+
