/*=========================================\\
|| For use with Adafruit Motor Shield v2   ||
|| For wiring on the shield, please refer ||
|| to /hardware/simple_wiring.xls file.   ||
\\========================================*/

#include <Wire.h>
#include <PID_v1.h>
#include <Adafruit_ADS1015.h>
#include <Adafruit_MotorShield.h>
#include "utility/Adafruit_PWMServoDriver.h"
#include <PID_v1.h>

/*========================================================
||  class for manipulating/controlling the sliders      ||
||  instantiate one for each slider                     ||
========================================================*/

class CSlider {
 
  private:
        int _pin;                     // the pin number on the Arduino that this slider's pot is hooked up to
        const byte PID_ERROR_MARGIN;  // tolerable overshoot or undershoot distance from the target
        Adafruit_DCMotor *_motor;     // which motor port (1/2/3/4) on the Adafruit Motor Shield is this slider hooked up to
             
        int _slideDirection;
        bool _isMoving;               // true if slider has not yet reached its target position +/- PID_ERROR_MARGIN 
        PID _sliderPID;
        byte _sliderKind;             // 1 = Line, 2 = Word, 3 = Char
        bool _isSlotChanged;          // true if knob is resting on a different slot. A slider is divided into ten slots or regions each with an interval of 100, last slot has interval of 124, total of all slots is 1024 which is the full range of Arduino analog pin reading, and tied to full potentiometer track.
        byte _curSlot, _oldSlot;      // current and old slot position values
        
    public:
        CSlider( byte sliderKind, int pin, Adafruit_DCMotor *motorAddress ) :
            _sliderKind( sliderKind ),
            _pin( pin ),
            PID_ERROR_MARGIN( 15 ),
            _motor( motorAddress ),
            _slideDirection( 1 ),
            _isMoving( true ),
            _isSlotChanged( false ),
            _input( 0 ), 
            _inputOld( 0 ), 
            _curSlot( 0 ),
            _oldSlot( 0 ),
            _setpoint( 50 ), 
            _output( 0 ),
            _sliderPID( &_input, &_output, &_setpoint,2,0.025,0.25, DIRECT )
        {
        } 
        double _input, _inputOld, _setpoint, _output;
        void slideToTarget( int theValue );
        byte toSlot( double theInput );
        byte getSlot();
        void processTactile();
        void run();
        void showStatus();
        void initialize();
        void readSliderValue();
        bool getIsMoving();
        bool getIsSlotChanged();
        void slide();        

    
}; // end class header CSlider

/*============================================================\\
||   Implementation of the methods in class CSlider           ||
\\============================================================*/ 

void CSlider::initialize() {
  //Serial.println( "setting _sliderPID to AUTOMATIC" );;
  _sliderPID.SetMode(AUTOMATIC);
  //Serial.println( "DONE!" ); 
} // end initialize()




void CSlider::showStatus() {
   Serial.print( "I am a slider of kind: " );
   if( _sliderKind == 1 )
       Serial.println( "LINE" );
   else if( _sliderKind == 2 )
       Serial.println( "WORD" );
   else
       Serial.println( "CHAR" );
   Serial.print( "_pin is: " ); 
   Serial.println( _pin );
   Serial.print( "PID_ERRO_MARGIN is: " );
   Serial.println( PID_ERROR_MARGIN );
   Serial.print( "_slideDirection is: " );
   Serial.println( _slideDirection );
   Serial.print( "_isMoving is: " );
   Serial.println( _isMoving );
   Serial.println( "_input, _inputOld, _setpoint and _output are: " );
   Serial.println( _input ); 
   Serial.println( _inputOld );
   Serial.println(  _setpoint );
   Serial.println(  _output );
} // end showStatus()




void CSlider::slideToTarget( int theValue ) {
// this will assign a new target for the slider to move to, as well as set it in motion
  _setpoint = theValue;
  _inputOld = theValue; // advance _inputOld to target value, otherwise a reset dependants will trigger when line/word sliders arrive at target value.
  _curSlot = toSlot( theValue );
  _oldSlot = _curSlot; // advance _oldSlot
  _isSlotChanged = false; // because we're manually driving the slider here
  _isMoving = true;
} // end slideToTarget()




byte CSlider::toSlot( double theInput ) {
//given a raw analog read value, determine which slot that slider is on and return the value 
  byte ret = floor( theInput / 100 );
  if( ret > 9 )
    ret = 9;
  return ret;
} // end toSlot()




byte CSlider::getSlot() {
  return toSlot( _input );
} // end getSlot()




void CSlider::processTactile() {
// this is for handling changes to the knob's position that is caused by user tactile input / physically dragging the knob
// it basically checks whether there's a change in knob's location
// if yes, prepare a String message to send to the RPi
// send it
// then memorize knob's new position
  _curSlot = toSlot( _input );
  _oldSlot = toSlot( _inputOld );

  if( _curSlot != _oldSlot ) {
    _isSlotChanged = true;
    String myType = "c";
    if( _sliderKind == 1 )
      myType = "l";
    else if( _sliderKind == 2 )
      myType = "w";
    String msg = String( "{\"r\":{\"" + myType + "\":\"" ) + String( _curSlot ) + String( "\"}}" );
    Serial.println( msg ); 
  } else {
    _isSlotChanged = false;
  } 
  _inputOld = _input;
} // end processTactile()




bool CSlider::getIsMoving() {
  return _isMoving;
} // end getIsMoving()




bool CSlider::getIsSlotChanged() {
  return _isSlotChanged;
} // end getIsSlotChanged()



// NOT USED NOW, to be implemented after knowing how to refer to the main sketch, or 
// refer to an arraylist of dependants
void CSlider::run() {
  /*
  readSliderValue();
  if( getIsMoving() )  
    slide();
  else 
    processTactile();
  if( getIsSlotChanged() )
    // slide dependants to zero
*/
} // end run()



// private methods

void CSlider::readSliderValue(){
  // if sliders are placed to slide from 0 to 1024 from left to right OR up to down, use
  //return( analogRead( _pin ) );

  // otherwise use
  double rawInput = (1024 - analogRead( _pin ));
  if( abs( rawInput - _input ) > 5 ) // filter out noise from very slight changes
    _input = rawInput; 
} // end readSliderValue()




void CSlider::slide() {

    // correction for bidirectional movement
    if( _slideDirection == -1 ) {
      _input = 1024-_input; 
    }

    if( _input - _setpoint > PID_ERROR_MARGIN ) {
      // overshot, reverse direction
      _input = 1024-_input;
      _setpoint = 1024-_setpoint;
      _slideDirection = -1 * _slideDirection;
    }

    if( abs( _input - _setpoint ) > PID_ERROR_MARGIN ) { // target not yet reached
      _sliderPID.Compute();
      if( _output > 220 )    // upper cap to sliding speed
        _output = 220;
      if( _output < 200 )
        _output = 200;
      
      _motor->setSpeed( _output );
      if( _slideDirection == -1 ) {
        _motor->run( BACKWARD ); // reverse wiring on the motor shield if it slide to wrong direction
      }  else { 
        _motor->run( FORWARD ); 
      }
      delay( 10 );
      _motor->run(RELEASE );
    } else { // target reached
      _isMoving = false;
      if( _slideDirection == -1 ) { // if stopping after a -1 dir, then normalize
        _setpoint = 1024 - _setpoint;  
        _input = 1024 - _input;
      }
      _slideDirection = 1;
      //showStatus();    // uncomment to check stuff
    }
    _isSlotChanged = false;

} // end slide()
       


/*========================================================
||  class for manipulating/controlling the dial         |
========================================================*/

class CDial {
 
  private:
        int _pin;                     // the pin number on the  that this dial's pot is hooked up to
        const byte PID_ERROR_MARGIN;  // tolerable overshoot or undershoot distance from the target
        Adafruit_DCMotor *_motor;     // which motor port (1/2/3/4) on the Adafruit Motor Shield is this dial hooked up to
             
        int _rotateDirection;
        bool _isMoving;               // true if dial has not yet reached its target position +/- PID_ERROR_MARGIN 
        PID _dialPID;
        bool _isSlotChanged;          // true if dial is pointing on a different slot. A dial is divided into five slots or regions each with an interval of 200, last slot has interval of 224, total of all slots is 1024 which is the full range of Arduino analog pin reading, and tied to full potentiometer track.
        byte _curSlot, _oldSlot;       // current and old slot position values
   
    public:
        CDial( int pin, Adafruit_DCMotor *motorAddress ) :
            _pin( pin ),
            PID_ERROR_MARGIN( 15 ),
            _motor( motorAddress ),
            _rotateDirection( 1 ),
            _isMoving( true ),
            _isSlotChanged( false ),
            _input( 512 ), 
            _inputOld( 512 ), 
            _curSlot( 0 ),
            _oldSlot( 0 ),
            _setpoint( 512 ), 
            _output( 0 ),
            _dialPID( &_input, &_output, &_setpoint,2,0.025,0.25, DIRECT )
        {
        } 
        double _input, _inputOld, _setpoint, _output;
        void rotateToTarget( int theValue );
        byte toSlot( double theInput );
        byte getSlot();
        void processTactile();
        void run();
        void showStatus();
        void initialize();
        void readDialValue();
        bool getIsMoving();
        bool getIsSlotChanged();
        void rotate();        

    
}; // end class header CDial

/*============================================================\\
||   Implementation of the methods in class CDial             ||
\\============================================================*/ 

void CDial::initialize() {
  //Serial.println( "setting _dialPID to AUTOMATIC" );;
  _dialPID.SetMode(AUTOMATIC);
  //Serial.println( "DONE!" ); 
} // end initialize()




void CDial::showStatus() {
   Serial.print( "I am a DIAL " );
   Serial.print( "_pin is: " ); 
   Serial.println( _pin );
   Serial.print( "PID_ERRO_MARGIN is: " );
   Serial.println( PID_ERROR_MARGIN );
   Serial.print( "_rotateDirection is: " );
   Serial.println( _rotateDirection );
   Serial.print( "_isMoving is: " );
   Serial.println( _isMoving );
   Serial.println( "_input, _inputOld, _setpoint and _output are: " );
   Serial.println( _input ); 
   Serial.println( _inputOld );
   Serial.println(  _setpoint );
   Serial.println(  _output );
} // end showStatus()




void CDial::rotateToTarget( int theValue ) {
// this will assign a new target for the dial to move to, as well as set it in motion
  _setpoint = theValue;
  _input = toSlot( theValue );
  _inputOld = _input;
  _isMoving = true;
} // end rotateToTarget()




byte CDial::toSlot( double theInput ) {
//given a raw analog read value, determine which slot that dial is on and return the value 
  byte ret = floor( theInput / 200 );
  if( ret > 4 )
    ret = 4;
  return ret;
} // end toSlot()




byte CDial::getSlot() {
  return toSlot( _input );
} // end getSlot()




void CDial::processTactile() {
// this is for handling changes to the knob's position that is caused by user tactile input / physically rotating the knob
// it basically checks whether there's a change in knob's location
// if yes, prepare a String message to send to the RPi
// send it
// then memorize knob's new position
  _curSlot = toSlot( _input );
  _oldSlot = toSlot( _inputOld );

  if( _curSlot != _oldSlot ) {
    _isSlotChanged = true;
    String myType = "d";
    String msg = String( "{\"t\":{\"" + myType + "\":\"" ) + String( _curSlot ) + String( "\" } }" ); // turn dial x
    // _curSlot 0/1/2/3/4 is settings/location/main/chat/find
    Serial.println( msg ); 
  } else {
    _isSlotChanged = false;
  } 
  _inputOld = _input;
} // end processTactile()




bool CDial::getIsMoving() {
  return _isMoving;
} // end getIsMoving()




bool CDial::getIsSlotChanged() {
  return _isSlotChanged;
} // end getIsSlotChanged()




// private methods

void CDial::readDialValue(){
  // if dial is placed to rotate from 0 to 1024 counter clockwise, use
  //return( analogRead( _pin ) );

  // otherwise use
  double rawInput = (1024 - analogRead( _pin ));
  if( abs( rawInput - _input ) > 5 ) // filter out noise from very slight changes
    _input = rawInput; 
} // end readSliderValue()




void CDial::rotate() {
    // correction for bidirectional movement
    if( _rotateDirection == -1 ) {
      _input = 1024-_input; 
    }

    if( _input - _setpoint > PID_ERROR_MARGIN ) {
      // overshot, reverse direction
      _input = 1024-_input;
      _setpoint = 1024-_setpoint;
      _rotateDirection = -1 * _rotateDirection;
    }

    if( abs( _input - _setpoint ) > PID_ERROR_MARGIN ) { // target not yet reached
      _dialPID.Compute();
      // no upper cap set for speed
      if( _output > 0 ) {   // lower cap ( these need tweaking to get right )
        _motor->setSpeed( _output );
        if( _rotateDirection == -1 ) {
          _motor->run( BACKWARD ); // reverse wiring on the motor shield if it slide to wrong direction
        } 
        else { 
          _motor->run( FORWARD ); 
        }
        delay( 10 );
        _motor->run(RELEASE );
      }
    } 
    else { // target reached
      _isMoving = false;
      if( _rotateDirection == -1 ) { // if stopping after a -1 dir, then normalize
        _setpoint = 1024 - _setpoint;  
        _input = 1024 - _input;
      }
      _rotateDirection = 1;
      //showStatus();    // uncomment to check stuff
    }

} // end rotate()
       


/*============================================================\\
||   Arduino sketch                                           ||
\\============================================================*/ 

// create the shield instance and get the motor pointer addresses
Adafruit_MotorShield AFMS = Adafruit_MotorShield(); 
Adafruit_DCMotor *lMotor = AFMS.getMotor(1);
Adafruit_DCMotor *wMotor = AFMS.getMotor(2);
Adafruit_DCMotor *cMotor = AFMS.getMotor(3);
Adafruit_DCMotor *rMotor = AFMS.getMotor(4);

Adafruit_ADS1115 ads1115;
int16_t old_adc3 = 0;
int16_t old_adc2 = 0;
int old_sg = 0;
int old_sc = 0;
//define shift-in register pins
int latchPin = 8;
int dataPin = 9;
int clockPin = 7;

//Define variables to hold the data 
//for each shift register.
byte switchVar1 = 72;  //01001000
byte switchVar2 = 159; //10011111
byte switchVar3 = 33; //000100001

byte oldSwitchVar1 = 0;
byte oldSwitchVar2 = 0;
byte oldSwitchVar3 = 0;



// create CSlider objects
CSlider lineSlider( 1, 0, lMotor );
CSlider wordSlider( 2, 1, wMotor );
CSlider charSlider( 3, 2, cMotor );

// create CDial object
CDial rotDial( 3, rMotor );

// for incoming serial data
int incomingNum = 0;
String incomingString = "";

// expecting target for which slider
String queryType = "";





void setup() {
   ads1115.begin(); // Initialize ads1115
   old_sg = floor( ads1115.readADC_SingleEnded( 2 ) / 600 ) * 10 + 50;
   old_sc = floor( ads1115.readADC_SingleEnded( 3 ) / 600 ) * 10 + 50;

  Serial.begin( 9600 );
  Serial.setTimeout( 30 );

  //define pin modes for the shift-in register
  pinMode(latchPin, OUTPUT);
  pinMode(clockPin, OUTPUT); 
  pinMode(dataPin, INPUT);

  // must have these:
  AFMS.begin();
  lineSlider.initialize();
  wordSlider.initialize();
  charSlider.initialize();
  rotDial.initialize();
} // end setup()




void loop() {
  // process incoming Serial data
  if( Serial.available() > 0 ) {
    if( queryType != "" ) { // expecting a numeric return from client
      incomingNum = Serial.parseInt();
      if( queryType == "line" ){
        lineSlider.slideToTarget( incomingNum * 100 + 50 );  
      } else if ( queryType == "word" ){
        wordSlider.slideToTarget( incomingNum * 100 + 50);
      } else if( queryType == "char" ) {
        charSlider.slideToTarget( incomingNum * 100 + 50 );
      }
      queryType = "";
      incomingNum = 0;
    } else { // default, parseString
      incomingString = Serial.readString();
      if( incomingString.substring( 0, 2 ) == "MS" ) { // Move Sliders
        // format is always MS-X-X-X where Xs are slot numbers ( single digit ) for line, word and char, respectively
        int cLine = incomingString.charAt( 3 ) - '0';
        int cWord = incomingString.charAt( 5 ) - '0';
        int cChar = incomingString.charAt( 7 ) - '0'; 
        
        lineSlider.slideToTarget( cLine * 100 + 50 );
        wordSlider.slideToTarget( cWord * 100 + 50 );
        charSlider.slideToTarget( cChar * 100 + 50 );
        incomingString = "";
      }
    }
  }

  // process shift-in registers
  digitalWrite(latchPin,1);
  delayMicroseconds(20);
  digitalWrite(latchPin,0);
  // read in the values
  switchVar1 = shiftIn(dataPin, clockPin);
  switchVar2 = shiftIn(dataPin, clockPin);
  switchVar3 = shiftIn(dataPin, clockPin);

  // debug 
  /*
  if( switchVar1 != 0 ) {
  Serial.println( switchVar1 );
  }
    if( switchVar2 != 0 ) {
  Serial.println( switchVar2 );
  }
    if( switchVar3 != 0 ) {
  Serial.println( switchVar3 );
  }
  */
  if( switchVar1 != 0 && oldSwitchVar1 == 0 ) {
    oldSwitchVar1 = switchVar1;
    switch( switchVar1 ) {
      case 1: // go top
        lineSlider.slideToTarget( 50 );
        wordSlider.slideToTarget( 50 );
        charSlider.slideToTarget( 50 );
        Serial.println( "{\"j\":{\"l\":\"t\"}}" ); // jump line top
      break;
      case 2: // scroll up
        lineSlider.slideToTarget( 950 );
        wordSlider.slideToTarget( 50 );
        charSlider.slideToTarget( 50 );
        Serial.println( "{\"j\":{\"l\":\"u\"}}" ); // jump line scrollup
        queryType = "line";
        Serial.println( "{\"q\":\"l\"}" ); // query line
      break;
      case 4: // scroll down
        lineSlider.slideToTarget( 50 );
        wordSlider.slideToTarget( 50 );
        charSlider.slideToTarget( 50 );
        Serial.println( "{\"j\":{\"l\":\"d\"}}" ); // jump line scrolldown
      break;
      case 8: // go bottom
        lineSlider.slideToTarget( 950 );
        wordSlider.slideToTarget( 50 );
        charSlider.slideToTarget( 50 );
        Serial.println( "{\"j\":{\"l\":\"b\"}}" ); // jump line bottom
      break;
      case 16: // read all
        Serial.println( "{\"r\":\"a\"}" ); // read all
      break;
      case 32: // OCR
        Serial.println( "{\"o\":\"o\"}" ); // OCR
      break;
      case 64: // cycle language
        Serial.println( "{\"l\":\"c\"}" ); // language cycle
      break;
      case 128: // read current
        String msg = String( "{\"r\":{\"l\":" ) + String( lineSlider.getSlot() ) + String( "}}" );
        Serial.println( msg );
      break;
    }
  } else {
    if( switchVar1 == 0 ) {
      oldSwitchVar1 = 0;
    } 
  }
  
  if( switchVar2 != 0 && oldSwitchVar2 == 0 ) {
    oldSwitchVar2 = switchVar2;
    switch( switchVar2 ) {
      case 1: // go top
        wordSlider.slideToTarget( 50 );
        charSlider.slideToTarget( 50 );
        Serial.println( "{\"j\":{\"w\":\"t\"}}" ); // jump word top
      break;
      case 2: // scroll up
        wordSlider.slideToTarget( 950 );
        charSlider.slideToTarget( 50 );
        Serial.println( "{\"j\":{\"w\":\"u\"}}" ); // jump word scrollup
        queryType = "word";
        Serial.println( "{\"q\":\"w\"}" ); // query word
      break;
      case 4: // scroll down
        wordSlider.slideToTarget( 50 );
        charSlider.slideToTarget( 50 );
        Serial.println( "{\"j\":{\"w\":\"d\"}}" ); // jump word scrolldown
      break;
      case 8: // go bottom
        wordSlider.slideToTarget( 950 );
        charSlider.slideToTarget( 50 );
        Serial.println( "{\"j\":{\"w\":\"b\"}}" ); // jump word bottom
      break;
      case 128: // read current
        String msg = String( "{\"r\":{\"w\":" ) + String( wordSlider.getSlot() ) + String( "}}" );
        Serial.println( msg );
      break;
    }
  } else {
    if( switchVar2 == 0 ) {
      oldSwitchVar2 = 0;
    } 
  }
  
  if( switchVar3 != 0 && oldSwitchVar3 == 0 ) {
    oldSwitchVar3 = switchVar3;
    switch( switchVar3 ) {
      case 1: // go top
        charSlider.slideToTarget( 50 );
        Serial.println( "{\"j\":{\"c\":\"t\"}}" ); // jump char top
      break;
      case 2: // scroll up
        charSlider.slideToTarget( 950 );
        Serial.println( "{\"j\":{\"c\":\"u\"}}" ); // jump char scrollup
        queryType = "char";
        Serial.println( "{\"q\":\"c\"}" ); // query char
      break;
      case 4: // scroll down
        charSlider.slideToTarget( 50 );
        Serial.println( "{\"j\":{\"c\":\"d\"}}" ); // jump char scrolldown
      break;
      case 8: // go bottom
        charSlider.slideToTarget( 950 );
        Serial.println( "{\"j\":{\"c\":\"b\"}}" ); // jump char bottom
      break;
      case 16: // dialbutton left
        if( rotDial.getSlot() == 0 ) {   // settings  
          Serial.println( "{\"m\":\"u\"}" );    // menu up
        } 
      break;
      case 32: // dialbutton right
        if( rotDial.getSlot() == 0 ) { // settings
          Serial.println( "{\"m\":\"d\"}" );    // menu down
        }
      break;        
      case 128: // read current
        String msg = String( "{\"r\":{\"c\":" ) + String( charSlider.getSlot() ) + String( "}}" );
        Serial.println( msg );
      break;      
    }
  } else {
    if( switchVar3 == 0 ) {
      oldSwitchVar3 = 0;
    } 
  }
  
   int16_t adc2, adc3;
   adc2 = ads1115.readADC_SingleEnded(2);
   adc3 = ads1115.readADC_SingleEnded(3);
   updateSpeechRate( "sg", adc2, old_adc2, old_sg );
   updateSpeechRate( "sc", adc3, old_adc3, old_sc );
    
  // process Sliders
  //uint8_t i;
  
  rotDial.readDialValue();
  if( rotDial.getIsMoving() ){  
    rotDial.rotate();
  }
  else
    rotDial.processTactile();

  // bad code here.. the intention is to move these into CSlider.run() one day
// TO Implement
// the line CSlider would need reference to the word and char CSliders, 
// coz line needs to be able to slide word and char back to 0th slot
// ditto word CSlider need reference for char CSlider
// but char CSlider doesn't need any reference

//==================
// first, do line slider routines
// then, do word slider routines
// last, do char slider routines
//==================

//=================
// line slider routines
//=================
  lineSlider.readSliderValue();
  if( lineSlider.getIsMoving() ) { // this means that, in the current loop() cycle the slider is in motion - trying to complete its travel to the target position, which was set by slideToTarget() in a previous loop() cycle.
// do not disrupt it, just let it finish running its course
    lineSlider.slide();
  }
  else 
    lineSlider.processTactile(); // only do this if slider has reached target +/- pid error margin around target position
  // below should be refactored and placed inside processTactile()
  if( lineSlider.getIsSlotChanged() ) {  // knob is now on a different slot
    // slide dependants to their 0th slot or initial position
    if( wordSlider. getSlot() != 0 )
      wordSlider.slideToTarget( 50 );
    if( charSlider.getSlot() != 0 )
      charSlider.slideToTarget( 50 );
  }

//==================
// word slider routines
//==================
  wordSlider.readSliderValue();
  if( wordSlider.getIsMoving() ) {  
    wordSlider.slide();
  }
  else 
    wordSlider.processTactile();
  // below should be refactord to be inside processTactile()
  if( wordSlider.getIsSlotChanged() ) {
    // slide dependants to their 0th slot
    if( charSlider.getSlot() != 0 )
      charSlider.slideToTarget( 50 );
  }


//==================
// char slider routines
//==================
  charSlider.readSliderValue();
  if( charSlider.getIsMoving() ) {
    charSlider.slide();
  }
  else 
    charSlider.processTactile();
  // charSlider doesnt have a dependant

} // end loop()





byte shiftIn(int myDataPin, int myClockPin) { 
  int i;
  int temp = 0;
  int pinState;
  byte myDataIn = 0;

  pinMode(myClockPin, OUTPUT);
  pinMode(myDataPin, INPUT);

  for (i=7; i>=0; i--)
  {
    digitalWrite(myClockPin, 0);
    delayMicroseconds(2);
    temp = digitalRead(myDataPin);
    if (temp) {
      pinState = 1;
      //set the bit to 0 no matter what
      myDataIn = myDataIn | (1 << i);
    }
    else {
      pinState = 0;
    }

    digitalWrite(myClockPin, 1);
  }
  return myDataIn;
}



void updateSpeechRate( String name, int16_t val, int16_t &old_val, int &old_sr ) {
     if( abs( old_val - val ) > 30 ) { 
       int r = floor( val / 600 ) * 10 + 50;
       if( r != old_sr ) {
         Serial.println( String("{\""+ name + "\":") + String( r ) + String( "}" ) ); 
         old_sr = r;
       }
       old_val = val;
     }
}














