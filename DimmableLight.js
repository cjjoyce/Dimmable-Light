class DimmableLight{
	constructor(id, address, comms, events){
		this.id = id; // Internal identifier for the JavaScript world.
		this.address = address; // Integer value in the range 1-65534 that identifies the light on the communications bus.
		this.comms = comms; // An object that gives access to the communications bus.
		this.events = events; // An object that allows event notification.
		this.lightLevel = 0; // Integer value in range 0-100 used for the toggle method.
	}
	
	on(){
		var addressByte = String.fromCharCode(this.address); // Converts address integer to char.
		this.lightLevel = 100;
		comms.send("\x02\x40\x00\x08\x00" + addressByte + "\x05\x64"); // Send to comms bus with light value set to 100.
	}
	
	off(){
		var addressByte = String.fromCharCode(this.address); // Convert address integer to char.
		this.lightLevel = 0;
		comms.send("\x02\x40\x00\x08\x00" + addressByte + "\x05\x00"); // Send to comms bus with light value set to 0.
	}
	
	toggle(){
		// (this.lightLevel == 0) ? this.on(); : this.off();
		
		if (this.lightLevel == 0){ 
			// If byte 7 (light level value) is off, turn on light.
			this.on();
		}
		
		else{
			// Else (light is on), turn off light.
			this.off();
		}
	}
	
	setLevel(level){
		if (level > 100){
			// If level is above 100, return.
			console.log("Level must be less than or equal to 100.");
			return;
		}
		this.lightLevel = level;
		var levelByte = String.fromCharCode(this.level); // Convert level to char.
		var addressByte = String.fromCharCode(this.address); // Convert address integer to char.
		comms.send("\x02\x40\x00\x08\x00" + addressByte + "\x05" + levelByte); // Send new light level to comms bus.
	}
	
	feedback(bytes){
		if (bytes.charCodeAt(6) == 5){ // If feedback type id is light level (0x05)
			var data = {level: bytes.charCodeAt(7)}; // Create data object with light level from bytes string.
			console.log(this.id, data);
			events.notify(this.id, data); // Report light level event
		}
		
		else{ // If the feedback type id is not light level, return.
			return;
		}
	}
}

// Testing
feedbackBytes = ("\x02\x42\x00\x08\x00\x01\x05\x48"); // String used as parameter for testing feedback method.
comms = new Object();
events = new Object();

light1 = new DimmableLight(1, 100, comms, events); // Create instance of DimmableLight
