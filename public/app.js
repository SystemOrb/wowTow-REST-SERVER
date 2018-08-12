// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const port = require('../config/settings').PORT;
const connection = require('../config/settings').Connection;
const path = require('path');
require('colors');
const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//MiddleWares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname + '/')));

// Routes Middlewares
app.use(require('../routes/routes.index'));

app.get('/', function(req, res) {
    res.send('Hello World')
});
// Connection
mongoose.connect(connection, { useNewUrlParser: true }, (err) => {
    if (err) {
        throw new Error(err);
    }
    console.log('Database has been connected'.magenta);
});
app.listen(port, () => {
        console.log('Application connected on port '.magenta + port);
    })
    // PORT CONNECTION