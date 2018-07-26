// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const port = require('../config/settings').PORT;
const connection = require('../config/settings').Connection;
require('colors');
const app = express();

//MiddleWares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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