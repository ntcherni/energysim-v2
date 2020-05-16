const fs = require('fs');

const Agent = require('./Agent.js');
const Appliance = require('./Appliance-v2.js');

const appliance_inits = require('./applianceInits.js');

// Read and format setup data:
let simulation_json = fs.readFileSync('./setup_data.json'); 
let simulation = JSON.parse(simulation_json);
let settings = simulation[0].settings[0];

let rooms = simulation[1].rooms;

let _Start = settings.start;
let _Increment = parseInt(settings.increment);
let _Days = simulation[0].settings[0].days;

// Create appliances as per setup data:
let appobjs = [];

rooms.forEach((room) => { 
    //console.log(room.appliances);
    room.appliances.forEach((appliance) => {
        
        let appliance_id = appliance.appliance_id;
        let appliance_type = appliance_id.split('_')[0];
        let appliance_init = appliance_inits.filter(obj => { return obj.type === appliance_type;});
        
        let watts1 = appliance_init[0].watts1; // on watts
        let watts2 = appliance_init[0].watts2; // standby watts

        let motive = appliance_init[0].motive;
        let min  = appliance_init[0].min;
        let max = appliance_init[0].max;
        if(appliance_init[0].alwaysOn == true) {
            alwaysOn = true;
        } else {
            alwaysOn = false;
        }

        appobjs.push( 
            new Appliance(appliance_id, 
                appliance_type, 
                watts1, watts2, 
                room.room_id, 
                motive,
                min, max,
                alwaysOn) 
        );

        appliance.data = [];
        appliance.data.push({x : [], y: []});
    });
});

// Create a agent:
let watchfulness = 0.5;
agent = new Agent(watchfulness);

let schedule = [];

// Variables for running simulation:
// Amount of days to simulate:
const days = _Days;
console.log("Days : " + days);

// start time: 
// Let timestamp = _Start;
let timestamp = 1549312452;

// Timestep length in seconds:
const timestep_length = _Increment;

// Timesteps in one day: 
const timesteps_in_one_day = (24 * 60 * 60) / timestep_length; 

// Calculate total timesteps to log:
const timesteps = days * 24 * 60 * 60 / timestep_length;
console.log("Total timesteps: " + timesteps);

const delay = 0;
let t = 0; 

weekdays = [1, 2, 3, 4];
weekends = [0, 6];
// day of week is just 5

simulationForward();

function simulationForward() {        
    setTimeout(function() {   // I'm setting a timeout just to the ticks of the function
        appobjs.forEach( (appobj) => {
            //console.log(appobj.timeleft);
            if(appobj.timeleft > 0) {
                appobj.timeleft--;
            }
        });

        // Get time information based on current timestamp
        let fakeDate = new Date(timestamp * 1000);
        dayOfWeek = fakeDate.getUTCDay();
        hour = fakeDate.getUTCHours();

        //console.log(dayOfWeek);

        // Stuff happens to environment

        // Stuff happens to agent
        agent.hunger += 0.0025;

        // Go to sleep/wake up on weekdays
        if(weekdays.includes(dayOfWeek)) {
            if(agent.isSleeping == true) {
                if(hour == 7) {
                    console.log('Agent is waking up.');
                    agent.wakeUp();
                }
            } else {
                if(hour == 23){
                    console.log('Agent is going to sleep.');
                    agent.goToSleep();
                    appobjs.forEach( (appobj) =>  {
                        appobj.turnOff(watchfulness);
                    });
                }
            }
        }
        
        // Go to sleep/wake up on weekends
        if(weekends.includes(dayOfWeek)) {
            if(agent.isSleeping == true) {
                if(hour == 9) {
                    console.log('Agent is waking up.');
                    agent.wakeUp();
                }
            } else { 
                if(hour == 0){
                    console.log('Agent is going to sleep.');
                    agent.goToSleep();
                    appobjs.forEach( (appobj) =>  {
                        appobj.turnOff(watchfulness);
                    });
                }
            }
        }

        // Wake up/go to sleep on fridays
        if(dayOfWeek == 5) {
            if(agent.isSleeping == true) {
                if(hour == 7) {
                    console.log('Agent is waking up.');
                    agent.wakeUp();
                }
            } else {
                if(hour == 0) {
                    console.log('Agent is going to sleep.');
                    agent.goToSleep();
                    appobjs.forEach( (appobj) =>  {
                        if(appobj.state == 1) {
                            appobj.turnOff(watchfulness);
                        }
                    });
                }
            }
        }
        // If the agent is currently at home and is not sleeping ... 
        if(agent.isHome == true && agent.isSleeping == false) {
            //console.log('Agent can interact with appliances at home.');
            
            // Deal with hunger striking at this timestep
            if(agent.hunger >= 1.0 && agent.isCooking == false) {
                agent.isCooking = true;
                console.log('Hunger has struck and the agent is not cooking.');
               
                // If it's past sunset, turn on the kitchen light... 

                // Get all appliances that affect the hunger motive
                hungerapps = appobjs.filter( (appobj) => {return appobj.motive == 'hunger'});
                numapps = 1 + Math.floor(Math.random() * Math.floor(hungerapps.length-1));
                hungerapps.sort(function() { return 0.5 - Math.random();})
                onapps = [];
                for(j=0; j<numapps; j++) {
                    onapps.push(hungerapps.pop());
                }
                
                // Turn on hunger appliances for determined amount of minutes 
                onapps.forEach((onapp) => {  
                    ontime = getRandomInt(onapp.min, onapp.max);  
                    onapp.timeleft = ontime;
                    if(onapp.alwaysOn == false) {
                        console.log('Turning on ' + onapp.id + ' for ' + ontime + ' minutes.');
                    }
                    onapp.turnOn();
                });
            }

            if(agent.isCooking == true) {
                sum = 0;
                onapps.forEach((onapp) => { 
                    //console.log('timeleft: ' + onapp.timeleft = );
                    if(onapp.timeleft == 0 && onapp.state == 1 && onapp.alwaysOn == false) {
                        console.log('Turning off ' + onapp.id + ".");
                        onapp.turnOff(agent.watchfulness);                }
                    sum += onapp.timeleft;
                });
                if(sum == 0) {
                    //console.log('appliances are all out of time');
                    agent.isCooking = false;
                    agent.eat();
                    console.log('Agent has eaten.');
                }
            }       
        }

        //agent.eat();

        // Create appliance_id -> action pairs for this timestep
        // let appliance_actions = [];

        // if(agent.isHome == true) {
        //     appobjs.forEach((appobj) => {
        //         // randomized action:
        //         let random = Math.random();
        //         if(random >= 0.0 && random <= 0.33) {
        //             appliance_actions[appobj.id] = 1; 
        //         } else if (random > 0.33 && random <= 0.66) {
        //             appliance_actions[appobj.id] = -1; 
        //         } else { 
        //             appliance_actions[appobj.id] = 0; 
        //         }
        //     });
        // } else { 
        //     appobjs.forEach((appobj) => {
        //         appliance_actions[appobj.id] = -1; 
        //     });
        // }

        let i = 0; 
        rooms.forEach((room) => {
            let j = 0;
            room.appliances.forEach((appliance) => {
                let appliance_id = appliance.appliance_id;

                // Get appliance object: 
                let appobj = appobjs.filter(obj => { return obj.id === appliance_id;});            
                appobj = appobj[0];

                // // Perform actions on appliance as per actions 
                // if(appliance_actions[appliance_id] == 1) {
                //     //appobj.turnOn();
                // } else if(appliance_actions[appliance_id] == -1) {
                //     //appobj.turnOff();
                // } else {
                //     //appobj.turnStandby();
                // }

                // Turn on appliances that are always on. 
                if(appobj.alwaysOn == true) {
                    appobj.turnOn();
                } 

                // When finished interactions, get the current watt output of appliance
                let watts = appobj.outputWatts;

                //console.log("appobj.state: " + appobj.state + ", watts: " + watts);
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
            console.log('Wrote output to output_data.json!');
        }
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

