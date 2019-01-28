const express = require('express');
const geocode = require('../../models/backend/google/zone');
const city = require('../../models/backend/city_rate');
const googleMap = require('@google/maps').createClient({
    key: 'AIzaSyBAPKoCSUMnZrtJGOgSlIHga-ibKwnCOfQ'
});
const geocoding = require('reverse-geocoding-google');
const reverseGeocode = require('../../models/backend/google/geolocation');
const provider = require('../../models/grueros/employer');
const app = express();

// Para obtener datos de una zona por la dirección
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
// Para crear una zona de geolocalización
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
// Para obtener todas las zonas
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
// Para obtener la zona según latitud y longitud
app.get('/reverse/:lat/:lng', (req, res) => {
    let SearchConfig = {
        'latitude': req.params.lat,
        'longitude': req.params.lng,
        'key': 'AIzaSyC025k9Zis8z0yCI7foth1VrlPqlE4etZY'
    }
    geocoding.location(SearchConfig, (err, matrix) => {
        if (err) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                msg: err
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            msg: 'Zone loaded',
            matrix
        });
    });
});
// Para obtener todas las rutas marcadas
/*
Esta función sirve para obtener todos los servicios activos que aun no se han aceptado
en el sistema, es decir los clientes solicitaron un servicio, y aun estan a la espera
de ser aceptado por el gruero
por ende esta función lista todos los servicios disponibles
*/
app.get('/reverse/zones', async(req, res) => {
    let city = req.query.city; // Ciudad donde opera el gruero
    try {
        reverseGeocode.find({ completed: false, taken: false }).populate('customer')
            .exec(async(err, WootowServices) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: err
                    });
                }
                /*
                Funciones asincronas
                */
                const reverse = await CompareCities(city, WootowServices);
                const NewMatrix = await ReturnServicesByCity(city, reverse);
                console.log('work');
                res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'Servicios cargado',
                    NewMatrix
                });
            });
    } catch (error) {
        throw error;
    }
});
/*
Cuando el cliente paga un servicio y una ruta
se guarda solo las Coordenadas
por ende tenemos que usar la API de Geocode para obtener aproximaciones a esas coordenadas
y comprobar si esta situado en la misma ciudad que el gruero, sirve para mostrar servicios 
solo por ciudad
*/
let CompareCities = (PrimalCity, CollectionWootowServices) => {
        let ServicesOnMyCity = new Array(); // Creamos una nueva pila de aproximaciones a las coordenadas
        return new Promise((resolve, reject) => {
            const key = 'AIzaSyC025k9Zis8z0yCI7foth1VrlPqlE4etZY';
            // Recorremos todos los servicios y buscamos las aproximaciones
            for (let AvailableServices of CollectionWootowServices) {
                let config = {
                    'latitude': AvailableServices.fromLng,
                    'longitude': AvailableServices.fromLat,
                    'key': key
                }
                geocoding.location(config, (err, matrix) => {
                    if (err) {
                        return res.status(500).json({
                            status: false,
                            statusCode: 500,
                            msg: err
                        });
                    }
                    // Vamos insertando al nuevo arreglo de matrices
                    ServicesOnMyCity.push({
                        latitudeMain: AvailableServices.fromLng,
                        longitudeMain: AvailableServices.fromLat,
                        _id: AvailableServices._id,
                        tracking: AvailableServices.tracking,
                        completed: AvailableServices.completed,
                        taken: AvailableServices.taken,
                        toLng: AvailableServices.toLng,
                        toLat: AvailableServices.toLat,
                        service_ref: AvailableServices.service_ref,
                        customer: AvailableServices.customer,
                        matrix
                    });
                });
            }
            setTimeout(() => {
                resolve(ServicesOnMyCity);
            }, 2500);
        });
    }
    /*
    Sirve para comparar si los servicios son de la misma ciudad del conductor
    Para devolverlo al cliente
    */
let ReturnServicesByCity = (City, CitiesMatrix) => {
    return new Promise((resolve, reject) => {
        const Cities = new Array();
        for (let geozoneMatrix of CitiesMatrix) {
            let cityString = geozoneMatrix.matrix.plus_code.compound_code;
            if (cityString.indexOf(City) !== -1) {
                // resolve(geozoneMatrix);
                Cities.push(geozoneMatrix);
            }
        }
        setTimeout(() => {
            resolve(Cities);
        }, 3000);
    });
}
module.exports = app;