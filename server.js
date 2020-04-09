const path = require('path');
const fs = require('fs');

const express = require('express');
var exphbs  = require('express-handlebars');
const app = express();

const house = [ ];

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
    res.json(house);
});

// add a room to the house
app.get('/add/:room', (req, res) => {
    let id = Math.floor(1000 + Math.random() * 9000); 
    let name = req.params.room + "_" + id;
    house[name] = { name : name };
    // output json
});

// add an appliance to a room
app.post('/add/:room/:appliance', (req, res) => {
    res.status(200).json({msg: "success"});
});

app.get('/', (req, res) => {
    //res.json({ msg: 'msg' });
    res.render('index', 
        {msg: 'message'}
    );
});

app.listen(PORT, () => {
    console.log('running server');
});

