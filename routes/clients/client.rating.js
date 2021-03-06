const express = require('express');
const rating = require('../../models/clients/client.rating');
const app = express();

app.get('/:client', (request, response) => {
    let id = request.params.client;
    try {
        rating.find({ client: id }, (err, average) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            if (!average) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'This user ID doesnt exists'
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Ratings and reviews loaded succesfully',
                average
            });
        });
    } catch (error) {
        throw error;
    }
});
app.post('/', (request, response) => {
    let body = request.body;
    try {
        let reviews = new rating({
            client: body.user,
            average: body.average,
            feedback: body.feedback
        });
        reviews.save((err, review) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Ratings and reviews loaded succesfully',
                review
            });
        });
    } catch (error) {
        throw error;
    }
});

module.exports = app;