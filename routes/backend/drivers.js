const express = require('express');
const trucks = require('../../models/grueros/tows_cars');
const imgTows = require('../../models/grueros/tows_cars_docs');
const employer = require('../../models/grueros/employer');
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