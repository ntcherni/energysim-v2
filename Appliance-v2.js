class Appliance {
	constructor( _id, _type, _watts1, _watts2, _location) {
		this.id = _id;
		this.type = _type; 

		this.location = _location;

		this.state = -1; // off when created
		this.watts1 = _watts1; // on watts
		this.watts2 = _watts2; // standby watts

		this.timesTurnedOn = 0;
		this.outputWatts = 0; // output watts
	}
	
	turnOn() {
		this.state = 1;
		this.outputWatts = this.watts1;
	}
	turnOff() {
		this.state = -1;
		this.outputWatts = 0;
	}
	turnStandby() {
		this.state = 0;
		this.outputWatts = this.watts2;
	}
}

module.exports = Appliance