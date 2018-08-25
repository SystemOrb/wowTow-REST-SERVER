const express = require('express');
const fileUpload = require('express-fileupload');
const uniqid = require('uniqid');
const md5 = require('md5');
const fs = require('fs');
const path = require('path');
const Document = require('../models/grueros/documents');
const Employers = require('../models/grueros/employer');
const carImages = require('../models/grueros/tows_cars_docs');
const CarClientImages = require('../models/clients/client.car.image');
const drivers = require('../models/grueros/tows_cars');
const app = express();
// middleware
app.use(fileUpload());

app.put('/:app/:id/:operationType', async(request, response) => {
    if (!request.files) {
        return response.status(400).json({
            status: false,
            statusCode: 400,
            message: 'Must load a image file'
        });
    }
    // catch file data
    const FileItem = request.files.image;
    const AppDB = request.params.app;
    const id = request.params.id;
    // Validators
    if (!validateImageExtension(FileItem) || (!validateDBCollection(AppDB))) {
        return response.status(400).json({
            status: false,
            statusCode: 400,
            message: 'This File is invalid, please verify your upload'
        });
    }
    // upload on server
    let newFileName = pathCreator(id, FileItem.name);
    FileItem.mv(`uploads/${AppDB}/${newFileName}`, (err) => {
        if (err) {
            return response.status(500).json({
                status: false,
                statusCode: 500,
                message: 'Failure to upload this file',
                err
            });
        }
        // Operation to insert new image
        switch (request.params.operationType) {
            case 'document':
                updateDocument(id, response, newFileName, request.query.documentType);
                break;
            case 'towImage':
                towTruck(id, response, newFileName);
                break;
            case 'clientCar':
                CarClientImage(id, response, newFileName);
                break;
        }
    });
});

let validateImageExtension = (file) => {
    try {
        let verifyItem = file.name.split('.');
        let validExtension = ['jpg', 'png', 'jpeg', 'gif', 'svg'];
        if (validExtension.indexOf(verifyItem[verifyItem.length - 1]) < 0) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        throw error;
    }
}

let validateDBCollection = (db) => {
    try {
        let db_available = ['employers', 'client', 'admin'];
        if (db_available.indexOf(db) < 0) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        throw error;
    }
}
let updateDocument = (id, callback, fileName, documentType) => {
        try {
            // Search employer wowTow first
            Employers.findById(id, (err, Employer) => {
                if (err) {
                    deleteFile('employers', fileName, callback);
                    return callback.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                } // User doesnt exist
                if (!Employer) {
                    deleteFile('employers', fileName, callback);
                    return callback.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'This user doesnt exists'
                    });
                }
                // user exist so we can create new document
                const doc = new Document({
                    document_name: fileName,
                    user: Employer._id,
                    documentType,
                });
                doc.save((err, newDocument) => {
                    if (err) {
                        deleteFile('employers', fileName, callback);
                        return callback.status(500).json({
                            status: false,
                            statusCode: 500,
                            msg: 'Failure to connect with database server',
                            err
                        });
                    }
                    callback.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'Your Document has been uploaded successfully. Please wait for our confirmation',
                        newDocument
                    });
                });
            });
        } catch (error) {
            throw error;
        }
    }
    // Imagenes de gruas
let towTruck = (id, callback, fileName) => {
    // Verificamos si existe el conductor
    drivers.findById(id, (err, driverDB) => {
        if (err) {
            deleteFile('employers', fileName, callback);
            return callback.status(500).json({
                status: false,
                statusCode: 500,
                msg: 'Failure to connect with database server',
                err
            });
        }
        if (!driverDB) {
            deleteFile('employers', fileName, callback);
            return callback.status(400).json({
                status: false,
                statusCode: 400,
                msg: 'This driver doesnt exists'
            });
        }
        const towImg = new carImages({
            driver: driverDB._id,
            tow_image: fileName
        });
        towImg.save((err, towResp) => {
            if (err) {
                deleteFile('employers', fileName, callback);
                return callback.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            callback.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Your tow truck has been loaded successfully',
                towResp
            });
        });
    });
}
let CarClientImage = (id, callback, fileName) => {
    let _id = id;
    try {
        let body = new CarClientImages({
            car_model: _id,
            car_image: fileName
        });
        body.save((err, car_img) => {
            if (err) {
                deleteFile('client', fileName, callback);
                return callback.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            if (!car_img) {
                return callback.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'This car model doesnt exists',
                    err
                });
            }
            callback.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Profile car has been loaded',
                car_img
            });
        });
    } catch (error) {
        throw error;
    }
}
let pathCreator = (id, fileName) => {
    return md5(id + uniqid() + fileName.name) + `.${fileName.split('.')[1]}`;
}
let deleteFile = (folder, fileName, callback) => {
        let old_path = path.resolve(`uploads/${folder}/${fileName}`);
        fs.exists(old_path, (exists) => {
            if (exists) {
                fs.unlink(old_path, (err) => {
                    if (err) {
                        return callback.status(500).json({
                            status: true,
                            statusCode: 500,
                            msg: 'Failure to remove this file',
                            err
                        });
                    }
                });
            } else {
                throw new Error('Cannot removed this image');
            }
        });
    }
    // DISPLAY PICTURES
app.get('/image/:folder/:name', async(request, response) => {
    let img = request.params.name;
    let folder = request.params.folder;
    try {
        let pathImg = path.resolve(`uploads/${folder}/${img}`);
        let no_path = path.resolve(`uploads/${folder}/no_image.png`);
        let exists = await fs.existsSync(pathImg);
        if (exists) {
            response.sendFile(pathImg);
        } else {
            response.sendFile(no_path);
        }
    } catch (error) {
        throw error;
    }
});
module.exports = app;