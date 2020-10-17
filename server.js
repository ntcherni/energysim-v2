const path = require('path');
const fs = require('fs');

const express = require('express');
var exphbs  = require('express-handlebars');
const app = express();

var router = express.Router();

const house = [];

// Handelebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const PORT = process.env.PORT || 5002;


app.get('/test.json', (req, res) => {
    //let filepath = path.join("./", "test.json");
    const json = require("./test.json");
    res.json(json);
});

// empty array
app.get('/empty', (req, res) => {
    house.splice(0, house.length)
    res.json(house);
});

// view house array
app.get('/view', (req, res) => {
    res.json(house);
});

// add a room to the house
app.post('/add-room', (req, res) => {
    console.log(req.body);
    let id = Math.floor(1000 + Math.random() * 9000); //random id
    let name = req.body.name + "_" + id;
    name = name.replace(" ", "_");
    room = { "room_id" : name, "appliances" : [] };
    house.push(room);
    res.redirect('/');
    // output json
});

// add an appliance to a room
app.post('/add-appliance', (req, res) => {
    console.log(req.body);
    let type = req.body.selected_type;
    let id = Math.floor(1000 + Math.random() * 9000); //random id
    let type_id = type + "_" + id;
    //console.log(type_id);
    let roomName = req.body.room_id;
    let applianceObject = {appliance_id: type_id};
    console.log(applianceObject);
    let found = false;
    house.forEach((room) => {
        if(room.room_id === roomName) found = true;
    });
    if(!found) {
        res.json({msg: "No such room"});
    } else {
        let i = 0;
        house.forEach((room) => {
            if(room.room_id === roomName) {
                house[i].appliances.push(applianceObject);
            }
            i++;
        });
        res.redirect('/');
    }
});

app.get('/save', (req, res) => {
    // add layout info here? 
    let json = JSON.stringify(house, null, 4);
    fs.writeFile('./setup_data.json', json, (err) => {
        if (err) throw err;
        console.log('Wrote setup data!');
        res.json({'success' : 'true'});
    });
});

app.post('/save', (req, res) => {
    settings = [];
    settings.push(req.body);
    rooms = house;
    data = [];
    data.push({settings});
    data.push({rooms});
    let json = JSON.stringify(data, null, 4);
    fs.writeFile('./setup_data.json', json, (err) => {
        if (err) throw err;
        console.log('Wrote setup data!');
        res.json({'success' : 'true'});
    });
});

app.get('/', (req, res) => {
    //res.json({ msg: 'msg' });
    res.render('index', 
        {house: house}
    );
});

app.get('/ietest', (req, res) => {
    //res.json({ msg: 'msg' });
    res.render('ietest');
});

app.get('/graphs/:output_id', (req, res) => {
    filenames = fs.readdirSync(path.join(__dirname, "outputs"));
    search_filename = req.params.output_id + ".json"; 
    console.log('search_filename: ' + search_filename);
    fs.readFile( path.join(__dirname, "outputs", search_filename), (err, data) => {
        if(err) { 
            result_status = "failed"; 

            condensed_dataset = [];
            res.render('graphs', 
            { condensed_dataset, filenames,
                helpers: { 
                    json: function (context) { return JSON.stringify(context); } 
                }
            }
        );
        } else { 
            result_status = "success";

            // process the file data 
            const dataset = JSON.parse(data);
        
            let settings = dataset[0];
            let rooms = dataset[1]; 

            // condense data
            let condensed_dataset = [];
            //rooms = condense_hourly(rooms);
            condensed_dataset.push(settings);
            condensed_dataset.push(rooms);

            res.render('graphs', 
            { condensed_dataset, filenames,
                helpers: { 
                    json: function (context) { return JSON.stringify(context); } 
                }
            }
        );

        }
    });
});

// without params
app.get('/graphs', (req, res) => {
    // JSON data set from /generate
    
    console.log(req['params']);

    filenames = fs.readdirSync(path.join(__dirname, "outputs"));
    filename = filenames[0];

    fs.readFile(path.join(__dirname, "outputs", filename), (err, data) => {
    //fs.readFile('./output_data.json', (err, data) => {
        if(err) throw err;
        const dataset = JSON.parse(data);
        
        let settings = dataset[0];
        let rooms = dataset[1];

        // condendsing data: 
        let condensed_dataset = [];
        //rooms = condense_hourly(rooms);
        condensed_dataset.push(settings);
        condensed_dataset.push(rooms);

        let foldername = path.join(__dirname, 'outputs');
        var filenames = fs.readdirSync(foldername);
        //console.log(condensed_dataset);

        res.render('graphs', 
            { condensed_dataset, filenames,
                helpers: { 
                    json: function (context) { return JSON.stringify(context); } 
                }
            }
        );
    });
});

app.get('/generate', (req, res) => {
    // Now we can run a script and invoke a callback when complete, e.g.
    runScript('./generate-v3.js', function (err) {
        if (err) throw err;
        console.log('Generated!');
        res.json({ success: true });
    });

});

const applianceInits = require('./applianceInits.js');
app.get('/appliance-data.js', (req, res) => {
    fs.readFile('./applianceInits.js', (err, data) => {
            res.json(applianceInits);
    });
});

app.listen(PORT, () => {
    console.log('Running server on port 5002.');
});

// Child process script:
var childProcess = require('child_process');
const { isRegExp } = require('util');

function runScript(scriptPath, callback) {

    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;

    var process = childProcess.fork(scriptPath);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });
}

function condense_hourly(rooms) {
    console.log("Condensing hourly.");
    for(i = 0; i < rooms.length; i++) {    
        let appliances = rooms[i].appliances;
        for(j = 0; j < appliances.length; j++) {
            let appliance_data = appliances[j].data;
            let new_x = [];
            let new_y = [];
            let y_sum = 0;
            let x = 0;
            for(y_i = 0; y_i < appliance_data[0].y.length; y_i++){
                y_sum += appliance_data[0].y[y_i];
                if((y_i+1) % 60 == 0) { 
                    new_x.push(x);
                    new_y.push(y_sum);
                    y_sum = 0;
                    x++;
                }
            }
            //console.log(new_y);
            rooms[i].appliances[j].data[0].y = new_y;
            rooms[i].appliances[j].data[0].x = new_x;
            //console.log( rooms[i].appliances[j].appliance_id );
            rooms[i].appliances[j].layout = {
                "title" : rooms[i].appliances[j].appliance_id + " in " + rooms[i].room_id,
                "xaxis" : {"title" : "time (hours)"}, 
                "yaxis" : {"title" : "joules (watts/sec)"}
            }; 
        }
    }
    //console.log(rooms[0].appliances[0].data);
    return rooms;
}
