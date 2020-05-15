class Agent {
	constructor(_watchfulness, _Increment) {
		// traits (floats)
		this.watchfulness = _watchfulness; // how watchful the Agent is about energy usage
		this.increment = _Increment;

		// booleans
		this.isAtHome = true; // home by default
		this.isSleeping = false; // not asleep by default
		this.isBusy = false; // not doing anything by default 
		this.isCooking = false;
		
		// integers 

		// motivations (floats)
		this.hunger =  0.0;
		this.energy = 1.0; 
	}
	
	changeWatchfulness(new_watchfulness) {
		this.watchfulness = new_watchfulness;
	}
	// -- 

	arriveHome() {
		this.isAtHome = 1; 
	}

	leaveHome() {
		this.isAtHome = -1; 
	}

	// -- 
	
	goToSleep() {
		this.isAsleep = 1; 
		this.energy = 1.0;
	}

	// -- 
	eat() {
		this.hunger = 0.0;
	}

	doLaundry() {
		this.laundry = 0.0;
	}

	takeShower() {
		this.hygiene = 1.0;
	}

	takeBath() {
		this.hygiene = 1.0;
	}	

	goOut() {
		this.social = 1.0;
	}

	talkOnPhone() {
		this.social = 1.0;
	}

	relax() {
		this.comfort = 1.0;
	}

	sleep() {
		this.energy += 0.125/(3600/this.increment); 
		if(this.energy > 1.0) { 
			this.energy = 1.0;
			this.sleeping = false;
			this.busy = false;
		}
	}
}

module.exports = Agent