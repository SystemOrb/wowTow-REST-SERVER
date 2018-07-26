// All routes for application REST
const express = require('express');
const app = express();
// Middlewares routes
/*********************************************
 * START AUTH
 *********************************************/
app.use('/admin/login', require('./backend/login'));
app.use('/client/login', require('./clients/login'));
/*********************************************
 * END AUTH
 *********************************************/
// UPLOAD FILES
app.use('/upload', require('./upload'));
//backend
app.use('/admin/documents', require('./backend/empDocuments'));
app.use('/admin/employers/membership', require('./backend/drivers'));
//client
//employers
app.use('/employer/membership/Tow/Car', require('./employer/afiliate_tow'));
app.use('/employer/login', require('./employer/login'));
module.exports = app;