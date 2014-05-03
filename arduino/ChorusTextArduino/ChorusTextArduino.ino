#include <PID_v1.h>
#include <AFMotor.h>

/*========================================================
||  class for manipulating/contolling the sliders       ||
||  instantiate one for each slider                     ||
========================================================*/

class CSlider {
 
  private:
        int _pin;                        // the pin number on the Arduino that this slider's pot is hooked up to
        const byte PID_ERROR_MARGIN;     // tolerable overshoot or undershoot distance from the target
        AF_DCMotor _motor;               // which motor port (1/2/3/4) on the Adafruit Motor Shield is this slider hooked up to
        int _slideDirection;
        bool _isMoving;                  // true if slider has not yet reached its target position +/- PID_ERROR_MARGIN 
        PID _sliderPID;
        byte _sliderKind;                // 1 = Line, 2 = Word, 3 = Char
        bool _isSlotChanged;        // true if knob is resting on a different slot. A slider is divided into ten slots or regions each with an interval of 100, last slot has interval of 124, total of all slots is 1024 which is the full range of Arduino analog pin reading, and tied to full potentiometer track.
   
    public
        // constructor and instantiation value for private fields
        CSlider( byte sliderKind, int pin, int motorPort ) :
            _sliderKind( sliderKind ),
            _pin( pin ),
            PID_ERROR_MARGIN( 25 ),
            _motor( motorPort ),
            _slideDirection( 1 ),
            _isMoving( true ),
            _isSlotChanged( false ),
            _input( 0 ), 
            _inputOld( 0 ), 
            _setpoint( 850 ), 
            _output( 0 ),
            _sliderPID( &_input, &_output, &_setpoint,4,0.025,0.025, DIRECT )
        { // leaving it blank here
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

/* ============================================================
=============================================================*/ 

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
}




void CSlider::slideToTarget( int theValue ) {
// this will assign a new target for the slider to move to, as well as set it in motion
  _setpoint = theValue;
  _input = toSlot( theValue );
  _inputOld = _input;
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
  int curSlot = toSlot( _input );
  int oldSlot = toSlot( _inputOld );

  if( curSlot != oldSlot ) {
    _isSlotChanged = true;
    //Serial.println( _input ); // debu
    String myType = "char";
    if( _sliderKind == 1 )
      myType = "line";
    else if( _sliderKind == 2 )
      myType = "word";

//prepare message to be sent via serial USB, to the raspberry pi
    String msg = String( "{ \"read\" : { \"" + myType + "\" : " ) + String( curSlot ) + String( " } }" );
// send msg to RPi
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
  double rawInput = (1024 - analogRead( _pin ));
  if( abs( rawInput - _input ) > 10 )
    _input = rawInput; // sliding sensitivity
} // end readSliderValue()




void CSlider::slide() {

    // correction for bidirectional movement
    if( _slideDirection == -1 ) {
      _input = 1024-_input;  // mirror the target point
      //Serial.print( "========================" );
      //Serial.print( _input );
      //Serial.print( " " );
      //Serial.println( _setpoint );
    }

    if( _input - _setpoint > PID_ERROR_MARGIN ) {
      // overshot, reverse direction
      _input = 1024-_input;
      _setpoint = 1024-_setpoint;
      _slideDirection = -1 * _slideDirection;
      Serial.print( ">>>>>>>>reversing direction!<<<<" );
      if( _sliderKind == 1 ) Serial.println( " LINE" );
      else if( _sliderKind == 2 ) Serial.println( "WORD" );
      else Serial.println( "CHAR" );
    }

    if( abs( _input - _setpoint ) > PID_ERROR_MARGIN ) { // target not yet reached
      _sliderPID.Compute();
      if( _output > 0 ) {
        _motor.setSpeed( _output );
        if( _slideDirection == -1 ) {
          _motor.run( BACKWARD ); 
        } 
        else { 
          _motor.run( FORWARD ); 
        }
        delay( 10 );
        _motor.run(RELEASE );
      }
    } 
    else { // target reached
      _isMoving = false;
      _slideDirection = 1;
    }

} // end slide()
       

/* ============================================================
||   begin sketch                                             ||
=============================================================*/ 

// instantiate the 3 CSlider objects
CSlider lineSlider( 1, 0, 1 );
CSlider wordSlider( 2, 1, 2 );
CSlider charSlider( 3, 2, 3 );




void setup() {
  Serial.begin( 9600 );
//must call initialize() to properly start the PID in each CSlider object
  lineSlider.initialize();
  wordSlider.initialize();
  charSlider.initialize();
} // end setup()




void loop() {
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
  if( lineSlider.getIsMoving() )  // this means that, in the current loop() cycle the slider is in motion - trying to complete its travel to the target position, which was set by slideToTarget() in a previous loop() cycle.
// do not disrupt it, just let it finish running its course
    lineSlider.slide();
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
  if( wordSlider.getIsMoving() )  
    wordSlider.slide();
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
  if( charSlider.getIsMoving() )  
    charSlider.slide();
  else 
    charSlider.processTactile();
  // charSlider doesnt have a dependant

} // end loop()














