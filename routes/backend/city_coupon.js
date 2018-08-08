const express = require('express');
const app = express();
const coupons = require('../../models/backend/coupons');
app.get('/', (request, response) => {
    let offset = Number(request.query.offset) || 0;
    let limit = Number(request.query.limit) || 15;
    try {
        coupons.find({}).skip(offset).limit(limit).populate('city')
            .exec((err, Coupon) => {
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
                    msg: 'Coupon has been loaded successfully',
                    Coupon
                });
            })
    } catch (error) {
        throw error;
    }
});
app.get('/:coupon', (request, response) => {
    let id = request.params.coupon
    try {
        coupons.findById(id).populate('city')
            .exec((err, Coupon) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                if (!Coupon) {
                    return response.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'This Coupon with this ID doesnt exists',
                        err
                    });
                }
                response.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'Coupon has been loaded successfully',
                    Coupon
                });
            })
    } catch (error) {
        throw error;
    }
});
app.post('/', (request, response) => {
    let body = request.body;
    try {
        let CouponCity = new coupons({
            city: body.city,
            amount_discount: body.amount_discount,
            date_start: body.date_start,
            date_end: body.date_end
        });
        CouponCity.save((err, Coupon) => {
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
                msg: 'Coupon has been created successfully',
                Coupon
            });
        });
    } catch (error) {
        throw error;
    }
});
app.delete('/:coupon', (request, response) => {
    let id = request.params.coupon;
    try {
        coupons.findByIdAndRemove(id, (err, Coupon) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            if (!Coupon) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'This Coupon with this ID doesnt exists',
                    err
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Coupon has been removed successfully',
                Coupon
            });
        });
    } catch (error) {
        throw error;
    }
});
app.put('/:invoice', (request, response) => {
    let id = request.params.invoice;
    let body = request.body;
    try {
        coupons.findByIdAndUpdate(id, body).exec((err, Coupon) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            if (!Coupon) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'This Coupon with this ID doesnt exists',
                    err
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Coupon has been updated successfully',
                Coupon
            });
        });
    } catch (error) {
        throw error;
    }
});
module.exports = app;