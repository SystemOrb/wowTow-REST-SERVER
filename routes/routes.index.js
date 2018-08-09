// All routes for application REST
const express = require('express');
const app = express();
// Middlewares routes
/*********************************************
 * START AUTH
 *********************************************/
app.use('/admin/login', require('./backend/login'));
app.use('/client/login', require('./clients/login'));
app.use('/client/rating', require('./clients/client.rating'));
app.use('/client/car/model', require('./clients/client.car.model'));
app.use('/client/car/risk', require('./clients/client.risk'));
app.use('/client/security/credit_card', require('./clients/client.creditcard.model'));
app.use('/client/payment/paypal', require('./clients/client.paypal'));
app.use('/client/payment/stripe', require('./clients/client.stripe'));
/*********************************************
 * END AUTH
 *********************************************/
// UPLOAD FILES
app.use('/upload', require('./upload'));
//backend
app.use('/admin/documents', require('./backend/empDocuments'));
app.use('/admin/documents/expiration', require('./backend/documentsExpiration'));
app.use('/admin/employers/membership', require('./backend/drivers'));
app.use('/admin/cities/rate', require('./backend/city_rate'));
app.use('/admin/clients/risk', require('./backend/clients.risk.control'));
app.use('/admin/payments/stripe', require('./backend/payments.stripe'));
app.use('/admin/payments/paypal', require('./backend/payments.paypal'));
app.use('/admin/cities/coupons', require('./backend/city_coupon'));
//client
//employers
app.use('/employer/membership/Tow/Car', require('./employer/afiliate_tow'));
app.use('/employer/login', require('./employer/login'));
app.use('/employer/rating', require('./employer/employer.rating'));
module.exports = app;