const express = require('express');
const documents = require('../../models/grueros/documents');
const app = express();

app.post('/', (req, res) => {
    let body = req.body;
    try {
        let doc = new documents({
            document_name: body.document_name,
            user: body.user,
            documentType: body.documentType,
        });
        doc.save((err, docUploaded) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            res.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Doc uploaded',
                docUploaded
            });
        });
    } catch (error) {
        throw error;
    }
});
app.get('/provider/:id', (req, res) => {
    let id = req.params.id;
    try {
        documents.find({ user: id }).exec((err, docs) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            if (!docs) {
                return res.status(200).json({
                    status: false,
                    statusCode: 500,
                    msg: 'This Provider not exists',
                });
            }
            res.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Docs loaded',
                docs
            });
        });
    } catch (error) {
        throw error;
    }
});

module.exports = app;