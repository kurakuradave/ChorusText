/*=========================================\\
|| For use with Adafruit Motor Shield v2   ||
|| For wiring on the shield, please refer ||
|| to the Fritzing diagram                ||
\\========================================*/

#include <Wire.h>
#include <PID_v1.h>
#include <Adafruit_MotorShield.h>
#include "utility/Adafruit_PWMServoDriver.h"
#include <PID_v1.h>

class CSlider {
 
  private:
        int _pin;
        const byte PID_ERROR_MARGIN;
        Adafruit_DCMotor *_motor;
        int _slideDirection;
        bool _isMoving;
        PID _sliderPID;
        byte _sliderKind;    // 1 - Line, 2 - Word, 3 - Char
        bool _isSlotChanged;
   
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
  Serial.println( "setting _sliderPID to AUTOMATIC" );;
  _sliderPID.SetMode(AUTOMATIC);
  Serial.println( "DONE!" ); 
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
  _setpoint = theValue;
  _input = toSlot( theValue );
  _inputOld = _input;
  _isMoving = true;
} // end slideToTarget()




byte CSlider::toSlot( double theInput ) {
  byte ret = floor( theInput / 100 );
  if( ret > 9 )
    ret = 9;
  return ret;
} // end toSlot()




byte CSlider::getSlot() {
  return toSlot( _input );
} // end getSlot()




void CSlider::processTactile() {
// process tactile input from user physically moved the slider
  int curSlot = toSlot( _input );
  int oldSlot = toSlot( _inputOld );

  if( curSlot != oldSlot ) {
    _isSlotChanged = true;
    String myType = "char";
    if( _sliderKind == 1 )
      myType = "line";
    else if( _sliderKind == 2 )
      myType = "word";
    String msg = String( "{ \"read\" : { \"" + myType + "\" : \"" ) + String( curSlot ) + String( "\" } }" );
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
      if( _output > 180 )    // upper cap to sliding speed
        _output = 180;
      if( _output > 80 ) {   // lower cap ( these need tweaking to get right )
        _motor->setSpeed( _output );
        if( _slideDirection == -1 ) {
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
      if( _slideDirection == -1 ) { // if stopping after a -1 dir, then normalize
        _setpoint = 1024 - _setpoint;  
        _input = 1024 - _input;
      }
      _slideDirection = 1;
      //showStatus();    // uncomment to check stuff
    }

} // end slide()
       

/*============================================================\\
||   Arduino sketch                                           ||
\\============================================================*/ 

// create the shield instance and get the motor pointer addresses
Adafruit_MotorShield AFMS = Adafruit_MotorShield(); 
Adafruit_DCMotor *lMotor = AFMS.getMotor(1);
Adafruit_DCMotor *wMotor = AFMS.getMotor(2);
Adafruit_DCMotor *cMotor = AFMS.getMotor(3);

// create CSlider objects
CSlider lineSlider( 1, 0, lMotor );
CSlider wordSlider( 2, 1, wMotor );
CSlider charSlider( 3, 2, cMotor );




void setup() {
  Serial.begin( 9600 );
  // must have these:
  AFMS.begin();
  lineSlider.initialize();
  wordSlider.initialize();
  charSlider.initialize();
} // end setup()




void loop() {
  uint8_t i;

  // bad code here.. the intention is to move these into CSlider.run()
  lineSlider.readSliderValue();
  if( lineSlider.getIsMoving() )  
    lineSlider.slide();
  else 
    lineSlider.processTactile();
  // below should be refactored and placed inside processTactile()
  if( lineSlider.getIsSlotChanged() ) {
    // slide dependants to zero
    if( wordSlider. getSlot() != 0 )
      wordSlider.slideToTarget( 50 );
    if( charSlider.getSlot() != 0 )
      charSlider.slideToTarget( 50 );
  }

  wordSlider.readSliderValue();
  if( wordSlider.getIsMoving() )  
    wordSlider.slide();
  else 
    wordSlider.processTactile();
  // below should be refactord to be inside processTactile()
  if( wordSlider.getIsSlotChanged() ) {
    // slide dependants to zero
    if( charSlider.getSlot() != 0 )
      charSlider.slideToTarget( 50 );
  }

  charSlider.readSliderValue();
  if( charSlider.getIsMoving() )  
    charSlider.slide();
  else 
    charSlider.processTactile();
  // charSlider doesnt have a dependant

} // end loop()














