$fn=30;

translate([0,0,26]) {
	cylinder(3,3,2);
}

translate([0,0,-2]) {
    cylinder(r=3,h=28);
}

translate( [0,0,6] ) {
	difference() {
  		  sphere( r=10 );
    		translate([0,0,-7]){
      	  cylinder(r=15,h=17); 
    		}
	}
}
