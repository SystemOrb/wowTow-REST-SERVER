const express = require('express');
const cityRate = require('../../models/backend/city_rate');
const app = express();

app.get('/', (request, response) => {
    let limit = Number(request.query.limit) || 0;
    let offset = Number(request.query.offset) || 5;
    cityRate.find({ status: true }).skip(limit).limit(offset)
        .exec((err, cities) => {
            if (err) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    err
                });
            }
            if (!cities) {
                return response.status(200).json({
                    status: false,
                    statusCode: 200,
                    msg: 'Must load a base rate on cities'
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Cities base rate has been loaded successfully',
                cities
            });
        });
});

app.post('/', (request, response) => {
    let body = request.body;
    let city_rate = new cityRate({
        country: body.country,
        city: body.city,
        base_rate: body.base_rate,
    });
    city_rate.save((err, city) => {
        if (err) {
            return response.status(400).json({
                status: false,
                statusCode: 400,
                err
            });
        }
        response.status(200).json({
            status: true,
            statusCode: 200,
            msg: 'City base rate has been loaded successfully',
            city
        });
    });
});

app.put('/:rate_id', (request, response) => {
    let rateId = request.params.rate_id;
    let body = request.body;
    try {
        cityRate.findByIdAndUpdate(rateId, body, (err, city) => {
            if (err) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    err
                });
            }
            if (!city) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'City cannot has been updated, Verify the id'
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'City base rate has been updated successfully',
                city
            });
        });
    } catch (error) {
        throw error;
    }
});
app.delete('/:city_rate', (request, response) => {
    let id = request.params.city_rate;
    try {
        cityRate.findByIdAndRemove(id, (err, city) => {
            if (err) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    err
                });
            }
            if (!city) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'City cannot has been deleted, Verify the id'
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'City base rate has been deleted successfully',
                city
            });
        });
    } catch (error) {
        throw error;
    }
});
app.put('/discount/:city', (request, response) => {
    let id = request.params.city;
    let body = request.body;
    try {
        cityRate.findByIdAndUpdate(id, body, (err, city) => {
            if (err) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    err
                });
            }
            if (!city) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'City cannot has been updated, Verify the id'
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'You discount has been loaded on this city successfully',
                city
            });
        });
    } catch (error) {
        throw error;
    }
});

module.exports = app;