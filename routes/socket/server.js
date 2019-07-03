const io = require('../../public/app').socketIO;
const geolocation = require('../../models/backend/google/geolocation');
const user = require('../../models/clients/user');
const gruero = require('../../models/grueros/employer');
io.on('connection', (client) => {
    // Verificamos que tipo de conexiones recibimos
    // APP GRUAS APP ANGULAR MAP Y JAVASCRIPT
    switch (client.handshake.query.authType) {
        case 'appCustomer':
            // Como el socket de la libreria javascript es el que hace la petición desde google maps
            // No podemos manipular la información desde angular por ende tenemos que trabajar desdes sockets
            // Y necesitamos guardar un socket temporal por cada cliente que entre desde Angular y mandarle
            // La respuesta a ese socket
            // La funcionalidad es por cada inicio de sesión o reload con el ID del cliente actualizamos
            // un socket ID temporal de tal forma que podemos mandarle peticiones a esa sessión socket
            const session = client.handshake.query.session;
            // Primero verificamos si el usuario esta autenticado en la app
            if (session !== null && (session !== undefined)) {
                // Si esta entonces iremos actualizando el socket session
                let body = {
                    SocketSession: client.id
                };
                user.findByIdAndUpdate(session, body).exec((err, updateSession) => {
                    if (err) {
                        io.close();
                        throw new Error(err);
                    }
                });
            }
            break;
        case 'appDriver':
            console.log('DriverApp');
            break;
    }

    // console.log('usuario conectado');
    client.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
    // Estamos a la escucha cuando un cliente solicita la información del servicio
    /*
    Este evento de socket se dispara en la libreria de javascript
    debido a que angular no tiene acceso al scope donde apunta los marcadores
    por ende desde javascript recibimos esto y lo mandamos al cliente de angular
    */
    client.on('routing', (dataRouting) => {
        geolocation.findById(dataRouting.serviceId).populate('customer')
            .populate('provider').populate('service_ref')
            .exec((err, ServiceDescription) => {
                if (err) {
                    throw err;
                }
                user.populate(ServiceDescription, {
                    path: 'customer.client'
                }, (err, allData) => {
                    if (err) {
                        io.close();
                        throw err;
                    }
                    // Enviamos a angular la respuesta del tracking
                    client.broadcast.to(allData.customer.client.SocketSession).emit('TrackingData', {
                        Tracking: allData
                    });
                });
            });
    });
    // Cuando iniciamos sesión o arrancamos la app vamos siempre actualizar las coordenadas del proveedor
    // de tal forma siempre actualizaremos el puntero
    client.on('CurrentLocation', (Coords) => {
        const body = {
            currentLat: Coords.Location.lat,
            currentLng: Coords.Location.lng
        };
        // Actualizamos las coordenadas
        gruero.findByIdAndUpdate(Coords.Provider, body).exec(
            (err, ProviderCoords) => {
                if (err) {
                    io.close();
                    throw new Error(err);
                }
            }
        );
    });
    // Cada tres segundos debemos buscar al cliente por si esta cambiando de ubicación
    client.on('polling', (provider, arg) => {
        gruero.findById(provider.provider).exec((err, DataProvider) => {
            if (err) {
                io.close();
                throw new Error(err);
            }
            arg(DataProvider);
        });
    });
});