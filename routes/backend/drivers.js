const express = require('express');
const trucks = require('../../models/grueros/tows_cars');
const imgTows = require('../../models/grueros/tows_cars_docs');
const employer = require('../../models/grueros/employer');
const jwt = require('../../middlewares/protection');
const app = express();

app.get('/', (request, response) => {
    // Pagination
    let offset = Number(request.query.offset) || 0;
    let limit = Number(request.query.limit) || 5;
    try {
        imgTows.find({}).limit(limit).skip(offset).populate('driver')
            .exec(async(err, driversDB) => {
                if (err) throw err;
                trucks.populate(driversDB, {
                    path: 'driver.driver'
                }, (err, resp) => {
                    if (err) throw err;
                    response.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'all drivers memberships loaded',
                        resp
                    });
                });
            });
    } catch (error) {
        throw error;
    }
});
app.get('/:id', (request, response) => {
    // Pagination
    let id = request.params.id;
    try {
        imgTows.findById(id).populate('driver')
            .exec(async(err, driversDB) => {
                if (err) throw err;
                trucks.populate(driversDB, {
                    path: 'driver.driver'
                }, (err, resp) => {
                    if (err) throw err;
                    response.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'all drivers memberships loaded',
                        resp
                    });
                });
            });
    } catch (error) {
        throw error;
    }
});
// Get All data by driver ID 
app.get('/session/provider/:id', (req, resp) => {
    let id = req.params.id;
    trucks.findOne({ driver: id }).exec((err, truckData) => {
        if (err) throw err;
        if (!truckData) {
            return resp.status(200).json({
                status: false,
                statusCode: 200,
                msg: 'No data loaded'
            });
        }
        imgTows.find({ driver: truckData._id }).populate('driver')
            .exec((err, towData) => {
                if (err) throw err;
                trucks.populate(towData, {
                    path: 'driver.driver'
                }, (err, dataPartial) => {
                    if (err) throw err;
                    resp.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'All Data Loaded',
                        dataPartial
                    });
                });
            });
    });
});
//Authorization providers
app.put('/provider/:keyUser', (request, response) => {
    let id = request.params.keyUser;
    let body = request.body;
    try {
        employer.findByIdAndUpdate(id, body).exec((err, driverDB) => {
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
                statusCodE: 200,
                msg: 'This service provider has been authorized to work',
                driverDB
            });
        });
    } catch (error) {
        throw error;
    }
});
let insertArrayAsync = (iterator, callback) => {
    return new Promise((resolve, reject) => {
        for (let i of iterator) {
            imgTows.find({ driver: i._id }).populate('driver')
                .exec((err, img) => {
                    if (err) throw err;
                    trucks.populate(img, {
                        path: 'driver.driver'
                    }, (err, resp) => {
                        if (err) throw err;
                        resolve(resp);
                    });
                })
        }
    });
}
module.exports = app;