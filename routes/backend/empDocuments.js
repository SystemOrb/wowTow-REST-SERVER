// Archivo que se encarga de administrar los documentos personales de la plataforma
const express = require('express');
const app = express();
const doc = require('../../models/grueros/documents');
const _ = require('underscore');
app.get('/', (request, response) => {
    let limit = Number(request.query.limit) || 5;
    let offset = Number(request.query.offset) || 0;
    try {
        doc.find({}).skip(offset).limit(limit).populate('user')
            .exec((err, documents) => {
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
                    msg: 'Employers Personal Documents loaded',
                    documents
                });
            });
    } catch (error) {
        throw error;
    }
});
// Validate documents 
app.put('/:doc_id', (request, response) => {
    let _key = request.params.doc_id;
    let object = _.pick(request.body, ['documentStatus']);
    doc.findByIdAndUpdate(_key, object, { new: true }, (err, activated) => {
        if (err) {
            return response.status(500).json({
                status: false,
                statusCode: 500,
                msg: 'Failure to connect with database server',
                err
            });
        }
        // if not find any result with this id
        if (!activated) {
            return response.status(400).json({
                status: false,
                statusCode: 400,
                msg: 'The document with this ID doesnt exist',
                err
            });
        }
        // so we activated this doc
        response.status(200).json({
            status: true,
            statusCode: 200,
            msg: 'This document has been activated',
            activated
        });
    });
});

module.exports = app;