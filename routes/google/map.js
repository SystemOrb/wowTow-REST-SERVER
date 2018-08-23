const express = require('express');
const geocode = require('../../models/backend/google/zone');
const city = require('../../models/backend/city_rate');
const googleMap = require('@google/maps').createClient({
    key: 'AIzaSyBAPKoCSUMnZrtJGOgSlIHga-ibKwnCOfQ'
});
const app = express();

app.get('/:zone', (request, response) => {
    let zoneData = request.params.zone;
    try {
        googleMap.geocode({
            address: zoneData
        }, function(err, resulset) {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Cannot connect with Google Api',
                    err
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Zone Loaded',
                resulset
            });
        });
    } catch (error) {
        throw error;
    }
});
app.post('/', (request, response) => {
    let body = request.body;
    try {
        // Creamos la zona de Geolocalización
        const Geolocation = new geocode({
            formatted_address: body.formatted_address,
            location_type: body.location_type,
            latitude: body.latitude,
            longitude: body.longitude,
            place_id: body.place_id
        });
        Geolocation.save((err, GeoZone) => {
            if (err) throw err;
            // Luego creamos el tax de esa ciudad
            const CityRate = new city({
                geozone: GeoZone._id,
                base_rate: body.base_rate,
            });
            CityRate.save((err, Zone) => {
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
                    msg: 'Zone rate has been charged success',
                    Zone
                });
            });
        });
    } catch (error) {
        throw error;
    }
});
app.get('/zone/all', (request, response) => {
    let offset = Number(request.query.offset) || 0;
    let skip = Number(request.query.limit) || 15;
    try {
        city.find({}).skip(offset).limit(skip).populate('geozone')
            .exec((err, GeoZone) => {
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
                    msg: 'All zones loaded',
                    GeoZone
                });
            });
    } catch (error) {
        throw error;
    }
});
app.get('/zone/location/:zoneKey', (request, response) => {
    let _id = request.params.zoneKey;
    try {
        city.findById(_id).populate('geozone')
            .exec((err, GeoZone) => {
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
                    msg: 'All zones loaded',
                    GeoZone
                });
            });
    } catch (error) {
        throw error;
    }
});

module.exports = app;