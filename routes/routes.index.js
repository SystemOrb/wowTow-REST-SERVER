// All routes for application REST
const express = require('express');
const app = express();
// Middlewares routes
/*********************************************
 * START AUTH
 *********************************************/
app.use('/admin/login', require('./backend/login'));
app.use('/client/login', require('./clients/login'));
app.use('/gruero/login', require('./grueros/login'));
/*********************************************
 * END AUTH
 *********************************************/
// UPLOAD FILES
app.use('/upload', require('./upload'));
//employers
app.use('/employer/documents', require('./backend/empDocuments'));
module.exports = app;