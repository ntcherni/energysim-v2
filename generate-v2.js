const fs = require('fs');

const Agent = require('./Agent.js');
const Appliance = require('./Appliance-v2.js');

const appliance_inits = require('./applianceInits.js');

// Read and format setup data:
let simulation_json = fs.readFileSync('./setup_data.json'); 

let simulation = JSON.parse(simulation_json);
let settings = simulation[0].settings[0];

let rooms = simulation[1].rooms;

let _Start = settings.start_time;
let _Increment = parseInt(settings.increment);
let _Days = simulation[0].settings[0].days;

// Create appliances as per setup data:
let appliance_objects = [];

rooms.forEach((room) => { 
    //console.log(room.appliances);
    room.appliances.forEach((appliance) => {
        
        let appliance_id = appliance.appliance_id;
        let appliance_type = appliance_id.split('_')[0];
        let appliance_init = appliance_inits.filter(obj => { return obj.type === appliance_type;});
        
        let watts1 = appliance_init[0].watts1; // on watts

        console.log(appliance_init[0].watts1);

        let watts2 = appliance_init[0].watts2; // standby watts
        appliance_objects.push( 
            new Appliance(appliance_id, appliance_type, watts1, watts2, room.room_id) 
        );

        appliance.data = [];
        appliance.data.push({x : [], y: []});
    });
});

// Create a person:
let watchfulness = 0.5;
person = new Agent(watchfulness);

let schedule = [];

// Variables for running simulation:
// Amount of days to simulate:
const days = _Days;
console.log("days : " + days);

// start time: 
// Let timestamp = _Start;
let timestamp = 1549312452;

// Timestep length in seconds:
const timestep_length = _Increment;

// Timesteps in one day: 
const timesteps_in_one_day = (24 * 60 * 60) / timestep_length; 

// Calculate total timesteps to log:
const timesteps = days * 24 * 60 * 60 / timestep_length;

console.log("total steps: " + timesteps);

const delay = 0;

let t = 0; 

simulationForward();

function simulationForward() {        
    setTimeout(function() {   // I'm setting a timeout just to the ticks of the function

        let fakeDate = new Date(timestamp * 1000);
        dayOfWeek = fakeDate.getUTCDay();
        hour = fakeDate.getUTCHours();

        // Stuff happens to environment

        // Stuff happens to person
        person.hunger += 0.002;

        // Decide what the person is doing based on state
        if(person.hunger >= 1.0) {
            person.eat();
        }

        // Create appliance_id -> action pairs for this timestep
        let appliance_actions = [];

        if(person.isAtHome == true) {
            appliance_objects.forEach((appliance_object) => {
                // randomized action:
                let random = Math.random();
                if(random >= 0.0 && random <= 0.33) {
                    appliance_actions[appliance_object.id] = 1; 
                } else if (random > 0.33 && random <= 0.66) {
                    appliance_actions[appliance_object.id] = -1; 
                } else { 
                    appliance_actions[appliance_object.id] = 0; 
                }
            });
        } else { 
            appliance_objects.forEach((appliance_object) => {
                appliance_actions[appliance_object.id] = -1; 
            });
        }
        let i = 0; 
        rooms.forEach((room) => {
            let j = 0;
            room.appliances.forEach((appliance) => {
                let appliance_id = appliance.appliance_id;

                // Get appliance object: 
                let appliance_object = appliance_objects.filter(obj => { return obj.id === appliance_id;});            
                appliance_object = appliance_object[0];

                // Perform actions on appliance as per actions 
                if(appliance_actions[appliance_id] == 1) {
                    appliance_object.turnOn();
                } else if(appliance_actions[appliance_id] == -1) {
                    appliance_object.turnOff();
                } else {
                    appliance_object.turnStandby();
                }

                // When finished interactions, get the current watt output of appliance
                let watts = appliance_object.outputWatts; 

                //console.log("appliance_object.state: " + appliance_object.state + ", watts: " + watts);
                //console.log("logging " + watts + " for appliance " + appliance_id);

                // Add values
                appliance.data[0].x.push(t); // timestep
                appliance.data[0].y.push(watts); // watts
                j++;
            });
            i++;
        });
        t++;
        //console.log(_Increment);
        //console.log(timestamp);
        timestamp += _Increment;

        if (t < timesteps) {
            simulationForward();             
        } else {
            completeSimulation();
        }
    }, delay);
}

function completeSimulation() {
    let simulation_completed = [];
    simulation_completed.push(settings);
    simulation_completed.push(rooms);
    let simulation_stringified = JSON.stringify(simulation_completed);
    fs.writeFile('output_data.json', simulation_stringified, 'utf8', (err) => {
        if(err) { 
            throw err;
        } else {
            console.log('wrote to output_data.json!');
        }
    });
}


