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
        bool _isSlotChanged;
   
    public
        // constructor
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
  int curSlot = toSlot( _input );
  int oldSlot = toSlot( _inputOld );
  
  // EXPERIMENTAL
  //if( curSlot == 9 ) {
  //    delay( 5000 );
  //    slideToTarget( 150 );
  //}

  if( curSlot != oldSlot ) {
    _isSlotChanged = true;
    //Serial.println( _input ); // debu
    String myType = "char";
    if( _sliderKind == 1 )
      myType = "line";
    else if( _sliderKind == 2 )
      myType = "word";
    String msg = String( "{ \"read\" : { \"" + myType + "\" : " ) + String( curSlot ) + String( " } }" );
    Serial.println( msg ); 
  } else {
    _isSlotChanged = false;
    //slideToTarget( ( curSlot * 100 ) + 50 );
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
  // if sliders are placed to slide from 0 to 1024 from left to right, use
  //return( analogRead( _pin ) );

  // otherwise use
  double rawInput = (1024 - analogRead( _pin ));
  if( abs( rawInput - _input ) > 10 )
    _input = rawInput; // sensitivity
} // end readSliderValue()




void CSlider::slide() {

    // correction for bidirectional movement
    if( _slideDirection == -1 ) {
      _input = 1024-_input; 
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
=============================================================*/ 

CSlider lineSlider( 1, 0, 1 );
CSlider wordSlider( 2, 1, 2 );
CSlider charSlider( 3, 2, 3 );

void setup() {
  Serial.begin( 9600 );
  lineSlider.initialize();
  wordSlider.initialize();
  charSlider.initialize();
}

void loop() {
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














