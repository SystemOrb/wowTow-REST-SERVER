const express = require('express');
const documentExpiration = require('../../models/grueros/expiration');
const user = require('../../models/grueros/employer');
const app = express();

app.get('/', (request, response) => {
    let offset = Number(request.query.offset) || 0;
    let limit = Number(request.query.limit) || 15;
    try {
        documentExpiration.find({}).skip(offset).limit(limit).populate('doc')
            .exec((err, document) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to create this expiration document',
                        err
                    });
                }
                user.populate(document, {
                    path: 'doc.user'
                }, (err, allDocumentData) => {
                    if (err) {
                        return response.status(400).json({
                            status: false,
                            statusCode: 400,
                            msg: 'Failure to get this document',
                            err
                        });
                    }
                    response.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'All documents loaded',
                        allDocumentData
                    });
                });
            });
    } catch (error) {
        throw error;
    }
});
app.get('/:docExp', (request, response) => {
    let id = request.params.docExp;
    try {
        documentExpiration.findById(id).populate('doc')
            .exec((err, document) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to create this expiration document',
                        err
                    });
                }
                if (!document) {
                    return response.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'This Document doesnt exists'
                    });
                }
                user.populate(document, {
                    path: 'doc.user'
                }, (err, allDocumentData) => {
                    if (err) {
                        return response.status(400).json({
                            status: false,
                            statusCode: 400,
                            msg: 'Failure to get this document',
                            err
                        });
                    }
                    response.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'All documents loaded',
                        allDocumentData
                    });
                });
            });
    } catch (error) {

    }
});
app.put('/:docEXP', (request, response) => {
    let id = request.params.docEXP;
    let body = request.body;
    try {
        documentExpiration.findByIdAndUpdate(id, body, (err, document) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to create this expiration document',
                    err
                });
            }
            if (!document) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'This Document doesnt exists'
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Your expiration document has been updated',
                document
            });
        });
    } catch (error) {
        throw error;
    }
});
app.post('/', (request, response) => {
    let body = request.body;
    try {
        let Expiration = new documentExpiration({
            doc: body.doc,
            expiration: body.exp
        });
        Expiration.save((err, document) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to create this expiration document',
                    err
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Your expiration document has been added',
                document
            })
        });
    } catch (error) {
        throw error;
    }
});

module.exports = app;